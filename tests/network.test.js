import test from 'node:test';
import assert from 'node:assert/strict';
import { mountNetwork } from '../src/background/network.js';

test('network pauses for hidden tabs and reduced motion, and cleans up on remount', () => {
  const originals = Object.fromEntries(['window','document','requestAnimationFrame','cancelAnimationFrame'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const win = new EventTarget(), doc = new EventTarget(), reduced = new EventTarget();
  const frames = new Map(); let next = 0, draws = 0;
  reduced.matches = false; doc.hidden = false;
  Object.assign(win, { innerWidth: 800, innerHeight: 600, devicePixelRatio: 3, matchMedia: () => reduced });
  const ctx = new Proxy({ clearRect() { draws++; }, createRadialGradient: () => ({ addColorStop() {} }) }, { get: (target,key) => target[key] ?? (() => {}) });
  Object.assign(globalThis, { window: win, document: doc, requestAnimationFrame: callback => { frames.set(++next,callback); return next; }, cancelAnimationFrame: id => frames.delete(id) });
  const canvas = { getContext: () => ctx };
  try {
    const dispose = mountNetwork(canvas);
    assert.equal(canvas.width, 1600); assert.equal(frames.size, 1);
    doc.hidden = true; doc.dispatchEvent(new Event('visibilitychange')); assert.equal(frames.size, 0);
    doc.hidden = false; doc.dispatchEvent(new Event('visibilitychange')); assert.equal(frames.size, 1);
    reduced.matches = true; reduced.dispatchEvent(new Event('change')); assert.equal(frames.size, 0);
    reduced.matches = false; reduced.dispatchEvent(new Event('change')); assert.equal(frames.size, 1);
    dispose(); assert.equal(frames.size, 0);
    const count = draws; win.dispatchEvent(new Event('resize')); reduced.dispatchEvent(new Event('change'));
    assert.equal(draws, count); assert.equal(frames.size, 0);
    const disposeAgain = mountNetwork(canvas); assert.equal(frames.size, 1); disposeAgain(); assert.equal(frames.size, 0);
  } finally {
    for (const [key, descriptor] of Object.entries(originals)) {
      if (descriptor) Object.defineProperty(globalThis,key,descriptor); else delete globalThis[key];
    }
  }
});
