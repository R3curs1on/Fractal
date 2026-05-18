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

    draw(ctx, colorPalette, generation) {
        ctx.beginPath();
        ctx.moveTo(this.a.x, this.a.y);
        ctx.lineTo(this.e.x, this.e.y);
        ctx.strokeStyle = getPaletteColor(colorPalette, generation);
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

    schema: [
        { key: "maxElements", label: "Max Segments", type: "range", min: 100, max: 50000, step: 500, default: 12000 },
        { key: "colorPalette", label: "Color Palette", type: "select", options: ["default", "fire", "ice"], default: "default" }
    ],
    getDefaultParams() {
        const params = {};
        this.schema.forEach(p => params[p.key] = p.default);
        return params;
    },
    // params:{
    //     maxElements: 15000,
    //     colorPalette: "default"
    // }
    init(canvas, params) {
        const p1 = new Point(canvas.width * 0.3, canvas.height * 0.4);
        const p2 = new Point(canvas.width * 0.7, canvas.height * 0.4);
        return { generation: 0, elements: [ new DragonSegment(p1, p2, true) ] , elementCount: 1 };
    },
    next(currentState, params) {
        if (currentState.elements.length >= Number(params.maxElements)) {
            return {
                generation: currentState.generation + 1,
                elements: currentState.elements,
                elementCount: currentState.elements.length
            };
        }
        let nextGenSegments = generateNextDragonGen(currentState.elements);
        return { generation: currentState.generation + 1, elements: nextGenSegments, elementCount: nextGenSegments.length };
    },
    render (ctx,currState,params) {
        let col = params.colorPalette;
        currState.elements.forEach(d => {
            d.draw(ctx, col, currState.generation);
        });
    }

}

export default DragonCurveEngine ;
export { DragonSegment, Point };


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


            const SierpinskiEngine = { 

    schema :[
        { key: "maxElements", label: "Max Triangles", type: "range", min: 100, max: 50000, step: 500, default: 12000 },
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
