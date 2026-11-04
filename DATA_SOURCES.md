# Geographic sources

## Boundaries and rivers

Natural Earth, public domain: https://www.naturalearthdata.com/

Boundary data accessed 2026-11-03 from the Natural Earth vector repository:
- `ne_50m_admin_0_boundary_lines_land.geojson`
- `ne_50m_admin_0_boundary_lines_disputed_areas.geojson`

Source repository: https://github.com/nvkelso/natural-earth-vector/tree/master/geojson

The default `FEATURECLA` classification is used except for the Kashmir/Ladakh and Arunachal Pradesh overrides described below. Only `International boundary (verify)` features are solid. Disputed, control, indefinite and indeterminant-frontier features plus auxiliary claim/breakaway/frontier lines are dashed. This is a generalized dataset snapshot, not an exhaustive or real-time record of disputes or a statement of sovereignty. Natural Earth's policy: https://www.naturalearthdata.com/about/disputed-boundaries-policy/

The existing 1:110m country topology supplies coastlines and the land mask. River geometry uses 1:50m rivers at scale ranks 1–3. Small resolution differences can occur between the coastlines and 1:50m boundary endpoints.

## Terrain

Terrain Tiles accessed 2026-11-03 from https://registry.opendata.aws/terrain-tiles/. Sixteen zoom-2 Terrarium tiles were decoded using `(red * 256 + green + blue / 256) - 32768`. The 1,024 × 1,024 Web Mercator elevation mosaic was smoothed with three five-neighbor passes, then contoured at 1,000, 1,500, 2,000, 2,500, 3,000, 4,000 and 5,000 metres. Tiny loops were omitted; coordinates were rounded to four decimal places. These are coarse decorative terrain contours, not navigational or survey data.

Encoding: https://github.com/tilezen/joerd/blob/master/docs/formats.md

Attribution and upstream license information: https://github.com/tilezen/joerd/blob/master/docs/attribution.md

### Terrain source attribution


* ArcticDEM terrain data DEM(s) were created from DigitalGlobe, Inc., imagery and
  funded under National Science Foundation awards 1043681, 1559691, and 1542736;
* Australia terrain data © Commonwealth of Australia (Geoscience Australia) 2017;
* Austria terrain data © offene Daten Österreichs – Digitales Geländemodell (DGM)
  Österreich;
* Canada terrain data contains information licensed under the Open Government
  Licence – Canada;
* Europe terrain data produced using Copernicus data and information funded by the
  European Union - EU-DEM layers;
* Global ETOPO1 terrain data U.S. National Oceanic and Atmospheric Administration
* Mexico terrain data source: INEGI, Continental relief, 2016;
* New Zealand terrain data Copyright 2011 Crown copyright (c) Land Information New
  Zealand and the New Zealand Government (All rights reserved);
* Norway terrain data © Kartverket;
* United Kingdom terrain data © Environment Agency copyright and/or database right
  2015. All rights reserved;
* United States 3DEP (formerly NED) and global GMTED2010 and SRTM terrain data
  courtesy of the U.S. Geological Survey.


## Urban footprints and lakes

Natural Earth 1:50m public-domain data, accessed 2026-11-03:
- Urban areas: https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-urban-areas/ (`ne_50m_urban_areas.geojson`). These generalized footprints derive from 2002–2003 MODIS imagery; they do not represent current urban extents.
- Lakes: https://www.naturalearthdata.com/downloads/50m-physical-vectors/ (`ne_50m_lakes.geojson`), restricted to `featurecla = Lake` and scale rank ≤ 2.

Urban points are deterministic Halton samples constrained to polygon exteriors and excluding holes. Counts are proportional to source `area_sqkm` (one sample per approximately 15 km², clamped to 4–120 per area). They are decorative samples of known urban footprints, not building coordinates, population observations, or night-light measurements. All 45,780 rounded points were checked against their source footprints.

Lake polygon winding is normalized for D3 spherical rendering; holes are preserved. Lake geometry is drawn independently of the coarse land mask so inland-water holes in the original country topology still receive shorelines.

## Regional borders and population hierarchy

Accessed 2026-11-03 from https://github.com/nvkelso/natural-earth-vector/tree/master/geojson :
- `ne_50m_admin_1_states_provinces_lines.geojson`: 581 admin-1 line features across AUS, BRA, CAN, CHN, IND, IDN, RUS, ZAF and USA. Only published admin-1 boundary lines are used; no artificial divisions are generated for other countries. See https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-1-states-provinces/ .
- `ne_50m_populated_places.geojson`: city centers and `POP_MAX` estimates, with `ADM0CAP` retaining smaller national capitals. Tier cutoffs are 100,000, 1 million and 5 million; these are design thresholds, not official classifications. Values are historical dataset estimates, not current census figures. See https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-populated-places/ .

The expanded terrain layer has 174 coarse elevation contours. A screen-space opacity gradient makes them clearer in the foreground and less prominent along the horizon; it does not change elevation geometry.

## Kashmir/Ladakh display override

At the portfolio owner’s request, this region displays India’s claimed outer boundary as solid white lines. The source snapshot’s `FCLASS_IN` classifications identify which internal control/alternate claim lines to omit and which claim segments become solid. The Demchok/Samdu administered perimeter segments are also solid, so no contested styling remains locally. Other regions retain the original classifications.

This is a map-presentation viewpoint, not a change to the source’s sovereignty metadata. The globe has uniform fill; country topology remains used only for coastline and combined land masking. The reproducible override and explicit Natural Earth feature IDs are in `scripts/apply-kashmir-viewpoint.py`.

## Arunachal Pradesh display override

At the portfolio owner's request, Arunachal Pradesh is displayed within India. Natural Earth feature `1746705337`, classified by `FCLASS_IN` as an international boundary, is rendered solid. Alternate claim line `1746705431`, classified by `FCLASS_IN` as unrecognized, is omitted. These two explicit feature overrides extend `scripts/apply-kashmir-viewpoint.py`; the existing Kashmir/Ladakh display and all other boundary classifications are preserved.
