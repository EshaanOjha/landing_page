// Content summarized from the project READMEs. Add a real screenshot URL or demo
// when available; diagrams are illustrative and are not application screenshots.
export const projects = [
  {
    id: 'kaushalya-track', number: '01', name: 'Kaushalya Track', category: 'Career outcomes · Full-stack',
    headline: 'Learning is a beginning. Track what comes next.',
    description: 'A platform for following the career progress of trainees after skill-development programs, connecting employment updates with personalized career roadmaps.',
    problem: 'Course completion alone does not explain what happens next: employment, salary progression, retention and skill gaps all need follow-up.',
    approach: 'Pair periodic employment updates with career guidance, giving trainees a reason to stay engaged while administrators follow cohort outcomes.',
    details: [
      { title: 'Updates with less friction', text: 'The project describes magic-link status updates so trainees can submit information without a conventional login flow. Consent and access boundaries remain part of that workflow.' },
      { title: 'A history, not just a snapshot', text: 'Append-only employment records preserve changes over time. Cohort analytics and employer verification provide additional context around reported outcomes.' },
      { title: 'Guidance alongside tracking', text: 'AI-generated career roadmaps connect reported progress with next steps. The README describes keeping sensitive personal identifiers out of AI-provider requests.' },
    ],
    tags: ['React', 'TypeScript', 'TanStack Start', 'Supabase', 'PostgreSQL'],
    nodes: ['Trainee update', 'Outcome history', 'Career roadmap'], signal: 'Progress over time',
    repo: 'https://github.com/EshaanOjha/Kaushalya-Track', image: null, demo: null,
  },
  {
    id: 'nearcast', number: '02', name: 'NearCast', category: 'Local networks · Media streaming',
    headline: 'Your files. Your network. Any nearby screen.',
    description: 'A small Express server that streams local video files to devices on the same network, with HTTP Range support for seeking and scrubbing.',
    problem: 'Playing a file on another device should not require copying the entire video first. Seeking also needs more than a single full-file response.',
    approach: 'Expose a movie catalogue and a video endpoint on the LAN, then let the player request the byte ranges it needs.',
    details: [
      { title: 'Partial content makes seeking work', text: 'The video endpoint supports HTTP Range requests and 206 Partial Content responses. A player can request a segment rather than restarting the entire transfer.' },
      { title: 'A small, focused API', text: 'GET /api/movies lists available videos and metadata. GET /video/:filename serves the media content to the browser.' },
      { title: 'A deliberate local scope', text: 'Devices need to share a Wi-Fi or LAN connection. Browser playback still depends on container and codec support; serving a file is not the same as transcoding it.' },
    ],
    tags: ['React', 'Node.js', 'Express', 'HTTP Range', 'LAN'],
    nodes: ['Local files', 'Express server', 'Nearby devices'], signal: '206 Partial Content',
    repo: 'https://github.com/EshaanOjha/nearcast', image: null, demo: null,
  },
  {
    id: 'warehouse-manager', number: '03', name: 'Warehouse Manager', category: 'Relational databases · Operations',
    headline: 'From stock on a shelf to a system of record.',
    description: 'A wholesale management system covering warehouse operations and B2B customer stock tracking, built around a relational database.',
    problem: 'Products, suppliers, orders and customer inventory are related. Keeping those relationships consistent is central to reliable warehouse operations.',
    approach: 'Connect admin and customer workflows to a MySQL schema, with an Express API handling authentication, orders, inventory and reporting.',
    details: [
      { title: 'Database design at the center', text: 'The repository includes a 16-table schema, constraints, triggers, procedures and views, together with normalization documentation and an ER diagram.' },
      { title: 'Orders and access boundaries', text: 'The backend includes atomic order placement and JWT-based role authorization, separating customer workflows from administration.' },
      { title: 'Inspecting performance', text: 'The project includes indexing and EXPLAIN ANALYZE examples. MySQL runs through Docker Compose, with seed data for exploring the workflows locally.' },
    ],
    tags: ['React', 'Node.js', 'Express', 'MySQL', 'Docker'],
    nodes: ['Orders & stock', 'Application API', 'Relational data'], signal: '16 connected tables',
    repo: 'https://github.com/EshaanOjha/Warehouse-Manager', image: null, demo: null,
  },
];
