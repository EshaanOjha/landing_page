import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
export function createApp(repository, staticDirectory) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"],
    fontSrc: ["'self'"], connectSrc: ["'self'"], imgSrc: ["'self'", 'data:'],
    objectSrc: ["'none'"], frameSrc: ["'none'"], frameAncestors: ["'none'"], baseUri: ["'none'"], upgradeInsecureRequests: null,
  } } }));
  app.get('/api/health', (req, res) => {
    const ok = repository.healthy();
    res.status(ok ? 200 : 503).json({ status: ok ? 'ok' : 'unavailable', storage: repository.mode });
  });
  app.get('/api/portfolio', async (req, res) => {
    try { res.set('Cache-Control', 'no-store').json({ portfolio: await repository.getPortfolio() }); }
    catch { res.status(503).json({ error: 'Portfolio temporarily unavailable' }); }
  });
  app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found' }));
  if (staticDirectory) {
    app.use(express.static(staticDirectory));
    app.get('/{*splat}', (req, res, next) => {
      if (path.extname(req.path)) return next();
      res.sendFile(path.join(staticDirectory, 'index.html'));
    });
  }
  return app;
}
