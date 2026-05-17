class Point {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

class Branch {
    constructor(a, e, angle, length, hasSplit = false) {
        this.a = a; 
        this.e = e; 
        this.angle = angle; 
        this.length = length;
        this.hasSplit = hasSplit; // New flag to track if this branch already sprouted children
    }

    draw(ctx, colorPalette, generation) {
        ctx.beginPath();
        ctx.moveTo(this.a.x, this.a.y);
        ctx.lineTo(this.e.x, this.e.y);
        ctx.strokeStyle = getPaletteColor(colorPalette, generation);
        ctx.lineWidth = Math.max(1, this.length * 0.08); 
        ctx.stroke();
    }
}

function generateNextTreeGen(currentBranches) {
    // Create a shadow copy of your existing trunk and branches so they aren't deleted
    const allBranches = [...currentBranches];
    const newTwigs = [];

    const branchAngle = 30 * Math.PI / 180; // 30 degrees to radians
    const lengthReduction = 0.68;

    for (let b of allBranches) {
        // If the branch already split in a previous generation, do not split it again
        if (b.hasSplit) continue;

        const newLength = b.length * lengthReduction;
        if (newLength < 3) continue; // Boundary limit safeguard

        // Mark this current branch as split so it becomes stable wood
        b.hasSplit = true;

        // Left Branch Math
        const leftAngle = b.angle - branchAngle;
        const leftEnd = new Point(
            b.e.x + newLength * Math.sin(leftAngle),
            b.e.y - newLength * Math.cos(leftAngle)
        );
        newTwigs.push(new Branch(b.e, leftEnd, leftAngle, newLength));

        // Right Branch Math
        const rightAngle = b.angle + branchAngle;
        const rightEnd = new Point(
            b.e.x + newLength * Math.sin(rightAngle),
            b.e.y - newLength * Math.cos(rightAngle)
        );
        newTwigs.push(new Branch(b.e, rightEnd, rightAngle, newLength));
    }

    // Return the combined array containing the history plus the new growth
    return [...allBranches, ...newTwigs];
}

// Map the clean unified structure to support your main.js Registry Factory pattern
export const TreeEngine = {
    maxElements: 8000,
    init(canvas) {
        const startNode = new Point(canvas.width / 2, canvas.height - 50);
        const endNode = new Point(canvas.width / 2, canvas.height - 300);
        // Generation 0 starts with a single foundational root branch
        return [new Branch(startNode, endNode, 0, 250)];
    },
    next(currentList) {
        return generateNextTreeGen(currentList);
    },
    render(ctx, list) {
        list.forEach(branch => branch.draw(ctx));
    }
};

// export { Branch , generateNextTreeGen };

const RecursiveTreeEngine = {
    schema: [
        { key: "maxElements", label: "Max Branches", type: "range", min: 100, max: 8000, step: 100, default: 8000 },
        { key: "colorPalette", label: "Color Palette", type: "select", options: ["default", "fire", "ice"], default: "default" }
    ],
    getDefaultParams() {
        const params = {};
        this.schema.forEach(p => params[p.key] = p.default);
        return params;
    },
    // params: {
    //     maxElements: 8000,
    //     colorPalette: "default"
    // },
    init(canvas, params) {
        const startNode = new Point(canvas.width / 2, canvas.height - 50);
        const endNode = new Point(canvas.width / 2, canvas.height - 300);
        return { generation: 0, elements: [new Branch(startNode, endNode, 0, 250)]  , elementCount: 1 };
    },
    next(currentState, params) { 
        if (currentState.elements.length >= Number(params.maxElements)) {
            console.warn("Reached maximum element limit for Recursive Tree. No further generations will be produced.");
            return currentState; // Return unchanged state to halt progression
        }
        return { generation: currentState.generation + 1, elements: generateNextTreeGen(currentState.elements), elementCount: generateNextTreeGen(currentState.elements).length };
    },
    render(ctx, currentState, params) { 
        currentState.elements.forEach(branch => branch.draw(ctx, params.colorPalette, currentState.generation)); 
    }
}

export default RecursiveTreeEngine ;
export { Branch, Point };


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
};*/
import { getPaletteColor } from "./palette.js";
