import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { access } from 'node:fs/promises';
import { createRepository } from './repository.js';
import { createApp } from './app.js';
const port = Number(process.env.PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT.');
const directory = process.argv.includes('--production') ? fileURLToPath(new URL('../dist/', import.meta.url)) : undefined;
if (directory) await access(directory + '/index.html');
let repository;
try { repository = await createRepository(process.env.MONGODB_URI); }
catch { console.error('MongoDB connection failed. Check MONGODB_URI and the database service.'); process.exit(1); }
const server = createApp(repository, directory).listen(port, process.env.HOST || '127.0.0.1', () => console.log(`Portfolio: http://${process.env.HOST || '127.0.0.1'}:${port} (storage: ${repository.mode})`));
server.on('error', async error => { console.error(error.message); await repository.close(); process.exit(1); });
let stopping = false;
function shutdown() {
  if (stopping) return;
  stopping = true;
  server.close(async () => { await repository.close(); process.exit(0); });
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
