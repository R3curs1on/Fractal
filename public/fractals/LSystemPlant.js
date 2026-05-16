

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

const LSystemEngine = {
    schema :[
        { key: "maxElements", label: "Max Depth", type: "range", min: 1, max: 6, step: 1, default: 5 },
        { key: "colorPalette", label: "Color Palette", type: "select", options: ["default", "vibrant"], default: "default" }
    ],

    getDefaultParams() {
        const params = {};
        this.schema.forEach(p => params[p.key] = p.default);
        return params;
    },

    // params: {
    //     maxElements: 6, // A depth of 4-5 is absolute peak perfection for this grammar rule
    //     colorPalette: "default"
    // },

    init(canvas, params) {
        let initialState = { axiom: "X", currentString: "X", depth: 0 };
        return {generation: 0, elements: [initialState] , elementCount: 1 };
    },

    next(currentState, params) {
        if (currentState.elements[0].depth >= Number(params.maxElements)) {
            console.warn("Safety Threshold Limit Hit");
            return currentState;
        }

        const state = currentState.elements[0];
        if (state.depth >= Number(params.maxElements)) return currentState;

        const rules = {
            "X": "F+[[X]-X]-F[-FX]+X",
            "F": "FF"
        };

        let nextString = state.currentString
            .split('')
            .map(char => rules[char] || char)
            .join('');

        return { generation: currentState.generation + 1, elements: [{ axiom: "X", currentString: nextString, depth: state.depth + 1 }] , elementCount: 1 };
    },

    render(ctx, currentState, params) {
        const state = currentState.elements[0];
        const str = state.currentString;

        ctx.save();
        ctx.strokeStyle = "rgba(0, 255, 204, 0.85)";
        // ctx.strokeStyle = colorGenerator.next().value;

        ctx.lineWidth = Math.max(1, 3.5 - state.depth * 0.5);
        
        // Root base position safely within lower bounds
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height - 30);
        
        const angleDelta = 25 * Math.PI / 180; 
        
        // Stable geometric multiplier to prevent bounding box clipping
        const stepLength = 180 * Math.pow(0.58, state.depth); 

        // CRITICAL WOBBLE FIX: Start ONE unified path for the entire layout
        ctx.beginPath();
        ctx.moveTo(0, 0);

        for (let char of str) {
            if (char === "F") {
                // Trace line relative to the current local matrix state
                ctx.lineTo(0, -stepLength);
                ctx.translate(0, -stepLength);
            } else if (char === "+") {
                ctx.rotate(angleDelta);
            } else if (char === "-") {
                ctx.rotate(-angleDelta);
            } else if (char === "[") {
                // Push the current transformation matrix state
                ctx.save();
            } else if (char === "]") {
                // Pop matrix and instantly move the path cursor back to the safe point
                ctx.restore();
                ctx.moveTo(0, 0); 
            }
        }
        
        // Complete the single unified path transaction cleanly
        ctx.stroke();
        ctx.restore();
    }
};

export default LSystemEngine ;

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