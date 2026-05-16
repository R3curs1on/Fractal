

const MandelbrotEngine = {
    schema  : [
        { key: "colorPalette", label: "Color Palette", type: "select", options: ["default"], default: "default" },
        { key: "maxElements", label: "Max Iterations", type: "range", min: 100, max: 2000, step: 100, default: 1000 }
    ],
    getDefaultParams() {
        const params = {};
        this.schema.forEach(p => params[p.key] = p.default);
        return params;
    },
    // params: {
    //     colorPalette: "default",
    //     maxElements: 0 , // Not used for pixel-mapped fractals
    // }, 

    init(canvas, params) {
        return { generation: 0 , elements: [] , elementCount: 0 }; // We can track generation for potential dynamic coloring
    },

    next(currentState, params) {
        currentState.generation += 15; // Increase max iterations to sharpen the detail
        return {generation: currentState.generation, elements: currentState.elements, elementCount: currentState.elementCount};
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

/*
const SierpinskiEngine = { 

    schema :[
        { key: "maxElements", label: "Max Triangles", type: "range", min: 100, max: 20000, step: 100, default: 10000 },
        { key: "padding", label: "Canvas Padding", type: "range", min: 10, max: 150, step: 5, default: 50 },
        { key: "colorPalette", label: "Color Palette", type: "select", options: ["default", "fire", "ice"], default: "default" }
    ],

    // params: {
    //     maxElements: 10000,
    //     padding: 50,
    //     colorPalette: "default"
    // },

    getDefaultParams() {
        const params = {};
        this.schema.forEach(p => params[p.key] = p.default);
        return params;
    },

    init(canvas, params) { 
        const p = Number(params.padding); 

        let x1 = canvas.width / 2, y1 = p;
        let x2 = p, y2 = canvas.height - p;
        let x3 = canvas.width - p, y3 = canvas.height - p;

        return {
            generation: 0,   
            elements: [ new Triangle( x1, y1, x2, y2, x3, y3 ) ] ,
            elementCount: 1
        };
         
    },
 
    next(currentState, params) {
         if (currentState.elements.length > Number(params.maxElements)) {
            console.warn("Safety Threshold Limit Hit");
            return currentState;
        }
        const nextElements = generateNextGenTriangles(currentState.elements);
        return {
            generation: currentState.generation + 1,
            elementCount: nextElements.length,
            elements: nextElements
        }; 
    }, 
    render(ctx, currentState, params) {
        currentState.elements.forEach(t => t.draw(ctx, params.colorPalette, currentState.generation));
    }
};

*/
