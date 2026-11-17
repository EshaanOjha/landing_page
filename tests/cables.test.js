import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { geoSatellite } from 'd3-geo-projection';
import { createCableLayer } from '../src/globe/cables.js';

test('cable flow stays clipped and reduced motion renders only static routes', () => {
  const projection = geoSatellite().distance(1.12).clipAngle(26).scale(100).translate([200,200]);
  let dots = 0, lines = 0;
  const ctx = new Proxy({arc(){dots++;},lineTo(){lines++;}}, {get:(target,key)=>target[key]??(()=>{})});
  const route = (id, coordinates) => ({id, geometry:{type:'MultiLineString',coordinates:[coordinates]},landings:[{coordinates:coordinates[0]}]});
  const near = route('near',[[-3,0],[3,0]]);
  const far = route('far',[[177,0],[179,0]]);
  const layer=createCableLayer(ctx,projection,[near,far]);
  layer.draw(9000,true);
  assert.equal(dots,1,'only the near-side landing should be drawn');
  const staticLines = lines;
  lines = 0;
  layer.draw(9000,false);
  assert.ok(lines > staticLines,'all routes get flowing trails without selection');
  lines = 0; dots = 0;
  createCableLayer(ctx,projection,[far]).draw(9000,false);
  assert.equal(lines,0,'far-side routes and packet trails remain clipped');
  assert.equal(dots,0);
});

test('archived India routes contain real route geometry and landing metadata', () => {
  const routes=JSON.parse(readFileSync(new URL('../public/data/cables/routes.json',import.meta.url)));
  assert.equal(routes.length,5);
  for(const route of routes){
    assert.ok(route.name && route.length);
    assert.ok(route.landings.some(point=>point.name.includes('India')));
    assert.ok(route.geometry.coordinates.some(line=>line.length>10));
    for(const line of route.geometry.coordinates) for(const [lon,lat] of line) {
      assert.ok(Number.isFinite(lon)&&Math.abs(lon)<=180);
      assert.ok(Number.isFinite(lat)&&Math.abs(lat)<=90);
    }
  }
});

test('city network includes every supplied capital and city without duplicate links', async () => {
  const { createCityRoutes, cityNetworkNodes } = await import('../src/globe/cityNetwork.js');
  const tiers = JSON.parse(readFileSync(new URL('../public/data/cityTiers.json',import.meta.url)));
  const hubs = JSON.parse(readFileSync(new URL('../src/globe/cityHubs.json',import.meta.url)));
  const nodes = cityNetworkNodes(tiers);
  const routes = createCityRoutes(tiers);
  const prepared = JSON.parse(readFileSync(new URL('../src/globe/cityRoutes.json', import.meta.url)));
  assert.deepEqual(prepared, routes, 'precomputed startup routes match the generator');
  assert.ok(nodes.length >= 1080);
  assert.ok(hubs.filter(h => h.capital).length >= 200);
  const endpoints = new Set(), edges = new Set();
  for (const route of routes) {
    const ends = route.geometry.coordinates[0].map(JSON.stringify);
    ends.forEach(end => endpoints.add(end));
    const key = ends.sort().join('|');
    assert.ok(!edges.has(key)); edges.add(key);
  }
  for (const point of nodes) assert.ok(endpoints.has(JSON.stringify(point)));
  for (const hub of hubs) assert.ok(endpoints.has(JSON.stringify(hub.coordinates)));
  assert.ok(routes.length <= nodes.length * 2);
});
