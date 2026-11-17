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
