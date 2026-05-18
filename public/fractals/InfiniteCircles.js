
// import getRandomColor from './getRandomColor.js';

// var colorGenerator = getRandomColor();

class FractalCircle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r; // Radius
    }

    draw(ctx, colorPalette, generation) {
        ctx.beginPath();
        // arc parameters: (x, y, radius, startAngle, endAngle)
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.closePath();
        const color = getPaletteColor(colorPalette, generation);
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.fill();
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
}

function generateNextCircleGen(currentCircles) {
    const nextGenCircles = [];

    for (let c of currentCircles) {
        // New circles will be half the size of the parent
        const newR = c.r / 2;

        // Let users zoom deeper before geometry naturally disappears.
        if (newR < 0.5) continue;
        
        // Push 4 sub-circles nestled perfectly inside the cardinal directions
        nextGenCircles.push(new FractalCircle(c.x - newR, c.y, newR)); // Left
        nextGenCircles.push(new FractalCircle(c.x + newR, c.y, newR)); // Right
        nextGenCircles.push(new FractalCircle(c.x, c.y - newR, newR)); // Top
        nextGenCircles.push(new FractalCircle(c.x, c.y + newR, newR)); // Bottom
    }

    return nextGenCircles;
}

// export { FractalCircle, generateNextCircleGen };


const InfiniteCirclesEngine = {
    schema: [
        { key: "maxElements", label: "Max Circles", type: "range", min: 100, max: 50000, step: 500, default: 12000 },
        { key: "padding", label: "Canvas Padding", type: "range", min: 10, max: 150, step: 5, default: 20 },
        { key: "colorPalette", label: "Color Palette", type: "select", options: ["default", "fire", "ice"], default: "default" }
    ],
    getDefaultParams() {
        const params = {};
        this.schema.forEach(p => params[p.key] = p.default);
        return params;
    },
    // params:{
    //     maxElements: 5000,
    //     padding: 20,
    //     colorPalette: "default"
    // },

    init(canvas, params) {
        const p = Number(params.padding);
        let centerX = canvas.width / 2;
        let centerY = canvas.height / 2;
        let initialRadius = (Math.min(canvas.width, canvas.height) / 2) - p;
        return { generation : 0 ,  elements : [ new FractalCircle(centerX, centerY, initialRadius) ] , elementCount: 1 };
    },
    next(currentState, params) {    
        if (currentState.elements.length >= Number(params.maxElements)) {
            return {
                generation: currentState.generation + 1,
                elements: currentState.elements,
                elementCount: currentState.elements.length
            };
        }
        const nextGenCircles = generateNextCircleGen(currentState.elements);
        return { generation: currentState.generation + 1, elements: nextGenCircles, elementCount: nextGenCircles.length };
    },
    render: (ctx,currState,params) => { 
        const col = params.colorPalette;
        currState.elements.forEach(c => {
            c.draw(ctx, col, currState.generation); 
        });
    }

}
export default InfiniteCirclesEngine;
export { FractalCircle };
 
import { getPaletteColor } from "./palette.js";
