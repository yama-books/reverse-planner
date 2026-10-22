"""Pixel/alpha evidence for M5 draft candidates. Does not modify the assets."""
from pathlib import Path
from PIL import Image
import json
files=sorted(Path('assets/icons/presets/review-v1').glob('*.png'))+sorted(Path('assets/icons/decor/review-v1').glob('*.png'))
assert len(files)==5
rows=[]
for p in files:
 im=Image.open(p)
 assert im.mode=='RGBA' and im.size==(128,128), str(p)
 alpha=im.getchannel('A')
 assert alpha.getextrema()==(0,255), str(p)
 assert all(alpha.getpixel(pt)==0 for pt in [(0,0),(127,0),(0,127),(127,127)]), str(p)
 bounds=alpha.getbbox()
 assert bounds and min(bounds[:2])>=8 and max(bounds[2:])<=120, str(p)
 rows.append({'path':p.as_posix(),'size':im.size,'alpha_range':alpha.getextrema(),'alpha_bounds':bounds,'corners_transparent':True})
out=Path('test-screenshots/m5');out.mkdir(parents=True,exist_ok=True)
(out/'alpha-report.json').write_text(json.dumps(rows,indent=2)+'\n')
print('M5_ALPHA_PASS 5 RGBA 128x128 PNGs; alpha 0..255; corners transparent; padded silhouettes')
