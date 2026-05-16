
// import getRandomColor from './getRandomColor.js';

// var colorGenerator = getRandomColor();

class FractalCircle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r; // Radius
    }

    draw(ctx) {
        ctx.beginPath();
        // arc parameters: (x, y, radius, startAngle, endAngle)
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.closePath();
        // let newCol = colorGenerator.next().value;
        ctx.fillStyle = "#ff7f00"; // Neon Orange
        ctx.strokeStyle = "#ff7f00"; // Neon Orange
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
    }
}

function generateNextCircleGen(currentCircles) {
    const nextGenCircles = [];

    for (let c of currentCircles) {
        // New circles will be half the size of the parent
        const newR = c.r / 2;

        // Skip generating if the radius drops below 2 pixels (performance ceiling)
        if (newR < 2) continue;
        
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
        { key: "maxElements", label: "Max Circles", type: "range", min: 100, max: 10000, step: 100, default: 5000 },
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
            console.warn("Reached maximum element limit for Infinite Circles. No further generations will be produced.");
            return currentState; // Return unchanged state to halt progression
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

/*
 max: 5000,
            init: () => {
                infiniteCirclesList = [ new FractalCircle(canvas.width/2, canvas.height/2, (canvas.width/2)-20) ];
            },
            next: () => infiniteCirclesList = generateNextCircleGen(infiniteCirclesList),
            render: () => {
                infiniteCirclesList.forEach(c => c.draw(ctx));
                updateMiniFractal();
            }



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