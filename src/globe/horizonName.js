// Shared by the lightweight loading canvas and the full globe renderer.
// Identical font metrics, baseline and animation time prevent a handoff jump.
export function drawHorizonName(ctx, width, height, radius, profile, elapsed, reduced) {
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
