"""Apply the requested India viewpoint to the existing Natural Earth snapshot.
Usage: python3 scripts/apply-kashmir-viewpoint.py /path/to/source-directory
The source directory must contain boundaries.json and disputed.json.
The feature IDs deliberately restrict this override to Kashmir/Ladakh.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# FCLASS_IN = Unrecognized: suppress internal control and alternate claim lines.
REMOVE = {1746705319, 1746709141, 1746708661, 1746708603, 1746708607,
          1746709133, 1746706305, 1746705543, 1746705409, 1746705451}
# FCLASS_IN = International boundary, plus the administered Demchok/Samdu
# perimeter segments (B03/B04) made solid to omit contested styling locally.
SOLID = {1746708757, 1746705415, 1746705471, 1746705439, 1746705479,
         1746705651, 1746708449, 1746708457}

def rounded(value):
    return [rounded(item) for item in value] if isinstance(value, list) else round(value, 4)

def geometry(feature):
    return {'type': feature['geometry']['type'], 'coordinates': rounded(feature['geometry']['coordinates'])}

def main():
    source = Path(sys.argv[1])
    regular, disputed, seen = [], [], set()
    original_regular, original_disputed = [], []
    for filename in ['boundaries.json', 'disputed.json']:
        for feature in json.loads((source / filename).read_text())['features']:
            props = feature['properties']
            item = geometry(feature)
            default_solid = filename == 'boundaries.json' and props['FEATURECLA'] == 'International boundary (verify)'
            (original_regular if default_solid else original_disputed).append(item)
            identifier = props['NE_ID']
            if identifier in REMOVE | SOLID:
                seen.add(identifier)
                if identifier in SOLID:
                    regular.append(item)
            else:
                (regular if default_solid else disputed).append(item)
    assert seen == REMOVE | SOLID, 'Source snapshot lacks expected boundary features'
    outputs = [('borders', original_regular, regular), ('contestedBorders', original_disputed, disputed)]
    for name, original, updated in outputs:
        current = json.loads((ROOT / f'public/data/{name}.json').read_text())['geometries']
        assert current in (original, updated), f'{name}: source mismatch; refusing to overwrite unrelated edits'
    for name, _, updated in outputs:
        (ROOT / f'public/data/{name}.json').write_text(json.dumps({'type': 'GeometryCollection', 'geometries': updated}, separators=(',', ':')))
    print(f'Removed {len(REMOVE)} internal/alternate lines; made {len(SOLID)} outer boundary segments solid.')

if __name__ == '__main__':
    main()
