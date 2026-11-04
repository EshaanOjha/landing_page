import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import net from 'node:net';
import mongoose from 'mongoose';
import { createRepository } from '../server/repository.js';
import { createApp } from '../server/app.js';
import { defaultPortfolio } from '../shared/portfolio.js';

test('isolated MongoDB persists profile and seed preserves edits', { timeout: 30000 }, async t => {
  const directory = await mkdtemp(join(tmpdir(), 'globe-db-test-'));
  const probe = net.createServer().listen(0, '127.0.0.1'); await once(probe, 'listening');
  const port = probe.address().port; await new Promise(resolve => probe.close(resolve));
  const child = spawn(process.env.MONGOD_BINARY || '/opt/homebrew/bin/mongod', ['--dbpath', directory, '--port', String(port), '--bind_ip', '127.0.0.1', '--quiet'], { stdio: 'ignore' });
  let launchError; child.on('error', error => { launchError = error; });
  let repository, connection, server;
  t.after(async () => {
    if (server) await new Promise(resolve => server.close(resolve));
    await connection?.close(); await repository?.close();
    if (child.pid && child.exitCode === null) { const exited = once(child, 'exit'); child.kill('SIGTERM'); await exited; }
    await rm(directory, { recursive: true, force: true });
  });
  const uri = `mongodb://127.0.0.1:${port}/globe_migration_test`;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (launchError) throw launchError;
    try { repository = await createRepository(uri); break; } catch (error) { if (attempt === 2) throw error; }
  }
  assert.deepEqual(await repository.getPortfolio(), defaultPortfolio);
  await repository.seed();
  connection = await mongoose.createConnection(uri).asPromise();
  await connection.collection('portfolios').updateOne({ _id: 'portfolio' }, { $set: { subtitle: 'Persisted MongoDB content' } });
  await repository.seed();
  server = createApp(repository).listen(0, '127.0.0.1'); await once(server, 'listening');
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/portfolio`);
  assert.equal((await response.json()).portfolio.subtitle, 'Persisted MongoDB content');
  assert.equal(repository.healthy(), true);
});
