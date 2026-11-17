import NetworkBackground from './components/NetworkBackground.jsx';
import { useEffect, useState } from 'react';
import { GalaxySelector } from './components/GalaxyBackground.jsx';
import Contact from './pages/Contact.jsx';
import Projects from './pages/Projects.jsx';
import About from './pages/About.jsx';
import Globe from './components/Globe.jsx';
import Navigation from './components/Navigation.jsx';
import { usePortfolio } from './hooks/usePortfolio.js';
import { useNavigation } from './hooks/useNavigation.js';

function Home() {
  const profile = usePortfolio();
  const [galaxy, setGalaxy] = useState('milky-way');
  const navigation = useNavigation();
  return (
    <main id="portfolio-hero" aria-label={`${profile.firstName} ${profile.lastName} portfolio`}
      data-active={navigation.activeId || undefined}>
      <div id="portfolio-stage">
        <Globe profile={profile} galaxy={galaxy} />
        <Navigation.Visuals {...navigation} />
      </div>
      <Navigation.Links {...navigation} />
      <GalaxySelector galaxy={galaxy} onChange={setGalaxy} />
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
