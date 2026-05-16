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


import SierpinskiEngine, { Triangle } from "./fractals/SierpinskiTriangle.js";
import SnowFlakeEngine, { Point as SnowPoint, Segment } from "./fractals/SnowFlake.js";
import InfiniteCirclesEngine, { FractalCircle } from "./fractals/InfiniteCircles.js";
import DragonCurveEngine, { DragonSegment } from "./fractals/DragonCurve.js";
import VicsekFractalEngine, { VicsekSquare } from "./fractals/VicsekFractal.js";
import RecursiveTreeEngine, { Branch, Point as TreePoint } from "./fractals/RecursiveTree.js";

import MandelbrotEngine from "./fractals/Mandelbrot.js";
import NewtonEngine from "./fractals/NewtonRaphson.js";
import FernEngine from "./fractals/BarnsleyFern.js";
import LSystemEngine from "./fractals/LSystemPlant.js";

$(document).ready( () => {
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
    const historyStack = [];
    const redoStack = [];
    let historySuspend = false;
    let historyTimer = null;
    let renderFrame = null;
    let renderToken = 0;
    let mandelbrotCommitTimer = null;
    let isMandelbrotDragging = false;
    let mandelbrotDragPointerId = null;
    let mandelbrotDragLast = null;

    // --- Side Drawer Toggle Control ---
    $("#menuToggle").on("click", function() {
        $("#sideDrawer").toggleClass("hidden");
    });

    $("#undoState").on("click", undoState);
    $("#redoState").on("click", redoState);
    $("#resetState").on("click", resetCurrentState);
    $("#exportPng").on("click", exportCurrentPng);
    $("#exportJson").on("click", exportCurrentJson);

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function cloneData(value) {
        if (typeof structuredClone === "function") {
            return structuredClone(value);
        }
        return JSON.parse(JSON.stringify(value));
    }

    function setActiveButton(activeId) {
        $(".choose-visuals button").removeClass("active");
        $(`#${activeId}`).addClass("active");
        $controlsHint.css("visibility", "visible");
        canvas.classList.toggle("mandelbrot-mode", activeId === "Mandelbrot");
    }

    function updateMiniFractal() {
        miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
        miniCtx.drawImage(canvas,
            0, 0, canvas.width, canvas.height,
            0, 0, miniCanvas.width, miniCanvas.height
        );
    }

    function serializeState(engineKey, state) {
        if (!state) return state;

        switch (engineKey) {
            case "SierpinskiTriangle":
                return {
                    ...state,
                    elements: state.elements.map(t => ({
                        x1: t.x1, y1: t.y1,
                        x2: t.x2, y2: t.y2,
                        x3: t.x3, y3: t.y3
                    }))
                };
            case "SnowFlake":
                return {
                    ...state,
                    elements: state.elements.map(s => ({
                        a: { x: s.a.x, y: s.a.y },
                        e: { x: s.e.x, y: s.e.y }
                    }))
                };
            case "InfiniteCircles":
                return {
                    ...state,
                    elements: state.elements.map(c => ({
                        x: c.x,
                        y: c.y,
                        r: c.r
                    }))
                };
            case "DragonCurve":
                return {
                    ...state,
                    elements: state.elements.map(d => ({
                        a: { x: d.a.x, y: d.a.y },
                        e: { x: d.e.x, y: d.e.y },
                        turnLeft: d.turnLeft
                    }))
                };
            case "VicsekFractal":
                return {
                    ...state,
                    elements: state.elements.map(v => ({
                        x: v.x,
                        y: v.y,
                        size: v.size
                    }))
                };
            case "RecursiveTree":
                return {
                    ...state,
                    elements: state.elements.map(b => ({
                        a: { x: b.a.x, y: b.a.y },
                        e: { x: b.e.x, y: b.e.y },
                        angle: b.angle,
                        length: b.length,
                        hasSplit: b.hasSplit
                    }))
                };
            default:
                return cloneData(state);
        }
    }

    function deserializeState(engineKey, state) {
        if (!state) return state;

        switch (engineKey) {
            case "SierpinskiTriangle":
                return {
                    ...state,
                    elements: state.elements.map(t => new Triangle(t.x1, t.y1, t.x2, t.y2, t.x3, t.y3))
                };
            case "SnowFlake":
                return {
                    ...state,
                    elements: state.elements.map(s => new Segment(
                        new SnowPoint(s.a.x, s.a.y),
                        new SnowPoint(s.e.x, s.e.y)
                    ))
                };
            case "InfiniteCircles":
                return {
                    ...state,
                    elements: state.elements.map(c => new FractalCircle(c.x, c.y, c.r))
                };
            case "DragonCurve":
                return {
                    ...state,
                    elements: state.elements.map(d => new DragonSegment(
                        { x: d.a.x, y: d.a.y },
                        { x: d.e.x, y: d.e.y },
                        d.turnLeft
                    ))
                };
            case "VicsekFractal":
                return {
                    ...state,
                    elements: state.elements.map(v => new VicsekSquare(v.x, v.y, v.size))
                };
            case "RecursiveTree":
                return {
                    ...state,
                    elements: state.elements.map(b => new Branch(
                        new TreePoint(b.a.x, b.a.y),
                        new TreePoint(b.e.x, b.e.y),
                        b.angle,
                        b.length,
                        b.hasSplit
                    ))
                };
            default:
                return cloneData(state);
        }
    }

    function buildSnapshot() {
        if (!activeKey || !currentEngine || !currentState) return null;
        return {
            activeKey,
            currentParams: cloneData(currentParams),
            currentState: serializeState(activeKey, currentState)
        };
    }

    function syncHistoryButtons() {
        $("#undoState").prop("disabled", historyStack.length <= 1);
        $("#redoState").prop("disabled", redoStack.length === 0);
    }

    function commitHistorySnapshot() {
        if (historySuspend) return;
        const snapshot = buildSnapshot();
        if (!snapshot) return;
        if (historyTimer) {
            clearTimeout(historyTimer);
            historyTimer = null;
        }
        redoStack.length = 0;
        historyStack.push(snapshot);
        syncHistoryButtons();
    }

    function scheduleHistoryCommit(delay = 140) {
        if (historySuspend) return;
        if (historyTimer) clearTimeout(historyTimer);
        historyTimer = setTimeout(() => {
            historyTimer = null;
            commitHistorySnapshot();
        }, delay);
    }

    function flushPendingHistoryCommit() {
        if (historyTimer) {
            clearTimeout(historyTimer);
            historyTimer = null;
            commitHistorySnapshot();
        }
        if (mandelbrotCommitTimer) {
            clearTimeout(mandelbrotCommitTimer);
            mandelbrotCommitTimer = null;
            if (activeKey === "Mandelbrot" && currentState && currentState.view) {
                finalizeMandelbrotInteraction();
            } else {
                commitHistorySnapshot();
            }
        }
    }

    function restoreSnapshot(snapshot) {
        if (!snapshot) return;
        stopMandelbrotInteraction();
        historySuspend = true;
        try {
            activeKey = snapshot.activeKey;
            currentEngine = FRACTAL_REGISTRY[activeKey];
            currentParams = cloneData(snapshot.currentParams);
            currentState = deserializeState(activeKey, snapshot.currentState);
            setActiveButton(activeKey);
            renderControlPanel();
            executeRenderCycle();
        } finally {
            historySuspend = false;
        }
        syncHistoryButtons();
    }

    function undoState() {
        if (historyStack.length <= 1) return;
        flushPendingHistoryCommit();
        const current = historyStack.pop();
        redoStack.push(current);
        restoreSnapshot(historyStack[historyStack.length - 1]);
    }

    function redoState() {
        if (redoStack.length === 0) return;
        flushPendingHistoryCommit();
        const snapshot = redoStack.pop();
        historyStack.push(snapshot);
        restoreSnapshot(snapshot);
    }

    function resetCurrentState() {
        if (!currentEngine) return;
        flushPendingHistoryCommit();
        stopMandelbrotInteraction();
        currentState = currentEngine.init(canvas, currentParams);
        executeRenderCycle();
        commitHistorySnapshot();
    }

    function downloadBlob(filename, mime, content) {
        const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function exportCurrentJson() {
        if (!currentEngine || !currentState) return;
        const payload = {
            activeKey,
            exportedAt: new Date().toISOString(),
            currentParams: cloneData(currentParams),
            currentState: serializeState(activeKey, currentState)
        };
        downloadBlob(`${activeKey || "fractal"}-state.json`, "application/json", JSON.stringify(payload, null, 2));
    }

    function exportCurrentPng() {
        canvas.toBlob(blob => {
            if (!blob) return;
            downloadBlob(`${activeKey || "fractal"}-render.png`, "image/png", blob);
        });
    }

    function scheduleRenderCycle() {
        if (renderFrame) return;
        renderFrame = requestAnimationFrame(() => {
            renderFrame = null;
            executeRenderCycle();
        });
    }

    function cancelRenderCycle() {
        if (!renderFrame) return;
        cancelAnimationFrame(renderFrame);
        renderFrame = null;
    }

    function stopMandelbrotInteraction() {
        renderToken++;
        isMandelbrotDragging = false;
        mandelbrotDragPointerId = null;
        mandelbrotDragLast = null;
        canvas.classList.remove("is-dragging");
        if (mandelbrotCommitTimer) {
            clearTimeout(mandelbrotCommitTimer);
            mandelbrotCommitTimer = null;
        }
        cancelRenderCycle();
        if (MandelbrotEngine._activeWorker) {
            MandelbrotEngine._activeWorker.terminate();
            MandelbrotEngine._activeWorker = null;
        }
    }

    function finalizeMandelbrotInteraction() {
        if (activeKey !== "Mandelbrot" || !currentState || !currentState.view) return;
        currentState = {
            ...currentState,
            generation: currentState.generation + 1,
            view: cloneData(currentState.view)
        };
        executeRenderCycle();
        commitHistorySnapshot();
    }

    function scheduleMandelbrotCommit(delay = 160) {
        if (mandelbrotCommitTimer) clearTimeout(mandelbrotCommitTimer);
        mandelbrotCommitTimer = setTimeout(() => {
            mandelbrotCommitTimer = null;
            finalizeMandelbrotInteraction();
        }, delay);
    }

    // --- Info Panel Output Synchronization ---
    function updateInfoPanel() {
        if (!currentEngine || !currentState) return;
        $("#infoName").text(activeKey);
        $("#infoGen").text(currentState.generation);
        const metricsText = currentState.view
            ? `${currentState.elementCount || 0} | zoom ${currentState.view.scale.toFixed(4)}`
            : (currentState.elementCount || 0);
        $("#infoElements").text(metricsText);
    }

    // --- Unified Execution Render Loop ---
    function executeRenderCycle() {
        const token = ++renderToken;
        // clearCanvas();
        // currentEngine.render(ctx, currentState, currentParams);
        // updateMiniFractal();
        // updateInfoPanel();

        clearCanvas();
        
        // Pass execution hook down to engine so asynchronous workers can trigger previews smoothly
        currentEngine.render(ctx, currentState, currentParams, function() {
            if (token !== renderToken) return;
            updateMiniFractal();
            updateInfoPanel();
        });

        // For geometric engines that finish synchronously instantly, fallback update checks:
        if (activeKey !== "Mandelbrot") {
            updateMiniFractal();
            updateInfoPanel();
        }
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
                    commitHistorySnapshot();
                });

                $wrapper.append($label, $input);
            }

            // Bind change intercepts for parameters requiring complete shape structure rebuilding
            $input.on('change', function() {
                if (activeKey === "Mandelbrot" && field.key === "maxElements") {
                    currentState = {
                        ...currentState,
                        elementCount: Math.min(Number(currentParams.maxElements), currentState.elementCount)
                    };
                    executeRenderCycle();
                    commitHistorySnapshot();
                } else if (field.key === "padding" || field.key === "maxElements") {
                    currentState = currentEngine.init(canvas, currentParams);
                    executeRenderCycle();
                    commitHistorySnapshot();
                }
            });

            $container.append($wrapper);
        });
    }

    // --- Dynamic Event Routing Channel ---
    $(".visual").on('click', function () {
        flushPendingHistoryCommit();
        stopMandelbrotInteraction();

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
        commitHistorySnapshot();
    });

    // --- Unified Keyboard Evolution Core ---
    $(document).on('keydown', function (e) { 
        const key = e.key.toLowerCase();
        if ((e.ctrlKey || e.metaKey) && key === "z") {
            e.preventDefault();
            if (e.shiftKey) redoState();
            else undoState();
            return;
        }
        if ((e.ctrlKey || e.metaKey) && key === "y") {
            e.preventDefault();
            redoState();
            return;
        }

        if (e.key === 'Enter' && currentEngine && currentState) {
            flushPendingHistoryCommit();
            currentState = currentEngine.next(currentState, currentParams);
            executeRenderCycle();
            commitHistorySnapshot();
        }
    });

    canvas.addEventListener("pointerdown", function (e) {
        if (activeKey !== "Mandelbrot" || !currentState || !currentState.view) return;
        isMandelbrotDragging = true;
        mandelbrotDragPointerId = e.pointerId;
        mandelbrotDragLast = { x: e.offsetX, y: e.offsetY };
        canvas.setPointerCapture(e.pointerId);
        canvas.classList.add("is-dragging");
        e.preventDefault();
    });

    canvas.addEventListener("pointermove", function (e) {
        if (activeKey !== "Mandelbrot" || !isMandelbrotDragging || e.pointerId !== mandelbrotDragPointerId) return;
        if (!currentState || !currentState.view) return;

        const dx = e.offsetX - mandelbrotDragLast.x;
        const dy = e.offsetY - mandelbrotDragLast.y;
        mandelbrotDragLast = { x: e.offsetX, y: e.offsetY };

        currentState = {
            ...currentState,
            view: {
                ...currentState.view,
                centerX: currentState.view.centerX - (dx / canvas.width) * currentState.view.scale,
                centerY: currentState.view.centerY - (dy / canvas.width) * currentState.view.scale
            }
        };

        scheduleRenderCycle();
        scheduleMandelbrotCommit();
        e.preventDefault();
    });

    function endMandelbrotDrag(e) {
        if (activeKey !== "Mandelbrot" || !isMandelbrotDragging || e.pointerId !== mandelbrotDragPointerId) return;
        isMandelbrotDragging = false;
        canvas.classList.remove("is-dragging");
        try {
            canvas.releasePointerCapture(e.pointerId);
        } catch (_) {}
        scheduleMandelbrotCommit(0);
        e.preventDefault();
    }

    canvas.addEventListener("pointerup", endMandelbrotDrag);
    canvas.addEventListener("pointercancel", endMandelbrotDrag);

    canvas.addEventListener("wheel", function (e) {
        if (activeKey !== "Mandelbrot" || !currentState || !currentState.view) return;
        e.preventDefault();

        const rect = canvas.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const view = currentState.view;
        const pointX = view.centerX + ((px / canvas.width) - 0.5) * view.scale;
        const pointY = view.centerY + ((py / canvas.width) - 0.5) * view.scale;
        const zoomFactor = e.deltaY < 0 ? 0.85 : 1.15;
        const nextScale = Math.max(0.0008, Math.min(6, view.scale * zoomFactor));

        currentState = {
            ...currentState,
            view: {
                ...view,
                scale: nextScale,
                centerX: pointX - ((px / canvas.width) - 0.5) * nextScale,
                centerY: pointY - ((py / canvas.width) - 0.5) * nextScale
            }
        };

        scheduleRenderCycle();
        scheduleMandelbrotCommit();
    }, { passive: false });
});
