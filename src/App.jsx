import { clientDestination } from './routing.js';
import { useEffect, useState } from 'react';
import './styles/cables.css';
import './styles/page-scene.css';
import { GalaxyCredit } from './components/GalaxyBackground.jsx';
import Contact from './pages/Contact.jsx';
import Projects from './pages/Projects.jsx';
import About from './pages/About.jsx';
import Globe from './components/Globe.jsx';
import Navigation from './components/Navigation.jsx';
import { usePortfolio } from './hooks/usePortfolio.js';
import { useNavigation } from './hooks/useNavigation.js';

function Home({ backdrop = false }) {
  const profile = usePortfolio();
  const galaxy = 'network-space';
  const [phase, setPhase] = useState(backdrop ? 'ready' : 'loading');
  const [entranceEnabled] = useState(!backdrop);
  const navigation = useNavigation();
  return (
    <div id="portfolio-hero" aria-label={`${profile.firstName} ${profile.lastName} portfolio`}
      data-phase={phase} data-active={navigation.activeId || undefined}>
      <div id="portfolio-stage">
        <Globe profile={profile} galaxy={galaxy} onPhase={setPhase} entranceEnabled={entranceEnabled} hideName={backdrop} />
        <Navigation.Visuals {...navigation} />
      </div>
      <div inert={phase === 'loading' || phase === 'entering'}>
        <Navigation.Links {...navigation} />
      </div>

    </div>
  );
}

function SceneCredits() {
  return (
      <aside className="globe-credits" aria-label="Sources and credits">
        <div> Cables: <a href="https://github.com/stevesong/open_undersea_cable_map" target="_blank" rel="noreferrer">© TeleGeography, 2022</a> · <a href="https://creativecommons.org/licenses/by-nc-sa/3.0/" target="_blank" rel="noreferrer">CC BY-NC-SA 3.0</a> · Illustrative</div>
        <GalaxyCredit galaxy="network-space" />
      </aside>
  );
}

function currentPath() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  if (path === '/about' && window.location.hash === '#connect') {
    window.history.replaceState(null, '', '/contact');
    return '/contact';
  }
  return path;
}

export default function App() {
  const [path, setPath] = useState(currentPath);
  const Page = path === '/about' ? About : path === '/projects' ? Projects : path === '/contact' ? Contact : null;
  useEffect(() => {
    const update = () => setPath(currentPath());
    window.addEventListener('popstate', update);
    window.addEventListener('hashchange', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('hashchange', update);
    };
  }, []);
  function navigate(event) {
    const next = clientDestination(event.target.closest?.('a[href]'), event, window.location.href);
    if (!next) return;
    event.preventDefault();
    if (next.href === window.location.href) return;
    window.history.pushState(null, '', next.pathname + next.search + next.hash);
    setPath(currentPath());
    window.dispatchEvent(new Event('popstate'));
    requestAnimationFrame(() => {
      const target = document.querySelector('.page-scene-content main') || document.getElementById('portfolio-hero');
      target?.setAttribute('tabindex', '-1');
      target?.focus({ preventScroll: true });
    });
  }
  return <div className={Page ? 'page-scene' : 'site-scene'} onClick={navigate}>
    <div className={Page ? 'page-scene-background' : 'home-scene-background'} aria-hidden={Page ? true : undefined} inert={!!Page}>
      <Home backdrop={!!Page} />
    </div>
    {Page && <div className="page-scene-content" key={path}><Page /></div>}
    <SceneCredits />
  </div>;
}
