const MandelbrotEngine = {
    maxElements: 0, // Not used for pixel-mapped fractals
    generation: 0,  // We use this as the "max iterations" depth

    init(canvas) {
        this.generation = 15; // Start with low resolution/speed
        return []; // No object array needed
    },

    next(list) {
        this.generation += 15; // Increase max iterations to sharpen the detail
        return [];
    },

    render(ctx, list) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const imgData = ctx.createImageData(width, height);

        // Zoom/Pan variables to center the set
        const minX = -2.0, maxX = 1.0;
        const minY = -1.5, maxY = 1.5;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                // Map pixel coordinates to complex number plane
                let cr = minX + (x / width) * (maxX - minX);
                let ci = minY + (y / height) * (maxY - minY);

                let zr = 0.0, zi = 0.0;
                let i = 0;

                // Test if the point escapes: Z = Z^2 + C
                while (zr * zr + zi * zi <= 4.0 && i < this.generation) {
                    let temp = zr * zr - zi * zi + cr;
                    zi = 2.0 * zr * zi + ci;
                    zr = temp;
                    i++;
                }

                // Pixel index mapping inside ImageData array (r, g, b, a)
                const pix = (x + y * width) * 4;
                if (i === this.generation) {
                    imgData.data[pix] = 0;     // R
                    imgData.data[pix+1] = 0;   // G
                    imgData.data[pix+2] = 0;   // B
                } else {
                    // Color mapping based on escape velocity
                    let hue = (i / this.generation) * 360;
                    imgData.data[pix] = Math.sin(hue) * 127 + 128; // Dynamic R
                    imgData.data[pix+1] = i * 5 % 255;             // Dynamic G
                    imgData.data[pix+2] = 255 - (i * 3 % 255);     // Dynamic B
                }
                imgData.data[pix+3] = 255; // Alpha opaque
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }
};

export { MandelbrotEngine };
