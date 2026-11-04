// Edit this file to personalize About. Draft copy is intentionally aspirational;
// replace it with your own background, verified milestones, and real links.
export const about = {
  intro: "I'm Eshaan Ojha. I’m interested in how machines communicate, how systems stay secure, and the backend code that makes everything work.",
  education: 'Computer science · Learning by building',
  location: 'Based in India',
  portrait: null, // e.g. '/images/portrait.jpg'; place the file in public/images/
  story: [
    'I’m a computer science student exploring networking, security and backend development. I like understanding what happens underneath an interface: where a request goes, how data moves, and what happens when something breaks.',
    'My favorite way to learn is to build a small system, take it apart, and make it better. I’m especially curious about reliable services, practical security, and the infrastructure connecting them.',
    'Outside coursework, I make room for hands-on experiments, reading and documenting what I learn. This portfolio is a growing record of that process.',
  ],
  focus: [
    { title: 'Networking', number: '01', description: 'Following a request from one machine to another, and understanding the decisions along the way.', experiment: 'An experiment to explore: a small home network lab with traffic inspection and custom routing.', tags: ['TCP/IP', 'DNS', 'Linux'], link: null },
    { title: 'Security', number: '02', description: 'Learning how systems fail, where trust boundaries sit, and how to build safer defaults.', experiment: 'An experiment to explore: investigate a vulnerable local application and document the fixes.', tags: ['Web security', 'Threat modeling', 'Labs'], link: null },
    { title: 'Backend', number: '03', description: 'Building the services behind an interface, with clear APIs and careful handling of data.', experiment: 'On this site: a React frontend backed by an Express API and optional MongoDB persistence.', tags: ['Node.js', 'Express', 'MongoDB'], link: null },
  ],
  current: [
    { label: 'Learning', text: 'Computer networks, operating systems, and the foundations of application security.' },
    { label: 'Building', text: 'This portfolio, one considered feature at a time.' },
    { label: 'Exploring', text: 'Small backend experiments and opportunities to contribute to open source.' },
  ],
  updated: 'November 2026',
  milestones: [
    { label: 'Foundations', title: 'Understand the system', text: 'Developing a foundation in programming, data structures and how computers communicate.' },
    { label: 'Practice', title: 'Learn through experiments', text: 'Turning concepts into small projects and recording the lessons along the way.' },
    { label: 'Next', title: 'Build in the open', text: 'Aiming to share useful tools, writeups and contributions with other developers.' },
  ],
};
