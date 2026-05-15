import { Point } from "./SnowFlake.js";

function * getRandomColor() {
    var letters = '0A1B2C3D4E5F6789';
    while(true) {
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        yield color;
    }
}
var colorGenerator = getRandomColor();

class Branch {
    constructor(a, e, angle, length, hasSplit = false) {
        this.a = a; 
        this.e = e; 
        this.angle = angle; 
        this.length = length;
        this.hasSplit = hasSplit; // New flag to track if this branch already sprouted children
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.a.x, this.a.y);
        ctx.lineTo(this.e.x, this.e.y);
        let newCol = colorGenerator.next().value;
        ctx.strokeStyle = newCol; 
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

export { Branch , generateNextTreeGen };