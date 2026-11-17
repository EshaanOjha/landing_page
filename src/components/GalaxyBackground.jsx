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
    <svg className={`galaxy-scene${galaxy === 'andromeda' ? ' is-visible' : ''}`} viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="andromeda-haze"><stop stopColor="#f4dfb2" stopOpacity=".5"/><stop offset=".16" stopColor="#b6b4d3" stopOpacity=".26"/><stop offset=".55" stopColor="#637b9a" stopOpacity=".12"/><stop offset="1" stopColor="#637b9a" stopOpacity="0"/></radialGradient>
      </defs>
      <g transform="translate(530 135) rotate(-24)">
        <ellipse rx="285" ry="80" fill="url(#andromeda-haze)"/>
        <ellipse rx="170" ry="30" fill="none" stroke="#171b29" strokeWidth="5" opacity=".5"/>
        <ellipse rx="100" ry="18" fill="none" stroke="#9bacc9" strokeWidth="1" opacity=".12"/>
        {dust.map((star, i) => {
          const angle = star.x * Math.PI * 8;
          const radius = 20 + i / dust.length * 230;
          return <circle key={i} cx={Math.cos(angle) * radius} cy={Math.sin(angle) * radius * .23 + star.y * 10} r={star.r} fill="#d4d7e3" opacity=".25"/>;
        })}
      </g>
    </svg>
  </div>;
}

export function GalaxySelector({ galaxy, onChange }) {
  return <div className="galaxy-selector" role="group" aria-label="Background galaxy">
    <span className="galaxy-selector-label">Sky</span>
    {[['milky-way', 'Milky Way'], ['andromeda', 'Andromeda']].map(([id, label]) =>
      <button type="button" key={id} aria-pressed={galaxy === id} onClick={() => onChange(id)}>{label}</button>)}
  </div>;
}
