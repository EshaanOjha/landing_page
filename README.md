# Globe Portfolio

A fullscreen rotating globe with white country borders and major city points, sized to the latest reference.

## Run locally

Open `index.html` directly in a browser, or serve this folder:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

The page includes its geographic data and rendering libraries, and preserves the sandboxed iframe and Content Security Policy. No build step is required.

## Edit

The visualization is embedded in the iframe's HTML-escaped `data-srcdoc` attribute in `index.html`.

- Horizon position: `height * 0.45 + radius`
- Globe radius: `Math.max(width * 1.30, height * 0.70)`

Keep the canvas circle and map projection aligned when changing the horizon position.

## Opening view and motion

The opening view is centered at 73° E, toward western India. Rotation runs at 1.75° per second, 30% slower than the original 2.5° per second.
