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

The opening view is centered at 73° E, toward western India. Rotation runs at 1.225° per second, 30% slower than the previous 1.75° per second. Name floating and city pulse timings are independent of this speed.

## Rivers and coastlines

Major rivers use thin white strokes at 32% opacity, clipped to the visible land. Coastlines use 1 px strokes at 95% opacity; inland political borders use 0.8 px strokes at 70% opacity. Cities remain solid white points.

River geometry comes from Natural Earth's public-domain [1:50m rivers and lake centerlines](https://www.naturalearthdata.com/downloads/50m-physical-vectors/50m-rivers-lake-centerlines/), restricted to scale ranks 1–3. Coastlines and the land mask come from the existing country topology. All geometry remains embedded; no runtime data requests are needed.

## Finishing details

A faint white atmosphere follows the horizon. Twenty-eight deterministic stars remain static above the globe. Eight existing city points pulse gently over six seconds without rings. Reduced-motion preferences disable rotation and pulses.

Terrain uses sparse, smoothed elevation contours at 1,000, 1,500, 2,000, 2,500, 3,000, 4,000, and 5,000 metres, fading from 3.5% opacity near the horizon to 22% toward the foreground. Disputed, control, indefinite, frontier, and claim boundaries use 3 px white dashes separated by 3 px gaps. Ordinary political borders are drawn separately, rather than underneath disputed sections.

See [DATA_SOURCES.md](DATA_SOURCES.md) for map sources, classification scope, terrain attribution, and resolution limits. All new geometry is embedded, with no runtime requests.

## Urban clusters and lakes

Urban clusters use 45,780 stable white points at 0.62 px radius and 48% opacity. They are sampled inside 2,143 published urban-area footprints; larger footprints receive more points, with a cap of 120 per area. Existing brighter city centers and subtle pulses remain. These samples represent urban shapes, not individual buildings or measured population density.

The 280 priority lake polygons use dark interiors and 0.65 px white shorelines at 46% opacity. Water masks underlying terrain, river centerlines, and urban samples. Both layers rotate and clip with the globe and retain the reduced-motion behavior.

## Regional boundaries and city hierarchy

Regional boundaries are 0.45 px solid white lines at 18% opacity in Australia, Brazil, Canada, China, India, Indonesia, Russia, South Africa, and the United States. This deliberately sparse coverage comes from Natural Earth's 1:50m admin-1 line dataset. National borders remain stronger; contested borders remain dashed.

City sizes use Natural Earth's historical `POP_MAX` estimates:

| Tier | Population estimate | Radius | Opacity |
|---|---|---|---|
| Smaller | 100,000–999,999, plus smaller national capitals | 0.85 px | 55% |
| Medium | 1–4.999 million | 1.3 px | 78% |
| Major | At least 5 million | 1.9 px | 100% |

Smaller centers render first; major centers retain the urban-cluster context. Eight selected major centers pulse subtly. No labels, halos, or regional dashes are added.

## Horizon name

“Eshaan” uses Space Grotesk Bold with tight tracking; “Ojha” uses Light with slightly wider tracking. JetBrains Mono supplies the dim `Networking - Security - Backend Development` subtitle, live globe viewing coordinates. A faint blue-white atmospheric rim supplies the restrained color accent. The former background haze is removed; the name has a restrained wide glow.

The curved globe still masks the bottom of the name during a 2.4-second rising entrance. Text is measured to fit the viewport, and reduced-motion preferences show the final position immediately. Both fonts are embedded, so no external font requests are needed; their SIL Open Font Licenses are included in `licenses/`.

## Floating name

After the 2.4-second rising entrance, the name gently floats vertically on a 6.2-second cycle. The motion eases in over 1.8 seconds and scales from 2 to 7 px with the typography. The subtitle stays anchored, and the globe continues to mask the lower edge of the name. Reduced-motion mode disables both the entrance and floating motion, showing the resting position immediately.

## Portfolio navigation zones

Adapted from the supplied `zones.html` and annotated screenshot: Projects 01 (left of the name), About 02 (upper left), Writeups 03 (upper center), Get in Touch 04 (right). The hero's center remains outside the polygon hit areas. Hover or keyboard focus highlights the active label/border without scaling or transforming the scene. The top-left portfolio label and rule are omitted. Pointer exits use a 100 ms grace period.

Below 761 px wide or 521 px tall, navigation becomes compact, keyboard-accessible buttons. Touch taps activate anchors directly. Reduced-motion mode disables navigation transitions. The existing name float, globe rotation, typography, sandbox and CSP remain intact.

Links are deliberately retained as `#projects`, `#about`, `#writeups`, and `#contact` anchors for future sections, as requested. No section content or contact information is invented. Because navigation lives inside the sandboxed visualization, these hashes belong to its document; add the destination sections inside that same document when ready. The current anchor is reflected by `aria-current="location"`.
