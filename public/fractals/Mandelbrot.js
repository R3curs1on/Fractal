

// const MandelbrotEngine = {
//     schema  : [
//         { key: "colorPalette", label: "Color Palette", type: "select", options: ["default"], default: "default" },
//         { key: "maxElements", label: "Max Iterations", type: "range", min: 100, max: 2000, step: 100, default: 1000 }
//     ],
//     getDefaultParams() {
//         const params = {};
//         this.schema.forEach(p => params[p.key] = p.default);
//         return params;
//     },
//     // params: {
//     //     colorPalette: "default",
//     //     maxElements: 0 , // Not used for pixel-mapped fractals
//     // }, 

//     init(canvas, params) {
//         return { generation: 0 , elements: [] , elementCount: 0 }; // We can track generation for potential dynamic coloring
//     },

//     next(currentState, params) {
//         currentState.generation += 15; // Increase max iterations to sharpen the detail
//         return {generation: currentState.generation, elements: currentState.elements, elementCount: currentState.elementCount};
//     },

//     render(ctx, currentState, params) {
//         const width = ctx.canvas.width;
//         const height = ctx.canvas.height;
//         const maxIter = currentState.generation;

//         for (let x = 0; x < width; x++) {
//             for (let y = 0; y < height; y++) {
//                 // Map pixel coordinate to complex number
//                 let zx = 0, zy = 0;
//                 const cx = (x - width / 2) * 4 / width;
//                 const cy = (y - height / 2) * 4 / width;

//                 let iter = 0;
//                 while (zx * zx + zy * zy <= 4 && iter < maxIter) {
//                     const xtemp = zx * zx - zy * zy + cx;
//                     zy = 2 * zx * zy + cy;
//                     zx = xtemp;
//                     iter++;
//                 }

//                 // Color based on the number of iterations
//                 const colorValue = iter === maxIter ? 0 : Math.floor(255 * iter / maxIter);
//                 ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
//                 ctx.fillRect(x, y, 1, 1);
//             }
//         }
//     }
// };

// export default  MandelbrotEngine ;


// src/fractals/Mandelbrot.js

const MandelbrotEngine = {
    schema: [
        { key: "colorPalette", label: "Color Palette", type: "select", options: ["default", "fire", "ice"], default: "default" },
        { key: "maxElements", label: "Max Iterations", type: "range", min: 50, max: 1500, step: 50, default: 150 }
    ],
    getDefaultParams() {
        const params = {};
        this.schema.forEach(p => params[p.key] = p.default);
        return params;
    },
    init(canvas, params) {
        return {
            generation: 0,
            type: "Mandelbrot",
            elementCount: 50,
            view: {
                centerX: -0.5,
                centerY: 0,
                scale: 3
            }
        };
    },
    next(currentState, params) {
        return {
            generation: currentState.generation + 1,
            type: "Mandelbrot",
            elementCount: Math.min(Number(params.maxElements), currentState.elementCount + 50),
            view: currentState.view
        };
    },
    render(ctx, currentState, params, onCompleteCallback) {
        if (this._activeWorker) {
            this._activeWorker.terminate();
            this._activeWorker = null;
        }

        // Instantiate worker background execution thread hook
        const worker = new Worker(new URL("../fractalWorker.js", import.meta.url));
        this._activeWorker = worker;
        
        worker.postMessage({
            type: "Mandelbrot",
            width: ctx.canvas.width,
            height: ctx.canvas.height,
            maxIter: currentState.elementCount,
            colorPalette: params.colorPalette,
            view: currentState.view
        });

        worker.onmessage = function (e) {
            const { imgDataArray } = e.data;
            const imgData = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);
            imgData.data.set(imgDataArray);
            ctx.putImageData(imgData, 0, 0);
            
            worker.terminate(); // Cleanup worker resources immediately
            if (MandelbrotEngine._activeWorker === worker) {
                MandelbrotEngine._activeWorker = null;
            }
            if (onCompleteCallback) onCompleteCallback();
        };

        worker.onerror = function (err) {
            console.error("Mandelbrot worker failed:", err);
            worker.terminate();
            if (MandelbrotEngine._activeWorker === worker) {
                MandelbrotEngine._activeWorker = null;
            }
        };
    }
};

export default MandelbrotEngine;
