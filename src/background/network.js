// Canvas drawing adapted from the supplied network-topology (1).html.
export function mountNetwork(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, nodes = [], pulses = [];
  let elapsed = 0, lastTime = 0, frame = 0, disposed = false;
  const influence = 1;
  let pointer = { x: -999, y: -999 }, cursorX = 0.5, paint = '#72e5ec';
  const random = (min, max) => min + Math.random() * (max - min);
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function resize() {
    width = window.innerWidth; height = window.innerHeight;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    pulses = [];
    nodes = Array.from({ length: 65 }, (_, i) => ({
      x: random(10, Math.max(11, width - 10)), y: random(10, Math.max(11, height - 10)),
      vx: random(-0.13, 0.13), vy: random(-0.13, 0.13), radius: random(1, 3), phase: i * 0.13,
    }));
    draw();
  }
      function line(a, b, opacity) {
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = paint;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.globalAlpha = 1;
      }

      function dot(x, y, radius, opacity = 1) {
        ctx.globalAlpha = opacity;
        ctx.fillStyle = paint;
        ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }

      function draw() {
        paint = `hsl(${(elapsed / 6000 * 360 + cursorX * 180) % 360} 85% 65%)`;
        ctx.clearRect(0, 0, width, height);
        const glow = ctx.createRadialGradient(width * 0.55, height * 0.5, 0,
          width * 0.55, height * 0.5, width * 0.7);
        glow.addColorStop(0, '#72e5ec0b'); glow.addColorStop(1, '#72e5ec00');
        ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);

        // Nearby nodes connect. Hovering brightens connections around the cursor.
        for (let i = 0; i < nodes.length; i++) {
          const a = nodes[i];
          for (let j = i + 1; j < nodes.length; j++) {
            const b = nodes[j];
            if (distance(a, b) >= 155 * influence) continue;
            const active = Math.min(distance(a, pointer), distance(b, pointer)) < 150;
            line(a, b, active ? 0.85 : 0.12);
            const progress = (elapsed * 0.0002 + a.phase + j * 0.07) % 1;
            dot(a.x + (b.x - a.x) * progress, a.y + (b.y - a.y) * progress,
              1.5, active ? 0.9 : 0.25);
          }
          dot(a.x, a.y, a.radius, 0.65);
        }

        // Clicks add connections and launch bright packets from the nearest node.
        for (const pulse of pulses) {
          const age = (elapsed - pulse.time) / 1000;
          if (age >= 2) continue;
          const origin = nodes.reduce((a, b) => distance(a, pulse) < distance(b, pulse) ? a : b);
          for (const target of nodes) {
            if (target === origin || distance(origin, target) >= 220 * influence) continue;
            line(origin, target, 0.6 * (1 - age / 2));
            const progress = Math.min(1, age / 1.5);
            dot(origin.x + (target.x - origin.x) * progress,
              origin.y + (target.y - origin.y) * progress, 3, 1 - age / 2);
          }
        }
        pulses = pulses.filter(pulse => elapsed - pulse.time < 2000);
      }


  function animate(now) {
    if (disposed || reduced.matches || document.hidden) return;
    const delta = Math.min(35, lastTime ? now - lastTime : 16.667);
    lastTime = now;
    elapsed += delta;
    for (const node of nodes) {
      node.x += node.vx * delta / 16.667; node.y += node.vy * delta / 16.667;
      if (node.x < 10 || node.x > width - 10) node.vx *= -1;
      if (node.y < 10 || node.y > height - 10) node.vy *= -1;
    }
    draw();
    frame = requestAnimationFrame(animate);
  }
  function syncMotion() {
    cancelAnimationFrame(frame); lastTime = 0;
    if (reduced.matches) { pulses = []; draw(); }
    if (!reduced.matches && !document.hidden && !disposed) frame = requestAnimationFrame(animate);
  }
  function move(event) {
    if (reduced.matches) return;
    cursorX = event.clientX / width;
    pointer = { x: event.clientX, y: event.clientY };
  }
  function leave() { pointer = { x: -999, y: -999 }; }
  function click(event) {
    if (reduced.matches || event.target.closest?.('a, button, input, select, textarea, summary')) return;
    pulses.push({ x: event.clientX, y: event.clientY, time: elapsed });
    // Bound work even during rapid clicking.
    pulses = pulses.slice(-8);
  }
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerleave', leave);
  window.addEventListener('blur', leave);
  window.addEventListener('click', click, { passive: true });
  document.addEventListener('visibilitychange', syncMotion);
  reduced.addEventListener('change', syncMotion);
  resize(); syncMotion();
  return () => {
    disposed = true; cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', move);
    document.removeEventListener('pointerleave', leave);
    window.removeEventListener('blur', leave);
    window.removeEventListener('click', click);
    document.removeEventListener('visibilitychange', syncMotion);
    reduced.removeEventListener('change', syncMotion);
  };
}
