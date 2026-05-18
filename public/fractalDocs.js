const FRACTAL_DOCS = {
    SierpinskiTriangle: {
        title: "Sierpinski Triangle",
        summary: "A self-similar triangle fractal built by repeatedly removing the middle triangle.",
        equation: "A(n+1) = 3A(n)\nscale = 1/2",
        notes: "Each Enter press subdivides every triangle into three smaller triangles.",
    },
    SnowFlake: {
        title: "Koch Snowflake",
        summary: "A classic L-system curve formed by replacing every segment with a four-part turn pattern.",
        equation: "F -> F+F--F+F",
        notes: "Drag to pan and zoom to inspect the edge growth. Every generation adds more spikes.",
    },
    InfiniteCircles: {
        title: "Infinite Circles",
        summary: "A recursive circle packing pattern that halves circles and places them in four directions.",
        equation: "r(n+1) = r(n) / 2",
        notes: "This iterative subdivision behaves like a recursive packing tree.",
    },
    DragonCurve: {
        title: "Dragon Curve",
        summary: "A folding curve generated from repeated midpoint-based turning.",
        equation: "L(n+1) = fold(L(n))",
        notes: "The renderer keeps the polyline in WebGL so it stays responsive at high depth.",
    },
    VicsekFractal: {
        title: "Vicsek Cross",
        summary: "A five-cell recursive cross that expands through square subdivision.",
        equation: "5-way subdivision with scale = 1/3",
        notes: "Use zoom and pan to inspect the recursive holes between the arms.",
    },
    RecursiveTree: {
        title: "Recursive Tree",
        summary: "A branching tree that rotates each child branch away from the trunk.",
        equation: "L(n+1) = 0.68 × L(n)\nθ = ±30°",
        notes: "The animation reveals branch growth over time after each generation step.",
    },
    BarnsleyFern: {
        title: "Barnsley Fern",
        summary: "An affine iterated function system that converges to the iconic fern shape.",
        equation: "x(n+1), y(n+1) = A_i [x(n), y(n)] + b_i",
        notes: "The density emerges from probability-weighted affine transforms.",
    },
    LSystemPlant: {
        title: "L-System Plant",
        summary: "A string-rewrite plant fractal that expands a grammar into branching line segments.",
        equation: "X -> F+[[X]-X]-F[-FX]+X\nF -> FF",
        notes: "The plant is drawn as a WebGL line batch and animates as the grammar deepens.",
    },
    Mandelbrot: {
        title: "Mandelbrot Set",
        summary: "The escape-time fractal for z(n+1) = z(n)^2 + c.",
        equation: "z(n+1) = z(n)^2 + c",
        notes: "Zoom is effectively unbounded from the UI side, though numeric precision still matters at extreme depth.",
    },
    MandelbrotCube: {
        title: "Mandelbrot Cube",
        summary: "A cubic escape-time variant with a sharper, more angular complex-plane texture.",
        equation: "z(n+1) = z(n)^3 + c",
        notes: "This keeps the same interaction model as Mandelbrot but uses a cubic recurrence.",
    },
    Julia: {
        title: "Julia Set",
        summary: "A Mandelbrot-family set where the constant c is set from the pointer position.",
        equation: "z(n+1) = z(n)^2 + c",
        notes: "Move the mouse to vary c unless Julia is frozen.",
    },
    JuliaCube: {
        title: "Julia Cube",
        summary: "A cubic Julia variant with the same interactive constant controls.",
        equation: "z(n+1) = z(n)^3 + c",
        notes: "The curve family changes noticeably as the cursor constant moves.",
    },
    NewtonRaphson: {
        title: "Newton Fractal",
        summary: "A root-attraction fractal built from Newton-Raphson iteration on z^3 - 1.",
        equation: "z(n+1) = z(n) - f(z(n)) / f'(z(n))\nf(z) = z^3 - 1",
        notes: "Each pixel converges to one of the cubic roots, and color encodes the basin of attraction.",
    },
    ApollonianGasket: {
        title: "Apollonian Gasket",
        summary: "A circle-packing fractal where each gap produces a new tangent circle.",
        equation: "k4 = k1 + k2 + k3 ± 2√(k1k2 + k2k3 + k3k1)\nwhere k = 1/r",
        notes: "This is the newest geometric fractal in the WebGL pipeline and animates as new circles appear.",
    },
};

export function getFractalDocs(key) {
    return FRACTAL_DOCS[key] || (key === "NewtonFractal" ? FRACTAL_DOCS.NewtonRaphson : null) || {
        title: key || "Fractal",
        summary: "No documentation entry is available for this fractal yet.",
        equation: "—",
        notes: "—",
    };
}

export default FRACTAL_DOCS;
