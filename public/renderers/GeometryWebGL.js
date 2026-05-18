const SHARED_STRIDE = 7;
const BYTES_PER_FLOAT = 4;

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
attribute vec4 a_color;
attribute float a_size;

uniform vec2 u_resolution;
uniform vec2 u_viewCenter;
uniform float u_viewScale;

varying vec4 v_color;

void main() {
    vec2 centered = a_position - u_viewCenter;
    vec2 screen = vec2(
        u_resolution.x * 0.5 + centered.x / u_viewScale,
        u_resolution.y * 0.5 + centered.y / u_viewScale
    );
    vec2 clip = vec2(
        (screen.x / u_resolution.x) * 2.0 - 1.0,
        1.0 - (screen.y / u_resolution.y) * 2.0
    );

    gl_Position = vec4(clip, 0.0, 1.0);
    gl_PointSize = max(1.0, a_size / u_viewScale);
    v_color = a_color;
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec4 v_color;
uniform int u_primitiveMode;

void main() {
    if (u_primitiveMode == 1) {
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        float dist = length(p);
        if (dist > 1.0) {
            discard;
        }

        float edge = smoothstep(1.0, 0.82, dist);
        gl_FragColor = vec4(v_color.rgb, v_color.a * edge);
        return;
    }

    gl_FragColor = v_color;
}
`;

const rendererCache = new WeakMap();

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function hslToRgb(h, s, l) {
    const hue = ((h % 360) + 360) % 360 / 360;
    const sat = clamp(s, 0, 1);
    const light = clamp(l, 0, 1);

    if (sat === 0) {
        return [light, light, light];
    }

    const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
    const p = 2 * light - q;

    const toChannel = (t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    return [
        toChannel(hue + 1 / 3),
        toChannel(hue),
        toChannel(hue - 1 / 3),
    ];
}

function paletteColor(palette, generation = 0, phase = 0, alpha = 1) {
    const mode = palette || "default";
    let hue;
    let saturation;
    let lightness;

    if (mode === "fire") {
        hue = 16 + ((generation * 8 + phase) % 34);
        saturation = 0.90;
        lightness = 0.54;
    } else if (mode === "ice") {
        hue = 185 + ((generation * 8 + phase) % 35);
        saturation = 0.86;
        lightness = 0.58;
    } else {
        hue = (generation * 23 + phase) % 360;
        saturation = 0.78;
        lightness = 0.56;
    }

    const [r, g, b] = hslToRgb(hue, saturation, lightness);
    return [r, g, b, alpha];
}

function getContext(canvas) {
    const gl =
        canvas.getContext("webgl", {
            alpha: false,
            antialias: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
        }) ||
        canvas.getContext("experimental-webgl", {
            alpha: false,
            antialias: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
        });

    if (!gl) {
        throw new Error("Unable to acquire a WebGL context for geometric fractals");
    }

    return gl;
}

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    if (!shader) {
        throw new Error("Unable to create shader");
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader) || "unknown shader error";
        gl.deleteShader(shader);
        throw new Error(info);
    }

    return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();

    if (!program) {
        throw new Error("Unable to create WebGL program");
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program) || "unknown program link error";
        gl.deleteProgram(program);
        throw new Error(info);
    }

    return program;
}

function pushVertex(target, x, y, color, size = 1) {
    target.push(x, y, color[0], color[1], color[2], color[3], size);
}

function addLine(target, x1, y1, x2, y2, color) {
    pushVertex(target, x1, y1, color, 1);
    pushVertex(target, x2, y2, color, 1);
}

function addTriangle(target, x1, y1, x2, y2, x3, y3, color) {
    pushVertex(target, x1, y1, color, 1);
    pushVertex(target, x2, y2, color, 1);
    pushVertex(target, x3, y3, color, 1);
}

function addSquare(target, x, y, size, color) {
    addTriangle(target, x, y, x + size, y, x + size, y + size, color);
    addTriangle(target, x, y, x + size, y + size, x, y + size, color);
}

function addCircle(target, x, y, diameter, color) {
    pushVertex(target, x, y, color, diameter);
}

function addPoint(target, x, y, size, color) {
    pushVertex(target, x, y, color, size);
}

function buildLSystemSegments(state, canvas, color) {
    const output = [];
    const entry = state?.elements?.[0];
    if (!entry || !entry.currentString) {
        return output;
    }

    const str = entry.currentString;
    const angleDelta = (25 * Math.PI) / 180;
    const stepLength = 180 * Math.pow(0.58, entry.depth || 0);
    let x = canvas.width / 2;
    let y = canvas.height - 30;
    let angle = -Math.PI / 2;
    const stack = [];

    for (const char of str) {
        if (char === "F") {
            const nextX = x + Math.cos(angle) * stepLength;
            const nextY = y + Math.sin(angle) * stepLength;
            addLine(output, x, y, nextX, nextY, color);
            x = nextX;
            y = nextY;
        } else if (char === "+") {
            angle += angleDelta;
        } else if (char === "-") {
            angle -= angleDelta;
        } else if (char === "[") {
            stack.push({ x, y, angle });
        } else if (char === "]") {
            const restored = stack.pop();
            if (restored) {
                x = restored.x;
                y = restored.y;
                angle = restored.angle;
            }
        }
    }

    return output;
}

function buildScene(activeKey, currentState, currentParams, canvas) {
    const progress = clamp(currentState?.animationProgress ?? 1, 0, 1);
    const alpha = 0.3 + (0.7 * progress);
    const color = paletteColor(currentParams?.colorPalette, currentState?.generation || 0, 0, alpha);
    const triangles = [];
    const lines = [];
    const points = [];
    const circles = [];
    const sliceCount = (items) => Math.max(1, Math.ceil(items.length * progress));

    switch (activeKey) {
        case "SierpinskiTriangle":
            for (const tri of (currentState?.elements || []).slice(0, sliceCount(currentState?.elements || []))) {
                addTriangle(triangles, tri.x1, tri.y1, tri.x2, tri.y2, tri.x3, tri.y3, color);
            }
            break;
        case "SnowFlake":
            for (const seg of (currentState?.elements || []).slice(0, sliceCount(currentState?.elements || []))) {
                addLine(lines, seg.a.x, seg.a.y, seg.e.x, seg.e.y, color);
            }
            break;
        case "DragonCurve":
            for (const seg of (currentState?.elements || []).slice(0, sliceCount(currentState?.elements || []))) {
                addLine(lines, seg.a.x, seg.a.y, seg.e.x, seg.e.y, color);
            }
            break;
        case "VicsekFractal":
            for (const sq of (currentState?.elements || []).slice(0, sliceCount(currentState?.elements || []))) {
                addSquare(triangles, sq.x, sq.y, sq.size, color);
            }
            break;
        case "RecursiveTree":
            for (const branch of (currentState?.elements || []).slice(0, sliceCount(currentState?.elements || []))) {
                addLine(lines, branch.a.x, branch.a.y, branch.e.x, branch.e.y, color);
            }
            break;
        case "InfiniteCircles":
            for (const circle of (currentState?.elements || []).slice(0, sliceCount(currentState?.elements || []))) {
                addCircle(circles, circle.x, circle.y, circle.r * 2, color);
            }
            break;
        case "ApollonianGasket":
            for (const circle of (currentState?.elements || []).slice(0, sliceCount(currentState?.elements || []))) {
                addCircle(circles, circle.x, circle.y, circle.r * 2, color);
            }
            break;
        case "BarnsleyFern":
            for (const pt of (currentState?.elements || []).slice(0, sliceCount(currentState?.elements || []))) {
                addPoint(points, canvas.width / 2 + pt.x * 90, canvas.height - pt.y * 90 - 30, 2, color);
            }
            break;
        case "LSystemPlant":
            {
                const segments = buildLSystemSegments(currentState, canvas, color);
                lines.push(...segments.slice(0, Math.max(0, Math.ceil(segments.length * progress))));
            }
            break;
        default:
            break;
    }

    return {
        triangles,
        lines,
        points,
        circles,
    };
}

function createBatchBuffer(gl, data) {
    const buffer = gl.createBuffer();
    if (!buffer) {
        throw new Error("Unable to create WebGL buffer");
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
    return buffer;
}

function resetVertexState(gl) {
    const maxAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS) || 0;
    for (let i = 0; i < maxAttribs; i += 1) {
        gl.disableVertexAttribArray(i);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

class GeometryWebGLRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = getContext(canvas);
        this.program = createProgram(this.gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);

        this.positionLocation = this.gl.getAttribLocation(this.program, "a_position");
        this.colorLocation = this.gl.getAttribLocation(this.program, "a_color");
        this.sizeLocation = this.gl.getAttribLocation(this.program, "a_size");
        this.resolutionLocation = this.gl.getUniformLocation(this.program, "u_resolution");
        this.viewCenterLocation = this.gl.getUniformLocation(this.program, "u_viewCenter");
        this.viewScaleLocation = this.gl.getUniformLocation(this.program, "u_viewScale");
        this.primitiveModeLocation = this.gl.getUniformLocation(this.program, "u_primitiveMode");

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.clearColor(0.02, 0.02, 0.03, 1.0);
    }

    drawBatch(primitiveType, data, primitiveMode) {
        const gl = this.gl;
        if (!data || data.length === 0) {
            return;
        }

        const buffer = createBatchBuffer(gl, data);
        gl.useProgram(this.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        const stride = SHARED_STRIDE * BYTES_PER_FLOAT;
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, stride, 0);

        gl.enableVertexAttribArray(this.colorLocation);
        gl.vertexAttribPointer(this.colorLocation, 4, gl.FLOAT, false, stride, 2 * BYTES_PER_FLOAT);

        gl.enableVertexAttribArray(this.sizeLocation);
        gl.vertexAttribPointer(this.sizeLocation, 1, gl.FLOAT, false, stride, 6 * BYTES_PER_FLOAT);

        gl.uniform1i(this.primitiveModeLocation, primitiveMode);
        gl.drawArrays(primitiveType, 0, data.length / SHARED_STRIDE);
        gl.deleteBuffer(buffer);
    }

    render(activeKey, currentState, currentParams) {
        const gl = this.gl;
        resetVertexState(gl);
        const view = currentState?.view || {
            centerX: this.canvas.width / 2,
            centerY: this.canvas.height / 2,
            scale: 1,
        };

        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program);
        gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
        gl.uniform2f(this.viewCenterLocation, view.centerX, view.centerY);
        gl.uniform1f(this.viewScaleLocation, Math.max(0.000001, view.scale || 1));

        const scene = buildScene(activeKey, currentState, currentParams, this.canvas);
        this.drawBatch(gl.TRIANGLES, scene.triangles, 0);
        this.drawBatch(gl.LINES, scene.lines, 0);
        this.drawBatch(gl.POINTS, scene.points, 0);
        this.drawBatch(gl.POINTS, scene.circles, 1);

        gl.flush();
    }
}

function getRenderer(canvas) {
    let renderer = rendererCache.get(canvas);
    if (!renderer) {
        renderer = new GeometryWebGLRenderer(canvas);
        rendererCache.set(canvas, renderer);
    }
    return renderer;
}

export function renderGeometryScene(canvas, activeKey, currentState, currentParams, onCompleteCallback) {
    const renderer = getRenderer(canvas);
    renderer.render(activeKey, currentState, currentParams);

    if (onCompleteCallback) {
        onCompleteCallback();
    }
}
