import { useEffect } from 'react';
import { about } from '../content/about.js';
import { certificates } from '../content/certificates.js';
import '../styles/about.css';

function Section({ id, label, children }) {
  return <section className="about-section" id={id} aria-labelledby={`${id}-label`}>
    <h2 className="eyebrow" id={`${id}-label`}>{label}</h2>
    <div>{children}</div>
  </section>;
}

export default function About() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'About — Eshaan Ojha';
    const frame = requestAnimationFrame(() => {
      const id = window.location.hash.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
    });
    return () => { cancelAnimationFrame(frame); document.title = previousTitle; };
  }, []);
  return <div className="about-page">
    <a className="about-skip" href="#about-content">Skip to content</a>
    <header className="about-header">
      <a className="back-link" href="/">← Back to globe</a>
      <nav aria-label="About page"><a href="#focus">Focus</a><a href="#certificates">Certificates</a><a href="/contact">Contact</a></nav>
    </header>
    <main id="about-content">
      <section className="about-intro" aria-labelledby="about-heading">
        <div className="about-intro-copy">
          <p className="eyebrow with-dot">About / Eshaan Ojha</p>
          <h1 id="about-heading"><strong>Networks, security</strong><span>and the backends<br className="desktop-break" /> behind them.</span></h1>
          <p className="about-lead">{about.intro}</p>
        </div>
        <figure className="about-portrait">
          <div className="portrait-frame">
            {about.portrait ? <img src={about.portrait} alt="Eshaan Ojha" /> : <div className="portrait-placeholder">
              <svg viewBox="0 0 300 320" aria-hidden="true"><path d="M55 75H150L245 145V245H150L55 175Z M150 75V245 M55 175L245 145" /><circle cx="55" cy="75" r="5"/><circle cx="150" cy="75" r="5"/><circle cx="245" cy="145" r="5"/><circle cx="245" cy="245" r="5"/><circle cx="150" cy="245" r="5"/><circle cx="55" cy="175" r="5"/></svg>
              <span className="eyebrow">Portrait / Coming soon</span>
            </div>}
          </div>
          <figcaption className="eyebrow">{about.education}<br />{about.location}</figcaption>
        </figure>
      </section>
      <Section id="story" label="Who I am"><div className="about-story">{about.story.map(text => <p key={text}>{text}</p>)}</div></Section>
      <Section id="focus" label="What I work on"><div className="about-focus-grid">
        {about.focus.map(item => <article key={item.title}>
          <span className="eyebrow focus-number">/{item.number}</span><h3>{item.title}</h3><p>{item.description}</p><p className="focus-example">{item.experiment}</p>
          <ul className="about-tags" aria-label={`${item.title} interests`}>{item.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
          {item.link && <a className="text-link" href={item.link}>Explore the work ↗</a>}
        </article>)}
      </div></Section>
      <Section id="currently" label="Right now"><p className="eyebrow updated">Updated {about.updated}</p><dl className="about-current">
        {about.current.map(item => <div key={item.label}><dt className="eyebrow with-dot">{item.label}</dt><dd>{item.text}</dd></div>)}
      </dl></Section>
      <Section id="journey" label="Along the way"><div className="about-milestones">
        {about.milestones.map(item => <article key={item.label}><p className="eyebrow">{item.label}</p><h3>{item.title}</h3><p>{item.text}</p></article>)}
      </div></Section>

      <Section id="certificates" label="Certificates & learning">
        <div className="certificate-grid">{certificates.map(certificate => <article className="certificate-card" key={certificate.id}>
          <a className="certificate-preview" href={certificate.pdf} target="_blank" rel="noreferrer" aria-label={`View ${certificate.title} certificate PDF (opens in new tab)`}>
            <img src={certificate.image} alt={`${certificate.title} completion certificate awarded to Eshaan Krishna Ojha`} loading="lazy" width="900" height={certificate.id === 'cs50x' ? 696 : 547} />
          </a>
          <div className="certificate-copy">
            <p className="eyebrow">{certificate.issuer}</p>
            <h3>{certificate.title}</h3>
            <p className="certificate-date">Completed <time dateTime={certificate.dateTime}>{certificate.date}</time></p>
            <p>{certificate.description}</p>
            <div className="certificate-actions">
              <a href={certificate.pdf} target="_blank" rel="noreferrer" aria-label={`View ${certificate.title} PDF (opens in new tab)`}>View certificate ↗</a>
              <a href={certificate.verification} target="_blank" rel="noreferrer" aria-label={`Verify ${certificate.title} with issuer (opens in new tab)`}>Verify ↗</a>
            </div>
          </div>
        </article>)}</div>
      </Section>
    </main>
    <footer className="about-footer eyebrow"><span>© {new Date().getFullYear()} Eshaan Ojha</span><a href="/">Return to orbit ↗</a></footer>
  </div>;
}
