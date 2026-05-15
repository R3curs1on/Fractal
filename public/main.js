// import { Triangle, generateNextGenTriangles } from "./fractals/SierpinskiTriangle.js"; 
// import { Segment, Point, generateNextGenSnowFlake } from "./fractals/SnowFlake.js";
// import { FractalCircle, generateNextCircleGen } from "./fractals/InfiniteCircles.js";
// // New Imports
// import { DragonSegment, generateNextDragonGen } from "./fractals/DragonCurve.js";
// import { VicsekSquare, generateNextVicsekGen } from "./fractals/VicsekFractal.js";
// import { Branch, generateNextTreeGen } from "./fractals/RecursiveTree.js";

// import { MandelbrotEngine } from "./fractals/Mandelbrot.js";
// import { NewtonEngine } from "./fractals/NewtonRaphson.js";
// import { FernEngine } from "./fractals/BarnsleyFern.js";
// import { LSystemEngine } from "./fractals/LSystemPlant.js";

// $(document).ready(function () {
//     console.log("jQuery loaded");

//     const canvas = $("#fractalCanvas")[0];
//     const ctx = canvas.getContext('2d');

//     let chooseVisuals = null;
//     const $controlsHint = $("#controlsHint");

//     // Array Trackers
//     let trianglesList = [];
//     let snowFlakeSegments = [];
//     let infiniteCirclesList = [];
//     let dragonSegments = [];
//     let vicsekSquares = [];
//     let treeBranches = [];

//     function clearCanvas() {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//     }

//     function setActiveButton(activeId) {
//         $(".choose-visuals button").removeClass("active");
//         $(`#${activeId}`).addClass("active");
//         $controlsHint.css("visibility", "visible");
//     }

//     // --- BUTTON CLICK LISTENERS ---

//     $("#SierpinskiTriangle").on('click', function () {
//         chooseVisuals = "sierpinskiTriangle";
//         setActiveButton("SierpinskiTriangle");
//         clearCanvas();
//         const padding = 50;
//         trianglesList = [ new Triangle(canvas.width/2, padding, padding, canvas.height-padding, canvas.width-padding, canvas.height-padding) ];
//         trianglesList.forEach(t => t.draw(ctx));
//     });

//     $("#SnowFlake").on('click', function() {
//         chooseVisuals = "snowFlake";
//         setActiveButton("SnowFlake");
//         clearCanvas();
//         const padding = 70;
//         const uW = canvas.width - (padding * 2);
//         const tH = uW * (Math.sqrt(3) / 2); 
//         const topY = (canvas.height - tH) / 2;
//         const bottomY = topY + tH;
//         const p1 = new Point(canvas.width / 2, topY);       
//         const p2 = new Point(canvas.width - padding, bottomY); 
//         const p3 = new Point(padding, bottomY);              
//         snowFlakeSegments = [ new Segment(p1, p2), new Segment(p2, p3), new Segment(p3, p1) ];
//         snowFlakeSegments.forEach(s => s.draw(ctx));
//     });

//     $("#InfiniteCircles").on('click', function () {
//         chooseVisuals = "infiniteCircle";
//         setActiveButton("InfiniteCircles");
//         clearCanvas();
//         infiniteCirclesList = [ new FractalCircle(canvas.width/2, canvas.height/2, (canvas.width/2)-20) ];
//         infiniteCirclesList.forEach(c => c.draw(ctx));
//     });

//     $("#DragonCurve").on('click', function() {
//         chooseVisuals = "dragonCurve";
//         setActiveButton("DragonCurve");
//         clearCanvas();
//         // Setup central baseline segment
//         const p1 = new Point(canvas.width * 0.3, canvas.height * 0.4);
//         const p2 = new Point(canvas.width * 0.7, canvas.height * 0.4);
//         dragonSegments = [ new DragonSegment(p1, p2, true) ];
//         dragonSegments.forEach(d => d.draw(ctx));
//     });

//     $("#VicsekFractal").on('click', function() {
//         chooseVisuals = "vicsekFractal";
//         setActiveButton("VicsekFractal");
//         clearCanvas();
//         const size = canvas.width - 200;
//         vicsekSquares = [ new VicsekSquare(100, 100, size) ];
//         vicsekSquares.forEach(v => v.draw(ctx));
//     });

//     $("#RecursiveTree").on('click', function() {
//         chooseVisuals = "recursiveTree";
//         setActiveButton("RecursiveTree");
//         clearCanvas();
//         const startNode = new Point(canvas.width / 2, canvas.height - 50);
//         const endNode = new Point(canvas.width / 2, canvas.height - 300);
//         treeBranches = [ new Branch(startNode, endNode, 0, 250) ];
//         treeBranches.forEach(b => b.draw(ctx));
//     });

//     // --- ENTER KEYPRESS CONTROLLER ---

//     $(document).on('keydown', function(e) {
//         if (e.key === "Enter") {
//             clearCanvas();

//             if (chooseVisuals === "sierpinskiTriangle") {
//                 if (trianglesList.length < 10000) trianglesList = generateNextGenTriangles(trianglesList);
//                 trianglesList.forEach(t => t.draw(ctx));
//             }
//             else if (chooseVisuals === "snowFlake") {
//                 if (snowFlakeSegments.length < 15000) snowFlakeSegments = generateNextGenSnowFlake(snowFlakeSegments);
//                 snowFlakeSegments.forEach(s => s.draw(ctx));
//             }
//             else if (chooseVisuals === "infiniteCircle") {
//                 if (infiniteCirclesList.length < 5000) infiniteCirclesList = generateNextCircleGen(infiniteCirclesList);
//                 infiniteCirclesList.forEach(c => c.draw(ctx));
//             }
//             else if (chooseVisuals === "dragonCurve") {
//                 if (dragonSegments.length < 15000) dragonSegments = generateNextDragonGen(dragonSegments);
//                 dragonSegments.forEach(d => d.draw(ctx));
//             }
//             else if (chooseVisuals === "vicsekFractal") {
//                 if (vicsekSquares.length < 4000) vicsekSquares = generateNextVicsekGen(vicsekSquares);
//                 vicsekSquares.forEach(v => v.draw(ctx));
//             }
//             else if (chooseVisuals === "recursiveTree") {
//                 if (treeBranches.length < 8000) treeBranches = generateNextTreeGen(treeBranches);
//                 treeBranches.forEach(b => b.draw(ctx));
//             }
//         }
    // });
    // 
import { Triangle, generateNextGenTriangles } from "./fractals/SierpinskiTriangle.js"; 
import { Segment, Point, generateNextGenSnowFlake } from "./fractals/SnowFlake.js";
import { FractalCircle, generateNextCircleGen } from "./fractals/InfiniteCircles.js";
import { DragonSegment, generateNextDragonGen } from "./fractals/DragonCurve.js";
import { VicsekSquare, generateNextVicsekGen } from "./fractals/VicsekFractal.js";
import { Branch, generateNextTreeGen } from "./fractals/RecursiveTree.js";

// Pixel-Mapped and Text-Parsed Engine Imports
import { MandelbrotEngine } from "./fractals/Mandelbrot.js";
import { NewtonEngine } from "./fractals/NewtonRaphson.js";
import { FernEngine } from "./fractals/BarnsleyFern.js";
import { LSystemEngine } from "./fractals/LSystemPlant.js";

$(document).ready(function () {
    console.log("Unified Fractal Engine Initialized.");

    const canvas = $("#fractalCanvas")[0];
    const ctx = canvas.getContext('2d');
    const $controlsHint = $("#controlsHint");

    // --- State Storage Structures ---
    let trianglesList = [];
    let snowFlakeSegments = [];
    let infiniteCirclesList = [];
    let dragonSegments = [];
    let vicsekSquares = [];
    let treeBranches = [];
    
    // Non-iterable math values tracked inside state wrappers
    let pixelBasedState = [];

    // --- The Unified Registry Matrix ---
    // Maps each button ID directly to its structural data, maximum constraints, and lifecycle methods
    const FRACTAL_REGISTRY = {
        "SierpinskiTriangle": {
            max: 10000,
            init: () => {
                const p = 50;
                trianglesList = [ new Triangle(canvas.width/2, p, p, canvas.height-p, canvas.width-p, canvas.height-p) ];
            },
            next: () => trianglesList = generateNextGenTriangles(trianglesList),
            render: () => trianglesList.forEach(t => t.draw(ctx))
        },
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
            render: () => snowFlakeSegments.forEach(s => s.draw(ctx))
        },
        "InfiniteCircles": {
            max: 5000,
            init: () => {
                infiniteCirclesList = [ new FractalCircle(canvas.width/2, canvas.height/2, (canvas.width/2)-20) ];
            },
            next: () => infiniteCirclesList = generateNextCircleGen(infiniteCirclesList),
            render: () => infiniteCirclesList.forEach(c => c.draw(ctx))
        },
        "DragonCurve": {
            max: 15000,
            init: () => {
                const p1 = new Point(canvas.width * 0.3, canvas.height * 0.4);
                const p2 = new Point(canvas.width * 0.7, canvas.height * 0.4);
                dragonSegments = [ new DragonSegment(p1, p2, true) ];
            },
            next: () => dragonSegments = generateNextDragonGen(dragonSegments),
            render: () => dragonSegments.forEach(d => d.draw(ctx))
        },
        "VicsekFractal": {
            max: 4000,
            init: () => {
                const size = canvas.width - 200;
                vicsekSquares = [ new VicsekSquare(100, 100, size) ];
            },
            next: () => vicsekSquares = generateNextVicsekGen(vicsekSquares),
            render: () => vicsekSquares.forEach(v => v.draw(ctx))
        },
        "RecursiveTree": {
            max: 8000,
            init: () => {
                const startNode = new Point(canvas.width / 2, canvas.height - 50);
                const endNode = new Point(canvas.width / 2, canvas.height - 300);
                treeBranches = [ new Branch(startNode, endNode, 0, 250) ];
            },
            next: () => treeBranches = generateNextTreeGen(treeBranches),
            render: () => treeBranches.forEach(b => b.draw(ctx))
        },
        
        // --- Newly Added Advanced Math Modules ---
        "Mandelbrot": {
            max: MandelbrotEngine.maxElements,
            init: () => pixelBasedState = MandelbrotEngine.init(canvas),
            next: () => pixelBasedState = MandelbrotEngine.next(pixelBasedState),
            render: () => MandelbrotEngine.render(ctx, pixelBasedState)
        },
        "NewtonRaphson": {
            max: NewtonEngine.maxElements,
            init: () => pixelBasedState = NewtonEngine.init(canvas),
            next: () => pixelBasedState = NewtonEngine.next(pixelBasedState),
            render: () => NewtonEngine.render(ctx, pixelBasedState)
        },
        "BarnsleyFern": {
            max: FernEngine.maxElements,
            init: () => pixelBasedState = FernEngine.init(canvas),
            next: () => pixelBasedState = FernEngine.next(pixelBasedState),
            render: () => FernEngine.render(ctx, pixelBasedState)
        },
        "LSystemPlant": {
            max: LSystemEngine.maxElements,
            init: () => pixelBasedState = LSystemEngine.init(canvas),
            next: () => pixelBasedState = LSystemEngine.next(pixelBasedState),
            render: () => LSystemEngine.render(ctx, pixelBasedState)
        }
    };

    let activeKey = null;

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function setActiveButton(activeId) {
        $(".choose-visuals button").removeClass("active");
        $(`#${activeId}`).addClass("active");
        $controlsHint.css("visibility", "visible");
    }

    // --- Dynamic Event Routing Channel ---
    $(".choose-visuals button").on('click', function () {
        activeKey = $(this).attr('id');
        const targetConfig = FRACTAL_REGISTRY[activeKey];

        if (!targetConfig) return;

        setActiveButton(activeKey);
        clearCanvas();

        // Object Oriented Polmorphic Invocation
        targetConfig.init();
        targetConfig.render();
    });

    // --- Unified Keyboard Evolution Core ---
    $(document).on('keydown', function (e) {
        if (e.key === "Enter" && activeKey) {
            const targetConfig = FRACTAL_REGISTRY[activeKey];
            
            // Centralized calculation limit handling
            // Accounts for both element array lengths and custom iteration metrics
            const currentVolume = (activeKey === "Mandelbrot" || activeKey === "NewtonRaphson" || activeKey === "BarnsleyFern" || activeKey === "LSystemPlant") 
                ? (pixelBasedState.length || targetConfig.max) 
                : getCurrentElementCount(activeKey);

            if (currentVolume > targetConfig.max) {
                console.warn(`Safety Threshold Limit Hit for: ${activeKey}`);
                return;
            }

            console.log(`Processing next matrix generation step for: ${activeKey}`);
            clearCanvas();
            targetConfig.next();
            targetConfig.render();
        }
    });

    // Context helper to map tracking arrays dynamically without nested conditionals
    function getCurrentElementCount(key) {
        if (key === "SierpinskiTriangle") return trianglesList.length;
        if (key === "SnowFlake") return snowFlakeSegments.length;
        if (key === "InfiniteCircles") return infiniteCirclesList.length;
        if (key === "DragonCurve") return dragonSegments.length;
        if (key === "VicsekFractal") return vicsekSquares.length;
        if (key === "RecursiveTree") return treeBranches.length;
        return 0;
    }
});
// });


