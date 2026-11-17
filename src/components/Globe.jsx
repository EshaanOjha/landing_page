import { useEffect, useRef, useState } from 'react';
import GalaxyBackground from './GalaxyBackground.jsx';
import { loadGlobeData } from '../globe/loadData.js';

export default function Globe({ profile, galaxy = 'milky-way' }) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const profileRef = useRef(profile);
  const galaxyRef = useRef(galaxy);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const routesRef = useRef([]);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/data/cables/routes.json', { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Cable data unavailable'); return response.json(); })
      .then(routes => { routesRef.current = routes; rendererRef.current?.setCables(routes); })
      .catch(error => { if (error.name !== 'AbortError') console.warn('Cable routes unavailable:', error); });
    return () => controller.abort();
  }, []);
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
    Promise.all([loadGlobeData(), import('../globe/renderer.js')])
      .then(([data, { mountGlobe }]) => {
        if (cancelled) return;
        instance = mountGlobe(canvasRef.current, data, profileRef.current, galaxyRef.current);
        rendererRef.current = instance;
        if (routesRef.current.length) instance.setCables(routesRef.current);
        setStatus('ready');
      })
      .catch(error => {
        if (!cancelled) {
          console.error('Unable to render globe:', error);
          setStatus('error');
        }
      });
    return () => {
      cancelled = true;
      instance?.dispose();
      if (rendererRef.current === instance) rendererRef.current = null;
    };
  }, [attempt]);

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
