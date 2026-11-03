# Geographic sources

## Boundaries and rivers

Natural Earth, public domain: https://www.naturalearthdata.com/

Boundary data accessed 2026-11-03 from the Natural Earth vector repository:
- `ne_50m_admin_0_boundary_lines_land.geojson`
- `ne_50m_admin_0_boundary_lines_disputed_areas.geojson`

Source repository: https://github.com/nvkelso/natural-earth-vector/tree/master/geojson

The default `FEATURECLA` classification is used, without a country-specific viewpoint override. Only `International boundary (verify)` features are solid. Disputed, control, indefinite and indeterminant-frontier features plus auxiliary claim/breakaway/frontier lines are dashed. This is a generalized dataset snapshot, not an exhaustive or real-time record of disputes or a statement of sovereignty. Natural Earth's policy: https://www.naturalearthdata.com/about/disputed-boundaries-policy/

The existing 1:110m country topology supplies coastlines and the land mask. River geometry uses 1:50m rivers at scale ranks 1–3. Small resolution differences can occur between the coastlines and 1:50m boundary endpoints.

## Terrain

Terrain Tiles accessed 2026-11-03 from https://registry.opendata.aws/terrain-tiles/. Sixteen zoom-2 Terrarium tiles were decoded using `(red * 256 + green + blue / 256) - 32768`. The 1,024 × 1,024 Web Mercator elevation mosaic was smoothed with three five-neighbor passes, then contoured at 1,500, 3,000 and 4,500 metres. Tiny loops were omitted; coordinates were rounded to four decimal places. These are coarse decorative terrain contours, not navigational or survey data.

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

