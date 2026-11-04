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
  const stars = Array.from({length: 28}, () => [random(), 0.025 + random() * 0.37, 0.35 + random() * 0.4, 0.1 + random() * 0.19]);
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
    const progress = reduced.matches ? 1 : Math.min(elapsed / 2400, 1);
    const rise = progress * progress * (3 - 2 * progress);
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    let fontSize = Math.min(190, Math.max(42, width * 0.115));
    const firstFont = () => {ctx.font = `700 ${fontSize}px "Inter", Arial, sans-serif`;};
    const lastFont = () => {ctx.font = `400 ${fontSize}px "Inter", Arial, sans-serif`;};
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
    // Keep the j's descender above the curved horizon even at the lowest float.
    lastFont();
    const jIndex = profile.lastName.indexOf('j');
    const prefix = jIndex < 0 ? '' : profile.lastName.slice(0, jIndex);
    const jX = startX + metrics.first + metrics.gap
      + trackedWidth(prefix, fontSize * 0.015) + (prefix ? fontSize * 0.015 : 0);
    const dx = Math.min(radius, Math.abs(jX - width / 2));
    const letterHorizon = horizon + radius - Math.sqrt(radius * radius - dx * dx);
    const descent = ctx.measureText('j').actualBoundingBoxDescent ?? fontSize * 0.22;
    const settledBaseline = Math.min(horizon + fontSize * 0.08,
      letterHorizon - descent - floatAmplitude - 3);
    const riseBaseline = horizon + fontSize * 0.38
      + (settledBaseline - horizon - fontSize * 0.38) * rise;
    // Start floating only after the entrance; ease in from zero displacement
    // and velocity so the handoff never jumps. Keep the subtitle anchored.
    const floatTime = Math.max(0, elapsed - 2400);
    const floatProgress = Math.min(floatTime / 1800, 1);
    const floatEase = floatProgress * floatProgress * (3 - 2 * floatProgress);
    const floatOffset = reduced.matches ? 0
      : -Math.sin(floatTime / 6200 * Math.PI * 2) * floatAmplitude * floatEase;
    const baseline = riseBaseline + floatOffset;
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
    ctx.globalAlpha = 0.25 + rise * 0.75;
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
    // Fit the supporting line independently; keep it readable on narrow screens.
    const subtitle = profile.subtitle;
    const monoSize = width < 480 ? 11 : 12;
    ctx.font = `400 ${monoSize}px "JetBrains Mono", monospace`;
    let tracking = width < 480 ? 0.45 : 1.6;
    const baseWidth = trackedWidth(subtitle, 0);
    tracking = Math.max(0, Math.min(tracking, (width * 0.9 - baseWidth) / (subtitle.length - 1)));
    ctx.fillStyle = '#8b949b';
    drawTracked(subtitle, (width - trackedWidth(subtitle, tracking)) / 2, riseBaseline - fontSize * 0.82 - 24, tracking);
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
    ctx.save();
    ctx.fillStyle = '#fff';
    for (const [x, y, size, alpha] of stars) {
      ctx.globalAlpha = alpha;
      ctx.beginPath(); ctx.arc(x * width, y * height, size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
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
    ctx.strokeStyle = '#fff';
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
    ctx.globalAlpha = 0.32;
    ctx.lineWidth = 0.45;
    ctx.beginPath(); path(rivers); ctx.stroke();
    // Small, stable point clusters reveal actual built-up-area shapes.
    ctx.globalAlpha = 0.48;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); path.pointRadius(0.62)(urbanClusters); ctx.fill();
    ctx.restore();
    // Water masks underlying river/terrain/urban marks, preserving dark interiors.
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#080808';
    ctx.beginPath(); path(lakes); ctx.fill();
    ctx.globalAlpha = 0.46;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.65;
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
    ctx.fillStyle = '#fff';
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
    terrainStroke.addColorStop(0, 'rgba(255,255,255,0.035)');
    terrainStroke.addColorStop(0.45, 'rgba(255,255,255,0.10)');
    terrainStroke.addColorStop(1, 'rgba(255,255,255,0.22)');
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
    document.fonts.load('700 100px "Inter"'),
    document.fonts.load('400 100px "Inter"'),
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
