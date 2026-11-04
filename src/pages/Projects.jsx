import { useEffect } from 'react';
import { projects } from '../content/projects.js';
import '../styles/about.css';
import '../styles/projects.css';

function ProjectVisual({ project }) {
  return <figure className={`project-visual visual-${project.id}`}>
    {project.image ? <img src={project.image} alt={`${project.name} application interface`} loading="lazy" /> : <div className="project-diagram">
      <div className="diagram-top"><span>System overview</span><span>/{project.number}</span></div>
      <div className="diagram-flow">{project.nodes.map((node, index) => <div className="diagram-node" key={node}>
        <span className="node-symbol" aria-hidden="true">{index === 0 ? '○' : index === 1 ? '◇' : '⊞'}</span><span className="node-step">0{index + 1}</span><strong>{node}</strong>
      </div>)}</div>
      <div className="diagram-bottom"><span className="signal-dot" />{project.signal}<span className="diagram-rule" /></div>
    </div>}
    <figcaption>{project.image ? 'Application preview' : 'Illustrative system diagram'} <span>{project.name}</span></figcaption>
  </figure>;
}

export default function Projects() {
  useEffect(() => {
    const title = document.title;
    document.title = 'Projects — Eshaan Ojha';
    return () => { document.title = title; };
  }, []);
  return <div className="about-page projects-page">
    <a className="about-skip" href="#projects-content">Skip to content</a>
    <header className="about-header projects-header"><a className="back-link" href="/">← Back to globe</a><nav aria-label="Portfolio pages"><a href="/about">About</a><a href="/projects" aria-current="page">Projects</a></nav></header>
    <main id="projects-content">
      <section className="projects-intro" aria-labelledby="projects-heading">
        <p className="eyebrow with-dot">Selected work / 03 projects</p>
        <h1 id="projects-heading"><strong>Built to solve problems.</strong><span>From local networks<br />to real-world workflows.</span></h1>
        <p>Three projects exploring how systems connect, how data moves, and how software supports the people using it.</p>
        <nav className="project-index" aria-label="Project index">{projects.map(project => <a key={project.id} href={`#${project.id}`}><span>{project.number}</span>{project.name}<span aria-hidden="true">↘</span></a>)}</nav>
      </section>
      {projects.map(project => <article className="project-entry" id={project.id} key={project.id} aria-labelledby={`${project.id}-heading`}>
        <div className="project-heading"><span className="project-number">/{project.number}</span><div><p className="eyebrow">{project.category}</p><h2 id={`${project.id}-heading`}>{project.name}</h2></div><a className="project-source" href={project.repo} target="_blank" rel="noreferrer" aria-label={`${project.name} source code (opens in new tab)`}>Source code ↗</a></div>
        <div className="project-summary"><h3>{project.headline}</h3><p>{project.description}</p></div>
        <ProjectVisual project={project} />
        <div className="project-story"><div><h3 className="eyebrow">The problem</h3><p>{project.problem}</p></div><div><h3 className="eyebrow">The approach</h3><p>{project.approach}</p></div></div>
        <ul className="about-tags project-tags" aria-label={`${project.name} technologies`}>{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
        <details className="project-details"><summary><span>Engineering details<span className="sr-only"> for {project.name}</span></span><span className="details-mark" aria-hidden="true">+</span></summary><div className="engineering-grid">{project.details.map(detail => <section key={detail.title}><h4>{detail.title}</h4><p>{detail.text}</p></section>)}</div><a href={project.repo} target="_blank" rel="noreferrer">Explore the repository ↗</a></details>
        {project.demo && <a className="text-link" href={project.demo} target="_blank" rel="noreferrer">Open live demo ↗</a>}
      </article>)}
      <section className="projects-outro" aria-labelledby="projects-outro-heading"><p className="eyebrow">Keep exploring</p><h2 id="projects-outro-heading">The work is one part.<br /><span>Here’s the person behind it.</span></h2><a href="/about">More about me ↗</a><a href="/contact">Get in touch ↗</a></section>
    </main>
    <footer className="about-footer eyebrow"><span>© {new Date().getFullYear()} Eshaan Ojha</span><a href="/">Return to orbit ↗</a></footer>
  </div>;
}
