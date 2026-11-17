"""Build a small historical cable dataset from the CC BY-NC-SA 3.0 archive."""
import json
from urllib.request import urlopen
from pathlib import Path
BASE='https://raw.githubusercontent.com/stevesong/open_undersea_cable_map/e7903491e73bcac0d0b013b945897d10928483c4/'
IDS=['imewe','seamewe-4','europe-india-gateway-eig','i2i-cable-network-i2icn','tata-tgn-tata-indicom']
def read(path):
    with urlopen(BASE+path) as response: return json.load(response)
routes=read('cable/cable-geo.json')['features']
landings={f['properties']['id']:f for f in read('landing-point/landing-point-geo.json')['features']}
result=[]
for identifier in IDS:
    meta=read('cable/'+identifier+'.json')
    assert not meta['is_planned']
    features=[f for f in routes if f['properties']['id']==identifier]
    coords=[line for f in features for line in f['geometry']['coordinates']]
    assert coords
    result.append({'id':identifier,'name':meta['name'],'length':meta['length'],
      'geometry':{'type':'MultiLineString','coordinates':coords},
      'landings':[{'name':p['name'],'coordinates':landings[p['id']]['geometry']['coordinates']} for p in meta['landing_points']]})
root=Path(__file__).resolve().parents[1]
(root/'public/data/cables/routes.json').write_text(json.dumps(result,separators=(',',':')))
print('Saved',len(result),'historical cable routes')
