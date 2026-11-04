import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mountGlobe } from '../src/globe/renderer.js';
import { defaultPortfolio } from '../shared/portfolio.js';

test('real geographic layers render, profile updates, and unmount cancels animation', async () => {
  const names = ['world','cityTiers','rivers','borders','contestedBorders','terrain','urbanClusters','lakes','regionalBorders'];
  const data = Object.fromEntries(await Promise.all(names.map(async name => [name, JSON.parse(await readFile(new URL(`../public/data/${name}.json`, import.meta.url), 'utf8'))])));
  let disconnected = 0, removed = 0, frames = new Map(), next = 0, text = [];
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({ measureText: s => ({ width: s.length * 12 }), fillText: s => text.push(s), createLinearGradient: () => gradient }, { get: (target, key) => target[key] ?? (() => {}) });
  const reduced = { matches: false, addEventListener() {}, removeEventListener() { removed++; } };
  const globals = { window: { matchMedia: () => reduced }, document: { hidden: false, fonts: { load: async () => {} } }, devicePixelRatio: 1,
    ResizeObserver: class { observe() {} disconnect() { disconnected++; } },
    requestAnimationFrame: cb => { frames.set(++next, cb); return next; }, cancelAnimationFrame: id => frames.delete(id) };
  const originals = Object.fromEntries(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, globals);
  try {
    const canvas = { parentElement: { clientWidth: 1280, clientHeight: 720 }, getContext: () => ctx };
    const renderer = mountGlobe(canvas, data, defaultPortfolio);
    assert.equal(canvas.width, 1280);
    assert.equal(frames.size, 1);
    for (let timestamp = 0; timestamp < 3000; timestamp += 80) {
      const [id, callback] = frames.entries().next().value; frames.delete(id); callback(timestamp);
    }
    text = [];
    renderer.updateProfile({ firstName: 'Z', lastName: 'Q', subtitle: 'Custom subtitle' });
    assert.ok(text.includes('Z') && text.includes('Q'));
    renderer.dispose();
    await Promise.resolve(); await Promise.resolve();
    assert.equal(frames.size, 0);
    assert.equal(disconnected, 1);
    assert.equal(removed, 1);
    reduced.matches = true;
    const second = mountGlobe(canvas, data, defaultPortfolio);
    second.dispose();
    assert.equal(frames.size, 0);
  } finally {
    for (const key of Object.keys(globals)) {
      if (originals[key]) Object.defineProperty(globalThis, key, originals[key]); else delete globalThis[key];
    }
  }
});
