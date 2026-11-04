heyyyyy wsggg welcome under the hood of my landing page
## About page

The homepage About link opens `/about`. Edit `src/content/about.js` to replace the draft biography, focus areas, current activities, milestones and contact details. The copy is placeholder content for personalization, not a verified résumé.

- Set `portrait` to a local image URL such as `/images/portrait.jpg` and place the image in `public/images/`.
- Set contact `href` values to your real HTTPS profile links or `mailto:you@example.com`; null entries appear as non-clickable placeholders.
- Optional focus `link` values enable project links. Set `resume` to `/resume.pdf` after placing your PDF in `public/`.
- Layout and appearance live in `src/pages/About.jsx` and `src/styles/about.css`.

About uses normal page navigation, works on direct load/refresh, and does not mount the globe or load its geographic data. It supports compact mobile layouts, keyboard focus, section anchors and reduced motion. Its content is currently a local editable module; it does not require MongoDB.

## Projects page

The homepage Projects link opens `/projects`. Edit `src/content/projects.js` for project summaries, engineering notes, technology tags and repository links. Current copy is based on the repositories' READMEs, without invented results or personal contribution claims.

Each entry supports an optional `image` (a same-origin URL such as `/images/nearcast.webp`) and `demo` URL. Place screenshot assets in `public/images/`. Without an image, a labeled illustrative system diagram is displayed. Live-demo links only appear when configured. Engineering details use keyboard-accessible native disclosures. Certificates remain separate from this page.
