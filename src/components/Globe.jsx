import { useEffect, useRef, useState } from 'react';
import { loadGlobeData } from '../globe/loadData.js';

export default function Globe({ profile }) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const profileRef = useRef(profile);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    profileRef.current = profile;
    rendererRef.current?.updateProfile(profile);
  }, [profile]);

  useEffect(() => {
    let cancelled = false;
    let instance;
    Promise.all([loadGlobeData(), import('../globe/renderer.js')])
      .then(([data, { mountGlobe }]) => {
        if (cancelled) return;
        instance = mountGlobe(canvasRef.current, data, profileRef.current);
        rendererRef.current = instance;
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
      <canvas ref={canvasRef} role="img" aria-label={`${profile.firstName} ${profile.lastName} floating behind a rotating globe with borders, rivers, lakes, terrain and urban clusters.`} />
      {status === 'loading' && <span className="sr-only" role="status">Loading globe</span>}
      {status === 'error' && <div className="globe-error" role="alert">
        <p>The globe could not load.</p>
        <button type="button" onClick={() => { setStatus('loading'); setAttempt(value => value + 1); }}>Try again</button>
      </div>}
    </div>
  );
}
