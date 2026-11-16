import * as d3 from 'd3-geo';
import { geoSatellite } from 'd3-geo-projection';
import { mesh, merge } from 'topojson-client';

export function mountGlobe(canvas, data, initialProfile) {
  const root = canvas.parentElement;
  const { world, cityTiers, rivers, borders, contestedBorders, terrain, urbanClusters, lakes, regionalBorders } = data;
  let profile = initialProfile;
  let disposed = false;
  let frameId;
  const media = window.matchMedia.bind(window);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is unavailable.');

  // Natural Earth POP_MAX estimates classify symbols; no population labels.

  const majorCities = cityTiers[2].geometry.coordinates;
  // Natural Earth 1:50m rivers, scale ranks 1–3; public-domain geometry.

  // Natural Earth classifications with the Kashmir/Ladakh display override; see DATA_SOURCES.md.



  const coastlines = mesh(world, world.objects.countries, (a, b) => a === b);
  const land = merge(world, world.objects.countries.geometries);
  // Samples are constrained to published urban footprints, not building locations.



  const distance = 1.12;
  const projection = geoSatellite().distance(distance)
    .clipAngle(Math.acos(1 / distance) * 180 / Math.PI - 0.001).precision(0.35);
  const path = d3.geoPath(projection, ctx);
  const reduced = media('(prefers-reduced-motion: reduce)');
  let width, height, radius, longitude = 73, previous, elapsed = 0, terrainStroke, rimStroke;
  // Fixed seed keeps the sparse star field stable across frames and resizing.
  let seed = 41;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const stars = Array.from({ length: 110 }, (_, i) => ({
    x: 0.025 + random() * 0.95,
    y: 0.035 + random() * 0.33,
    size: i % 17 === 0 ? 1.1 : 0.4 + random() * 0.4,
    alpha: i % 17 === 0 ? 0.65 : 0.18 + random() * 0.25,
    phase: random() * Math.PI * 2,
    period: 8000 + random() * 6000,
    twinkle: i % 13 === 0,
  }));
  // Decorative constellation patterns, not an astronomical sky chart.
  const constellations = [
    { x: 0.16, y: 0.12, points: [[-0.5,0.1],[-0.25,-0.18],[0,0.05],[0.24,-0.25],[0.48,0.02]], edges: [[0,1],[1,2],[2,3],[3,4]] },
    { x: 0.79, y: 0.16, points: [[-0.5,-0.22],[-0.2,-0.12],[0.05,0.13],[0.4,0.04],[0.32,-0.26]], edges: [[0,1],[1,2],[2,3],[3,4],[4,1]] },
  ];
  function drawSky() {
    ctx.save();
    ctx.fillStyle = '#e7e3d8';
    const count = Math.min(stars.length, Math.max(40, Math.round(width * height / 12000)));
    for (const star of stars.slice(0, count)) {
      // Leave breathing room around the name and its sunrise glow.
      const quiet = star.x > 0.22 && star.x < 0.78 && star.y > 0.22 ? 0.25 : 1;
      const shimmer = star.twinkle && !reduced.matches
        ? 0.82 + 0.18 * Math.sin(elapsed / star.period * Math.PI * 2 + star.phase) : 1;
      ctx.globalAlpha = star.alpha * quiet * shimmer;
      ctx.beginPath(); ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2); ctx.fill();
    }
    const span = Math.min(width * 0.19, height * 0.22, 200);
    ctx.strokeStyle = '#7a949f';
    ctx.lineWidth = 0.65;
    for (const constellation of constellations) {
      const points = constellation.points.map(([x, y]) =>
        [constellation.x * width + x * span, constellation.y * height + y * span]);
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      for (const [a, b] of constellation.edges) {
        ctx.moveTo(...points[a]); ctx.lineTo(...points[b]);
      }
      ctx.stroke();
      ctx.globalAlpha = 0.55;
      for (const [x, y] of points) {
        ctx.beginPath(); ctx.arc(x, y, 0.95, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }
  // Select existing city coordinates near major urban centers; no added labels.
  const pulseCities = [[73,19],[77,29],[139,36],[-74,41],[0,51],[-46,-24],[31,30],[151,-34]]
    .map(target => majorCities.reduce((best, city) => d3.geoDistance(city, target) < d3.geoDistance(best, target) ? city : best));
  const pulsePath = d3.geoPath(projection, ctx);
  function trackedWidth(label, tracking) {
    return Array.from(label).reduce((sum, char) => sum + ctx.measureText(char).width, 0)
      + Math.max(0, Array.from(label).length - 1) * tracking;
  }
  function drawTracked(label, x, y, tracking) {
    for (const char of label) {
      ctx.fillText(char, x, y);
      x += ctx.measureText(char).width + tracking;
    }
  }
  function drawHorizonName() {
    const horizon = height * 0.45;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    let fontSize = Math.min(190, Math.max(42, width * 0.115));
    const firstFont = () => {ctx.font = `200 ${fontSize}px "Outfit", Arial, sans-serif`;};
    const lastFont = () => {ctx.font = `200 ${fontSize}px "Outfit", Arial, sans-serif`;};
    const measureName = () => {
      firstFont(); const first = trackedWidth(profile.firstName, -fontSize * 0.04);
      lastFont(); const last = trackedWidth(profile.lastName, fontSize * 0.015);
      return {first, last, gap: fontSize * 0.22, total: first + last + fontSize * 0.22};
    };
    let metrics = measureName();
    fontSize *= Math.min(1, width * 0.80 / metrics.total);
    metrics = measureName();
    const startX = (width - metrics.total) / 2;
    const floatAmplitude = Math.min(7, Math.max(2, fontSize * 0.045));
    // Let the j dip behind the horizon, then clear it at the top of each hover.
    lastFont();
    const jIndex = profile.lastName.indexOf('j');
    const prefix = jIndex < 0 ? '' : profile.lastName.slice(0, jIndex);
    const jX = startX + metrics.first + metrics.gap
      + trackedWidth(prefix, fontSize * 0.015) + (prefix ? fontSize * 0.015 : 0);
    const dx = Math.min(radius, Math.abs(jX - width / 2));
    const letterHorizon = horizon + radius - Math.sqrt(radius * radius - dx * dx);
    const descent = ctx.measureText('j').actualBoundingBoxDescent ?? fontSize * 0.22;
    const hoverBaseline = letterHorizon - descent + floatAmplitude - 2;
    // Hover immediately, without an entrance rise or delayed floating phase.
    // Reduced motion holds the name at the fully readable upper position.
    const floatOffset = reduced.matches ? -floatAmplitude
      : -Math.sin(elapsed / 6200 * Math.PI * 2) * floatAmplitude;
    const baseline = hoverBaseline + floatOffset;
    // A soft elliptical sunrise sits behind the lettering and opaque globe.
    // Gradients avoid a full-screen blur pass and keep the effect inexpensive.
    ctx.save();
    ctx.translate(width / 2, horizon + fontSize * 0.12);
    ctx.scale(Math.max(1, metrics.total * 0.62), Math.max(1, fontSize * 1.55));
    const sunrise = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    sunrise.addColorStop(0, 'rgba(255,205,115,0.32)');
    sunrise.addColorStop(0.32, 'rgba(227,168,70,0.16)');
    sunrise.addColorStop(0.7, 'rgba(192,123,42,0.05)');
    sunrise.addColorStop(1, 'rgba(192,123,42,0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = sunrise;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();

    const gold = ctx.createLinearGradient(0, baseline - fontSize, 0, baseline + fontSize * 0.15);
    gold.addColorStop(0, '#fff1cf');
    gold.addColorStop(0.4, '#e7d3a5');
    gold.addColorStop(0.72, '#cda668');
    gold.addColorStop(1, '#ffe3a2');
    const paintName = () => {
      firstFont(); drawTracked(profile.firstName, startX, baseline, -fontSize * 0.04);
      lastFont(); drawTracked(profile.lastName, startX + metrics.first + metrics.gap, baseline, fontSize * 0.015);
    };
    ctx.fillStyle = gold;
    ctx.shadowColor = 'rgba(244,192,100,0.32)';
    ctx.shadowBlur = Math.min(36, fontSize * 0.24);
    paintName();
    ctx.shadowBlur = 0;

    // One gentle sweep every twelve seconds; static light for reduced motion.
    const sweep = reduced.matches ? 0.52 : (elapsed % 12000) / 12000;
    const shineX = startX - metrics.total * 0.3 + sweep * metrics.total * 1.6;
    const shineWidth = Math.max(24, metrics.total * 0.16);
    const shine = ctx.createLinearGradient(shineX - shineWidth, baseline - fontSize,
      shineX + shineWidth, baseline);
    shine.addColorStop(0, 'rgba(255,247,221,0)');
    shine.addColorStop(0.5, 'rgba(255,247,221,0.48)');
    shine.addColorStop(1, 'rgba(255,247,221,0)');
    ctx.fillStyle = shine;
    paintName();
    ctx.restore();
  }
  function drawCornerDetails() {
    const pad = width < 480 ? 20 : 32;
    const y = pad + 10;
    ctx.save();
    ctx.font = '400 10px "JetBrains Mono", monospace';
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    ctx.globalAlpha = 0.75;
    // These are the globe's live viewing coordinates, not a personal location.
    const lon = ((longitude + 540) % 360) - 180;
    const view = `12.0°N / ${Math.abs(lon).toFixed(1)}°${lon < 0 ? 'W' : 'E'}`;
    ctx.textAlign = 'right'; ctx.fillStyle = '#657179';
    ctx.fillText(view, width - pad, y);
    ctx.restore();
  }
  function draw() {
    if (disposed) return;
    ctx.clearRect(0, 0, width, height);
    drawCornerDetails();
    projection.rotate([-longitude, -12, -12]);
    drawSky();
    // Paint the name behind the opaque sphere for true curved-horizon occlusion.
    drawHorizonName();
    // Draw the soft outer atmosphere first; the opaque globe covers its inner glow.
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = rimStroke; ctx.lineWidth = 1.05;
    ctx.shadowColor = 'rgba(141,215,226,0.35)'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(width / 2, height * 0.45 + radius, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#101010';
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.45 + radius, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d8d5cd';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    // The shared spherical projection hides far-side rivers. The land mask
    // also trims small coastline mismatches between the two map resolutions.
    ctx.save();
    ctx.beginPath(); path(land); ctx.clip();
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = terrainStroke;
    ctx.lineWidth = 0.5;
    ctx.beginPath(); path(terrain); ctx.stroke();
    ctx.restore();
    // Regional lines stay solid and subordinate to national/disputed borders.
    ctx.globalAlpha = 0.18;
    ctx.lineWidth = 0.45;
    ctx.beginPath(); path(regionalBorders); ctx.stroke();
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = '#559fa6';
    ctx.lineWidth = 0.6;
    ctx.beginPath(); path(rivers); ctx.stroke();
    // Small, stable point clusters reveal actual built-up-area shapes.
    ctx.globalAlpha = 0.48;
    ctx.fillStyle = '#d8c498';
    ctx.beginPath(); path.pointRadius(0.62)(urbanClusters); ctx.fill();
    ctx.restore();
    // Opaque dark water masks underlying marks, then receives a faint teal fill.
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#080808';
    ctx.beginPath(); path(lakes); ctx.fill();
    ctx.globalAlpha = 0.40;
    ctx.fillStyle = '#244c54';
    ctx.beginPath(); path(lakes); ctx.fill();
    ctx.globalAlpha = 0.72;
    ctx.strokeStyle = '#559fa6'; ctx.lineWidth = 0.65;
    ctx.beginPath(); path(lakes); ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 0.8;
    ctx.beginPath(); path(borders); ctx.stroke();
    ctx.save();
    ctx.globalAlpha = 0.76;
    ctx.lineWidth = 0.85;
    ctx.lineCap = 'butt';
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); path(contestedBorders); ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 0.95;
    ctx.lineWidth = 1.0;
    ctx.beginPath(); path(coastlines); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#d8c498';
    // Draw smaller cities first so major centers remain distinct in clusters.
    for (const tier of cityTiers) {
      ctx.save();
      ctx.globalAlpha = tier.opacity;
      ctx.beginPath(); path.pointRadius(tier.radius)(tier.geometry); ctx.fill();
      ctx.restore();
    }
    if (!reduced.matches) {
      pulseCities.forEach((city, index) => {
        const pulse = (1 + Math.sin(elapsed / 1000 * Math.PI / 3 + index * 1.7)) / 2;
        ctx.save();
        ctx.globalAlpha = 0.35 + pulse * 0.3;
        ctx.beginPath();
        pulsePath.pointRadius(1.9 + pulse * 0.35)({type:'Point', coordinates:city});
        ctx.fill(); ctx.restore();
      });
    }
  }
  function resize() {
    width = root.clientWidth; height = root.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    radius = Math.max(width * 1.30, height * 0.70);
    rimStroke = ctx.createLinearGradient(0, 0, width, 0);
    rimStroke.addColorStop(0, 'rgba(255,255,255,0.08)');
    rimStroke.addColorStop(0.36, '#c7e2e6');
    rimStroke.addColorStop(0.5, '#8dd7e2');
    rimStroke.addColorStop(0.64, '#c7e2e6');
    rimStroke.addColorStop(1, 'rgba(255,255,255,0.08)');
    terrainStroke = ctx.createLinearGradient(0, height * 0.45, 0, height);
    terrainStroke.addColorStop(0, 'rgba(121,117,107,0.06)');
    terrainStroke.addColorStop(0.45, 'rgba(121,117,107,0.18)');
    terrainStroke.addColorStop(1, 'rgba(121,117,107,0.35)');
    projection.scale(radius / Math.sqrt((distance - 1) / (distance + 1)))
      .translate([width / 2, height * 0.45 + radius]);
    draw();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(root);
  function animate(now) {
    if (disposed) return;
    if (previous !== undefined && !document.hidden && !reduced.matches) {
      const delta = Math.min(now - previous, 80);
      elapsed += delta;
      longitude = (longitude + delta * 0.001225) % 360;
      draw();
    }
    previous = now;
    frameId = requestAnimationFrame(animate);
  }
  // Self-hosted fonts load without third-party requests; redraw even in reduced motion.
  Promise.all([
    document.fonts.load('200 100px "Outfit"'),
    document.fonts.load('400 12px "JetBrains Mono"')
  ]).then(draw).catch(() => {});
  reduced.addEventListener('change', draw);
  resize(); frameId = requestAnimationFrame(animate);
  return {
    updateProfile(next) { profile = next; draw(); },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      reduced.removeEventListener('change', draw);
    }
  };
}
