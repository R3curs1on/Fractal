

const MandelbrotEngine = {
    params: {
        colorPalette: "default",
        maxElements: 0 , // Not used for pixel-mapped fractals
    }, 

    init(canvas, params) {
        return { generation: 0 }; // We can track generation for potential dynamic coloring
    },

    next(currentState, params) {
        currentState.generation += 15; // Increase max iterations to sharpen the detail
        return currentState;
    },

    render(ctx, currentState, params) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const maxIter = currentState.generation;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                // Map pixel coordinate to complex number
                let zx = 0, zy = 0;
                const cx = (x - width / 2) * 4 / width;
                const cy = (y - height / 2) * 4 / width;

                let iter = 0;
                while (zx * zx + zy * zy <= 4 && iter < maxIter) {
                    const xtemp = zx * zx - zy * zy + cx;
                    zy = 2 * zx * zy + cy;
                    zx = xtemp;
                    iter++;
                }

                // Color based on the number of iterations
                const colorValue = iter === maxIter ? 0 : Math.floor(255 * iter / maxIter);
                ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
};

export default  MandelbrotEngine ;
