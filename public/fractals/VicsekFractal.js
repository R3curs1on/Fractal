// import getRandomColor from './getRandomColor.js';

// const colorGenerator = getRandomColor();

class VicsekSquare {
    constructor(x, y, size) {
        this.x = x; 
        this.y = y; 
        this.size = size;
        // COLOR FIX: Saved in memory at instantiation to stop shifting on redraws
        this.color =  "#7f00ff"; // Neon Purple
    }

    draw(ctx, colorPalette, generation) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.size, this.size);
        const color = getPaletteColor(colorPalette, generation);
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.fill();
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
}

function generateNextVicsekGen(currentSquares) {
    // PRESERVATION FIX: Check if the upcoming generation will collapse to zero pixels
    if (currentSquares.length === 0 || (currentSquares[0].size / 3) < 0.5) {
        return currentSquares; // Return original array safely instead of stripping data
    }

    const nextGen = [];
    for (let sq of currentSquares) {
        const newSize = sq.size / 3;

        // 5 Grid positions forming a cross
        nextGen.push(new VicsekSquare(sq.x + newSize, sq.y + newSize, newSize)); // Center
        nextGen.push(new VicsekSquare(sq.x + newSize, sq.y, newSize));           // Top
        nextGen.push(new VicsekSquare(sq.x + newSize, sq.y + 2 * newSize, newSize)); // Bottom
        nextGen.push(new VicsekSquare(sq.x, sq.y + newSize, newSize));           // Left
        nextGen.push(new VicsekSquare(sq.x + 2 * newSize, sq.y + newSize, newSize)); // Right
    }
    return nextGen;
}

export const VicsekEngine = {
    maxElements: 20000,
    init(canvas) {
        const size = canvas.width - 200;
        vicsekSquares = [ new VicsekSquare(100, 100, size) ];
        return vicsekSquares;
    },
    next(list) { return generateNextVicsekGen(list); },
    render(ctx, list) { list.forEach(v => v.draw(ctx)); }
};

// export { VicsekSquare, generateNextVicsekGen };


const VicsekFractalEngine = {
    schema: [
        { key: "maxElements", label: "Max Squares", type: "range", min: 100, max: 20000, step: 200, default: 8000 },
        { key: "colorPalette", label: "Color Palette", type: "select", options: ["default", "fire", "ice"], default: "default" }
    ],
    getDefaultParams() {
        const params = {};
        this.schema.forEach(p => params[p.key] = p.default);
        return params;
    },
    // params: {
    //     maxElements: 4000,
    //     colorPalette: "default"
    // },
    init(canvas, params) {
        const size = canvas.width - 200;
        return { generation: 0, elements: [ new VicsekSquare(100, 100, size) ], elementCount: 1 }; // Return initial state with element count
    },
    next(currentState, params) { 
        if (currentState.elements.length >= Number(params.maxElements)) {
            return {
                generation: currentState.generation + 1,
                elements: currentState.elements,
                elementCount: currentState.elements.length
            };
        }
        return { generation: currentState.generation + 1, elements: generateNextVicsekGen(currentState.elements), elementCount: generateNextVicsekGen(currentState.elements).length };
    },
    render(ctx, currentState, params) { 
        currentState.elements.forEach(v => v.draw(ctx, params.colorPalette, currentState.generation)); 
    }
}

export default VicsekFractalEngine;
export { VicsekSquare };


/*
 "VicsekFractal": {
            max: 4000,
            init: () => {
                const size = canvas.width - 200;
                vicsekSquares = [ new VicsekSquare(100, 100, size) ];
            },
            next: () => vicsekSquares = generateNextVicsekGen(vicsekSquares),
            render: () => {
                vicsekSquares.forEach(v => v.draw(ctx));
                updateMiniFractal();
            }
        },



        const SierpinskiEngine = { 

    schema :[
        { key: "maxElements", label: "Max Triangles", type: "range", min: 100, max: 20000, step: 200, default: 8000 },
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
            return {
                generation: currentState.generation + 1,
                elements: currentState.elements,
                elementCount: currentState.elements.length
            };
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
import { getPaletteColor } from "./palette.js";
