// import SierpinskiEngine from "./fractals/SierpinskiTriangle.js";
// import  SnowFlakeEngine  from "./fractals/SnowFlake.js";
// import  InfiniteCirclesEngine  from "./fractals/InfiniteCircles.js";
// import  DragonCurveEngine  from "./fractals/DragonCurve.js";
// import VicsekFractalEngine from "./fractals/VicsekFractal.js";
// import RecursiveTreeEngine  from "./fractals/RecursiveTree.js";

// import  MandelbrotEngine  from "./fractals/Mandelbrot.js";
// import  NewtonEngine  from "./fractals/NewtonRaphson.js";
// import  FernEngine  from "./fractals/BarnsleyFern.js";
// import  LSystemEngine  from "./fractals/LSystemPlant.js";


// $(document).ready(function () {
//     console.log("Unified Fractal Engine Initialized.");

//     const canvas = $("#fractalCanvas")[0];    
//     const ctx = canvas.getContext('2d');

//     const miniCanvas = $("#minifractalCanvas")[0];
//     const miniCtx = miniCanvas.getContext('2d');

//     const $controlsHint = $("#controlsHint");

//     // --- State Storage Structures ---
//     let trianglesList = [];
//     let snowFlakeSegments = [];
//     let infiniteCirclesList = [];
//     let dragonSegments = [];
//     let vicsekSquares = [];
//     let treeBranches = [];
    
//     let pixelBasedState = [];

//     const FRACTAL_REGISTRY = {
//         "SierpinskiTriangle": SierpinskiEngine,
//         "SnowFlake": SnowFlakeEngine,
//         "InfiniteCircles": InfiniteCirclesEngine,
//         "DragonCurve": DragonCurveEngine,
//         "VicsekFractal": VicsekFractalEngine,
//         "RecursiveTree": RecursiveTreeEngine,
//         "Mandelbrot": MandelbrotEngine,
//         "NewtonRaphson": NewtonEngine,
//         "BarnsleyFern": FernEngine,
//         "LSystemPlant": LSystemEngine
//     };


//     let activeKey = null;
//     let currentEngine = null;
//     let currentParams = {};
//     let currentState = null;


//     function clearCanvas() {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//     }

//     function setActiveButton(activeId) {
//         $(".choose-visuals button").removeClass("active");
//         $(`#${activeId}`).addClass("active");
//         $controlsHint.css("visibility", "visible");
//     }


//     function updateMiniFractal() {
//         miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
//         miniCtx.drawImage(canvas,
//             0, 0, canvas.width, canvas.height,
//             0, 0, miniCanvas.width, miniCanvas.height
//         );

//     }
//     // --- Dynamic Event Routing Channel ---
//     $(".visual").on('click', function () {

//         activeKey = $(this).attr('id');
//         const targetEngine= FRACTAL_REGISTRY[activeKey];

//         if (!targetEngine) return;
//         currentEngine = targetEngine;

//         setActiveButton(activeKey);
//         clearCanvas();

//         currentParams = targetEngine.params  ;
//         currentState = targetEngine.init(canvas, currentParams);
//         targetEngine.render(ctx, currentState, currentParams);

//         updateMiniFractal();
//     });

//     // --- Unified Keyboard Evolution Core ---
//     $(document).on('keydown', function (e) { 
//         if(e.key === 'Enter' && currentEngine && currentState) {
//             currentState = currentEngine.next(currentState, currentParams);
//             clearCanvas();
//             currentEngine.render(ctx, currentState, currentParams);
//             updateMiniFractal();
//         }
//     });

    
// });
// // });


import SierpinskiEngine from "./fractals/SierpinskiTriangle.js";
import SnowFlakeEngine from "./fractals/SnowFlake.js";
import InfiniteCirclesEngine from "./fractals/InfiniteCircles.js";
import DragonCurveEngine from "./fractals/DragonCurve.js";
import VicsekFractalEngine from "./fractals/VicsekFractal.js";
import RecursiveTreeEngine from "./fractals/RecursiveTree.js";

import MandelbrotEngine from "./fractals/Mandelbrot.js";
import NewtonEngine from "./fractals/NewtonRaphson.js";
import FernEngine from "./fractals/BarnsleyFern.js";
import LSystemEngine from "./fractals/LSystemPlant.js";

$(document).ready(function () {
    console.log("Unified Fractal Engine Initialized.");

    const canvas = $("#fractalCanvas")[0];    
    const ctx = canvas.getContext('2d');

    const miniCanvas = $("#minifractalCanvas")[0];
    const miniCtx = miniCanvas.getContext('2d');

    const $controlsHint = $("#controlsHint");

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

    // --- Side Drawer Toggle Control ---
    $("#menuToggle").on("click", function() {
        $("#sideDrawer").toggleClass("hidden");
    });

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

    // --- Info Panel Output Synchronization ---
    function updateInfoPanel() {
        if (!currentEngine || !currentState) return;
        $("#infoName").text(activeKey);
        $("#infoGen").text(currentState.generation);
        $("#infoElements").text(currentState.elementCount || 0);
    }

    // --- Unified Execution Render Loop ---
    function executeRenderCycle() {
        clearCanvas();
        currentEngine.render(ctx, currentState, currentParams);
        updateMiniFractal();
        updateInfoPanel();
    }

    // --- Dynamic Control UI Field Generator ---
    function renderControlPanel() {
        const $container = $("#dynamicControls");
        $container.empty(); // Wipe out previous input elements

        if (!currentEngine || !currentEngine.schema) return;

        currentEngine.schema.forEach(field => {
            const $wrapper = $('<div class="control-group"></div>');
            const $label = $(`<label>${field.label}: </label>`);
            let $input;

            if (field.type === "range") {
                $input = $(`<input type="range" min="${field.min}" max="${field.max}" step="${field.step}" value="${currentParams[field.key]}">`);
                const $valueIndicator = $(`<span class="range-val">${currentParams[field.key]}</span>`);
                
                $input.on('input', function() {
                    const val = $(this).val();
                    $valueIndicator.text(val);
                    currentParams[field.key] = val; // Apply slider updates into state context
                    
                    // Trigger live re-renders for superficial options (like color switching)
                    if (field.key === "colorPalette") {
                        executeRenderCycle();
                    }
                });
                
                $wrapper.append($label, $input, $valueIndicator);

            } else if (field.type === "select") {
                $input = $('<select></select>');
                field.options.forEach(opt => {
                    const selected = currentParams[field.key] === opt ? "selected" : "";
                    $input.append(`<option value="${opt}" ${selected}>${opt}</option>`);
                });

                $input.on('change', function() {
                    currentParams[field.key] = $(this).val();
                    executeRenderCycle();
                });

                $wrapper.append($label, $input);
            }

            // Bind change intercepts for parameters requiring complete shape structure rebuilding
            $input.on('change', function() {
                if (field.key === "padding" || field.key === "maxElements") {
                    currentState = currentEngine.init(canvas, currentParams);
                    executeRenderCycle();
                }
            });

            $container.append($wrapper);
        });
    }

    // --- Dynamic Event Routing Channel ---
    $(".visual").on('click', function () {
        activeKey = $(this).attr('id');
        const targetEngine = FRACTAL_REGISTRY[activeKey];

        if (!targetEngine) return;
        currentEngine = targetEngine;

        setActiveButton(activeKey);

        // Fetch defaults safely out of schema definition arrays
        currentParams = targetEngine.getDefaultParams();
        currentState = targetEngine.init(canvas, currentParams);

        renderControlPanel();
        executeRenderCycle();
    });

    // --- Unified Keyboard Evolution Core ---
    $(document).on('keydown', function (e) { 
        if (e.key === 'Enter' && currentEngine && currentState) {
            currentState = currentEngine.next(currentState, currentParams);
            executeRenderCycle();
        }
    });
});