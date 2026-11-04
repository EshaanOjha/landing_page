import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../server/app.js';
import { createRepository } from '../server/repository.js';
import { defaultPortfolio } from '../shared/portfolio.js';

test('API returns profile, security headers, and explicit API errors', async t => {
  const repository = await createRepository();
  const server = createApp(repository).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${base}/api/portfolio`);
  assert.deepEqual(await response.json(), { portfolio: defaultPortfolio });
  assert.match(response.headers.get('content-security-policy'), /script-src 'self'/);
  assert.equal(response.headers.get('x-powered-by'), null);
  assert.equal((await fetch(`${base}/api/missing`)).status, 404);
  assert.equal((await fetch(`${base}/api/portfolio`, { method: 'POST' })).status, 404);
  repository.getPortfolio = async () => { throw new Error('private connection details'); };
  const failure = await fetch(`${base}/api/portfolio`);
  assert.equal(failure.status, 503);
  assert.deepEqual(await failure.json(), { error: 'Portfolio temporarily unavailable' });
  repository.healthy = () => false;
  assert.equal((await fetch(`${base}/api/health`)).status, 503);
});
