// import { Point } from "./SnowFlake.js";
// import getRandomColor from './getRandomColor.js';

// var colorGenerator = getRandomColor();

class Point {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

 class DragonSegment {
    constructor(a, e, turnLeft) {
        this.a = a;         // Start Point
        this.e = e;         // End Point
        this.turnLeft = turnLeft; // Boolean to alternate folding direction
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.a.x, this.a.y);
        ctx.lineTo(this.e.x, this.e.y);
        // let newCol = colorGenerator.next().value;
        ctx.strokeStyle =  "#ff007f"; // Neon Pink
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}
 function generateNextDragonGen(currentSegments) {
    const nextGen = [];
    
    // We process the list backwards or forwards carefully to preserve orientation
    for (let i = 0; i < currentSegments.length; i++) {
        const seg = currentSegments[i];
        const a = seg.a;
        const e = seg.e;

        // Find midpoint/apex using a 90-degree isosceles triangle rotation
        const midX = (a.x + e.x) / 2;
        const midY = (a.y + e.y) / 2;
        const diffX = e.x - a.x;
        const diffY = e.y - a.y;

        let c;
        // Rotate 90 degrees out or in based on turnLeft property
        if (seg.turnLeft) {
            c = new Point(midX - diffY / 2, midY + diffX / 2);
        } else {
            c = new Point(midX + diffY / 2, midY - diffX / 2);
        }

        // The first segment inherits true, the second inherits false to create the alternate fold
        nextGen.push(new DragonSegment(a, c, true));
        nextGen.push(new DragonSegment(e, c, false));
    }
    return nextGen;
}

// export { DragonSegment, generateNextDragonGen };

const DragonCurveEngine = {
    params:{
        maxElements: 15000,
        colorPalette: "default"
    }
    ,
    init(canvas, params) {
        const p1 = new Point(canvas.width * 0.3, canvas.height * 0.4);
        const p2 = new Point(canvas.width * 0.7, canvas.height * 0.4);
        return { generation: 0, elements: [ new DragonSegment(p1, p2, true) ] };
    },
    next(currentState, params) {
        if (currentState.elements.length >= params.maxElements) {
            console.log("Reached max element threshold for Dragon Curve. No further generations will be produced.");
            return currentState; // No change if we've hit the max element threshold
        }
        let nextGenSegments = generateNextDragonGen(currentState.elements);
        return { generation: currentState.generation + 1, elements: nextGenSegments };
    },
    render (ctx,currState,params) {
        let col = params.colorPalette;
        currState.elements.forEach(d => {
            d.draw(ctx, col, currState.generation);
        });
    }

}

export default DragonCurveEngine ;


/*
     "DragonCurve": {
                max: 15000,
                init: () => {
                    const p1 = new Point(canvas.width * 0.3, canvas.height * 0.4);
                    const p2 = new Point(canvas.width * 0.7, canvas.height * 0.4);
                    dragonSegments = [ new DragonSegment(p1, p2, true) ];
                },
                next: () => dragonSegments = generateNextDragonGen(dragonSegments),
                render: () => {
                    dragonSegments.forEach(d => d.draw(ctx));
                    updateMiniFractal();
                }
            },
*/