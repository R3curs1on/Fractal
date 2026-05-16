

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

    params :{
        maxElements: 200000,
        colorPalette: "default",
    }, 
    
    init(canvas,params) {
        // Generation 0: Initialize with a single starting point tracking list
        let initialPoint = new Point(0, 0);
        return { generation: 0, elements: [initialPoint] };
    },

    next(currentState, params) {
        if (currentState.elements.length > params.maxElements) {
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
        return { generation: currentState.generation + 1, elements: nextList };
    },

    render(ctx, currentState, params) {
        ctx.fillStyle = "#00ff66"; // Vivid leaf green
        // let newCol = colorGenerator.next().value;
        // ctx.fillStyle = newCol;
        
        // Loop through and map math bounds to canvas pixels
        for (let pt of currentState.elements) {
            let px = ctx.canvas.width / 2 + pt.x * 90;
            let py = ctx.canvas.height - pt.y * 90 - 30;
            ctx.fillRect(px, py, 1.5, 1.5);
        }
    }
};


export default FernEngine ;