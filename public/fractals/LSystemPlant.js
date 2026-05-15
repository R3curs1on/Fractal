export const LSystemEngine = {
    maxElements: 8, // Tracks Max String Generation Expansions

    init(canvas) {
        // Generation 0 starting text instructions (Axiom)
        return [{ axiom: "X", currentString: "X", depth: 0 }];
    },

    next(stateArray) {
        const state = stateArray[0];
        if (state.depth >= 5) return stateArray; // Avoid string memory crashes

        // Grammar rules mapping
        const rules = {
            "X": "F+[[X]-X]-F[-FX]+X",
            "F": "FF"
        };

        // Standard string map array generation technique
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
        ctx.strokeStyle = "rgba(0, 255, 204, 0.75)";
        ctx.lineWidth = 1.2;
        
        // Start position at bottom center looking upwards
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height - 20);
        
        const angleDelta = 25 * Math.PI / 180; // 25 degree turns
        const stepLength = 4.5 / (state.depth + 1); // Shrink lines as depth grows

        const transformStack = [];

        for (let char of str) {
            if (char === "F") {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -stepLength);
                ctx.stroke();
                ctx.translate(0, -stepLength);
            } else if (char === "+") {
                ctx.rotate(angleDelta);
            } else if (char === "-") {
                ctx.rotate(-angleDelta);
            } else if (char === "[") {
                // Save state matrix using HTML5 context stack tracking arrays
                ctx.save();
            } else if (char === "]") {
                ctx.restore();
            }
        }
        ctx.restore();
    }
};