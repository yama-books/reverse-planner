"""APP-004 M3 reversible image-fit experiments for UI review.

Outputs only derived candidate PNGs in review-v2 folders. No source overwrite.
The source-sheet cropping and background flood are deliberately conservative and
must receive a visual check before these candidates can be adopted.
"""
from collections import deque
from zipfile import ZipFile
from io import BytesIO
from pathlib import Path
from PIL import Image,ImageDraw,ImageOps
import csv,hashlib,subprocess,base64,json
P=Path
CAT_IDS=["RP-CATWORK-S09-I01","RP-CATWORK-S09-I03","RP-CATEMO-S10-I07","RP-CATVAR-S11-I28","RP-CATEMO-S10-I01"]
UI_IDS=["RP-PLAN-S02-I04","RP-PLAN-S02-I01","RP-TASK-S03-I01","RP-UI-S01-I05","RP-TIMER-S04-I01"]
def flood_background(im):
    rgb=im.convert("RGB")
    w,h=rgb.size
    px=rgb.load()
    mask=bytearray(w*h)
    for x in range(w):
        for y in (0,h-1):mask[y*w+x]=1
    for y in range(h):
        for x in (0,w-1):mask[y*w+x]=1
    q=deque((j%w,j//w) for j,a in enumerate(mask) if a)
    # Only very light and mildly tinted area outside line art may be background.
    def eligible(x,y):
        r,g,b=px[x,y]
        return (r>=208 and g>=201 and b>=174 and max(r,g,b)-min(r,g,b)<=76)
    # Don't accidentally flood through a dark outline.
    for x,y in tuple(q):
        if not eligible(x,y):mask[y*w+x]=0
    q=deque((j%w,j//w) for j,a in enumerate(mask) if a)
    while q:
        x,y=q.popleft()
        for a,b in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
            if 0<=a<w and 0<=b<h:
                n=b*w+a
                if not mask[n] and eligible(a,b):
                    mask[n]=1;q.append((a,b))
    raw=bytearray(255 if not a else 0 for a in mask)
    rgba=rgb.convert("RGBA");rgba.putalpha(Image.frombytes("L",(w,h),bytes(raw)))
    return rgba
def fit_to_canvas(rgba,side=256,content=216):
    a=rgba.getchannel("A")
    bbox=a.getbbox()
    assert bbox,(rgba.size,"empty alpha")
    crop=rgba.crop(bbox)
    factor=min(content/crop.width,content/crop.height)
    item=crop.resize((max(1,round(crop.width*factor)),max(1,round(crop.height*factor))),Image.Resampling.LANCZOS)
    out=Image.new("RGBA",(side,side),(0,0,0,0))
    out.alpha_composite(item,((side-item.width)//2,(side-item.height)//2))
    return out
def original_archive():
    prefix="assets/source-archive/icons/qc-v4/icons-qc-v4-196.zip.part"
    raw=b"".join(subprocess.check_output(["git","show",f"FETCH_HEAD:{prefix}{n:03d}"]) for n in range(1,18))
    assert hashlib.sha256(raw).hexdigest()=="f1b6c92264914de53b5755a0b356b1a4840b4c7492cd41869e3cb15cc37b24a2"
    return ZipFile(BytesIO(raw))
def read_manifest(path,field):
    with open(path,encoding="utf-8-sig",newline="") as f:
        return {r[field]:r for r in csv.DictReader(f)}
def source_cat(archive,files,coord,id):
    name=files[id]["元画像ファイル名"]
    paths=[n for n in archive.namelist() if n.endswith("/"+name)]
    assert len(paths)==1,(id,paths)
    original=Image.open(BytesIO(archive.read(paths[0]))).convert("RGB")
    x0,y0,x1,y1=map(int,coord[id]["アイコン領域XYXY"].split())
    # Expand bottom margin where sheets have actual pixels beyond older crop.
    # S11 next label starts immediately after old rectangle, hence no expansion.
    extra=0 if id=="RP-CATVAR-S11-I28" else (5 if id=="RP-CATEMO-S10-I07" else 18)
    area=original.crop((x0,y0,x1,min(y1+extra,original.height)))
    return area
def main():
    src=original_archive()
    reg=read_manifest("test-screenshots/m3-ICON_REGISTRY.csv","アイコンID")
    coord=read_manifest("test-screenshots/m3-CROP_COORDINATES.csv","アイコンID")
    catsOut=P("assets/icons/cats/review-v2");iconsOut=P("assets/icons/ui/review-v2")
    catsOut.mkdir(parents=True,exist_ok=True);iconsOut.mkdir(parents=True,exist_ok=True)
    preview=Image.new("RGB",(200*10,470),(246,242,233))
    d=ImageDraw.Draw(preview)
    metrics=[]
    for i,id in enumerate(CAT_IDS+UI_IDS):
        if i<5:
            base=Image.open("assets/icons/cats/"+id+".png").convert("RGBA")
            source=source_cat(src,reg,coord,id)
            rgba=fit_to_canvas(flood_background(source),256,210)
            location=catsOut/(id+".png")
        else:
            base=Image.open("test-screenshots/m3-ui-originals/"+id+".png").convert("RGBA")
            source=base
            rgba=fit_to_canvas(flood_background(source),128,104)
            location=iconsOut/(id+".png")
        rgba.save(location,optimize=True)
        alpha=rgba.getchannel("A")
        box=alpha.getbbox()
        original_bbox=base.getchannel("A").getbbox()
        assert box is not None and 0<box[0] and 0<box[1] and box[2]<rgba.width and box[3]<rgba.height,(id,box)
        report={"id":id,"candidate":str(location),"original_bbox":original_bbox,"new_bbox":box,"format":"RGBA","edge_alpha":0}
        metrics.append(report)
        print("M3_CANDIDATE",json.dumps(report,ensure_ascii=False))
        for j,(im,desc) in enumerate([(base,"BEFORE"),(rgba,"REVIEW")]):
            n=i*200
            tile=im.resize((146,146),Image.Resampling.NEAREST)
            bg=Image.new("RGBA",(146,146),(191,229,212,255) if i<5 else (57,113,91,255))
            bg.alpha_composite(tile)
            preview.paste(bg.convert("RGB"),(n+26,28+j*210))
            d.text((n+7,j*210+5),id.split("-S")[0]+" "+desc,fill=(40,50,43))
    (P("test-screenshots")/"m3-candidate-metrics.json").write_text(json.dumps(metrics,ensure_ascii=False,indent=2),encoding="utf8")
    buf=BytesIO();preview.save(buf,"PNG",optimize=True)
    print("M3_IMAGE_REPAIRS",base64.b64encode(buf.getvalue()).decode())
    preview.save(P("test-screenshots")/"m3-before-after.png",optimize=True)
    print("M3_IMAGE_REPAIRS_BYTES",len(buf.getvalue()))
if __name__=="__main__":main()
