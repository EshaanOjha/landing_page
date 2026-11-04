"""Apply the requested India viewpoint to the existing Natural Earth snapshot.
Usage: python3 scripts/apply-kashmir-viewpoint.py /path/to/source-directory
The source directory must contain boundaries.json and disputed.json.
The feature IDs restrict this override to Kashmir/Ladakh and Arunachal Pradesh.
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

# Arunachal Pradesh: solid northern perimeter; omit the alternate claim line.
ARUNACHAL_REMOVE = {1746705431}
ARUNACHAL_SOLID = {1746705337}

def rounded(value):
    return [rounded(item) for item in value] if isinstance(value, list) else round(value, 4)

def geometry(feature):
    return {'type': feature['geometry']['type'], 'coordinates': rounded(feature['geometry']['coordinates'])}

def main():
    source = Path(sys.argv[1])
    regular, disputed, seen = [], [], set()
    original_regular, original_disputed = [], []
    previous_regular, previous_disputed = [], []
    for filename in ['boundaries.json', 'disputed.json']:
        for feature in json.loads((source / filename).read_text())['features']:
            props = feature['properties']
            item = geometry(feature)
            default_solid = filename == 'boundaries.json' and props['FEATURECLA'] == 'International boundary (verify)'
            (original_regular if default_solid else original_disputed).append(item)
            identifier = props['NE_ID']
            if identifier not in REMOVE:
                (previous_regular if identifier in SOLID or default_solid else previous_disputed).append(item)
            if identifier in REMOVE | SOLID | ARUNACHAL_REMOVE | ARUNACHAL_SOLID:
                seen.add(identifier)
                if identifier in SOLID | ARUNACHAL_SOLID:
                    regular.append(item)
            else:
                (regular if default_solid else disputed).append(item)
    assert seen == REMOVE | SOLID | ARUNACHAL_REMOVE | ARUNACHAL_SOLID, 'Source snapshot lacks expected boundary features'
    outputs = [('borders', original_regular, previous_regular, regular), ('contestedBorders', original_disputed, previous_disputed, disputed)]
    for name, original, previous, updated in outputs:
        current = json.loads((ROOT / f'public/data/{name}.json').read_text())['geometries']
        assert current in (original, previous, updated), f'{name}: source mismatch; refusing to overwrite unrelated edits'
    for name, _, _, updated in outputs:
        (ROOT / f'public/data/{name}.json').write_text(json.dumps({'type': 'GeometryCollection', 'geometries': updated}, separators=(',', ':')))
    print(f'Removed {len(REMOVE | ARUNACHAL_REMOVE)} internal/alternate lines; made {len(SOLID | ARUNACHAL_SOLID)} outer boundary segments solid.')

if __name__ == '__main__':
    main()
