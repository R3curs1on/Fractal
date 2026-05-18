const MODE_CONFIG = {
    Mandelbrot: {
        modeId: 0,
        centerX: -0.5,
        centerY: 0,
        scale: 3,
        maxElements: 12000,
        step: 200,
        defaultIterations: 350,
    },
    MandelbrotCube: {
        modeId: 1,
        centerX: -0.5,
        centerY: 0,
        scale: 3,
        maxElements: 12000,
        step: 200,
        defaultIterations: 350,
    },
    Julia: {
        modeId: 2,
        centerX: 0,
        centerY: 0,
        scale: 3,
        maxElements: 12000,
        step: 200,
        defaultIterations: 350,
    },
    JuliaCube: {
        modeId: 3,
        centerX: 0,
        centerY: 0,
        scale: 3,
        maxElements: 12000,
        step: 200,
        defaultIterations: 350,
    },
    NewtonRaphson: {
        modeId: 4,
        centerX: 0,
        centerY: 0,
        scale: 4,
        maxElements: 200,
        step: 10,
        defaultIterations: 20,
    },
};

const DEFAULT_SCHEMA = [
    {
        key: "colorPalette",
        label: "Color Palette",
        type: "select",
        options: ["default", "fire", "ice"],
        default: "default",
    },
    {
        key: "maxElements",
        label: "Max Iterations",
        type: "range",
        min: 5,
        max: 6000,
        step: 25,
        default: 250,
    },
];

const MAX_ITER_LIMIT = 12000;
const MIN_VIEW_SCALE = Number.MIN_VALUE;
const MAX_VIEW_SCALE = Number.MAX_VALUE;
const renderers = new WeakMap();

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision highp float;
precision highp int;

#define MAX_ITER_LIMIT 12000

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_scale;
uniform int u_maxIterations;
uniform int u_mode;
uniform int u_palette;
uniform vec2 u_juliaConstant;

float clamp01(float value) {
    return clamp(value, 0.0, 1.0);
}

vec2 mapToComplex(vec2 p) {
    return vec2(
        (p.x / u_resolution.x) * u_scale + u_center.x - u_scale * 0.5,
        (p.y / u_resolution.x) * u_scale + u_center.y - (u_scale * 0.5 * u_resolution.y) / u_resolution.x
    );
}

vec2 complexMul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 complexDiv(vec2 a, vec2 b) {
    float denom = b.x * b.x + b.y * b.y;
    if (denom <= 0.0000001) {
        return vec2(0.0);
    }
    return vec2(
        (a.x * b.x + a.y * b.y) / denom,
        (a.y * b.x - a.x * b.y) / denom
    );
}

vec3 paletteDefault(float t) {
    vec3 phase = vec3(0.0, 0.18, 0.36);
    return 0.5 + 0.5 * cos(6.2831853 * (phase + vec3(1.0, 0.92, 0.84) * t));
}

vec3 paletteFire(float t) {
    float s = pow(clamp01(t), 0.8);
    return mix(vec3(0.05, 0.01, 0.02), vec3(1.0, 0.62, 0.08), s);
}

vec3 paletteIce(float t) {
    float s = pow(clamp01(t), 0.7);
    return mix(vec3(0.03, 0.05, 0.08), vec3(0.18, 0.78, 1.0), s);
}

vec3 rootBase(int rootIndex) {
    if (rootIndex == 0) {
        return vec3(0.96, 0.35, 0.28);
    }
    if (rootIndex == 1) {
        return vec3(0.25, 0.86, 0.66);
    }
    return vec3(0.35, 0.56, 0.98);
}

vec3 paletteNewton(int rootIndex, float t) {
    vec3 base = rootBase(rootIndex);
    float s = pow(clamp01(t), 0.6);
    vec3 dark = vec3(0.04, 0.05, 0.08);
    vec3 bright = mix(base, vec3(1.0), 0.18 + 0.2 * s);
    return mix(dark, bright, 0.55 + 0.45 * s);
}

vec3 applyPalette(float t) {
    if (u_palette == 1) {
        return paletteFire(t);
    }
    if (u_palette == 2) {
        return paletteIce(t);
    }
    return paletteDefault(t);
}

void main() {
    vec2 c = mapToComplex(gl_FragCoord.xy);
    int maxIter = u_maxIterations;
    if (maxIter < 1) {
        maxIter = 1;
    }
    float smoothIter = float(maxIter);
    int rootIndex = -1;

    if (u_mode == 4) {
        vec2 z = c;
        for (int i = 0; i < MAX_ITER_LIMIT; ++i) {
            if (i >= maxIter) {
                break;
            }

            vec2 z2 = complexMul(z, z);
            vec2 z3 = complexMul(z2, z);
            vec2 fz = vec2(z3.x - 1.0, z3.y);
            vec2 dfz = vec2(3.0 * z2.x, 3.0 * z2.y);
            vec2 step = complexDiv(fz, dfz);
            vec2 nextZ = vec2(z.x - step.x, z.y - step.y);
            float stepLen = dot(step, step);

            z = nextZ;
            smoothIter = float(i);

            if (stepLen < 0.0000000001) {
                if (distance(z, vec2(1.0, 0.0)) < 0.0008) {
                    rootIndex = 0;
                } else if (distance(z, vec2(-0.5, 0.8660254)) < 0.0008) {
                    rootIndex = 1;
                } else if (distance(z, vec2(-0.5, -0.8660254)) < 0.0008) {
                    rootIndex = 2;
                }
                break;
            }
        }

        if (rootIndex == -1) {
            gl_FragColor = vec4(0.03, 0.04, 0.06, 1.0);
        } else {
            float t = smoothIter / float(maxIter);
            gl_FragColor = vec4(paletteNewton(rootIndex, t), 1.0);
        }
        return;
    }

    vec2 z = vec2(0.0);
    if (u_mode == 2 || u_mode == 3) {
        z = c;
    }

    bool escaped = false;
    for (int i = 0; i < MAX_ITER_LIMIT; ++i) {
        if (i >= maxIter) {
            break;
        }

        vec2 nextZ;
        if (u_mode == 1) {
            nextZ = vec2(
                z.x * z.x * z.x - z.x * z.y * z.y - 2.0 * z.x * z.y * z.y + c.x,
                3.0 * z.x * z.x * z.y - z.y * z.y * z.y + c.y
            );
        } else if (u_mode == 3) {
            nextZ = vec2(
                z.x * z.x * z.x - z.x * z.y * z.y - 2.0 * z.x * z.y * z.y + u_juliaConstant.x,
                3.0 * z.x * z.x * z.y - z.y * z.y * z.y + u_juliaConstant.y
            );
        } else if (u_mode == 2) {
            nextZ = vec2(
                z.x * z.x - z.y * z.y + u_juliaConstant.x,
                2.0 * z.x * z.y + u_juliaConstant.y
            );
        } else {
            nextZ = vec2(
                z.x * z.x - z.y * z.y + c.x,
                2.0 * z.x * z.y + c.y
            );
        }

        z = nextZ;
        smoothIter = float(i);

        if (dot(z, z) > 4.0) {
            escaped = true;
            break;
        }
    }

    if (!escaped) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    float magnitude = max(length(z), 1.000001);
    float smooth = smoothIter + 1.0 - log(log(magnitude)) / log(2.0);
    float t = clamp01(smooth / float(maxIter));
    gl_FragColor = vec4(applyPalette(t), 1.0);
}
`;

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function getContext(canvas) {
    const gl =
        canvas.getContext("webgl", {
            alpha: false,
            antialias: false,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
        }) ||
        canvas.getContext("experimental-webgl", {
            alpha: false,
            antialias: false,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
        });

    if (!gl) {
        throw new Error("Unable to acquire a WebGL context");
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

class WebGLRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = getContext(canvas);
        this.program = createProgram(this.gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
        this.modeLocation = this.gl.getUniformLocation(this.program, "u_mode");
        this.paletteLocation = this.gl.getUniformLocation(this.program, "u_palette");
        this.maxIterationsLocation = this.gl.getUniformLocation(this.program, "u_maxIterations");
        this.centerLocation = this.gl.getUniformLocation(this.program, "u_center");
        this.scaleLocation = this.gl.getUniformLocation(this.program, "u_scale");
        this.resolutionLocation = this.gl.getUniformLocation(this.program, "u_resolution");
        this.juliaLocation = this.gl.getUniformLocation(this.program, "u_juliaConstant");
        this.positionLocation = this.gl.getAttribLocation(this.program, "a_position");

        this.buffer = this.gl.createBuffer();
        if (!this.buffer) {
            throw new Error("Unable to create WebGL buffer");
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array([
                -1, -1,
                1, -1,
                -1, 1,
                1, 1,
            ]),
            this.gl.STATIC_DRAW
        );

        this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.clearColor(0, 0, 0, 1);
    }

    resetVertexState() {
        const maxAttribs = this.gl.getParameter(this.gl.MAX_VERTEX_ATTRIBS) || 0;
        for (let i = 0; i < maxAttribs; i += 1) {
            this.gl.disableVertexAttribArray(i);
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    paletteIndex(name) {
        if (name === "fire") {
            return 1;
        }
        if (name === "ice") {
            return 2;
        }
        return 0;
    }

    render({ modeId, centerX, centerY, scale, maxIterations, colorPalette, juliaConstant }) {
        const gl = this.gl;

        this.resetVertexState();
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1i(this.modeLocation, modeId);
        gl.uniform1i(this.paletteLocation, this.paletteIndex(colorPalette));
        gl.uniform1i(this.maxIterationsLocation, clamp(maxIterations | 0, 1, MAX_ITER_LIMIT));
        gl.uniform2f(this.centerLocation, centerX, centerY);
        gl.uniform1f(this.scaleLocation, scale);
        gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
        gl.uniform2f(this.juliaLocation, juliaConstant.x, juliaConstant.y);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.flush();
    }
}

function getRenderer(canvas) {
    let renderer = renderers.get(canvas);
    if (!renderer) {
        renderer = new WebGLRenderer(canvas);
        renderers.set(canvas, renderer);
    }
    return renderer;
}

export function createPixelFractalEngine(mode = "Mandelbrot") {
    const config = MODE_CONFIG[mode];

    if (!config) {
        throw new Error(`Unknown pixel fractal mode: ${mode}`);
    }

    const schema = DEFAULT_SCHEMA.map((field) => {
        if (field.key === "maxElements") {
            return {
                ...field,
                min: mode === "NewtonRaphson" ? 5 : 50,
                max: config.maxElements,
                step: config.step,
                default: config.defaultIterations,
            };
        }

        return { ...field };
    });

    return {
        schema,
        rendererKind: "webgl",
        mode,
        modeId: config.modeId,

        getDefaultParams() {
            const params = {};
            this.schema.forEach((p) => {
                params[p.key] = p.default;
            });
            return params;
        },

        cancelRender() {},

        init(canvas, params) {
            return {
                generation: 0,
                type: mode,
                elementCount: clamp(
                    Number(params?.maxElements) || config.defaultIterations,
                    schema[1].min,
                    schema[1].max
                ),
                view: {
                    centerX: config.centerX,
                    centerY: config.centerY,
                    scale: config.scale,
                },
                mouseX: canvas ? canvas.width / 2 : 0,
                mouseY: canvas ? canvas.height / 2 : 0,
                juliaFrozen: false,
            };
        },

        next(currentState, params) {
            return {
                ...currentState,
                generation: currentState.generation + 1,
                elementCount: clamp(
                    Number(currentState.elementCount) + config.step,
                    schema[1].min,
                    Number(params.maxElements) || config.maxElements
                ),
                view: {
                    ...currentState.view,
                },
            };
        },

        zoomAt(currentState, canvas, x, y, zoomIn = true) {
            const factor = zoomIn ? 0.9 : 1.1;
            const nextScale = clamp(currentState.view.scale * factor, MIN_VIEW_SCALE, MAX_VIEW_SCALE);
            const delta = nextScale - currentState.view.scale;
            const px = x / canvas.width;
            const py = y / canvas.height;

            return {
                ...currentState,
                view: {
                    ...currentState.view,
                    centerX: currentState.view.centerX + (0.5 - px) * delta,
                    centerY:
                        currentState.view.centerY +
                        (0.5 - py) * delta * (canvas.height / canvas.width),
                    scale: nextScale,
                },
            };
        },

        panBy(currentState, canvas, dx, dy) {
            return {
                ...currentState,
                view: {
                    ...currentState.view,
                    centerX: currentState.view.centerX - (dx / canvas.width) * currentState.view.scale,
                    centerY: currentState.view.centerY - (dy / canvas.height) * currentState.view.scale,
                },
            };
        },

        adjustIterations(currentState, delta, params) {
            return {
                ...currentState,
                elementCount: clamp(
                    Number(currentState.elementCount) + delta,
                    schema[1].min,
                    Number(params.maxElements) || config.maxElements
                ),
            };
        },

        toggleJuliaFreeze(currentState) {
            return {
                ...currentState,
                juliaFrozen: !currentState.juliaFrozen,
            };
        },

        render(canvas, currentState, params, onCompleteCallback) {
            const renderer = getRenderer(canvas);
            const juliaConstant = {
                x: ((Number(currentState?.mouseX) || canvas.width / 2) - canvas.width / 2) / canvas.width,
                y: ((Number(currentState?.mouseY) || canvas.height / 2) - canvas.height / 2) / canvas.width,
            };
            const view = currentState?.view || {
                centerX: config.centerX,
                centerY: config.centerY,
                scale: config.scale,
            };

            renderer.render({
                modeId: config.modeId,
                centerX: view.centerX,
                centerY: view.centerY,
                scale: view.scale,
                maxIterations: Number(currentState?.elementCount) || config.defaultIterations,
                colorPalette: params?.colorPalette || "default",
                juliaConstant,
            });

            if (onCompleteCallback) {
                onCompleteCallback();
            }
        },
    };
}

const MandelbrotEngine = createPixelFractalEngine("Mandelbrot");

export default MandelbrotEngine;
