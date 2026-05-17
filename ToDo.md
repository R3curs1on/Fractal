
**To Do** :

- [x] index.html basic divs and choose to show different types of fractals 
- [x] in src/fractals make 2-3 default fractals like Sierpinski Triangle , snow flake pattern and all recursion/maths there
- [x] in src/rendering make some rendering logic ( this is not some image based )
- [x] write src/main.js for all DOM handler and rendering 
- [x] use src/utils for things out of above directory 
- [x] parameter controls
- [x] Mandelbrot zoom
- [ ] maths equations info panel of fractals
- [x] generation history
- [x] export system
- [x] color systems
- [ ] animated recursion
- [x] undo/redo system
- [ ] performance optimization for mandelbrot julia cube fractal zoom with offscreen canvas and web workers or openGL(https://github.com/R3curs1on/fractals_OpenGL)
- [ ] add more fractals like Barnsley fern, L-system, Apollonian gasket, Newton fractal, etc.
- [ ]  info panel and docs of fractals 




• Your repo already has the right extension point: a single FRACTAL_REGISTRY in public/main.js:38 and click/keyboard routing in public/main.js:181. Build on
  that, don’t rewrite it.

  What to use

  - Native HTML controls first: input type="range", checkbox, select, color, buttons.
  - Canvas 2D API for all drawing: Canvas API (https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API).
  - requestAnimationFrame for anything animated: requestAnimationFrame (https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame).
  - URLSearchParams + History API for shareable state and browser back/forward: URLSearchParams
    (https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams), History API (https://developer.mozilla.org/en-US/docs/Web/API/History_API).
  - structuredClone and localStorage for history/persistence: structuredClone (https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone), localSt
    orage (https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
  - canvas.toBlob() + blob: URLs for export: toBlob (https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob), blob URLs
    (https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob).
  - OffscreenCanvas + Web Workers if Mandelbrot zoom becomes slow: OffscreenCanvas (https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas), Web Worke
    rs (https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API).

  How to implement each feature

  1. Parameter controls

  - Add a controls sidebar or panel in public/index.html.
  - Give each fractal a control schema, for example:

  params: [
    { key: "iterations", type: "range", min: 5, max: 500, step: 5 },
    { key: "palette", type: "select", options: ["default", "fire", "ice"] }
  ]

  - Render the controls dynamically when activeKey changes.
  - Keep params in a central state object, then pass them into init, next, and render.
  - Good learning topics: DOM events, form inputs, state management.

  2. Mandelbrot zoom

  - Add view = { centerX, centerY, scale, iterations }.
  - Change the pixel-to-complex mapping in public/fractals/Mandelbrot.js so it uses view instead of fixed bounds.
  - Handle wheel for zoom and pointerdown/pointermove for pan.
  - Re-render on every interaction, and debounce if needed.
  - If it gets heavy, move rendering to OffscreenCanvas or a worker.
  - Good learning topics: complex numbers, affine mapping, canvas pixel loops, workers.

  3. Info panel

  - Create an aside that shows:
      - active fractal name
      - generation number
      - current parameters
      - element count / iteration count
      - keyboard shortcuts
  - Update it whenever a fractal is selected or advanced.
  - You already have a hint/status area in the page; turn that into a real info panel instead of a one-line message.
  - Good learning topics: DOM rendering, accessibility, state-to-UI sync.

  4. Generation history

  - Store snapshots before each Enter step.
  - For shape-based fractals, store the current arrays with structuredClone.
  - For pixel-based fractals, store only the params/state, not the whole canvas bitmap.
  - Add Prev, Next, and Reset buttons.
  - If you want browser back/forward support, sync the current state into history.pushState() / replaceState().
  - Good learning topics: immutable state, cloning, browser history.
  - Practical rule: don’t store full canvases for every generation unless you explicitly want image thumbnails.

  5. Export system

  - For PNG export, use canvas.toBlob() and trigger a download with a temporary blob: URL.
  - For reproducibility, also export a JSON file containing fractal type, params, generation, and view state.
  - If you want vector export later, only some fractals are good SVG candidates; the current app is canvas-first.
  - Good learning topics: Blob APIs, downloads, serialization.
  - If you need a screenshot feature, the mini canvas in public/index.html:13 plus updateMiniFractal() in public/main.js:172 is already a useful preview/export
    hook.

  6. Color systems

  - Stop generating random colors inside draw() if you want repeatable history and exports.
  - Move color selection into state or derive it from:
      - generation depth
      - segment index
      - escape-time iteration
      - branch angle
  - Use HSL palettes or fixed gradient maps for consistency.
  - Add a palette selector in the controls panel.
  - Good learning topics: color spaces, deterministic rendering, palette design.
  - In your current code, several fractals use random color generators during draw, so this is the first thing I would normalize.

  7. Animated recursion

  - Separate “state evolution” from “visual animation.”
  - Use requestAnimationFrame to interpolate between two generations, or to reveal one generation gradually.
  - Examples:
      - tree branches grow from length 0 to full length
      - Sierpinski triangles fade in per depth
      - Koch segments draw in sequence
      - Mandelbrot zoom animates center/scale smoothly
  - Good learning topics: animation loops, easing, frame timing, state machines.

  Best order to build

  1. Parameter controls
  2. Info panel
  3. Generation history
  4. Export system
  5. Color systems
  6. Animated recursion
  7. Mandelbrot zoom
  8. OffscreenCanvas/Web Workers for performance

  One architecture change I recommend

  - Make every fractal engine follow the same shape:

  {
    params,
    init(canvas, params),
    next(state, params),
    render(ctx, state, params)
  }

  That will make controls, history, export, and animation much easier to add.

  Docs to read first

  - Canvas API (https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
  - CanvasRenderingContext2D (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
  - requestAnimationFrame (https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
  - URLSearchParams (https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
  - History API (https://developer.mozilla.org/en-US/docs/Web/API/History_API)
  - structuredClone (https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone)
  - localStorage (https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
  - HTMLCanvasElement.toBlob() (https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)
  - blob: URLs (https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob)
  - OffscreenCanvas (https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
  - Web Workers (https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)

  If you want, I can turn this into an implementation plan for this repo and start wiring the first feature, probably parameter controls + info panel.