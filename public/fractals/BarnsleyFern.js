

// function* getRandomGreenShade() {
//     while (true) {
//         // Green hue range
//         const hue = Math.floor(100 + Math.random() * 40);
//         // Strong saturation
//         const saturation = Math.floor(60 + Math.random() * 40);
//         // Variable brightness
//         const lightness = Math.floor(25 + Math.random() * 50);

//         yield `hsl(${hue}, ${saturation}%, ${lightness}%)`;
//     }
// }
// var colorGenerator = getRandomGreenShade();


class Point {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}   

const FernEngine = {

    schema :[   
        { key: "maxElements", label: "Max Points", type: "range", min: 10000, max: 500000, step: 10000, default: 200000 },
        { key: "colorPalette", label: "Color Palette", type: "select", options: ["default", "fire", "ice"], default: "default" }
    ],

    getDefaultParams() {
        const params = {};
        this.schema.forEach( p => params[p.key] = p.default);
        return params;
    },
    // params :{
    //     maxElements: 200000,
    //     colorPalette: "default",
    // }, 
    
    init(canvas,params) {
        // Generation 0: Initialize with a single starting point tracking list
        let initialPoint = new Point(0, 0);
        return { generation: 0, elements: [initialPoint] , elementCount: 1 };
    },

    next(currentState, params) {
        if (currentState.elements.length > Number(params.maxElements)   ) {
            console.warn("Safety Threshold Limit Hit");
            return currentState;
        }

        // Generate 3,000 new evolutionary chaos points per Enter click
        const nextList = [...currentState.elements];    
        let lastPt = nextList[nextList.length - 1] || new Point(0, 0);

        for (let i = 0; i < 3000; i++) {
            let r = Math.random();
            let nextX, nextY;

            // Barnsley matrix probability distributions
            if (r < 0.01) {
                nextX = 0;
                nextY = 0.16 * lastPt.y;
            } else if (r < 0.86) {
                nextX = 0.85 * lastPt.x + 0.04 * lastPt.y;
                nextY = -0.04 * lastPt.x + 0.85 * lastPt.y + 1.6;
            } else if (r < 0.93) {
                nextX = 0.2 * lastPt.x - 0.26 * lastPt.y;
                nextY = 0.23 * lastPt.x + 0.22 * lastPt.y + 1.6;
            } else {
                nextX = -0.15 * lastPt.x + 0.28 * lastPt.y;
                nextY = 0.26 * lastPt.x + 0.24 * lastPt.y + 0.44;
            }

            lastPt = new Point(nextX, nextY);
            nextList.push(lastPt);
        }
        return { generation: currentState.generation + 1, elements: nextList, elementCount: nextList.length };
    },

    render(ctx, currentState, params) {
        ctx.fillStyle = getPaletteColor(params.colorPalette, currentState.generation);
        
        // Loop through and map math bounds to canvas pixels
        for (let pt of currentState.elements) {
            let px = ctx.canvas.width / 2 + pt.x * 90;
            let py = ctx.canvas.height - pt.y * 90 - 30;
            ctx.fillRect(px, py, 1.5, 1.5);
        }
    }
};


export default FernEngine ;


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
import { getPaletteColor } from "./palette.js";
