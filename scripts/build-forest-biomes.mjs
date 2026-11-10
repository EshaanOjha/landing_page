// Usage: node scripts/build-forest-biomes.mjs /path/to/ecoregions.json
// Source and attribution: DATA_SOURCES.md. No network access at runtime.
import { readFileSync, writeFileSync } from 'node:fs';
import { geoArea } from 'd3-geo';
const source = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const biomes = new Set([
  'Tropical & Subtropical Moist Broadleaf Forests',
  'Tropical & Subtropical Dry Broadleaf Forests',
  'Tropical & Subtropical Coniferous Forests',
  'Temperate Broadleaf & Mixed Forests',
  'Temperate Conifer Forests', 'Boreal Forests/Taiga', 'Mangroves',
]);
const coordinates = [];
for (const feature of source.features) {
  if (!biomes.has(feature.properties?.BIOME_NAME)) continue;
  const polygons = feature.geometry.type === 'Polygon'
    ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  for (const polygon of polygons) {
    // D3 uses clockwise exteriors and counterclockwise holes on the sphere.
    const rings = polygon.map((ring, i) => {
      const copy = ring.map(point => point.slice(0, 2));
      const area = geoArea({ type: 'Polygon', coordinates: [copy] });
      if ((i === 0 && area > 2 * Math.PI) || (i > 0 && area < 2 * Math.PI)) copy.reverse();
      return copy;
    });
    if (geoArea({ type: 'Polygon', coordinates: rings }) > 0.000001) coordinates.push(rings);
  }
}
writeFileSync(new URL('../public/data/forestBiomes.json', import.meta.url),
  JSON.stringify({ type: 'MultiPolygon', coordinates }));
console.log(`Wrote ${coordinates.length} generalized forest-biome polygons.`);
