#!/usr/bin/env python3
"""APP-004 M3 alpha/bounds/contrast candidate audit, all files read only.

This audit does not certify semantic image quality or replace human review.
It verifies that candidates have visible pixel art, safe margins, meaningful
alpha, no opaque tile, and preserves source/render comparison across 3 colors.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
from collections import deque
import json,math,hashlib

ROOT=Path(__file__).resolve().parent.parent
CATS=["RP-CATWORK-S09-I01","RP-CATWORK-S09-I03","RP-CATEMO-S10-I07","RP-CATVAR-S11-I28","RP-CATEMO-S10-I01"]
UI=["RP-PLAN-S02-I04","RP-PLAN-S02-I01","RP-TASK-S03-I01","RP-UI-S01-I05","RP-TIMER-S04-I01"]
BACKGROUND={"cream":(246,242,232,255),"mint":(191,229,212,255),"peach":(250,211,201,255),"green":(57,113,91,255),"charcoal":(54,70,62,255)}
def measure(path,side,minimum_gap):
    data=path.read_bytes()
    img=Image.open(path)
    assert img.mode=="RGBA",(path,img.mode)
    assert img.size==(side,side),(path,img.size)
    alpha=img.getchannel("A")
    box=alpha.getbbox()
    assert box,(path,"no visible artwork")
    margins=(box[0],box[1],side-box[2],side-box[3])
    assert min(margins)>=minimum_gap,(path,"possibly cropped",box,margins)
    assert all(alpha.getpixel((x,0))==alpha.getpixel((x,side-1))==0 for x in range(side))
    assert all(alpha.getpixel((0,y))==alpha.getpixel((side-1,y))==0 for y in range(side))
    hist=alpha.histogram()
    opaque=sum(hist[240:]); transparent=hist[0]
    assert opaque>side*side*.055,(path,"foreground too small",opaque)
    assert transparent>side*side*.13,(path,"opaque rectangular plate",transparent)
    # alpha=0 under the corners proves the button color can show through.
    for x,y in ((1,1),(side-2,1),(1,side-2),(side-2,side-2)):
        assert alpha.getpixel((x,y))==0,(path,"corner has background artifact",x,y)
    pixels=img.load()
    dark=sum(1 for y in range(box[1],box[3]) for x in range(box[0],box[2])
             if pixels[x,y][3]>220 and min(pixels[x,y][:3])<100)
    assert dark>max(50,side*1.2),(path,"pixel outline mostly absent",dark)
    return {"id":path.stem,"width":side,"bbox":box,"margins":margins,
            "transparent_pct":round(transparent*100/(side*side),1),
            "opaque_pct":round(opaque*100/(side*side),1),
            "dark_outline_pixels":dark,"sha256":hashlib.sha256(data).hexdigest()}
def composite(img,color,size):
    tile=img.resize((size,size),Image.Resampling.NEAREST)
    canvas=Image.new("RGBA",(size,size),color)
    canvas.alpha_composite(tile)
    return canvas.convert("RGB")
def collage(rows,title,outdir):
    backgrounds=["cream","mint","peach","green","charcoal"]
    tile=142;cell_w=170
    h=65+len(rows)*190;w=180+cell_w*len(backgrounds)
    result=Image.new("RGB",(w,h),(245,242,232))
    dr=ImageDraw.Draw(result)
    dr.text((10,12),title,fill=(39,60,45))
    for col,name in enumerate(backgrounds):
        dr.text((180+col*cell_w,37),name,fill=(43,62,50))
    for row,(id,path) in enumerate(rows):
        dr.text((6,88+row*190),id,fill=(39,60,45))
        rgba=Image.open(path).convert("RGBA")
        for col,name in enumerate(backgrounds):
            result.paste(composite(rgba,BACKGROUND[name],tile),(180+col*cell_w,60+row*190))
    result.save(outdir/("m3-quality-"+title.lower().replace(" ","-")+".png"),optimize=True)

def main():
    output=ROOT/"test-screenshots";output.mkdir(exist_ok=True)
    catalog=[]
    cats=[]
    for id in CATS:
        path=ROOT/"assets/icons/cats/review-v2"/(id+".png")
        catalog.append(measure(path,256,12));cats.append((id,path))
    ui=[]
    for id in UI:
        path=ROOT/"assets/icons/ui/review-v2"/(id+".png")
        catalog.append(measure(path,128,8));ui.append((id,path))
    collage(cats,"CATS FIVE BACKGROUNDS",output)
    collage(ui,"UI FIVE BACKGROUNDS",output)
    (output/"m3-alpha-audit.json").write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    for row in catalog:print("M3_ALPHA_AUDIT",json.dumps(row,ensure_ascii=False))
    print("M3_ALPHA_GATE",len(catalog),"of 10 valid RGBA assets; five backgrounds exported")
if __name__=="__main__":main()
