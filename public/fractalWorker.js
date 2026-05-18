self.onmessage = function (e) {
    const {
        type,
        width,
        height,
        maxIter,
        colorPalette = "default",
        view = {},
        julia = {},
    } = e.data;

    const pixels = new Uint8ClampedArray(width * height * 4);
    const centerX = typeof view.centerX === "number"
        ? view.centerX
        : (type === "Mandelbrot" || type === "MandelbrotCube" ? -0.5 : 0);
    const centerY = typeof view.centerY === "number" ? view.centerY : 0;
    const scale = typeof view.scale === "number" ? view.scale : 3;
    const juliaRe = typeof julia.re === "number" ? julia.re : 0;
    const juliaIm = typeof julia.im === "number" ? julia.im : 0;

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const point = mapPixelToComplex(x, y, width, height, centerX, centerY, scale);
            let iter = 0;
            let rootIndex = -1;

            if (type === "Julia") {
                iter = iterateJulia(point.re, point.im, juliaRe, juliaIm, maxIter);
            } else if (type === "JuliaCube") {
                iter = iterateJuliaCube(point.re, point.im, juliaRe, juliaIm, maxIter);
            } else if (type === "MandelbrotCube") {
                iter = iterateMandelbrotCube(point.re, point.im, maxIter);
            } else if (type === "NewtonRaphson") {
                const result = iterateNewtonRaphson(point.re, point.im, maxIter);
                iter = result.iter;
                rootIndex = result.rootIndex;
            } else {
                iter = iterateMandelbrot(point.re, point.im, maxIter);
            }

            const idx = (x + y * width) * 4;
            const rgba = type === "NewtonRaphson"
                ? colorForNewton(rootIndex, iter, maxIter, colorPalette)
                : colorForIteration(iter, maxIter, colorPalette);
            pixels[idx] = rgba[0];
            pixels[idx + 1] = rgba[1];
            pixels[idx + 2] = rgba[2];
            pixels[idx + 3] = rgba[3];
        }
    }

    self.postMessage({ imgDataArray: pixels }, [pixels.buffer]);
};

function mapPixelToComplex(x, y, width, height, centerX, centerY, scale) {
    return {
        re: (x / width) * scale + centerX - scale * 0.5,
        im: (y / width) * scale + centerY - (scale * 0.5 * height) / width,
    };
}

function iterateMandelbrot(re, im, maxIter) {
    let x = 0;
    let y = 0;
    let iter = 0;

    while (iter < maxIter && x * x + y * y < 4) {
        const tmp = x * x - y * y + re;
        y = 2 * x * y + im;
        x = tmp;
        iter += 1;
    }

    return iter;
}

function iterateMandelbrotCube(re, im, maxIter) {
    let x = 0;
    let y = 0;
    let iter = 0;

    while (iter < maxIter && x * x + y * y < 4) {
        const tmp = x * x * x - x * y * y - 2 * x * y * y + re;
        y = 3 * x * x * y - y * y * y + im;
        x = tmp;
        iter += 1;
    }

    return iter;
}

function iterateJulia(x, y, constantRe, constantIm, maxIter) {
    let iter = 0;

    while (iter < maxIter && x * x + y * y < 4) {
        const tmp = x * x - y * y + constantRe;
        y = 2 * x * y + constantIm;
        x = tmp;
        iter += 1;
    }

    return iter;
}

function iterateJuliaCube(x, y, constantRe, constantIm, maxIter) {
    let iter = 0;

    while (iter < maxIter && x * x + y * y < 4) {
        const tmp = x * x * x - x * y * y - 2 * x * y * y + constantRe;
        y = 3 * x * x * y - y * y * y + constantIm;
        x = tmp;
        iter += 1;
    }

    return iter;
}

function iterateNewtonRaphson(re, im, maxIter) {
    let zr = re;
    let zi = im;
    const tolerance = 0.000001;
    const roots = [
        { r: 1, i: 0 },
        { r: -0.5, i: Math.sqrt(3) / 2 },
        { r: -0.5, i: -Math.sqrt(3) / 2 },
    ];

    for (let iter = 0; iter < maxIter; iter += 1) {
        const r2 = zr * zr;
        const i2 = zi * zi;
        const denom = 3.0 * ((r2 - i2) * (r2 - i2) + 4.0 * r2 * i2);
        if (denom < 1e-8) {
            return { iter, rootIndex: -1 };
        }

        const nextZr = zr - (3.0 * r2 * r2 * zr - 6.0 * r2 * zi * zi * zr - 3.0 * i2 * i2 * zr + r2 - i2) / denom;
        const nextZi = zi - (6.0 * r2 * r2 * zi + 3.0 * r2 * zr * zr * zi - 3.0 * i2 * i2 * zi + 2.0 * zr * zi) / denom;

        if ((nextZr - zr) * (nextZr - zr) + (nextZi - zi) * (nextZi - zi) < tolerance) {
            zr = nextZr;
            zi = nextZi;
            for (let i = 0; i < roots.length; i += 1) {
                const dr = zr - roots[i].r;
                const di = zi - roots[i].i;
                if (dr * dr + di * di < 0.0008) {
                    return { iter, rootIndex: i };
                }
            }
            return { iter, rootIndex: -1 };
        }

        zr = nextZr;
        zi = nextZi;
    }

    return { iter: maxIter, rootIndex: -1 };
}

function colorForIteration(iter, maxIter, paletteName) {
    if (iter >= maxIter) {
        return [0, 0, 0, 255];
    }

    const t = iter / maxIter;

    if (paletteName === "fire") {
        return [
            Math.floor(t * 255),
            Math.floor(t * t * 255),
            30,
            255,
        ];
    }

    if (paletteName === "ice") {
        return [
            30,
            Math.floor(Math.sqrt(t) * 200),
            Math.floor(t * 255),
            255,
        ];
    }

    const hue = (iter * 5) % 360;
    return [...hslToRgb(hue / 360, 0.8, 0.5), 255];
}

function colorForNewton(rootIndex, iter, maxIter, paletteName) {
    if (rootIndex === -1) {
        return [8, 10, 16, 255];
    }

    const t = iter / maxIter;

    if (paletteName === "fire") {
        return [
            Math.floor(180 + t * 75),
            Math.floor(40 + rootIndex * 40 + t * 110),
            Math.floor(20 + t * 35),
            255,
        ];
    }

    if (paletteName === "ice") {
        return [
            Math.floor(30 + t * 40),
            Math.floor(120 + rootIndex * 35 + t * 80),
            Math.floor(170 + t * 70),
            255,
        ];
    }

    const hue = (rootIndex * 120 + iter * 6) % 360;
    return [...hslToRgb(hue / 360, 0.85, 0.5), 255];
}

function hslToRgb(h, s, l) {
    let r;
    let g;
    let b;

    if (s === 0) {
        r = l;
        g = l;
        b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}
