// import getRandomColor from './getRandomColor.js';
// var colorGenerator = getRandomColor();



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
    draw(ctx, colorPalette, generation) {
        ctx.beginPath();
        ctx.moveTo(this.a.x, this.a.y);
        ctx.lineTo(this.e.x, this.e.y); 
        ctx.strokeStyle =  "#007fff"; // Neon Blue
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

// export { Segment , generateNextGenSnowFlake, Point };

const SnowFlakeEngine = {
    params :{
        maxElements : 15000,
        padding: 70,
        colorPalette: "default"
    },
    init (canvas,params){
        const p = params.padding;

        const uW = canvas.width - (p * 2);
        const tH = uW * (Math.sqrt(3) / 2); 
        const topY = (canvas.height - tH) / 2;
        const bottomY = topY + tH;

        const p1 = new Point(canvas.width / 2, topY);       
        const p2 = new Point(canvas.width - p, bottomY); 
        const p3 = new Point(p, bottomY);               

        return { generation: 0, elements: [ new Segment(p1, p2), new Segment(p2, p3), new Segment(p3, p1) ] };
    },
    next(currState,params){
        if(currState.elements.length > params.maxElements){ 
            console.warn("Safety Threshold Limit Hit");
            return currState;
        }
        const nextElements = generateNextGenSnowFlake(currState.elements);
        return { generation: currState.generation + 1, elements: nextElements };
    },
    render(ctx,currState,params){
        const col = params.colorPalette ;
        const gen = currState.generation;
        currState.elements.forEach(s =>{ 
            s.draw(ctx, col, gen); 
        });
    }
}

export default SnowFlakeEngine ;

/* 
"SnowFlake": {
            max: 15000,
            init: () => {
                const p = 70;
                const uW = canvas.width - (p * 2);
                const tH = uW * (Math.sqrt(3) / 2); 
                const topY = (canvas.height - tH) / 2;
                const bottomY = topY + tH;
                const p1 = new Point(canvas.width / 2, topY);       
                const p2 = new Point(canvas.width - p, bottomY); 
                const p3 = new Point(p, bottomY);              
                snowFlakeSegments = [ new Segment(p1, p2), new Segment(p2, p3), new Segment(p3, p1) ];
            },
            next: () => snowFlakeSegments = generateNextGenSnowFlake(snowFlakeSegments),
            render: () => {
                snowFlakeSegments.forEach(s => s.draw(ctx));
                updateMiniFractal();
            }
        },
 */