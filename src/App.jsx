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

export default function App() {
  return window.location.pathname.replace(/\/$/, "") === "/about" ? <About /> : <Home />;
}
