// public/fractalWorker.js

self.onmessage = function (e) {
    const { type, width, height, maxIter, colorPalette } = e.data;
    
    // Create an array buffer to hold pixel data directly
    const imgDataArray = new Uint8ClampedArray(width * height * 4);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            
            let iter = 0;
            let finalIter = maxIter;

            if (type === "Mandelbrot") {
                let zx = 0, zy = 0;
                const cx = (x - width / 2) * 4 / width;
                const cy = (y - height / 2) * 4 / width;

                while (zx * zx + zy * zy <= 4 && iter < maxIter) {
                    const xtemp = zx * zx - zy * zy + cx;
                    zy = 2 * zx * zy + cy;
                    zx = xtemp;
                    iter++;
                }
                finalIter = iter;

            } else if (type === "NewtonRaphson") {
                // Mapping screen to complex plane for Z^3 - 1 = 0
                let zr = (x - width / 2) * 4 / width;
                let zi = (y - height / 2) * 4 / width;
                const tolerance = 0.000001;
                
                while (iter < maxIter) {
                    // Newton step for Z_next = Z - (Z^3 - 1) / (3*Z^2)
                    let r2 = zr * zr;
                    let i2 = zi * zi;
                    let denom = 3.0 * ((r2 - i2) * (r2 - i2) + 4.0 * r2 * i2);
                    if (denom < 1e-8) break;

                    let next_zr = zr - (3.0 * r2 * r2 * zr - 6.0 * r2 * zi * zi * zr - 3.0 * i2 * i2 * zr + r2 - i2) / denom;
                    let next_zi = zi - (6.0 * r2 * r2 * zi + 3.0 * r2 * zr * zr * zi - 3.0 * i2 * i2 * zi + 2.0 * zr * zi) / denom;

                    // Check divergence/convergence tolerance
                    if ((next_zr - zr) * (next_zr - zr) + (next_zi - zi) * (next_zi - zi) < tolerance) {
                        break;
                    }
                    zr = next_zr;
                    zi = next_zi;
                    iter++;
                }
                finalIter = iter;
            }

            // Calculate pixel pointer offset inside buffer array
            const idx = (x + y * width) * 4;
            
            // Color Mapping Algorithms
            if (finalIter === maxIter) {
                // Interior parts (stable convergence zones)
                imgDataArray[idx] = 15;     // R
                imgDataArray[idx + 1] = 15; // G
                imgDataArray[idx + 2] = 20; // B
                imgDataArray[idx + 3] = 255;// A
            } else {
                // Escape velocity boundaries
                let r = 0, g = 0, b = 0;
                const factor = finalIter / maxIter;

                if (colorPalette === "fire") {
                    r = Math.floor(factor * 255);
                    g = Math.floor(Math.pow(factor, 2) * 255);
                    b = 30;
                } else if (colorPalette === "ice") {
                    r = 30;
                    g = Math.floor(Math.pow(factor, 0.5) * 200);
                    b = Math.floor(factor * 255);
                } else {
                    // Default Smooth HSL transition mapping inside RGB space
                    const hue = (finalIter * 5) % 360;
                    const rgb = hslToRgb(hue / 360, 0.8, 0.5);
                    r = rgb[0]; g = rgb[1]; b = rgb[2];
                }

                imgDataArray[idx] = r;
                imgDataArray[idx + 1] = g;
                imgDataArray[idx + 2] = b;
                imgDataArray[idx + 3] = 255;
            }
        }
    }

    // Pass the typed array buffer directly back via zero-copy message port pipeline
    self.postMessage({ imgDataArray }, [imgDataArray.buffer]);
};

// Simple embedded utility to convert precise HSL ranges to Uint8 specifications
function hslToRgb(h, s, l) {
    let r, g, b;
    if (s == 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}