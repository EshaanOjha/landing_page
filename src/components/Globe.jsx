import { useEffect, useRef, useState } from 'react';
import { drawHorizonName } from '../globe/horizonName.js';
import GalaxyBackground from './GalaxyBackground.jsx';
import { loadGlobeData } from '../globe/loadData.js';

export default function Globe({ profile, galaxy = 'milky-way', onPhase }) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const profileRef = useRef(profile);
  const galaxyRef = useRef(galaxy);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    profileRef.current = profile;
    rendererRef.current?.updateProfile(profile);
  }, [profile]);

  useEffect(() => {
    galaxyRef.current = galaxy;
    rendererRef.current?.updateGalaxy(galaxy);
  }, [galaxy]);

  useEffect(() => {
    let cancelled = false;
    let instance;
    onPhase?.('loading');
    // Draw the loading name on the same canvas with the same layout and clock.
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let nameElapsed = 0, namePrevious, nameFrame, previewStopped = false;
    function paintName() {
      if (previewStopped || !ctx) return;
      const { clientWidth: width, clientHeight: height } = canvas.parentElement;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
        canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      drawHorizonName(ctx, width, height, Math.max(width * 1.3, height * 0.7), profileRef.current, nameElapsed, reduced);
    }
    function previewName(now) {
      if (previewStopped) return;
      if (namePrevious !== undefined && !document.hidden && !reduced.matches) nameElapsed += Math.min(now - namePrevious, 80);
      namePrevious = now;
      paintName();
      nameFrame = requestAnimationFrame(previewName);
    }
    function stopPreview() {
      previewStopped = true;
      cancelAnimationFrame(nameFrame);
    }
    paintName();
    nameFrame = requestAnimationFrame(previewName);
    // Keep the name alone on screen even when assets are cached.
    let holdTimer;
    const nameHold = new Promise(resolve => {
      holdTimer = setTimeout(resolve, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500);
    });
    const image = new Image();
    image.src = '/images/andromeda.jpg';
    const imageReady = galaxyRef.current === 'andromeda' ? image.decode().catch(() => {}) : Promise.resolve();
    const fontsReady = Promise.all([
      document.fonts.load('200 100px "Outfit"'), document.fonts.load('400 12px "JetBrains Mono"'),
    ]).catch(() => {});
    const controller = new AbortController();
    const cables = fetch('/data/cables/routes.json', { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Cable data unavailable'); return response.json(); })
      .catch(() => []);
    Promise.all([loadGlobeData(), import('../globe/renderer.js'), cables, imageReady, fontsReady, nameHold])
      .then(([data, { mountGlobe }, routes]) => {
        if (cancelled) return;
        stopPreview();
        instance = mountGlobe(canvasRef.current, data, profileRef.current, galaxyRef.current, { enabled: true, initialElapsed: nameElapsed, onComplete: () => { if (!cancelled) onPhase?.('ready'); } });
        rendererRef.current = instance;
        instance.setCables(routes);
        onPhase?.('entering');
        setStatus('ready');
      })
      .catch(error => {
        if (!cancelled) {
          console.error('Unable to render globe:', error);
          setStatus('error');
          onPhase?.('error');
        }
      });
    return () => {
      cancelled = true;
      stopPreview();
      controller.abort();
      clearTimeout(holdTimer);
      instance?.dispose();
      if (rendererRef.current === instance) rendererRef.current = null;
    };
  }, [attempt, onPhase]);

  return (
    <div id="orbital-globe">
      <GalaxyBackground galaxy={galaxy} />
      <canvas ref={canvasRef} role="img" aria-label={`${profile.firstName} ${profile.lastName} floating behind a rotating globe with borders, rivers, lakes, terrain, urban clusters and flowing city-to-city and submarine cable packets.`} />
      {status === 'loading' && <span className="sr-only" role="status">Loading globe</span>}
      {status === 'error' && <div className="globe-error" role="alert">
        <p>The globe could not load.</p>
        <button type="button" onClick={() => { setStatus('loading'); setAttempt(value => value + 1); }}>Try again</button>
      </div>}
    </div>
  );
}
