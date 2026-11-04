import { useEffect } from 'react';
import { contact } from '../content/contact.js';
import '../styles/about.css';
import '../styles/contact.css';

export default function Contact() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Get in touch — Eshaan Ojha';
    return () => { document.title = previousTitle; };
  }, []);

  return <div className="about-page contact-page">
    <a className="about-skip" href="#contact-content">Skip to content</a>
    <header className="about-header contact-header">
      <a className="back-link" href="/">← Back to globe</a>
      <nav aria-label="Portfolio pages"><a href="/about">About</a><a href="/projects">Projects</a><a href="/contact" aria-current="page">Contact</a></nav>
    </header>
    <main id="contact-content" className="contact-main">
      <p className="eyebrow with-dot contact-label">Get in touch</p>
      <div className="contact-body">
        <h1 className="about-closing"><strong>Let’s build</strong><br />something useful.</h1>
        <dl className="about-contacts">
          {contact.contacts.map(item => <div key={item.label}>
            <dt className="eyebrow">{item.label}</dt>
            <dd>{item.href
              ? <a href={item.href}>{item.text} <span aria-hidden="true">↗</span></a>
              : <span className="contact-placeholder">{item.text}<small>Coming soon</small></span>}
            </dd>
          </div>)}
        </dl>
        {contact.resume && <a className="text-link" href={contact.resume}>View résumé ↗</a>}
      </div>
    </main>
    <footer className="about-footer eyebrow"><span>© {new Date().getFullYear()} Eshaan Ojha</span><a href="/">Return to orbit ↗</a></footer>
  </div>;
}
