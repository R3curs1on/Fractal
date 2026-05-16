import { getPaletteColor } from "./palette.js";

const NewtonEngine = {
    schema: [
        { key: "maxElements", label: "Max Iterations", type: "range", min: 5, max: 80, step: 5, default: 20 },
        { key: "colorPalette", label: "Color Palette", type: "select", options: ["default", "fire", "ice"], default: "default" }
    ],

    getDefaultParams() {
        const params = {};
        this.schema.forEach(p => params[p.key] = p.default);
        return params;
    },

    init(canvas, params) {
        this.iterations = 5;
        return { generation: 0, elements: [], elementCount: this.iterations };
    },

    next(currentState, params) {
        this.iterations = Math.min(Number(params.maxElements), this.iterations + 5);
        return {
            generation: currentState.generation + 1,
            elements: [],
            elementCount: this.iterations
        };
    },

    render(ctx, currentState, params) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const maxIter = this.iterations;

        const roots = [
            { r: 1, i: 0 },
            { r: -0.5, i: Math.sqrt(3) / 2 },
            { r: -0.5, i: -Math.sqrt(3) / 2 }
        ];

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let zr = (x / width) * 4 - 2;
                let zi = (y / height) * 4 - 2;

                let iter = 0;
                let rootIndex = -1;

                while (iter < maxIter) {
                    const zr2 = zr * zr;
                    const zi2 = zi * zi;

                    const fzr = zr * zr2 - 3 * zr * zi2 - 1;
                    const fzi = 3 * zr2 * zi - zi * zi2;
                    const dfr = 3 * (zr2 - zi2);
                    const dfi = 6 * zr * zi;
                    const denom = dfr * dfr + dfi * dfi;

                    if (denom === 0) break;

                    const stepR = (fzr * dfr + fzi * dfi) / denom;
                    const stepI = (fzi * dfr - fzr * dfi) / denom;

                    zr -= stepR;
                    zi -= stepI;

                    for (let i = 0; i < roots.length; i++) {
                        const dr = zr - roots[i].r;
                        const di = zi - roots[i].i;
                        if (dr * dr + di * di < 0.0008) {
                            rootIndex = i;
                            break;
                        }
                    }

                    if (rootIndex !== -1 || (stepR * stepR + stepI * stepI) < 1e-10) {
                        break;
                    }

                    iter++;
                }

                const color = rootIndex === -1
                    ? "#05070b"
                    : getPaletteColor(params.colorPalette, currentState.generation, rootIndex * 90 + iter);

                ctx.fillStyle = color;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
};

export default NewtonEngine;
