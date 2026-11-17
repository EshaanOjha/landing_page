import { geoDistance } from 'd3-geo';
import hubs from './cityHubs.json' with { type: 'json' };

export function cityNetworkNodes(cityTiers) {
  const nodes = hubs.map(hub => hub.coordinates);
  for (const tier of cityTiers) for (const point of tier.geometry.coordinates) {
    // Merge only duplicate locations within roughly 1 km; keep nearby cities.
    if (nodes.every(other => geoDistance(point, other) > 0.00016)) nodes.push(point);
  }
  return nodes;
}

// Illustrative proximity links, not measured internet infrastructure.
// Every city gets its nearest link, plus a second regional link when available.
export function createCityRoutes(cityTiers) {
  const nodes = cityNetworkNodes(cityTiers);
  const edges = new Map();
  nodes.forEach((point, i) => {
    nodes.map((other, j) => ({ j, distance: geoDistance(point, other) }))
      .filter(item => item.j !== i).sort((a, b) => a.distance - b.distance)
      .slice(0, 2).forEach(({ j, distance }, rank) => {
        if (rank && distance > 0.24) return;
        const a = Math.min(i, j), b = Math.max(i, j);
        edges.set(`${a}:${b}`, { a, b });
      });
  });
  return [...edges.values()].map(({ a, b }) => ({
    id: `city-${a}-${b}`,
    geometry: { type: 'MultiLineString', coordinates: [[nodes[a], nodes[b]]] },
    landings: [],
  }));
}
