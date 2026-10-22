"""Pixel/alpha evidence for M5 draft candidates. Does not modify the assets."""
from pathlib import Path
from PIL import Image,ImageDraw
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
# The M5 refinement leaves the five review-v1 source files untouched and
# tests the two distinct derived candidates rather than overwriting originals.
pairs=[
 ("exam",Path("assets/icons/presets/review-v1/exam.png"),Path("assets/icons/presets/review-v2/exam.png")),
 ("sparkle",Path("assets/icons/decor/review-v1/sparkle.png"),Path("assets/icons/decor/review-v2/sparkle.png"))
]
checks=[]
for name,src,dst in pairs:
 before=Image.open(src).convert("RGBA");after=Image.open(dst).convert("RGBA")
 b1=before.getchannel("A").getbbox();b2=after.getchannel("A").getbbox()
 assert after.mode=="RGBA" and after.size==(128,128)
 assert b2 is not None and all(after.getchannel("A").getpixel(c)==0 for c in ((0,0),(127,0),(0,127),(127,127)))
 assert min(b2[0],b2[1],128-b2[2],128-b2[3])>=12
 w1,w2=b1[2]-b1[0],b2[2]-b2[0]
 cx,cy=(b2[0]+b2[2])/2,(b2[1]+b2[3])/2
 assert abs(cx-64)<=1 and abs(cy-64)<=1,(name,cx,cy)
 if name=="exam":
  assert w2>=w1+14,(name,w1,w2)
 else:
  assert (b2[2]-b2[0],b2[3]-b2[1])==(b1[2]-b1[0],b1[3]-b1[1]),"sparkle was resized or repainted"
 record={"id":name,"before_bounds":b1,"after_bounds":b2,"before_width":w1,"after_width":w2,"center":[cx,cy]}
 checks.append(record);rows.append({"path":dst.as_posix(),"size":after.size,"alpha_bounds":b2,"source":src.as_posix(),"normalized":True})
 print("M5_NORMALIZATION_PASS",json.dumps(record,ensure_ascii=False))
# Visual review: actual 24px and 40px drawn on mint and charcoal, all source art preserved.
canvas=Image.new("RGB",(960,500),(246,242,232))
d=ImageDraw.Draw(canvas)
d.text((16,12),"M5 review-v1 -> review-v2 : actual transparent artwork",fill=(23,62,67))
backgrounds=[("mint",(191,229,212)),("charcoal",(54,70,62))]
for i,(name,src,dst) in enumerate(pairs):
 y=45+i*220
 d.text((16,y),name.upper(),fill=(23,62,67))
 for j,(bg,color) in enumerate(backgrounds):
  for k,(label,path) in enumerate((("old",src),("new",dst))):
   x=125+j*410+k*194
   tile=Image.new("RGBA",(180,162),(*color,255))
   raw=Image.open(path).convert("RGBA")
   for p,size in enumerate((24,40)):
    art=raw.resize((size,size),Image.Resampling.NEAREST)
    tile.alpha_composite(art,(25+p*72,45))
   canvas.paste(tile.convert("RGB"),(x,y+10))
   d.text((x+8,y+173),bg+" / "+label+" : 24px | 40px",fill=(23,62,67))
canvas.save(out/"m5-v1-v2-normalization.png",optimize=True)
(out/"normalization-report.json").write_text(json.dumps(checks,indent=2)+"\n")

(out/'alpha-report.json').write_text(json.dumps(rows,indent=2)+'\n')
print('M5_ALPHA_PASS 5 RGBA 128x128 PNGs; alpha 0..255; corners transparent; padded silhouettes')
