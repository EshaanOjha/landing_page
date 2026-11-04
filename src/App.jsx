import { useEffect } from 'react';
import Contact from './pages/Contact.jsx';
import Projects from './pages/Projects.jsx';
import About from './pages/About.jsx';
import Globe from './components/Globe.jsx';
import Navigation from './components/Navigation.jsx';
import { usePortfolio } from './hooks/usePortfolio.js';
import { useNavigation } from './hooks/useNavigation.js';

function Home() {
  const profile = usePortfolio();
  const navigation = useNavigation();
  return (
    <main id="portfolio-hero" aria-label={`${profile.firstName} ${profile.lastName} portfolio`}
      data-active={navigation.activeId || undefined}>
      <div id="portfolio-stage">
        <Globe profile={profile} />
        <Navigation.Visuals {...navigation} />
      </div>
      <Navigation.Links {...navigation} />
    </main>
  );
}

function LegacyContactRedirect() {
  useEffect(() => { window.location.replace("/contact"); }, []);
  return <a href="/contact">Continue to Get in touch</a>;
}

export default function App() {
  const path = window.location.pathname.replace(/\/$/, "");
  if (path === "/contact") return <Contact />;
  if (path === "/about" && window.location.hash === "#connect") {
    return <LegacyContactRedirect />;
  }
  if (path === "/projects") return <Projects />;
  return path === "/about" ? <About /> : <Home />;
}
