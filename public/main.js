
import { Triangle, generatorNextGen } from "./fractals/SierpinskiTriangle.js"; 

$(document).ready(function () {
    console.log("jQuery loaded");


    const canvas = $("#fractalCanvas")[0]
    const ctx = canvas.getContext('2d');



    let chooseVisuals = null ;
    const optionSierpinskiTriangle = $("#SierpinskiTriangle")
    const optionSnowFlake = $("#SnowFlake")
    const optionInfiniteCircle = $("#InfiniteCircles")

    let trianglesList = [];

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
            trianglesList = generatorNextGen(trianglesList);
            renderTriangles(trianglesList);
        }
        else return;
    });

    optionSnowFlake.on('click',function() {
        chooseVisuals = "snowFlake";
        console.log("clear canvas");
        clearCanvas();
        console.log("draw snow flake");
        // drawSnowFlake(ctx, canvas.width/2, canvas.height/2, 200, 5);

    })

});
