heyyyyy wsggg welcome under the hood of my landing page
## About page

The homepage About link opens `/about`. Edit `src/content/about.js` to replace the draft biography, focus areas, current activities, and milestones. Contact details now live in `src/content/contact.js`. The copy is placeholder content for personalization, not a verified résumé.

- Set `portrait` to a local image URL such as `/images/portrait.jpg` and place the image in `public/images/`.
- In `src/content/contact.js`, set contact `href` values to your real HTTPS profile links or `mailto:you@example.com`; null entries appear as non-clickable placeholders.
- Optional focus `link` values enable project links. Set `resume` to `/resume.pdf` after placing your PDF in `public/`.
- Layout and appearance live in `src/pages/About.jsx` and `src/styles/about.css`.

About uses normal page navigation, works on direct load/refresh, and does not mount the globe or load its geographic data. It supports compact mobile layouts, keyboard focus, section anchors and reduced motion. Its content is currently a local editable module; it does not require MongoDB.

## Projects page

The homepage Projects link opens `/projects`. Edit `src/content/projects.js` for project summaries, engineering notes, technology tags and repository links. Current copy is based on the repositories' READMEs, without invented results or personal contribution claims.

Each entry supports an optional `image` (a same-origin URL such as `/images/nearcast.webp`) and `demo` URL. Place screenshot assets in `public/images/`. Without an image, a labeled illustrative system diagram is displayed. Live-demo links only appear when configured. Engineering details use keyboard-accessible native disclosures. Certificates remain separate from this page.

## Contact page

`/contact` contains the contact section moved from About, including GitHub, LinkedIn, email and an optional résumé link. Edit `src/content/contact.js` to add real profile URLs and an email address. The homepage, About navigation and Projects closing link all point here. Old `/about#connect` links redirect to `/contact`. There is no contact form or message-submission backend.

## Certificates

About displays CS50x and TryHackMe Cyber Security 101 after “Along the way.” Originals and rendered preview images are self-hosted in `public/certificates/`. Titles, dates, file paths and issuer verification links are editable in `src/content/certificates.js`. PDF links open a new tab; original PDFs are unchanged. CS50x specifies a completion year only, so no month/day is inferred.
