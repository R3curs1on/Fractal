
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



class Point {
        constructor(x,y) {
            this.x = x;
            this.y = y;
        }
}

class Segment {
    constructor( a, e) {
        this.a = a;
        this.e = e;
    }
    draw(ctx){
        ctx.beginPath();
        ctx.moveTo(this.a.x, this.a.y);
        ctx.lineTo(this.e.x, this.e.y);
        let newCol = colorGenerator.next().value;
        ctx.strokeStyle =  newCol;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}

function generateNextGenSnowFlake(currentSegments){
    let nextGenSegments = [];

    for(let s of currentSegments){
        let a,b,c,d,e;
        a = s.a;
        e = s.e;

        let dx = e.x - a.x;
        let dy = e.y - a.y;
        
        b = new Point(a.x + dx/3, a.y + dy/3);
        d = new Point(a.x + 2*dx/3, a.y + 2*dy/3);

        /* To find point c, we can rotate the vector (dx/3, dy/3) by 60 degrees counterclockwise and add it to point b
            Rotation of a point (x, y) by an angle θ can be done using the following formulas:
            x' = x * cos(θ) - y * sin(θ)
            y' = x * sin(θ) + y * cos(θ) */

        let angle = -Math.PI / 3; // 60 degrees in radians
        let rotatedX = (dx/3) * Math.cos(angle) - (dy/3) * Math.sin(angle);
        let rotatedY = (dx/3) * Math.sin(angle) + (dy/3) * Math.cos(angle);
        c = new Point(b.x + rotatedX, b.y + rotatedY);


        nextGenSegments.push(new Segment(a,b));
        nextGenSegments.push(new Segment(b,c));
        nextGenSegments.push(new Segment(c,d));
        nextGenSegments.push(new Segment(d,e));



    }
    return nextGenSegments;
}

export { Segment , generateNextGenSnowFlake, Point };