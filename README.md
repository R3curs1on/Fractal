# Fractal

Fractal is a browser-based fractal playground rendered on a single `<canvas>`.
You pick a shape, then press `Enter` to advance the next generation or iteration.

The project is a static site located under `public/` and uses ES modules in the browser.
There is no `package.json` or build step in the repo.

## What It Includes

The UI currently exposes these fractals:

- `Sierpinski Triangle` - recursive triangle subdivision
- `Snow Flake` - Koch-style line subdivision
- `Infinite Circles` - recursive circle splitting into four smaller circles
- `Dragon Curve` - iterative folding of line segments
- `Vicsek Cross` - cross-shaped square subdivision
- `Fractal Tree` - recursive branching tree
- `Mandelbrot Set` - pixel-based escape-time rendering of the Mandelbrot set
- `Newton Fractal` - Newton iteration for `z^3 - 1`
- `Barnsley Fern` - iterated function system point generation
- `L-System Plant` - string-rewrite plant rendered with turtle graphics

## How It Works

- `public/index.html` defines the page shell, fractal buttons, and canvas.
- `public/main.js` handles button clicks and `Enter` key presses, then routes to the active fractal engine.
- `public/style.css` contains the terminal-style visual theme.
- `public/fractals/` contains the fractal implementations.

Some files in `public/fractals/` are present as scratch or experimental work and are not wired into the current UI:

- `public/fractals/simplePattern.js`
- `public/fractals/L_system_strings.js`

## Run Locally

1. Clone the repository.
2. Open a terminal in the project directory.
3. Start a static server from `public/`:

```bash
cd public
python3 -m http.server
```

4. Open `http://localhost:8000` in your browser.

If you change the port, use the matching URL from your server output.

## Notes

- The page loads `jQuery` from a CDN.
- The page also loads the `Iosevka` font from a CDN.
- Because the app uses browser ES modules, it should be served over HTTP rather than opened directly with `file://`.

## Project Files

- `LICENSE` - Apache 2.0 license
- `ToDo.md` - original notes and planned follow-up work

## License

Apache License 2.0. See [`LICENSE`](LICENSE) for the full text.
