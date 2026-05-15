import { Triangle, generateNextGenTriangles } from "./fractals/SierpinskiTriangle.js"; 
import { Segment, Point, generateNextGenSnowFlake } from "./fractals/SnowFlake.js";
import { FractalCircle, generateNextCircleGen } from "./fractals/InfiniteCircles.js";
// New Imports
import { DragonSegment, generateNextDragonGen } from "./fractals/DragonCurve.js";
import { VicsekSquare, generateNextVicsekGen } from "./fractals/VicsekFractal.js";
import { Branch, generateNextTreeGen } from "./fractals/RecursiveTree.js";

$(document).ready(function () {
    console.log("jQuery loaded");

    const canvas = $("#fractalCanvas")[0];
    const ctx = canvas.getContext('2d');

    let chooseVisuals = null;
    const $controlsHint = $("#controlsHint");

    // Array Trackers
    let trianglesList = [];
    let snowFlakeSegments = [];
    let infiniteCirclesList = [];
    let dragonSegments = [];
    let vicsekSquares = [];
    let treeBranches = [];

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function setActiveButton(activeId) {
        $(".choose-visuals button").removeClass("active");
        $(`#${activeId}`).addClass("active");
        $controlsHint.css("visibility", "visible");
    }

    // --- BUTTON CLICK LISTENERS ---

    $("#SierpinskiTriangle").on('click', function () {
        chooseVisuals = "sierpinskiTriangle";
        setActiveButton("SierpinskiTriangle");
        clearCanvas();
        const padding = 50;
        trianglesList = [ new Triangle(canvas.width/2, padding, padding, canvas.height-padding, canvas.width-padding, canvas.height-padding) ];
        trianglesList.forEach(t => t.draw(ctx));
    });

    $("#SnowFlake").on('click', function() {
        chooseVisuals = "snowFlake";
        setActiveButton("SnowFlake");
        clearCanvas();
        const padding = 70;
        const uW = canvas.width - (padding * 2);
        const tH = uW * (Math.sqrt(3) / 2); 
        const topY = (canvas.height - tH) / 2;
        const bottomY = topY + tH;
        const p1 = new Point(canvas.width / 2, topY);       
        const p2 = new Point(canvas.width - padding, bottomY); 
        const p3 = new Point(padding, bottomY);              
        snowFlakeSegments = [ new Segment(p1, p2), new Segment(p2, p3), new Segment(p3, p1) ];
        snowFlakeSegments.forEach(s => s.draw(ctx));
    });

    $("#InfiniteCircles").on('click', function () {
        chooseVisuals = "infiniteCircle";
        setActiveButton("InfiniteCircles");
        clearCanvas();
        infiniteCirclesList = [ new FractalCircle(canvas.width/2, canvas.height/2, (canvas.width/2)-20) ];
        infiniteCirclesList.forEach(c => c.draw(ctx));
    });

    $("#DragonCurve").on('click', function() {
        chooseVisuals = "dragonCurve";
        setActiveButton("DragonCurve");
        clearCanvas();
        // Setup central baseline segment
        const p1 = new Point(canvas.width * 0.3, canvas.height * 0.4);
        const p2 = new Point(canvas.width * 0.7, canvas.height * 0.4);
        dragonSegments = [ new DragonSegment(p1, p2, true) ];
        dragonSegments.forEach(d => d.draw(ctx));
    });

    $("#VicsekFractal").on('click', function() {
        chooseVisuals = "vicsekFractal";
        setActiveButton("VicsekFractal");
        clearCanvas();
        const size = canvas.width - 200;
        vicsekSquares = [ new VicsekSquare(100, 100, size) ];
        vicsekSquares.forEach(v => v.draw(ctx));
    });

    $("#RecursiveTree").on('click', function() {
        chooseVisuals = "recursiveTree";
        setActiveButton("RecursiveTree");
        clearCanvas();
        const startNode = new Point(canvas.width / 2, canvas.height - 50);
        const endNode = new Point(canvas.width / 2, canvas.height - 300);
        treeBranches = [ new Branch(startNode, endNode, 0, 250) ];
        treeBranches.forEach(b => b.draw(ctx));
    });

    // --- ENTER KEYPRESS CONTROLLER ---

    $(document).on('keydown', function(e) {
        if (e.key === "Enter") {
            clearCanvas();

            if (chooseVisuals === "sierpinskiTriangle") {
                if (trianglesList.length < 10000) trianglesList = generateNextGenTriangles(trianglesList);
                trianglesList.forEach(t => t.draw(ctx));
            }
            else if (chooseVisuals === "snowFlake") {
                if (snowFlakeSegments.length < 15000) snowFlakeSegments = generateNextGenSnowFlake(snowFlakeSegments);
                snowFlakeSegments.forEach(s => s.draw(ctx));
            }
            else if (chooseVisuals === "infiniteCircle") {
                if (infiniteCirclesList.length < 5000) infiniteCirclesList = generateNextCircleGen(infiniteCirclesList);
                infiniteCirclesList.forEach(c => c.draw(ctx));
            }
            else if (chooseVisuals === "dragonCurve") {
                if (dragonSegments.length < 15000) dragonSegments = generateNextDragonGen(dragonSegments);
                dragonSegments.forEach(d => d.draw(ctx));
            }
            else if (chooseVisuals === "vicsekFractal") {
                if (vicsekSquares.length < 4000) vicsekSquares = generateNextVicsekGen(vicsekSquares);
                vicsekSquares.forEach(v => v.draw(ctx));
            }
            else if (chooseVisuals === "recursiveTree") {
                if (treeBranches.length < 8000) treeBranches = generateNextTreeGen(treeBranches);
                treeBranches.forEach(b => b.draw(ctx));
            }
        }
    });
});