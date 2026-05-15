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

class Triangle {
    constructor(x1, y1, x2, y2, x3, y3) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;
    }
    draw(ctx){
        ctx.beginPath(); // Start a new path for the triangle
        ctx.moveTo(this.x1, this.y1); // Move to the first vertex
        ctx.lineTo(this.x2, this.y2); // Draw a line to the second vertex
        ctx.lineTo(this.x3, this.y3); // Draw a line to the third vertex
        ctx.closePath(); 

        let newCol = colorGenerator.next().value;
        ctx.strokeStyle = newCol;

        ctx.fillStyle = newCol;

        ctx.lineWidth = 1;

        ctx.fill();

        ctx.stroke();
    }
}
function generateNextGenTriangles(currentTriangles){
    const nextGenTriangles = [];
    for(let t of currentTriangles){
        const x12 = (t.x1 + t.x2) / 2;
        const y12 = (t.y1 + t.y2) / 2;
        const x23 = (t.x2 + t.x3) / 2;
        const y23 = (t.y2 + t.y3) / 2;
        const x31 = (t.x3 + t.x1) / 2;
        const y31 = (t.y3 + t.y1) / 2;

        nextGenTriangles.push(new Triangle(t.x1, t.y1, x12, y12, x31, y31));
        nextGenTriangles.push(new Triangle(x12, y12, t.x2, t.y2, x23, y23));
        nextGenTriangles.push(new Triangle(x31, y31, x23, y23, t.x3, t.y3));
    }
    return nextGenTriangles;
}

// this below was first attempt to draw sierpinski triangle using string replacement and then printing it on console ; 
function drawSierpinski(ctx, x1, y1, x2, y2, x3, y3, depth) {
    if (depth === 0) {
        // Base Case: Draw the solid triangle

        ctx.beginPath(); // Start a new path for the triangle
        ctx.moveTo(x1, y1); // Move to the first vertex
        ctx.lineTo(x2, y2); // Draw a line to the second vertex
        ctx.lineTo(x3, y3); // Draw a line to the third vertex
        ctx.closePath();  // Close the path to create a triangle    

        ctx.strokeStyle = "#900dc4"; // Set the stroke color 
        ctx.lineWidth = 1;              // Set the line width to 1 pixel
        ctx.stroke();                   // Stroke the triangle outline
        return;
    }

    // Recursive Case: Calculate midpoints of all three lines
    const x12 = (x1+x2)/2;
    const y12 = (y1+y2)/2;
    const x23 = (x2+x3)/2;
    const y23 = (y2+y3)/2;
    const x31 = (x3+x1)/2;
    const y31 = (y3+y1)/2;

    // Recurse into the three outer corner sub-triangles
    drawSierpinski(ctx, x1, y1, x12, y12, x31, y31, depth - 1);
    drawSierpinski(ctx, x12, y12, x2, y2, x23, y23, depth - 1);
    drawSierpinski(ctx, x31, y31, x23, y23, x3, y3, depth - 1);
}


export { drawSierpinski , getRandomColor , Triangle , generateNextGenTriangles };