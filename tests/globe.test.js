import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { drawHorizonName } from '../src/globe/horizonName.js';
import { mountGlobe } from '../src/globe/renderer.js';
import { defaultPortfolio } from '../shared/portfolio.js';

test('real geographic layers render, profile updates, and unmount cancels animation', async () => {
  const names = ['world','cityTiers','rivers','borders','contestedBorders','terrain','urbanClusters','lakes','regionalBorders'];
  const data = Object.fromEntries(await Promise.all(names.map(async name => [name, JSON.parse(await readFile(new URL(`../public/data/${name}.json`, import.meta.url), 'utf8'))])));
  let disconnected = 0, removed = 0, frames = new Map(), next = 0, text = [], namePositions = [];
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({ measureText: s => ({ width: s.length * 12 }), fillText: (s, x, y) => { text.push(s); namePositions.push([s, x, y]); }, createLinearGradient: () => gradient, createRadialGradient: () => gradient }, { get: (target, key) => target[key] ?? (() => {}) });
  const reduced = { matches: false, addEventListener() {}, removeEventListener() { removed++; } };
  const globals = { window: { matchMedia: () => reduced }, document: { hidden: false, fonts: { load: async () => {} } }, devicePixelRatio: 1,
    ResizeObserver: class { observe() {} disconnect() { disconnected++; } },
    requestAnimationFrame: cb => { frames.set(++next, cb); return next; }, cancelAnimationFrame: id => frames.delete(id) };
  const originals = Object.fromEntries(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, globals);
  try {
    const canvas = { parentElement: { clientWidth: 1280, clientHeight: 720 }, getContext: () => ctx };
    drawHorizonName(ctx, 1280, 720, 1280 * 1.3, defaultPortfolio, 1500, reduced);
    const previewPositions = namePositions;
    namePositions = [];
    drawHorizonName(ctx, 1280, 720, 1280 * 1.3, defaultPortfolio, 1500, reduced, 1);
    assert.equal(namePositions.length, 0, 'fully lowered name no longer draws over secondary pages');
    namePositions = [];
    let completed = 0;
    const renderer = mountGlobe(canvas, data, defaultPortfolio, 'andromeda', { enabled: true, initialElapsed: 1500, onComplete: () => completed++ });
    assert.deepEqual(namePositions, previewPositions, 'loading and globe names have identical positions and hover phase');
    assert.equal(completed, 0);
    assert.equal(canvas.width, 1280);
    assert.equal(frames.size, 1);
    for (let timestamp = 0; timestamp < 3000; timestamp += 80) {
      const [id, callback] = frames.entries().next().value; frames.delete(id); callback(timestamp);
    }
    assert.equal(completed, 1, 'entrance completes exactly once');
    text = [];
    renderer.updateProfile({ firstName: 'Z', lastName: 'Q', subtitle: 'Custom subtitle' });
    assert.ok(text.includes('Z') && text.includes('Q'));
    renderer.dispose();
    await Promise.resolve(); await Promise.resolve();
    assert.equal(frames.size, 0);
    assert.equal(disconnected, 1);
    assert.equal(removed, 1);
    reduced.matches = true;
    const second = mountGlobe(canvas, data, defaultPortfolio, 'andromeda', { enabled: true, onComplete: () => completed++ });
    const [id, callback] = frames.entries().next().value; frames.delete(id); callback(0);
    assert.equal(completed, 2, 'reduced motion skips the rise on the first frame');
    second.dispose();
    assert.equal(frames.size, 0);
  } finally {
    for (const key of Object.keys(globals)) {
      if (originals[key]) Object.defineProperty(globalThis, key, originals[key]); else delete globalThis[key];
    }
  }
});
