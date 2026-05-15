
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

class FractalCircle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r; // Radius
    }

    draw(ctx) {
        ctx.beginPath();
        // arc parameters: (x, y, radius, startAngle, endAngle)
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.closePath();
        let newCol = colorGenerator.next().value;
        ctx.fillStyle = newCol;
        ctx.strokeStyle = newCol; 
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
    }
}

function generateNextCircleGen(currentCircles) {
    const nextGenCircles = [];

    for (let c of currentCircles) {
        // New circles will be half the size of the parent
        const newR = c.r / 2;

        // Skip generating if the radius drops below 2 pixels (performance ceiling)
        if (newR < 2) continue;
        
        // Push 4 sub-circles nestled perfectly inside the cardinal directions
        nextGenCircles.push(new FractalCircle(c.x - newR, c.y, newR)); // Left
        nextGenCircles.push(new FractalCircle(c.x + newR, c.y, newR)); // Right
        nextGenCircles.push(new FractalCircle(c.x, c.y - newR, newR)); // Top
        nextGenCircles.push(new FractalCircle(c.x, c.y + newR, newR)); // Bottom
    }

    return nextGenCircles;
}

export { FractalCircle, generateNextCircleGen };