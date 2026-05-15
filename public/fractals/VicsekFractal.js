

function * getRandomColor() {
    var letters = '0A1B2C3D4E5F6789';
    while(true) {
      var color = '#';
      for (var i = 0; i < 6; i++ ) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      yield color;
      
    }
    /*
    use like:
    var generator = getRandomColor();
    console.log(generator.next().value); // e.g. "#3E2F1B"
    console.log(generator.next().value); // e.g. "#A1B2C3"
    */
}
var colorGenerator = getRandomColor();


 class VicsekSquare {
    constructor(x, y, size) {
        this.x = x; // Top-Left corner X
        this.y = y; // Top-Left corner Y
        this.size = size;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.size, this.size);
        let newCol = colorGenerator.next().value;
        ctx.fillStyle = newCol; //"#00ff7f"; // Neon Green
        ctx.strokeStyle = newCol; //"#00ff7f"; // Neon Green 
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}
 function generateNextVicsekGen(currentSquares) {
    const nextGen = [];
    
    for (let sq of currentSquares) {
        const newSize = sq.size / 3;
        if (newSize < 1) continue; // Boundary kill switch

        // 5 Grid positions forming a cross: Center, Top, Bottom, Left, Right
        nextGen.push(new VicsekSquare(sq.x + newSize, sq.y + newSize, newSize)); // Center
        nextGen.push(new VicsekSquare(sq.x + newSize, sq.y, newSize));           // Top
        nextGen.push(new VicsekSquare(sq.x + newSize, sq.y + 2 * newSize, newSize)); // Bottom
        nextGen.push(new VicsekSquare(sq.x, sq.y + newSize, newSize));           // Left
        nextGen.push(new VicsekSquare(sq.x + 2 * newSize, sq.y + newSize, newSize)); // Right
    }
    return nextGen;
}

export { VicsekSquare, generateNextVicsekGen };