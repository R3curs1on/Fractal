
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
    params:{
        maxElements: 5000,
        padding: 20,
        colorPalette: "default"
    },
    init(canvas, params) {
        let centerX = canvas.width / 2;
        let centerY = canvas.height / 2;
        let initialRadius = (Math.min(canvas.width, canvas.height) / 2) - params.padding;
        return { generation : 0 ,  elements : [ new FractalCircle(centerX, centerY, initialRadius) ] };
    },
    next(currentState, params) {    
        if (currentState.elements.length >= params.maxElements) {
            console.warn("Reached maximum element limit for Infinite Circles. No further generations will be produced.");
            return currentState; // Return unchanged state to halt progression
        }
        const nextGenCircles = generateNextCircleGen(currentState.elements);
        return { generation: currentState.generation + 1, elements: nextGenCircles };
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

*/