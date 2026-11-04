import { useEffect, useState } from 'react';
import { defaultPortfolio, isPortfolio } from '../../shared/portfolio.js';

export function usePortfolio() {
  const [profile, setProfile] = useState(defaultPortfolio);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/portfolio', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Portfolio API unavailable.');
        return response.json();
      })
      .then(({ portfolio }) => {
        if (!isPortfolio(portfolio)) throw new Error('Invalid portfolio response.');
        if (!controller.signal.aborted) setProfile(portfolio);
      })
      .catch(error => {
        // Local defaults keep the visual page useful during API downtime.
        if (error.name !== 'AbortError') console.warn('Using local portfolio defaults.');
      });
    return () => controller.abort();
  }, []);
  return profile;
}
