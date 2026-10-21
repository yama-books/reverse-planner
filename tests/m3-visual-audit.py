"""APP-004 visual M3 source diagnostics. Original PNGs are never modified."""
from PIL import Image,ImageOps,ImageDraw,ImageFont
from pathlib import Path
from io import BytesIO
import base64,json
CAT_IDS=["RP-CATWORK-S09-I01","RP-CATWORK-S09-I03","RP-CATEMO-S10-I07","RP-CATVAR-S11-I28","RP-CATEMO-S10-I01"]
UI_IDS=["RP-PLAN-S02-I04","RP-PLAN-S02-I01","RP-TASK-S03-I01","RP-UI-S01-I05","RP-TIMER-S04-I01"]
def a_bounds(im):
    rgba=im.convert("RGBA")
    a=rgba.getchannel("A")
    return a.getbbox(),[sum(1 for x in range(a.width) if a.getpixel((x,y))>64) for y in list(range(8))+list(range(a.height-8,a.height))]
def fg_bounds(im):
    rgb=im.convert("RGB")
    base=rgb.getpixel((0,0))
    px=rgb.load(); xmin=rgb.width;ymin=rgb.height;xmax=-1;ymax=-1
    counts=[]
    for y in range(rgb.height):
        cnt=0
        for x in range(rgb.width):
            a=px[x,y]
            if sum(abs(a[i]-base[i]) for i in range(3))>=65:
                cnt+=1
                xmin=min(xmin,x);ymin=min(ymin,y);xmax=max(xmax,x);ymax=max(ymax,y)
        counts.append(cnt)
    return {"background":base,"bbox":(xmin,ymin,xmax+1,ymax+1),"top":counts[:10],"bottom":counts[-10:]}
def text(draw,xy,t,color=(33,40,37)):draw.text(xy,t,fill=color)
def make_grid(ids,folder,kind):
    tile=190
    canvas=Image.new("RGB",(tile*5,260),(245,242,231))
    d=ImageDraw.Draw(canvas)
    for i,ident in enumerate(ids):
        f=Path(folder)/(ident+".png")
        im=Image.open(f)
        stat={"id":ident,"mode":im.mode,"size":im.size}
        if kind=="cat":
            bbox,slices=a_bounds(im)
            stat.update(bbox=bbox,topBottomCounts=slices,edgeBottomAlpha=sum(slices[-3:]))
        else: stat.update(fg_bounds(im))
        print("M3_SOURCE_DIAG "+json.dumps(stat,ensure_ascii=False))
        preview=im.convert("RGBA").resize((155,155),Image.Resampling.NEAREST)
        if kind=="cat":
            bg=Image.new("RGBA",(155,155),(191,229,212,255))
            bg.alpha_composite(preview)
            preview=bg.convert("RGB")
        canvas.paste(preview,(i*tile+17,25))
        text(d,(i*tile+5,5),ident.split("-S")[0],(45,61,50))
        text(d,(i*tile+5,190),ident.split("-")[-1]+"  "+str(stat.get("bbox")),(45,61,50))
        if kind=="ui":
            im2=im.resize((64,64),Image.Resampling.LANCZOS)
            canvas.paste(im2,(i*tile+65,210))
    return canvas
def emit_image(name,img):
    buf=BytesIO()
    img.save(buf,"PNG",optimize=True)
    payload=base64.b64encode(buf.getvalue()).decode()
    print("M3_IMAGE_"+name+" "+payload)
    print("M3_BYTES_"+name,len(buf.getvalue()))
cats=make_grid(CAT_IDS,"assets/icons/cats","cat")
icons=make_grid(UI_IDS,"test-screenshots/m3-ui-originals","ui")
emit_image("CATS",cats)
emit_image("ICONS",icons)
# Scan existing complete screen screenshots to independently inspect vertical display.
screens=["home-390","setup-mobile","clock-plan-mobile","timer-mobile","done-mobile"]
card=Image.new("RGB",(5*225,630),(246,242,233))
d=ImageDraw.Draw(card)
for i,name in enumerate(screens):
    im=Image.open("test-screenshots/m3-before/"+name+".png")
    # Preserve entire screenshot to make bottom artifact visible if present.
    im.thumbnail((218,570),Image.Resampling.LANCZOS)
    card.paste(im,(i*225+(225-im.width)//2,27))
    d.text((i*225+6,5),name,fill=(36,52,42))
emit_image("SCREENS",card)
