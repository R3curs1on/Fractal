// import getRandomColor from './getRandomColor.js';
// var colorGenerator = getRandomColor();



class Point {
        constructor(x,y) {
            this.x = x;
            this.y = y;
        }
}

class Segment {
    constructor( a, e) {
        this.a = a;
        this.e = e;
    }
    draw(ctx, colorPalette, generation) {
        ctx.beginPath();
        ctx.moveTo(this.a.x, this.a.y);
        ctx.lineTo(this.e.x, this.e.y);

        const color = getPaletteColor(colorPalette, generation);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}

function generateNextGenSnowFlake(currentSegments){
    let nextGenSegments = [];

    for(let s of currentSegments){
        let a,b,c,d,e;
        a = s.a;
        e = s.e;

        let dx = e.x - a.x;
        let dy = e.y - a.y;
        
        b = new Point(a.x + dx/3, a.y + dy/3);
        d = new Point(a.x + 2*dx/3, a.y + 2*dy/3);

        /* To find point c, we can rotate the vector (dx/3, dy/3) by 60 degrees counterclockwise and add it to point b
            Rotation of a point (x, y) by an angle θ can be done using the following formulas:
            x' = x * cos(θ) - y * sin(θ)
            y' = x * sin(θ) + y * cos(θ) */

        let angle = -Math.PI / 3; // 60 degrees in radians
        let rotatedX = (dx/3) * Math.cos(angle) - (dy/3) * Math.sin(angle);
        let rotatedY = (dx/3) * Math.sin(angle) + (dy/3) * Math.cos(angle);
        c = new Point(b.x + rotatedX, b.y + rotatedY);


        nextGenSegments.push(new Segment(a,b));
        nextGenSegments.push(new Segment(b,c));
        nextGenSegments.push(new Segment(c,d));
        nextGenSegments.push(new Segment(d,e));



    }
    return nextGenSegments;
}

// export { Segment , generateNextGenSnowFlake, Point };

const SnowFlakeEngine = {
    schema :[
        { key: "maxElements", label: "Max Segments", type: "range", min: 100, max: 20000, step: 100, default: 15000 },
        { key: "padding", label: "Canvas Padding", type: "range", min: 10, max: 150, step: 5, default: 70 },
        { key: "colorPalette", label: "Color Palette", type: "select", options: ["default", "fire", "ice"], default: "default" }
    ],

    // params :{
    //     maxElements : 15000,
    //     padding: 70,
    //     colorPalette: "default"
    // },
    getDefaultParams() {
        const params = {};
        this.schema.forEach(p => params[p.key] = p.default);
        return params;
    },

    init (canvas,params){
        const p = Number(params.padding); 

        const uW = canvas.width - (p * 2);
        const tH = uW * (Math.sqrt(3) / 2); 
        const topY = (canvas.height - tH) / 2;
        const bottomY = topY + tH;

        const p1 = new Point(canvas.width / 2, topY);       
        const p2 = new Point(canvas.width - p, bottomY); 
        const p3 = new Point(p, bottomY);               

        return { generation: 0, elements: [ new Segment(p1, p2), new Segment(p2, p3), new Segment(p3, p1) ], elementCount: 3 };
    },
    next(currState,params){
        if(currState.elements.length > Number(params.maxElements)){ 
            console.warn("Safety Threshold Limit Hit");
            return currState;
        }
        const nextElements = generateNextGenSnowFlake(currState.elements);
        return { generation: currState.generation + 1, elements: nextElements, elementCount: nextElements.length };
    },
    render(ctx,currState,params){
        const col = params.colorPalette ;
        const gen = currState.generation;
        currState.elements.forEach(s =>{ 
            s.draw(ctx, col, gen); 
        });
    }
}



export default SnowFlakeEngine ;
export { Point, Segment };

/* 
"SnowFlake": {
            max: 15000,
            init: () => {
                const p = 70;
                const uW = canvas.width - (p * 2);
                const tH = uW * (Math.sqrt(3) / 2); 
                const topY = (canvas.height - tH) / 2;
                const bottomY = topY + tH;
                const p1 = new Point(canvas.width / 2, topY);       
                const p2 = new Point(canvas.width - p, bottomY); 
                const p3 = new Point(p, bottomY);              
                snowFlakeSegments = [ new Segment(p1, p2), new Segment(p2, p3), new Segment(p3, p1) ];
            },
            next: () => snowFlakeSegments = generateNextGenSnowFlake(snowFlakeSegments),
            render: () => {
                snowFlakeSegments.forEach(s => s.draw(ctx));
                updateMiniFractal();
            }
        },



        for example below update code :

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
import { getPaletteColor } from "./palette.js";
