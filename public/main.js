import { Triangle, generateNextGenTriangles } from "./fractals/SierpinskiTriangle.js"; 
import { Segment, Point, generateNextGenSnowFlake } from "./fractals/SnowFlake.js";
import { FractalCircle, generateNextCircleGen } from "./fractals/InfiniteCircles.js";

$(document).ready(function () {
    console.log("jQuery loaded");

    const canvas = $("#fractalCanvas")[0];
    const ctx = canvas.getContext('2d');

    let chooseVisuals = null;
    const optionSierpinskiTriangle = $("#SierpinskiTriangle");
    const optionSnowFlake = $("#SnowFlake");
    const optionInfiniteCircle = $("#InfiniteCircles");
    const $controlsHint = $("#controlsHint");

    // Arrays maintaining active structural generations
    let trianglesList = [];
    let snowFlakeSegments = [];
    let infiniteCirclesList = [];

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Handles modern visual styling feedback transitions for the UI
    function setActiveButton(activeId) {
        $(".choose-visuals button").removeClass("active");
        $(`#${activeId}`).addClass("active");
        $controlsHint.css("visibility", "visible");
    }

    // --- Interactive Render Triggers ---

    optionInfiniteCircle.on('click', function () {
        chooseVisuals = "infiniteCircle";
        setActiveButton("InfiniteCircles");
        clearCanvas();
        console.log("Drawing base infinite circle configuration...");

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const initialRadius = (canvas.width / 2) - 20; 
        
        infiniteCirclesList = [ new FractalCircle(centerX, centerY, initialRadius) ];
        renderCircles(infiniteCirclesList);
    });

    optionSierpinskiTriangle.on('click', function () {
        chooseVisuals = "sierpinskiTriangle";
        setActiveButton("SierpinskiTriangle");
        clearCanvas();
        console.log("Drawing base Sierpinski configuration...");

        const padding = 50;
        const x1 = canvas.width / 2;
        const y1 = padding;
        const x2 = padding;
        const y2 = canvas.height - padding;
        const x3 = canvas.width - padding;
        const y3 = canvas.height - padding;

        trianglesList = [ new Triangle(x1, y1, x2, y2, x3, y3) ];
        renderTriangles(trianglesList);
    });

    optionSnowFlake.on('click', function() {
        chooseVisuals = "snowFlake";
        setActiveButton("SnowFlake");
        clearCanvas();
        console.log("Drawing base snowflake configuration...");
        
        const padding = 50;
        const usableWidth = canvas.width - (padding * 2);
        const triangleHeight = usableWidth * (Math.sqrt(3) / 2); 

        const topY = (canvas.height - triangleHeight) / 2;
        const bottomY = topY + triangleHeight;

        const p1 = new Point(canvas.width / 2, topY);       
        const p2 = new Point(canvas.width - padding, bottomY); 
        const p3 = new Point(padding, bottomY);              

        snowFlakeSegments = [ new Segment(p1, p2) , new Segment(p2, p3) , new Segment(p3, p1) ];
        renderSegments(snowFlakeSegments);
    });

    // --- Render Loop Iterators ---

    function renderCircles(circlesList) {
        for (let c of circlesList) {
            c.draw(ctx);
        }
    }

    function renderTriangles(trianglesList) {
        for (let t of trianglesList) {
            t.draw(ctx);
        }
    }

    function renderSegments(segmentsList) {
        for (let s of segmentsList) {
            s.draw(ctx);
        }
    }

    // --- Keystroke State Progression ---

    $(document).on('keydown', function(e) {
        if (e.key === "Enter") {
            if (chooseVisuals === "sierpinskiTriangle") {
                if (trianglesList.length > 5000) {
                    console.warn("Max safe generation depth reached to prevent tab crash.");
                    return;
                }
                console.log("Generating next generation of Sierpinski Triangle...");
                trianglesList = generateNextGenTriangles(trianglesList);
                clearCanvas();
                renderTriangles(trianglesList);
            }
            else if (chooseVisuals === "snowFlake") {
                if (snowFlakeSegments.length > 5000) {
                    console.warn("Max safe generation depth reached to prevent tab crash.");
                    return;
                }
                console.log("Generating next generation of Koch Snowflake...");
                snowFlakeSegments = generateNextGenSnowFlake(snowFlakeSegments);
                clearCanvas();
                renderSegments(snowFlakeSegments);  
            }
            else if (chooseVisuals === "infiniteCircle") {
                if (infiniteCirclesList.length > 3000) {
                    console.warn("Max safe circle depth reached.");
                    return;
                }
                console.log("Generating next generation of Infinite Circles...");
                infiniteCirclesList = generateNextCircleGen(infiniteCirclesList);
                clearCanvas();
                renderCircles(infiniteCirclesList);
            }
        }
    });
});