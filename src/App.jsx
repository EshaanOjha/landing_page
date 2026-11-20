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
  const Container = backdrop ? 'div' : 'main';
  const navigation = useNavigation();
  return (
    <Container id="portfolio-hero" aria-label={`${profile.firstName} ${profile.lastName} portfolio`}
      data-phase={phase} data-active={navigation.activeId || undefined}>
      <div id="portfolio-stage">
        <Globe profile={profile} galaxy={galaxy} onPhase={setPhase} entranceEnabled={!backdrop} />
        <Navigation.Visuals {...navigation} />
      </div>
      <div inert={phase === 'loading' || phase === 'entering'}>
        <Navigation.Links {...navigation} />
      </div>
      {!backdrop && <SceneCredits />}
    </Container>
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

function PageScene({ children }) {
  return <div className="page-scene">
    <div className="page-scene-background" aria-hidden="true" inert><Home backdrop /></div>
    <div className="page-scene-content">{children}</div>
    <SceneCredits />
  </div>;
}

function LegacyContactRedirect() {
  useEffect(() => { window.location.replace("/contact"); }, []);
  return <a href="/contact">Continue to Get in touch</a>;
}

export default function App() {
  const path = window.location.pathname.replace(/\/$/, "");
  if (path === "/contact") return <PageScene><Contact /></PageScene>;
  if (path === "/about" && window.location.hash === "#connect") {
    return <LegacyContactRedirect />;
  }
  if (path === "/projects") return <PageScene><Projects /></PageScene>;
  return path === "/about" ? <PageScene><About /></PageScene> : <Home />;
}
