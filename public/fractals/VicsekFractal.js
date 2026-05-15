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
const colorGenerator = getRandomColor();

class VicsekSquare {
    constructor(x, y, size) {
        this.x = x; 
        this.y = y; 
        this.size = size;
        // COLOR FIX: Saved in memory at instantiation to stop shifting on redraws
        this.color = colorGenerator.next().value; 
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.size, this.size);
        ctx.fillStyle = this.color; 
        ctx.strokeStyle = this.color; 
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function generateNextVicsekGen(currentSquares) {
    // PRESERVATION FIX: Check if the upcoming generation will collapse to zero pixels
    if (currentSquares.length === 0 || (currentSquares[0].size / 3) < 2) {
        console.warn("Vicsek Fractal has reached maximum resolution limits.");
        return currentSquares; // Return original array safely instead of stripping data
    }

    const nextGen = [];
    for (let sq of currentSquares) {
        const newSize = sq.size / 3;

        // 5 Grid positions forming a cross
        nextGen.push(new VicsekSquare(sq.x + newSize, sq.y + newSize, newSize)); // Center
        nextGen.push(new VicsekSquare(sq.x + newSize, sq.y, newSize));           // Top
        nextGen.push(new VicsekSquare(sq.x + newSize, sq.y + 2 * newSize, newSize)); // Bottom
        nextGen.push(new VicsekSquare(sq.x, sq.y + newSize, newSize));           // Left
        nextGen.push(new VicsekSquare(sq.x + 2 * newSize, sq.y + newSize, newSize)); // Right
    }
    return nextGen;
}

export const VicsekEngine = {
    maxElements: 4000,
    init(canvas) {
        const size = canvas.width - 200;
        vicsekSquares = [ new VicsekSquare(100, 100, size) ];
        return vicsekSquares;
    },
    next(list) { return generateNextVicsekGen(list); },
    render(ctx, list) { list.forEach(v => v.draw(ctx)); }
};

export { VicsekSquare, generateNextVicsekGen };