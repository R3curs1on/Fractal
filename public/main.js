
import { Triangle, generateNextGenTriangles } from "./fractals/SierpinskiTriangle.js"; 
import { Segment, Point, generateNextGenSnowFlake } from "./fractals/SnowFlake.js";

$(document).ready(function () {
    console.log("jQuery loaded");


    const canvas = $("#fractalCanvas")[0]
    const ctx = canvas.getContext('2d');



    let chooseVisuals = null ;
    const optionSierpinskiTriangle = $("#SierpinskiTriangle")
    const optionSnowFlake = $("#SnowFlake")
    const optionInfiniteCircle = $("#InfiniteCircles")

    let trianglesList = [];
    let snowFlakeSegments = [];

    function clearCanvas(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    optionInfiniteCircle.on('click',function (){
        chooseVisuals = "infiniteCircle";
        console.log("clear canvas");
        clearCanvas();
        console.log("draw infinite circle");
        // drawInfiniteCircle(ctx, canvas.width/2, canvas.height/2, 200, 5);

    });

    optionSierpinskiTriangle.on('click',function (){
        chooseVisuals = "sierpinskiTriangle";
        console.log("clear canvas");
        clearCanvas();
        console.log("draw sierpinski triangle");


        const padding = 50;
        const x1 = canvas.width / 2;
        const y1 = padding;
        const x2 = padding;
        const y2 = canvas.height - padding;
        const x3 = canvas.width - padding;
        const y3 = canvas.height - padding;

        // drawSierpinski(ctx, x1, y1, x2, y2, x3, y3, 5);
        trianglesList = [ new Triangle(x1, y1, x2, y2, x3, y3) ];
        renderTriangles(trianglesList);

    })

    function renderTriangles(trianglesList){
        for(let t of trianglesList){
            t.draw(ctx);
        }
    }

    $(document).on('keydown', function(e) {
        if(e.key === 'Enter' && chooseVisuals === "sierpinskiTriangle"){
            
            if (trianglesList.length > 5000) {
                console.warn("Max safe generation depth reached to prevent tab crash.");
                return;
            }

            console.log("generate next gen of sierpinski triangle");
            trianglesList = generateNextGenTriangles(trianglesList);
            clearCanvas();
            renderTriangles(trianglesList);
        }
        else if(e.key === 'Enter' && chooseVisuals === "snowFlake"){
            if (snowFlakeSegments.length > 5000) {
                console.warn("Max safe generation depth reached to prevent tab crash.");
                return;
            }
            console.log("generate next gen of snow flake");
            snowFlakeSegments = generateNextGenSnowFlake(snowFlakeSegments);
            clearCanvas();
            renderSegments(snowFlakeSegments);  
        }
    });

    optionSnowFlake.on('click',function() {
        chooseVisuals = "snowFlake";
        console.log("clear canvas");
        clearCanvas();
        console.log("draw snow flake");
        // drawSnowFlake(ctx, canvas.width/2, canvas.height/2, 200, 5);
        const padding = 50;
        const usableWidth = canvas.width - (padding * 2);
        
        // Equilateral triangle height calculation: side * sqrt(3)/2
        const triangleHeight = usableWidth * (Math.sqrt(3) / 2); 

        // Center the triangle vertically within the usable space
        const topY = (canvas.height - triangleHeight) / 2;
        const bottomY = topY + triangleHeight;

        // Instantiating points for absolute maximum canvas coverage
        const p1 = new Point(canvas.width / 2, topY);       // Top Center Apex
        const p2 = new Point(canvas.width - padding, bottomY); // Bottom Right
        const p3 = new Point(padding, bottomY);              // Bottom Left

        snowFlakeSegments = [ new Segment(p1, p2) , new Segment(p2, p3) , new Segment(p3, p1) ];
        renderSegments(snowFlakeSegments);


    })

    function renderSegments(segmentsList){
        for(let s of segmentsList){
            s.draw(ctx);
        }
    }

});
