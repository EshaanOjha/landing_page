# Globe Portfolio

A React portfolio with the existing canvas globe, floating horizon name, geographic layers, and responsive navigation. The former single HTML/iframe export is now a modular MERN application.

## Stack and structure

- **React + Vite:** components, navigation state, asset loading and build tooling.
- **Node.js + Express:** read-only portfolio API and production static hosting.
- **MongoDB + Mongoose:** optional persisted name and subtitle, loaded through the API.
- **D3 Geo / geoSatellite + Canvas 2D:** the existing globe renderer; no WebGL or Three.js.

```text
src/components/       Globe and navigation React components
src/hooks/            Profile loading and navigation state
src/globe/            Canvas renderer and geographic asset loader
src/styles/           Layout, fonts and navigation styles
src/navigation.js     Four navigation regions and anchors
shared/portfolio.js   Default name/subtitle and shared validation
server/               Express API, Mongoose repository and seed script
public/data/          Self-hosted geographic JSON
public/fonts/         Self-hosted fonts (licenses in licenses/)
tests/                API, renderer lifecycle and isolated MongoDB checks
```

## Run locally

Use Node.js 22.12+ and npm. From this repository:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Vite serves React with hot reload and proxies `/api` to Express on port 3001. Restart `npm run dev` after changing server files. Opening `index.html` directly or using a Python static server no longer runs the app.

## Enable MongoDB

The UI works immediately with shared defaults when `MONGODB_URI` is unset. To use persistent content, start your own local MongoDB service (or provide an Atlas connection string), then:

```sh
cp .env.example .env
```

Set `MONGODB_URI=mongodb://127.0.0.1:27017/globe_portfolio` in `.env`, then run:

```sh
npm run db:seed
npm run dev
```

Seeding creates the `portfolio` document in the `portfolios` collection and never overwrites existing profile fields. Edit `firstName`, `lastName`, and `subtitle` in MongoDB and reload the page to see changes. The API deliberately exposes no public write route or admin interface. Keep `.env` private; it is gitignored.

With a configured URI, an unavailable database fails server startup. A later API failure lets the frontend display local defaults. `/api/health` reports storage mode and connectivity; `/api/portfolio` returns `{ "portfolio": { ... } }`. An empty database uses defaults until seeded.

## Production

```sh
npm run build
npm start
```

Open http://127.0.0.1:3001. Express serves `dist/` and the API together. `PORT` and `HOST` are configurable; the default host is loopback for local development. For deployment, configure the host and HTTPS through your hosting platform.

Production uses Helmet security headers and a same-origin Content Security Policy. The old sandboxed iframe is removed because React owns the page directly. Scripts, fonts and data are self-hosted; inline styles are allowed for React navigation positioning. Development is served by Vite and does not use the production document CSP.

## Verification

```sh
npm test
npm run test:db
npm run build
```

The database test starts a temporary isolated MongoDB process and removes its own test data afterward. It defaults to `/opt/homebrew/bin/mongod`; set `MONGOD_BINARY` for another installation. It does not use `.env` or your portfolio database.

## Editing the portfolio

Change default content in `shared/portfolio.js`, or persisted content in MongoDB when enabled. Globe geometry, colors, motion and horizon placement are in `src/globe/renderer.js`. Navigation labels, polygons and anchors are in `src/navigation.js`.

About, Projects, Writeups and Contact remain anchors without destination content, as requested. No new sections or contact details were invented.

See [visual design](docs/DESIGN.md) for preserved animation/layer details and [data sources](DATA_SOURCES.md) for geographic attribution and limitations.
