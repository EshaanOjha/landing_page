import { drawHorizonName } from './horizonName.js';
import * as d3 from 'd3-geo';
import { createCableLayer } from './cables.js';
import cityRoutes from './cityRoutes.json' with { type: 'json' };
import cityHubs from './cityHubs.json' with { type: 'json' };
import { geoSatellite } from 'd3-geo-projection';
import { mesh, merge } from 'topojson-client';

export function mountGlobe(canvas, data, initialProfile, initialGalaxy = 'andromeda', entrance = {}) {
  const root = canvas.parentElement;
  const { world, cityTiers, rivers, borders, contestedBorders, terrain, urbanClusters, lakes, regionalBorders } = data;
  let profile = initialProfile;
  let galaxy = initialGalaxy;
  let disposed = false;
  let entranceTime = entrance.enabled ? 0 : 2600;
  let nameHidden = !!entrance.sinkName;
  let entranceComplete = !entrance.enabled;
  let frameId;
  const media = window.matchMedia.bind(window);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is unavailable.');

  // Natural Earth POP_MAX estimates classify symbols; no population labels.

  const hubGeometry = { type: 'MultiPoint', coordinates: cityHubs.map(hub => hub.coordinates) };
  const majorCities = cityTiers[2].geometry.coordinates;
  // Natural Earth 1:50m rivers, scale ranks 1–3; public-domain geometry.

  // Natural Earth classifications with the Kashmir/Ladakh display override; see DATA_SOURCES.md.



  const coastlines = mesh(world, world.objects.countries, (a, b) => a === b);
  const land = merge(world, world.objects.countries.geometries);
  // Samples are constrained to published urban footprints, not building locations.



  const latitude = 32; // Frame central and southern Europe above the cropped horizon.
  const distance = 1.12;
  const projection = geoSatellite().distance(distance)
    .clipAngle(Math.acos(1 / distance) * 180 / Math.PI - 0.001).precision(0.35);
  const path = d3.geoPath(projection, ctx);
  let cableLayer = null;
  const cityNetwork = createCableLayer(ctx, projection, cityRoutes, {
    color: '#9c8c68', opacity: 0.19, forward: '#e6d6a9', backward: '#bca477',
    packets: 1, period: 18000, width: 1.25,
  });
  const reduced = media('(prefers-reduced-motion: reduce)');
  let width, height, radius, longitude = 10, previous, elapsed = entrance.initialElapsed ?? 0, terrainStroke, rimStroke;
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
    ctx.restore();
  }
  // Select existing city coordinates near major urban centers; no added labels.
  const pulseCities = [[73,19],[77,29],[139,36],[-74,41],[0,51],[-46,-24],[31,30],[151,-34]]
    .map(target => majorCities.reduce((best, city) => d3.geoDistance(city, target) < d3.geoDistance(best, target) ? city : best));
  const pulsePath = d3.geoPath(projection, ctx);
  function drawCornerDetails() {
    const pad = width < 480 ? 20 : 32;
    const y = pad + 10;
    ctx.save();
    ctx.font = '400 10px "JetBrains Mono", monospace';
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    ctx.globalAlpha = 0.75;
    // These are the globe's live viewing coordinates, not a personal location.
    const lon = ((longitude + 540) % 360) - 180;
    const view = `${latitude.toFixed(1)}°N / ${Math.abs(lon).toFixed(1)}°${lon < 0 ? 'W' : 'E'}`;
    ctx.textAlign = 'right'; ctx.fillStyle = '#657179';
    ctx.fillText(view, width - pad, y);
    ctx.restore();
  }
  function draw() {
    if (disposed) return;
    ctx.clearRect(0, 0, width, height);
    if (entranceTime >= 2600 || reduced.matches) drawCornerDetails();
    projection.rotate([-longitude, -latitude, -12]);
    ctx.save();
    ctx.globalAlpha = Math.min(1, entranceTime / 2600);
    drawSky();
    ctx.restore();
    // Paint the name behind the opaque sphere for true curved-horizon occlusion.
    drawHorizonName(ctx, width, height, radius, profile, elapsed, reduced, nameHidden ? 1 : 0);
    ctx.save();
    const progress = reduced.matches ? 1 : Math.min(1, entranceTime / 2600);
    ctx.translate(0, (1 - progress) ** 3 * height * 0.65);
    // Draw the soft outer atmosphere first; the opaque globe covers its inner glow.
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = rimStroke; ctx.lineWidth = 1.05;
    ctx.shadowColor = 'rgba(141,215,226,0.35)'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(width / 2, height * 0.45 + radius, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    if (galaxy === 'andromeda') {
      ctx.save();
      ctx.strokeStyle = 'rgba(239,206,149,0.45)';
      ctx.lineWidth = 1.2;
      ctx.shadowColor = 'rgba(239,190,105,0.3)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(width / 2, height * 0.45 + radius, radius,
        -Math.PI / 2 - 0.14, -Math.PI / 2 + 0.14);
      ctx.stroke(); ctx.restore();
    }
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
    cityNetwork.draw(elapsed, reduced.matches);
    ctx.save();
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = '#d8c498';
    ctx.beginPath();
    path.pointRadius(1)(hubGeometry);
    ctx.fill(); ctx.restore();
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
    if (cableLayer) cableLayer.draw(elapsed, reduced.matches);
    ctx.restore();
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
      entranceTime = Math.min(2600, entranceTime + delta);
      if (!entranceComplete && entranceTime >= 2600) {
        entranceComplete = true;
        entrance.onComplete?.();
      }
      elapsed += delta;
      longitude = (longitude + delta * 0.001225) % 360;
      draw();
    }
    if (reduced.matches && !entranceComplete) {
      entranceTime = 2600; entranceComplete = true; draw(); entrance.onComplete?.();
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
    setCables(routes) { cableLayer = createCableLayer(ctx, projection, routes); draw(); },
    updateGalaxy(next) { galaxy = next; draw(); },
    setNameHidden(hidden) { nameHidden = hidden; draw(); },
    updateProfile(next) { profile = next; draw(); },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      reduced.removeEventListener('change', draw);
    }
  };
}
