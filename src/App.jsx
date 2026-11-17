import NetworkBackground from './components/NetworkBackground.jsx';
import { useEffect, useState } from 'react';
import './styles/cables.css';
import { GalaxyCredit } from './components/GalaxyBackground.jsx';
import Contact from './pages/Contact.jsx';
import Projects from './pages/Projects.jsx';
import About from './pages/About.jsx';
import Globe from './components/Globe.jsx';
import Navigation from './components/Navigation.jsx';
import { usePortfolio } from './hooks/usePortfolio.js';
import { useNavigation } from './hooks/useNavigation.js';

function Home() {
  const profile = usePortfolio();
  const galaxy = 'andromeda';
  const [phase, setPhase] = useState('loading');
  const navigation = useNavigation();
  return (
    <main id="portfolio-hero" aria-label={`${profile.firstName} ${profile.lastName} portfolio`}
      data-phase={phase} data-active={navigation.activeId || undefined}>
      <div id="portfolio-stage">
        <Globe profile={profile} galaxy={galaxy} onPhase={setPhase} />
        <Navigation.Visuals {...navigation} />
      </div>
      <div inert={phase === 'loading' || phase === 'entering'}>
        <Navigation.Links {...navigation} />
      </div>
      <aside className="globe-credits" aria-label="Sources and credits">
        <div> Cables: <a href="https://github.com/stevesong/open_undersea_cable_map" target="_blank" rel="noreferrer">© TeleGeography, 2022</a> · <a href="https://creativecommons.org/licenses/by-nc-sa/3.0/" target="_blank" rel="noreferrer">CC BY-NC-SA 3.0</a> · Illustrative</div>
        <GalaxyCredit galaxy={galaxy} />
      </aside>
    </main>
  );
}

function LegacyContactRedirect() {
  useEffect(() => { window.location.replace("/contact"); }, []);
  return <a href="/contact">Continue to Get in touch</a>;
}

export default function App() {
  const path = window.location.pathname.replace(/\/$/, "");
  if (path === "/contact") return <NetworkBackground><Contact /></NetworkBackground>;
  if (path === "/about" && window.location.hash === "#connect") {
    return <LegacyContactRedirect />;
  }
  if (path === "/projects") return <NetworkBackground><Projects /></NetworkBackground>;
  return path === "/about" ? <NetworkBackground><About /></NetworkBackground> : <Home />;
}
