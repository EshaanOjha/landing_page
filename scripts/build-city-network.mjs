import { readFile, writeFile } from 'node:fs/promises';
import { createCityRoutes } from '../src/globe/cityNetwork.js';
const tiers = JSON.parse(await readFile(new URL('../public/data/cityTiers.json', import.meta.url), 'utf8'));
await writeFile(new URL('../src/globe/cityRoutes.json', import.meta.url), JSON.stringify(createCityRoutes(tiers)) + '\n');
