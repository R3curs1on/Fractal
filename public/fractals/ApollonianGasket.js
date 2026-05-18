import { getPaletteColor } from "./palette.js";

class ApollonianCircle {
    constructor(x, y, r, depth = 0, outer = false) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.depth = depth;
        this.outer = outer;
    }
}

function complex(re, im = 0) {
    return { re, im };
}

function cadd(a, b) {
    return complex(a.re + b.re, a.im + b.im);
}

function cscale(a, s) {
    return complex(a.re * s, a.im * s);
}

function cmul(a, b) {
    return complex(
        a.re * b.re - a.im * b.im,
        a.re * b.im + a.im * b.re
    );
}

function cdiv(a, s) {
    return complex(a.re / s, a.im / s);
}

function csqrt(z) {
    const magnitude = Math.hypot(z.re, z.im);
    const rootRe = Math.sqrt(Math.max(0, (magnitude + z.re) / 2));
    const rootIm = Math.sqrt(Math.max(0, (magnitude - z.re) / 2));
    return complex(rootRe, z.im < 0 ? -rootIm : rootIm);
}

function toSignedCurvature(circle) {
    if (circle.outer) {
        return -1 / Math.max(circle.r, 1e-9);
    }
    return 1 / Math.max(circle.r, 1e-9);
}

function toComplex(circle) {
    return complex(circle.x, circle.y);
}

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function areTangent(a, b, tolerance = 1.75) {
    const expected = a.outer || b.outer
        ? Math.abs(Math.abs(a.r) - Math.abs(b.r))
        : Math.abs(a.r + b.r);
    return Math.abs(distance(a, b) - expected) <= tolerance;
}

function sameCircle(a, b) {
    return Math.abs(a.x - b.x) < 0.75 && Math.abs(a.y - b.y) < 0.75 && Math.abs(a.r - b.r) < 0.75;
}

function descartesCircle(c1, c2, c3, sign = 1) {
    const k1 = toSignedCurvature(c1);
    const k2 = toSignedCurvature(c2);
    const k3 = toSignedCurvature(c3);
    const kRoot = Math.sqrt(Math.max(0, k1 * k2 + k2 * k3 + k3 * k1));
    const k4 = k1 + k2 + k3 + 2 * sign * kRoot;
    if (!Number.isFinite(k4) || Math.abs(k4) < 1e-9) {
        return null;
    }

    const z1 = toComplex(c1);
    const z2 = toComplex(c2);
    const z3 = toComplex(c3);
    const term = cadd(cadd(cscale(z1, k1), cscale(z2, k2)), cscale(z3, k3));
    const rootTerm = csqrt(
        cadd(
            cadd(cscale(cmul(z1, z2), k1 * k2), cscale(cmul(z2, z3), k2 * k3)),
            cscale(cmul(z3, z1), k3 * k1)
        )
    );
    const numerator = cadd(term, cscale(rootTerm, 2 * sign));
    const z4 = cdiv(numerator, k4);

    return new ApollonianCircle(
        z4.re,
        z4.im,
        Math.abs(1 / k4),
        Math.max(c1.depth, c2.depth, c3.depth) + 1,
        false
    );
}

function buildSeedCircles(canvas, padding) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const outerRadius = Math.min(canvas.width, canvas.height) / 2 - padding;
    const innerRadius = outerRadius / (1 + (2 / Math.sqrt(3)));
    const orbit = outerRadius - innerRadius;

    const outer = new ApollonianCircle(cx, cy, outerRadius, 0, true);
    const innerA = new ApollonianCircle(cx + orbit, cy, innerRadius, 0, false);
    const innerB = new ApollonianCircle(
        cx - orbit * 0.5,
        cy + orbit * (Math.sqrt(3) / 2),
        innerRadius,
        0,
        false
    );
    const innerC = new ApollonianCircle(
        cx - orbit * 0.5,
        cy - orbit * (Math.sqrt(3) / 2),
        innerRadius,
        0,
        false
    );

    return [outer, innerA, innerB, innerC];
}

function generateApollonianNext(circles, maxElements) {
    const next = circles.slice();
    const seen = new Set(
        next.map((circle) => `${circle.x.toFixed(2)}:${circle.y.toFixed(2)}:${circle.r.toFixed(2)}`)
    );

    for (let i = 0; i < circles.length; i += 1) {
        for (let j = i + 1; j < circles.length; j += 1) {
            for (let k = j + 1; k < circles.length; k += 1) {
                const a = circles[i];
                const b = circles[j];
                const c = circles[k];
                if (!areTangent(a, b) || !areTangent(b, c) || !areTangent(a, c)) {
                    continue;
                }

                const candidates = [
                    descartesCircle(a, b, c, 1),
                    descartesCircle(a, b, c, -1),
                ].filter(Boolean);

                for (const candidate of candidates) {
                    if (candidate.r < 1.25) {
                        continue;
                    }

                    const key = `${candidate.x.toFixed(2)}:${candidate.y.toFixed(2)}:${candidate.r.toFixed(2)}`;
                    if (seen.has(key) || next.some((circle) => sameCircle(circle, candidate))) {
                        continue;
                    }

                    next.push(candidate);
                    seen.add(key);

                    if (next.length >= maxElements) {
                        return next;
                    }
                }
            }
        }
    }

    return next;
}

const ApollonianGasketEngine = {
    schema: [
        { key: "maxElements", label: "Max Circles", type: "range", min: 4, max: 25000, step: 100, default: 4000 },
        { key: "padding", label: "Canvas Padding", type: "range", min: 10, max: 180, step: 5, default: 38 },
        { key: "colorPalette", label: "Color Palette", type: "select", options: ["default", "fire", "ice"], default: "default" }
    ],

    getDefaultParams() {
        const params = {};
        this.schema.forEach((p) => {
            params[p.key] = p.default;
        });
        return params;
    },

    init(canvas, params) {
        return {
            generation: 0,
            elements: buildSeedCircles(canvas, Number(params.padding)),
            elementCount: 4,
        };
    },

    next(currentState, params) {
        const maxElements = Number(params.maxElements) || 4000;
        if ((currentState?.elements?.length || 0) >= maxElements) {
            return {
                generation: (currentState?.generation || 0) + 1,
                elements: currentState.elements,
                elementCount: currentState.elements.length,
            };
        }

        const nextCircles = generateApollonianNext(currentState.elements, maxElements);
        return {
            generation: currentState.generation + 1,
            elements: nextCircles,
            elementCount: nextCircles.length,
        };
    },

    render(ctx, currentState, params) {
        const color = getPaletteColor(params.colorPalette, currentState.generation);
        currentState.elements.forEach((circle) => {
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, Math.abs(circle.r), 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = circle.outer ? 1.5 : 0.75;
            ctx.stroke();
        });
    }
};

export default ApollonianGasketEngine;
export { ApollonianCircle };
