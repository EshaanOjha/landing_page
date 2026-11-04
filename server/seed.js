import 'dotenv/config';
import { createRepository } from './repository.js';
if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in .env before seeding.');
const repository = await createRepository(process.env.MONGODB_URI);
try { await repository.seed(); console.log('Portfolio seeded; existing content preserved.'); }
finally { await repository.close(); }
