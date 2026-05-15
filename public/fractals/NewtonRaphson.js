export const NewtonEngine = {
    maxElements: 0,
    iterations: 10,

    init(canvas) {
        this.iterations = 5;
        return [];
    },

    next(list) {
        this.iterations += 5;
        return [];
    },

    render(ctx, list) {
        const w = ctx.canvas.width, h = ctx.canvas.height;
        const imgData = ctx.createImageData(w, h);

        // 3 True complex roots of Z^3 - 1 = 0
        const roots = [
            { r: 1, i: 0 },
            { r: -0.5, i: Math.sqrt(3)/2 },
            { r: -0.5, i: -Math.sqrt(3)/2 }
        ];

        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                // Map to complex plane (-2 to 2)
                let zr = (x / w) * 4 - 2;
                let zi = (y / h) * 4 - 2;

                let iter = 0;
                let rootIndex = -1;

                while (iter < this.iterations) {
                    // Newton step for Z^3 - 1: Z_new = Z - (Z^3 - 1) / (3 * Z^2)
                    let d = 3.0 * (zr*zr*zr*zr + 2.0*zr*zr*zi*zi + zi*zi*zi*zi);
                    if (d === 0) break;

                    let next_zr = zr - (zr*zr*zr*zr - zi*zi*zi*zi - zr + 2.0*zr*zr*zi*zi) / d;
                    let next_zi = zi - (2.0*zr*zr*zr*zi + 2.0*zr*zi*zi*zi - zi) / d;
                    
                    zr = next_zr;
                    zi = next_zi;

                    // Check closeness to any of the 3 roots
                    for (let rIdx = 0; rIdx < roots.length; rIdx++) {
                        let dr = zr - roots[rIdx].r;
                        let di = zi - roots[rIdx].i;
                        if (dr*dr + di*di < 0.001) {
                            rootIndex = rIdx;
                            break;
                        }
                    }
                    if (rootIndex !== -1) break;
                    iter++;
                }

                const pix = (x + y * w) * 4;
                imgData.data[pix+3] = 255; // Alpha

                // Color based on which root it converged to
                if (rootIndex === 0) { imgData.data[pix] = 255; } // Red Root
                else if (rootIndex === 1) { imgData.data[pix+1] = 255; } // Green Root
                else if (rootIndex === 2) { imgData.data[pix+2] = 255; } // Blue Root
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }
};
