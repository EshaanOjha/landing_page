import { geoStream, geoDistance, geoInterpolate } from 'd3-geo';

// Precompute distance tables and interpolators once; reuse the globe's animation loop.
function makeTrack(line) {
  const lengths = [0];
  const interpolate = [];
  for (let i = 1; i < line.length; i++) {
    lengths.push(lengths[i - 1] + geoDistance(line[i - 1], line[i]));
    interpolate.push(geoInterpolate(line[i - 1], line[i]));
  }
  const sample = fraction => {
    const target = fraction * lengths.at(-1);
    let low = 1, high = lengths.length - 1;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (lengths[mid] < target) low = mid + 1;
      else high = mid;
    }
    const span = lengths[low] - lengths[low - 1];
    return interpolate[low - 1](span ? (target - lengths[low - 1]) / span : 0);
  };
  const center = sample(0.5);
  // Half the complete path length conservatively bounds every trail point.
  return { sample, center, radius: lengths.at(-1) / 2 };
}

export function createCableLayer(ctx, projection, routes, options = {}) {
  const { color = '#52868e', opacity = 0.48, forward = '#b5e7e9', backward = '#75b9d0', packets = 2, period = 24000, width = 1.7 } = options;
  const tracks = routes.flatMap(route => route.geometry.coordinates
    .filter(line => line.length > 1).map(makeTrack));
  const sink = {
    lineStart() { this.started = false; }, lineEnd() {},
    point(x, y) {
      if (this.started) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
      this.started = true;
    }, polygonStart() {}, polygonEnd() {}, sphere() {},
  };
  function stroke(geometry) {
    ctx.beginPath();
    geoStream(geometry, projection.stream(sink));
    ctx.stroke();
  }
  function draw(elapsed, reduced) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity;
    ctx.lineWidth = 0.8;
    for (const route of routes) stroke(route.geometry);
    ctx.globalAlpha = 0.65;
    for (const route of routes) for (const landing of route.landings) {
      geoStream({ type: 'Point', coordinates: landing.coordinates }, projection.stream({
        point(x, y) { ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.stroke(); },
      }));
    }
    const viewCenter = projection.invert(projection.translate());
    const visibleAngle = projection.clipAngle() * Math.PI / 180;
    if (!reduced) tracks.forEach(({ sample: pointAt, center, radius }, index) => {
      if (geoDistance(center, viewCenter) > visibleAngle + radius) return;
      // Two offset streams in each direction. Tails fade into the route and
      // fade out at landings, never jumping across disconnected route sections.
      for (const direction of [-1, 1]) for (let packet = 0; packet < packets; packet++) {
        const phase = (elapsed / period + index * 0.173 + packet / packets + (direction < 0 ? 0.23 : 0)) % 1;
        const head = direction > 0 ? phase : 1 - phase;
        for (let tail = 0; tail < 10; tail++) {
          const start = head - direction * tail * 0.004;
          const end = head - direction * (tail + 1) * 0.004;
          if (start < 0 || start > 1 || end < 0 || end > 1) continue;
          const fade = Math.min(1, phase / 0.04, (1 - phase) / 0.04);
          ctx.globalAlpha = 0.8 * (1 - tail / 10) ** 2 * fade;
          ctx.strokeStyle = direction > 0 ? forward : backward;
          ctx.lineWidth = width;
          stroke({ type: 'LineString', coordinates: [pointAt(end), pointAt(start)] });
        }
      }
    });
    ctx.restore();
  }
  return { draw };
}
