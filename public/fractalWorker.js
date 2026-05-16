function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hp = h / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));

    let r = 0, g = 0, b = 0;

    if (hp >= 0 && hp < 1) {
        r = c; g = x; b = 0;
    } else if (hp < 2) {
        r = x; g = c; b = 0;
    } else if (hp < 3) {
        r = 0; g = c; b = x;
    } else if (hp < 4) {
        r = 0; g = x; b = c;
    } else if (hp < 5) {
        r = x; g = 0; b = c;
    } else {
        r = c; g = 0; b = x;
    }

    const m = l - c / 2;
    return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
    ];
}

function paletteRgb(palette, iteration, maxIter) {
    if (palette === "fire") {
        const hue = 16 + (iteration * 5) % 36;
        return hslToRgb(hue, 92, 56);
    }

    if (palette === "ice") {
        const hue = 188 + (iteration * 5) % 34;
        return hslToRgb(hue, 84, 60);
    }

    const hue = (iteration / Math.max(1, maxIter)) * 360;
    return hslToRgb(hue, 78, 55);
}

self.onmessage = function (e) {
    const { width, height, maxIter, colorPalette, view } = e.data;
    const pixels = new Uint8ClampedArray(width * height * 4);
    const currentView = view || { centerX: -0.5, centerY: 0, scale: 3 };
    const scale = Math.max(0.000001, currentView.scale || 3);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const cr = currentView.centerX + ((x / width) - 0.5) * scale;
            const ci = currentView.centerY + ((y / width) - 0.5) * scale;

            let zr = 0;
            let zi = 0;
            let iter = 0;

            while (zr * zr + zi * zi <= 4 && iter < maxIter) {
                const temp = zr * zr - zi * zi + cr;
                zi = 2 * zr * zi + ci;
                zr = temp;
                iter++;
            }

            const pix = (x + y * width) * 4;
            if (iter === maxIter) {
                pixels[pix] = 4;
                pixels[pix + 1] = 6;
                pixels[pix + 2] = 11;
            } else {
                const [r, g, b] = paletteRgb(colorPalette, iter, maxIter);
                pixels[pix] = r;
                pixels[pix + 1] = g;
                pixels[pix + 2] = b;
            }
            pixels[pix + 3] = 255;
        }
    }

    self.postMessage({ imgDataArray: pixels }, [pixels.buffer]);
};
