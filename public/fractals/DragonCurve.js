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
    /*
    use like:
    var generator = getRandomColor();
    console.log(generator.next().value); // e.g. "#3E2F1B"
    console.log(generator.next().value); // e.g. "#A1B2C3"
    */
}
var colorGenerator = getRandomColor();


 class DragonSegment {
    constructor(a, e, turnLeft) {
        this.a = a;         // Start Point
        this.e = e;         // End Point
        this.turnLeft = turnLeft; // Boolean to alternate folding direction
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.a.x, this.a.y);
        ctx.lineTo(this.e.x, this.e.y);
        let newCol = colorGenerator.next().value;
        ctx.strokeStyle =  newCol; //"#ff007f"; // Neon Pink
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}
 function generateNextDragonGen(currentSegments) {
    const nextGen = [];
    
    // We process the list backwards or forwards carefully to preserve orientation
    for (let i = 0; i < currentSegments.length; i++) {
        const seg = currentSegments[i];
        const a = seg.a;
        const e = seg.e;

        // Find midpoint/apex using a 90-degree isosceles triangle rotation
        const midX = (a.x + e.x) / 2;
        const midY = (a.y + e.y) / 2;
        const diffX = e.x - a.x;
        const diffY = e.y - a.y;

        let c;
        // Rotate 90 degrees out or in based on turnLeft property
        if (seg.turnLeft) {
            c = new Point(midX - diffY / 2, midY + diffX / 2);
        } else {
            c = new Point(midX + diffY / 2, midY - diffX / 2);
        }

        // The first segment inherits true, the second inherits false to create the alternate fold
        nextGen.push(new DragonSegment(a, c, true));
        nextGen.push(new DragonSegment(e, c, false));
    }
    return nextGen;
}

export { DragonSegment, generateNextDragonGen };