

function* getRandomGreenShade() {
    while (true) {
        // Green hue range
        const hue = Math.floor(100 + Math.random() * 40);
        // Strong saturation
        const saturation = Math.floor(60 + Math.random() * 40);
        // Variable brightness
        const lightness = Math.floor(25 + Math.random() * 50);

        yield `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
}
var colorGenerator = getRandomGreenShade();

const LSystemEngine = {
    maxElements: 6, // A depth of 4-5 is absolute peak perfection for this grammar rule

    init(canvas) {
        return [{ axiom: "X", currentString: "X", depth: 0 }];
    },

    next(stateArray) {
        const state = stateArray[0];
        if (state.depth >= this.maxElements) return stateArray;

        const rules = {
            "X": "F+[[X]-X]-F[-FX]+X",
            "F": "FF"
        };

        let nextString = state.currentString
            .split('')
            .map(char => rules[char] || char)
            .join('');

        return [{ axiom: "X", currentString: nextString, depth: state.depth + 1 }];
    },

    render(ctx, stateArray) {
        const state = stateArray[0];
        const str = state.currentString;

        ctx.save();
        // ctx.strokeStyle = "rgba(0, 255, 204, 0.85)";
        ctx.strokeStyle = colorGenerator.next().value;

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

export { LSystemEngine };