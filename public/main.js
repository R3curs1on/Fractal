import SierpinskiEngine from "./fractals/SierpinskiTriangle.js";
import  SnowFlakeEngine  from "./fractals/SnowFlake.js";
import  InfiniteCirclesEngine  from "./fractals/InfiniteCircles.js";
import  DragonCurveEngine  from "./fractals/DragonCurve.js";
import VicsekFractalEngine from "./fractals/VicsekFractal.js";
import RecursiveTreeEngine  from "./fractals/RecursiveTree.js";

import  MandelbrotEngine  from "./fractals/Mandelbrot.js";
import  NewtonEngine  from "./fractals/NewtonRaphson.js";
import  FernEngine  from "./fractals/BarnsleyFern.js";
import  LSystemEngine  from "./fractals/LSystemPlant.js";


$(document).ready(function () {
    console.log("Unified Fractal Engine Initialized.");

    const canvas = $("#fractalCanvas")[0];    
    const ctx = canvas.getContext('2d');

    const miniCanvas = $("#minifractalCanvas")[0];
    const miniCtx = miniCanvas.getContext('2d');

    const $controlsHint = $("#controlsHint");

    // --- State Storage Structures ---
    let trianglesList = [];
    let snowFlakeSegments = [];
    let infiniteCirclesList = [];
    let dragonSegments = [];
    let vicsekSquares = [];
    let treeBranches = [];
    
    let pixelBasedState = [];

    const FRACTAL_REGISTRY = {
        "SierpinskiTriangle": SierpinskiEngine,
        "SnowFlake": SnowFlakeEngine,
        "InfiniteCircles": InfiniteCirclesEngine,
        "DragonCurve": DragonCurveEngine,
        "VicsekFractal": VicsekFractalEngine,
        "RecursiveTree": RecursiveTreeEngine,
        "Mandelbrot": MandelbrotEngine,
        "NewtonRaphson": NewtonEngine,
        "BarnsleyFern": FernEngine,
        "LSystemPlant": LSystemEngine
    };


    let activeKey = null;
    let currentEngine = null;
    let currentParams = {};
    let currentState = null;


    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function setActiveButton(activeId) {
        $(".choose-visuals button").removeClass("active");
        $(`#${activeId}`).addClass("active");
        $controlsHint.css("visibility", "visible");
    }


    function updateMiniFractal() {
        miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
        miniCtx.drawImage(canvas,
            0, 0, canvas.width, canvas.height,
            0, 0, miniCanvas.width, miniCanvas.height
        );

    }
    // --- Dynamic Event Routing Channel ---
    $(".visual").on('click', function () {

        activeKey = $(this).attr('id');
        const targetEngine= FRACTAL_REGISTRY[activeKey];

        if (!targetEngine) return;
        currentEngine = targetEngine;

        setActiveButton(activeKey);
        clearCanvas();

        currentParams = targetEngine.params  ;
        currentState = targetEngine.init(canvas, currentParams);
        targetEngine.render(ctx, currentState, currentParams);

        updateMiniFractal();
    });

    // --- Unified Keyboard Evolution Core ---
    $(document).on('keydown', function (e) { 
        if(e.key === 'Enter' && currentEngine && currentState) {
            currentState = currentEngine.next(currentState, currentParams);
            clearCanvas();
            currentEngine.render(ctx, currentState, currentParams);
            updateMiniFractal();
        }
    });

    
});
// });
