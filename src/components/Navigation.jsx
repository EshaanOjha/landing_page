import { zones } from '../navigation.js';

function Visuals({ activeId, focusedId, hash }) {
  return <>
    <div id="portfolio-labels" aria-hidden="true">
      {zones.map(zone => <span key={zone.id}
        className={`portfolio-zone-label${activeId === zone.id ? ' is-active' : ''}${focusedId === zone.id ? ' is-focused' : ''}${hash === zone.href ? ' is-current' : ''}`}
        style={{ left: `${zone.anchor[0]}%`, top: `${zone.anchor[1]}%` }}>
        <span className="num">{zone.n}</span><span>{zone.label}</span>
      </span>)}
    </div>
    <svg className="portfolio-borders" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {zones.map(zone => <polygon key={zone.id} points={zone.points.map(point => point.join(',')).join(' ')}
        className={activeId === zone.id ? 'is-active' : undefined} />)}
    </svg>
  </>;
}

function Links({ activeId, hash, onEnter, onLeave, onFocus, onBlur }) {
  return <nav id="portfolio-zones" aria-label="Primary navigation">
    {zones.map(zone => <a key={zone.id} href={zone.href} aria-label={zone.label}
      aria-current={hash === zone.href ? 'location' : undefined}
      className={`portfolio-zone${activeId === zone.id ? ' is-active' : ''}`}
      style={{ clipPath: `polygon(${zone.points.map(point => `${point[0]}% ${point[1]}%`).join(',')})` }}
      onPointerEnter={event => onEnter(event, zone.id)} onPointerLeave={onLeave}
      onFocus={event => onFocus(event, zone.id)} onBlur={onBlur}>
      <span className="portfolio-mobile-label" aria-hidden="true"><span className="num">{zone.n}</span><span>{zone.label}</span></span>
    </a>)}
  </nav>;
}

export default { Visuals, Links };
