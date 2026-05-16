const NewtonEngine = {

    params : {
        colorPalette: "default",
        maxElements: 0, // Not used for pixel-mapped fractals
    }, 

    init(canvas, params) {
        this.iterations = 5;
        return {generation: 0}; // We can track generation for potential dynamic coloring
    },

    next(currentState, params   ) {
        this.iterations += 5;
        return currentState;
    },

    render(ctx, currentState, params) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const maxIter = this.iterations;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let zx = 0, zy = 0;
                const cx = (x - width / 2) * 4 / width;
                const cy = (y - height / 2) * 4 / width;

                let iter = 0;
                while (zx * zx + zy * zy <= 4 && iter < maxIter) {
                    const xtemp = zx * zx - zy * zy - cx;
                    zy = 2 * zx * zy - cy;
                    zx = xtemp;
                    iter++;
                }

                const colorValue = iter === maxIter ? 0 : Math.floor(255 * iter / maxIter);
                ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }

    }
};

export default NewtonEngine ;