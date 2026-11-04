// Geometry and numbering match the supplied zones.html and annotated screenshot.
// About and Projects have their own pages; the remaining anchors are reserved for future sections.
export const zones = [
  { id: 'projects', n: '01', label: 'Projects', href: '/projects', points: [[0,32.8],[17.5,32.8],[17.5,50.6],[0,60.1]], anchor: [8.7,44] },
  { id: 'about', n: '02', label: 'About', href: '/about', points: [[0,0],[43.6,0],[17.5,32.8],[0,32.8]], anchor: [9,15] },
  { id: 'writeups', n: '03', label: 'Writeups', href: '#writeups', points: [[43.6,0],[77.1,0],[77.1,21.7],[26.3,21.7]], anchor: [60,10.5] },
  { id: 'contact', n: '04', label: 'Get in Touch', href: '#contact', points: [[77.1,0],[100,0],[100,62.4],[77.1,21.7]], anchor: [89,20] },
];
