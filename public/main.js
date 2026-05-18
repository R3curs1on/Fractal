import SierpinskiEngine, { Triangle } from "./fractals/SierpinskiTriangle.js";
import SnowFlakeEngine, { Point as SnowPoint, Segment } from "./fractals/SnowFlake.js";
import InfiniteCirclesEngine, { FractalCircle } from "./fractals/InfiniteCircles.js";
import DragonCurveEngine, { DragonSegment } from "./fractals/DragonCurve.js";
import VicsekFractalEngine, { VicsekSquare } from "./fractals/VicsekFractal.js";
import RecursiveTreeEngine, { Branch, Point as TreePoint } from "./fractals/RecursiveTree.js";
import ApollonianGasketEngine from "./fractals/ApollonianGasket.js";

import MandelbrotEngine, { createPixelFractalEngine } from "./fractals/Mandelbrot.js";
import NewtonEngine from "./fractals/NewtonRaphson.js";
import FernEngine from "./fractals/BarnsleyFern.js";
import LSystemEngine from "./fractals/LSystemPlant.js";
import { getFractalDocs } from "./fractalDocs.js";
import { renderGeometryScene } from "./renderers/GeometryWebGL.js";

$(document).ready( () => {
    console.log("Unified Fractal Engine Initialized.");

    const canvas = $("#fractalCanvas")[0];
    const glCanvas = $("#fractalCanvasGL")[0];
    const ctx = canvas.getContext('2d');

    const miniCanvas = $("#minifractalCanvas")[0];
    const miniCtx = miniCanvas.getContext('2d');

    const $controlsHint = $("#controlsHint");
    const $infoTitle = $("#infoTitle");
    const $infoSummary = $("#infoSummary");
    const $infoEquation = $("#infoEquation");
    const $infoNotes = $("#infoNotes");

    const FRACTAL_REGISTRY = {
        "SierpinskiTriangle": SierpinskiEngine,
        "SnowFlake": SnowFlakeEngine,
        "InfiniteCircles": InfiniteCirclesEngine,
        "DragonCurve": DragonCurveEngine,
        "VicsekFractal": VicsekFractalEngine,
        "RecursiveTree": RecursiveTreeEngine,
        "ApollonianGasket": ApollonianGasketEngine,
        "Mandelbrot": MandelbrotEngine,
        "MandelbrotCube": createPixelFractalEngine("MandelbrotCube"),
        "Julia": createPixelFractalEngine("Julia"),
        "JuliaCube": createPixelFractalEngine("JuliaCube"),
        "NewtonRaphson": NewtonEngine,
        "NewtonFractal": NewtonEngine,
        "BarnsleyFern": FernEngine,
        "LSystemPlant": LSystemEngine
    };

    const PIXEL_FRACTAL_KEYS = new Set(["Mandelbrot", "MandelbrotCube", "Julia", "JuliaCube", "NewtonRaphson", "NewtonFractal"]);
    const JULIA_FRACTAL_KEYS = new Set(["Julia", "JuliaCube"]);
    const DRAG_THRESHOLD = 4;

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
    let dragSession = null;

    // --- Side Drawer Toggle Control ---
    $("#menuToggle").on("click", function() {
        $("#sideDrawer").toggleClass("hidden");
    });

    $("#undoState").on("click", undoState);
    $("#redoState").on("click", redoState);
    $("#resetState").on("click", resetCurrentState);
    $("#exportPng").on("click", exportCurrentPng);
    $("#exportJson").on("click", exportCurrentJson);
    $("#mandelbrotZoomIn").on("click", zoomInMandelbrot);
    $("#mandelbrotZoomOut").on("click", zoomOutFractal);
    $("#juliaFreeze").on("click", toggleJuliaFreeze);

    function clearCanvas() {
        if (!isPixelMode()) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    function cloneData(value) {
        if (typeof structuredClone === "function") {
            return structuredClone(value);
        }
        return JSON.parse(JSON.stringify(value));
    }

    function createDefaultDisplayView() {
        return {
            centerX: canvas.width / 2,
            centerY: canvas.height / 2,
            scale: 1,
        };
    }

    function ensureView(state) {
        if (!state) return state;
        if (state.view) return state;
        return {
            ...state,
            view: createDefaultDisplayView(),
        };
    }

    function withView(state, view) {
        if (!state) return state;
        return {
            ...state,
            view,
        };
    }

    function isPixelMode() {
        return PIXEL_FRACTAL_KEYS.has(activeKey);
    }

    function getActiveCanvas() {
        return glCanvas;
    }

    function syncCanvasVisibility() {
        const interactiveMode = !!(currentState && currentState.view);
        canvas.classList.add("render-hidden");
        glCanvas.classList.remove("render-hidden");
        canvas.classList.remove("mandelbrot-mode");
        glCanvas.classList.toggle("mandelbrot-mode", interactiveMode);
    }

    function normalizeStateForMode(state) {
        if (!state) return state;
        if (isPixelMode()) {
            if (state.view) return state;
            if (currentEngine && typeof currentEngine.init === "function") {
                const seedState = currentEngine.init(getActiveCanvas(), currentParams);
                return {
                    ...state,
                    view: seedState.view || createDefaultDisplayView(),
                    mouseX: state.mouseX ?? seedState.mouseX,
                    mouseY: state.mouseY ?? seedState.mouseY,
                    juliaFrozen: state.juliaFrozen ?? seedState.juliaFrozen,
                };
            }
            return ensureView(state);
        }
        return ensureView(state);
    }

    function applyDisplayPan(state, dx, dy) {
        if (!state || !state.view) return state;
        return withView(state, {
            ...state.view,
            centerX: state.view.centerX - dx * state.view.scale,
            centerY: state.view.centerY - dy * state.view.scale,
        });
    }

    function applyDisplayZoom(state, canvasNode, x, y, zoomIn = true) {
        if (!state || !state.view) return state;
        const factor = zoomIn ? 0.9 : 1.1;
        const nextScale = state.view.scale * factor;
        if (!Number.isFinite(nextScale) || nextScale <= 0) {
            return state;
        }
        const appliedFactor = nextScale / state.view.scale;
        return withView(state, {
            ...state.view,
            centerX: state.view.centerX + (1 - appliedFactor) * (x - canvasNode.width / 2),
            centerY: state.view.centerY + (1 - appliedFactor) * (y - canvasNode.height / 2),
            scale: nextScale,
        });
    }

    function panCurrentFractal(dx, dy, targetCanvas) {
        if (!currentState || !currentState.view) return;
        if (isPixelMode() && typeof currentEngine.panBy === "function") {
            currentState = currentEngine.panBy(currentState, targetCanvas, dx, dy);
        } else {
            currentState = applyDisplayPan(currentState, dx, dy);
        }
    }

    function zoomCurrentFractal(targetCanvas, x, y, zoomIn = true) {
        if (!currentState || !currentState.view) return;
        if (isPixelMode() && typeof currentEngine.zoomAt === "function") {
            currentState = currentEngine.zoomAt(currentState, targetCanvas, x, y, zoomIn);
        } else {
            currentState = applyDisplayZoom(currentState, targetCanvas, x, y, zoomIn);
        }
    }

    function setActiveButton(activeId) {
        $(".choose-visuals button").removeClass("active");
        $(`#${activeId}`).addClass("active");
        $controlsHint.css("visibility", "visible");
        syncCanvasVisibility();
        syncMandelbrotControls();
    }

    function syncMandelbrotControls() {
        const isEnabled = currentState && currentState.view;
        $("#mandelbrotZoomIn").prop("disabled", !isEnabled);
        $("#mandelbrotZoomOut").prop("disabled", !isEnabled);
        const isJulia = JULIA_FRACTAL_KEYS.has(activeKey) && currentState && currentState.view;
        $("#juliaFreeze").prop("disabled", !isJulia);
        if (isJulia) {
            $("#juliaFreeze").text(currentState.juliaFrozen ? "Unfreeze Julia" : "Freeze Julia");
        } else {
            $("#juliaFreeze").text("Freeze Julia");
        }
    }

    function formatZoomValue(value) {
        if (!Number.isFinite(value)) {
            return "∞";
        }
        const abs = Math.abs(value);
        if ((abs > 100000 || (abs > 0 && abs < 0.001))) {
            return value.toExponential(3);
        }
        return value.toFixed(4);
    }

    function refreshFractalDocs() {
        const docs = getFractalDocs(activeKey);
        $infoTitle.text(docs.title || activeKey || "-");
        $infoSummary.text(docs.summary || "");
        $infoEquation.text(docs.equation || "—");
        $infoNotes.text(docs.notes || "");
    }

    function updateMiniFractal() {
        miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
        const activeCanvas = getActiveCanvas();
        miniCtx.drawImage(activeCanvas,
            0, 0, activeCanvas.width, activeCanvas.height,
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
            if (PIXEL_FRACTAL_KEYS.has(activeKey) && currentState && currentState.view) {
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
            currentState = normalizeStateForMode(deserializeState(activeKey, snapshot.currentState));
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
        currentState = normalizeStateForMode(currentEngine.init(getActiveCanvas(), currentParams));
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
        getActiveCanvas().toBlob(blob => {
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
        dragSession = null;
        canvas.classList.remove("is-dragging");
        glCanvas.classList.remove("is-dragging");
        if (mandelbrotCommitTimer) {
            clearTimeout(mandelbrotCommitTimer);
            mandelbrotCommitTimer = null;
        }
        cancelRenderCycle();
        if (currentEngine && typeof currentEngine.cancelRender === "function") {
            currentEngine.cancelRender();
        }
    }

    function finalizeMandelbrotInteraction() {
        if (!currentState || !currentState.view) return;
        if (mandelbrotCommitTimer) {
            clearTimeout(mandelbrotCommitTimer);
            mandelbrotCommitTimer = null;
        }
        if (!PIXEL_FRACTAL_KEYS.has(activeKey)) {
            executeRenderCycle();
            commitHistorySnapshot();
            return;
        }
        currentState = {
            ...currentState,
            generation: currentState.generation + 1,
            view: cloneData(currentState.view)
        };
        executeRenderCycle();
        commitHistorySnapshot();
    }

    function zoomInMandelbrot() {
        if (!currentState || !currentState.view) return;
        flushPendingHistoryCommit();

        const targetCanvas = getActiveCanvas();
        zoomCurrentFractal(targetCanvas, targetCanvas.width / 2, targetCanvas.height / 2, true);
        if (PIXEL_FRACTAL_KEYS.has(activeKey)) {
            finalizeMandelbrotInteraction();
        } else {
            executeRenderCycle();
            commitHistorySnapshot();
        }
    }

    function zoomOutFractal() {
        if (!currentState || !currentState.view) return;
        flushPendingHistoryCommit();

        const targetCanvas = getActiveCanvas();
        zoomCurrentFractal(targetCanvas, targetCanvas.width / 2, targetCanvas.height / 2, false);
        if (PIXEL_FRACTAL_KEYS.has(activeKey)) {
            finalizeMandelbrotInteraction();
        } else {
            executeRenderCycle();
            commitHistorySnapshot();
        }
    }

    function panViewByKeyboard(dx, dy) {
        if (!currentState || !currentState.view) return;
        flushPendingHistoryCommit();

        const targetCanvas = getActiveCanvas();
        panCurrentFractal(dx, dy, targetCanvas);
        executeRenderCycle();
        commitHistorySnapshot();
    }

    function toggleJuliaFreeze() {
        if (!JULIA_FRACTAL_KEYS.has(activeKey) || !currentState || !currentState.view) return;

        currentState = {
            ...currentState,
            juliaFrozen: !currentState.juliaFrozen
        };
        syncMandelbrotControls();
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
            ? `${currentState.elementCount || 0} | zoom ${formatZoomValue(currentState.view.scale)}`
            : (currentState.elementCount || 0);
        $("#infoElements").text(metricsText);
        refreshFractalDocs();
        syncMandelbrotControls();
    }

    // --- Unified Execution Render Loop ---
    function executeRenderCycle() {
        const token = ++renderToken;
        const activeCanvas = getActiveCanvas();
        if (!PIXEL_FRACTAL_KEYS.has(activeKey) && currentState && currentState.animationStartedAt) {
            const elapsed = performance.now() - currentState.animationStartedAt;
            const progress = Math.max(0, Math.min(1, elapsed / Math.max(1, currentState.animationDuration || 1)));
            currentState = {
                ...currentState,
                animationProgress: progress,
            };
        }

        if (isPixelMode()) {
            currentEngine.render(activeCanvas, currentState, currentParams, function() {
                if (token !== renderToken) return;
                updateMiniFractal();
                updateInfoPanel();
            });
        } else {
            renderGeometryScene(activeCanvas, activeKey, currentState, currentParams, function() {
                if (token !== renderToken) return;
                updateMiniFractal();
                updateInfoPanel();
                if (currentState && currentState.animationStartedAt && (currentState.animationProgress || 0) < 1) {
                    scheduleRenderCycle();
                }
            });
        }

        if (!isPixelMode()) {
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

            // Bind pts for parameters change intercerequiring complete shape structure rebuilding
            $input.on('change', function() {
                if (PIXEL_FRACTAL_KEYS.has(activeKey) && field.key === "maxElements") {
                    currentState = {
                        ...currentState,
                        elementCount: Math.min(Number(currentParams.maxElements), currentState.elementCount)
                    };
                    executeRenderCycle();
                    commitHistorySnapshot();
                } else if (field.key === "padding" || field.key === "maxElements") {
                    currentState = currentEngine.init(getActiveCanvas(), currentParams);
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
        currentState = normalizeStateForMode(targetEngine.init(getActiveCanvas(), currentParams));

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
        if (JULIA_FRACTAL_KEYS.has(activeKey) && key === "c") {
            e.preventDefault();
            toggleJuliaFreeze();
            return;
        }
        if (PIXEL_FRACTAL_KEYS.has(activeKey) && !e.ctrlKey && !e.metaKey && !e.altKey) {
            if (e.key === "+" || e.key === "=" || e.code === "NumpadAdd") {
                e.preventDefault();
                zoomInMandelbrot();
                return;
            }
        }

        if (e.key === 'Enter' && currentEngine && currentState) {
            e.preventDefault();
            e.stopPropagation();
            flushPendingHistoryCommit();
            const previousView = currentState.view ? cloneData(currentState.view) : null;
            const nextState = currentEngine.next(currentState, currentParams);
            currentState = nextState;
            if (!currentState.view && previousView) {
                currentState = {
                    ...currentState,
                    view: previousView,
                };
            }
            currentState = normalizeStateForMode(currentState);
            if (!PIXEL_FRACTAL_KEYS.has(activeKey)) {
                currentState = {
                    ...currentState,
                    animationStartedAt: performance.now(),
                    animationDuration: 700,
                    animationProgress: 0,
                };
            }
            executeRenderCycle();
            commitHistorySnapshot();
            return;
        }

        if (!currentState || !currentState.view) return;

        const isPanLeft = key === "a" || e.key === "ArrowLeft";
        const isPanRight = key === "d" || e.key === "ArrowRight";
        const isPanUp = key === "w" || e.key === "ArrowUp";
        const isPanDown = key === "s" || e.key === "ArrowDown";
        const isZoomIn = e.key === "+" || e.key === "=" || e.code === "NumpadAdd";
        const isZoomOut = e.key === "-" || e.code === "NumpadSubtract";

        if (isPanLeft || isPanRight || isPanUp || isPanDown) {
            e.preventDefault();
            const step = Math.max(12, Math.round((currentState.view.scale || 1) * 24));
            let dx = 0;
            let dy = 0;
            if (isPanLeft) dx = step;
            if (isPanRight) dx = -step;
            if (isPanUp) dy = step;
            if (isPanDown) dy = -step;
            panViewByKeyboard(dx, dy);
            return;
        }

        if (isZoomIn || isZoomOut) {
            e.preventDefault();
            flushPendingHistoryCommit();
            zoomCurrentFractal(getActiveCanvas(), getActiveCanvas().width / 2, getActiveCanvas().height / 2, isZoomIn);
            if (PIXEL_FRACTAL_KEYS.has(activeKey)) {
                finalizeMandelbrotInteraction();
            } else {
                executeRenderCycle();
                commitHistorySnapshot();
            }
            return;
        }

        if (key === " " || e.code === "Space") {
            e.preventDefault();
            resetCurrentState();
            return;
        }
    });

    [canvas, glCanvas].forEach((targetCanvas) => {
        targetCanvas.addEventListener("pointerdown", function (e) {
            if (!currentState || !currentState.view) return;

            if (e.button === 0) {
                dragSession = {
                    pointerId: e.pointerId,
                    button: e.button,
                    canvas: targetCanvas,
                    startX: e.offsetX,
                    startY: e.offsetY,
                    lastX: e.offsetX,
                    lastY: e.offsetY,
                    moved: false,
                };
                try {
                    targetCanvas.setPointerCapture(e.pointerId);
                } catch (_) {}
                targetCanvas.classList.add("is-dragging");
                e.preventDefault();
                return;
            }

            if (e.button === 1) {
                zoomCurrentFractal(targetCanvas, e.offsetX, e.offsetY, true);
                if (PIXEL_FRACTAL_KEYS.has(activeKey)) {
                    finalizeMandelbrotInteraction();
                } else {
                    executeRenderCycle();
                    commitHistorySnapshot();
                }
                e.preventDefault();
                return;
            }

            if (e.button === 2) {
                e.preventDefault();
            }
        });

        targetCanvas.addEventListener("pointermove", function (e) {
            if (dragSession && dragSession.pointerId === e.pointerId) {
                if (!currentState || !currentState.view) return;

                const dx = e.offsetX - dragSession.lastX;
                const dy = e.offsetY - dragSession.lastY;
                dragSession.lastX = e.offsetX;
                dragSession.lastY = e.offsetY;

                const distance = Math.hypot(e.offsetX - dragSession.startX, e.offsetY - dragSession.startY);
                if (!dragSession.moved && distance >= DRAG_THRESHOLD) {
                    dragSession.moved = true;
                }
                if (!dragSession.moved) return;

                panCurrentFractal(dx, dy, targetCanvas);
                scheduleRenderCycle();
                e.preventDefault();
                return;
            }

            if (PIXEL_FRACTAL_KEYS.has(activeKey) && JULIA_FRACTAL_KEYS.has(activeKey) && currentState && currentState.view && !currentState.juliaFrozen) {
                currentState = {
                    ...currentState,
                    mouseX: e.offsetX,
                    mouseY: e.offsetY
                };
                scheduleRenderCycle();
                scheduleMandelbrotCommit();
            }
        });

        targetCanvas.addEventListener("pointerup", function (e) {
            if (dragSession && dragSession.pointerId === e.pointerId) {
                const session = dragSession;
                dragSession = null;

                try {
                    targetCanvas.releasePointerCapture(e.pointerId);
                } catch (_) {}
                targetCanvas.classList.remove("is-dragging");

                if (session.moved) {
                    if (PIXEL_FRACTAL_KEYS.has(activeKey)) {
                        finalizeMandelbrotInteraction();
                    } else {
                        executeRenderCycle();
                        commitHistorySnapshot();
                    }
                    e.preventDefault();
                    return;
                }

                if (session.button === 0 && PIXEL_FRACTAL_KEYS.has(activeKey) && typeof currentEngine.adjustIterations === "function") {
                    currentState = currentEngine.adjustIterations(currentState, 1, currentParams);
                    executeRenderCycle();
                    commitHistorySnapshot();
                }

                e.preventDefault();
                return;
            }

            if (e.button === 2 && PIXEL_FRACTAL_KEYS.has(activeKey) && currentState && currentState.view) {
                if (typeof currentEngine.adjustIterations === "function") {
                    currentState = currentEngine.adjustIterations(currentState, -1, currentParams);
                    executeRenderCycle();
                    commitHistorySnapshot();
                }
                e.preventDefault();
            }
        });

        targetCanvas.addEventListener("pointercancel", function (e) {
            if (dragSession && dragSession.pointerId === e.pointerId) {
                dragSession = null;
                try {
                    targetCanvas.releasePointerCapture(e.pointerId);
                } catch (_) {}
                targetCanvas.classList.remove("is-dragging");
            }
        });

        targetCanvas.addEventListener("wheel", function (e) {
            if (!currentState || !currentState.view) return;
            e.preventDefault();

            zoomCurrentFractal(targetCanvas, e.offsetX, e.offsetY, e.deltaY < 0);
            if (PIXEL_FRACTAL_KEYS.has(activeKey)) {
                finalizeMandelbrotInteraction();
            } else {
                executeRenderCycle();
                commitHistorySnapshot();
            }
        }, { passive: false });

        targetCanvas.addEventListener("contextmenu", function (e) {
            e.preventDefault();
        });
    });

});
