import test from 'node:test';
import assert from 'node:assert/strict';
import { clientDestination } from '../src/routing.js';
const current = 'https://portfolio.test/about';
const anchor = (href, options = {}) => ({ href, target: '', hasAttribute: () => false, ...options });
const click = { button: 0 };
test('portfolio navigation is intercepted while anchors, external links and downloads remain native', () => {
  for (const path of ['/', '/about', '/projects', '/contact']) {
    assert.equal(clientDestination(anchor(path), click, current).pathname, path);
  }
  assert.equal(clientDestination(anchor('/about#connect'), click, 'https://portfolio.test/').pathname, '/contact');
  for (const href of ['mailto:test@example.com', 'https://github.com/EshaanOjha', '/certificates/cs50x.pdf', '/about#focus']) {
    assert.equal(clientDestination(anchor(href), click, current), null);
  }
  assert.equal(clientDestination(anchor('/'), { button: 0, ctrlKey: true }, current), null);
  assert.equal(clientDestination(anchor('/', { target: '_blank' }), click, current), null);
  assert.equal(clientDestination(anchor('/', { hasAttribute: () => true }), click, current), null);
});
