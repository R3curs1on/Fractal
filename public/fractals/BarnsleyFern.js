import { Point } from "./SnowFlake.js";

export const FernEngine = {
    maxElements: 200000,
    
    init(canvas) {
        // Generation 0: Initialize with a single starting point tracking list
        return [new Point(0, 0)];
    },

    next(currentPoints) {
        // Generate 3,000 new evolutionary chaos points per Enter click
        const nextList = [...currentPoints];
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
        return nextList;
    },

    render(ctx, list) {
        ctx.fillStyle = "#00ff66"; // Vivid leaf green
        
        // Loop through and map math bounds to canvas pixels
        for (let pt of list) {
            let px = ctx.canvas.width / 2 + pt.x * 90;
            let py = ctx.canvas.height - pt.y * 90 - 30;
            ctx.fillRect(px, py, 1.5, 1.5);
        }
    }
};