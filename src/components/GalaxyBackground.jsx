import '../styles/galaxy.css';

// Decorative, seeded galaxy impressions rather than an astronomical sky chart.
// Static SVG dust fields keep the effect independent of the globe's render loop.
const dust = Array.from({ length: 220 }, (_, i) => {
  const noise = n => { const value = Math.sin(n * 127.1 + 31.7) * 43758.5453; return value - Math.floor(value); };
  const x = noise(i + 1);
  return { x, y: (noise(i + 701) + noise(i + 401) - 1), r: 0.35 + noise(i + 201) * 0.8 };
});

export default function GalaxyBackground({ galaxy }) {
  return <div className="galaxy-background" aria-hidden="true">
    <svg className={`galaxy-scene${galaxy === 'milky-way' ? ' is-visible' : ''}`} viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="milky-haze"><stop stopColor="#8196bb" stopOpacity=".24"/><stop offset=".5" stopColor="#665680" stopOpacity=".12"/><stop offset="1" stopColor="#665680" stopOpacity="0"/></radialGradient>
      </defs>
      <g transform="translate(500 150) rotate(-18)">
        <ellipse rx="620" ry="94" fill="url(#milky-haze)"/>
        <path d="M-550 12 Q-220 -12 0 10 T550 -5" fill="none" stroke="#03040a" strokeWidth="13" opacity=".5"/>
        {dust.map((star, i) => <circle key={i} cx={(star.x - .5) * 1100} cy={star.y * 60} r={star.r} fill="#c2cee5" opacity={.12 + star.r * .18}/>)}
      </g>
    </svg>
    <div className={`galaxy-scene andromeda-scene${galaxy === 'andromeda' ? ' is-visible' : ''}`}>
      <img className="andromeda-image" src="/images/andromeda.jpg" alt="" width="1920" height="1080" decoding="async" />
      <div className="andromeda-core" />
    </div>
  </div>;
}

export function GalaxyCredit({ galaxy }) {
  if (galaxy !== 'andromeda') return null;
  return <div className="galaxy-credit">
    <a title="ESA/Hubble & Digitized Sky Survey 2. Acknowledgment: Davide De Martin (ESA/Hubble). Color and framing adapted." href="https://esahubble.org/images/heic1112f/" target="_blank" rel="noreferrer">ESA/Hubble &amp; DSS2 · Davide De Martin</a>
    <span> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> · Adapted</span>
  </div>;
}
