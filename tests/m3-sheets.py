from zipfile import ZipFile
from io import BytesIO
from PIL import Image,ImageDraw
import csv,subprocess,base64,hashlib
p="assets/source-archive/icons/qc-v4/icons-qc-v4-196.zip.part"
blob=b"".join(subprocess.check_output(["git","show",f"FETCH_HEAD:{p}{j:03d}"]) for j in range(1,18))
assert hashlib.sha256(blob).hexdigest()=="f1b6c92264914de53b5755a0b356b1a4840b4c7492cd41869e3cb15cc37b24a2"
ids=["RP-CATWORK-S09-I01","RP-CATWORK-S09-I03","RP-CATEMO-S10-I07","RP-CATVAR-S11-I28","RP-CATEMO-S10-I01"]
registry={}
with open("test-screenshots/m3-ICON_REGISTRY.csv",encoding="utf-8-sig") as f:
    for row in csv.DictReader(f):registry[row["アイコンID"]]=row
coords={}
with open("test-screenshots/m3-CROP_COORDINATES.csv",encoding="utf-8-sig") as f:
    for row in csv.DictReader(f):coords[row["アイコンID"]]=row
sheet=Image.new("RGB",(5*350,560),(240,237,231)); d=ImageDraw.Draw(sheet)
with ZipFile(BytesIO(blob)) as archive:
    names=archive.namelist()
    for i,k in enumerate(ids):
        info=registry[k];n=info["元画像ファイル名"]
        match=[m for m in names if m.endswith("/"+n)]
        assert len(match)==1,(k,n,match)
        original=Image.open(BytesIO(archive.read(match[0]))).convert("RGB")
        x0,y0,x1,y1=map(int,coords[k]["アイコン領域XYXY"].split())
        margin=45
        box=(max(0,x0-margin),max(0,y0-margin),min(original.width,x1+margin),min(original.height,y1+margin))
        extended=original.crop(box)
        dr=ImageDraw.Draw(extended)
        dr.rectangle((x0-box[0],y0-box[1],x1-box[0],y1-box[1]),outline=(230,55,35),width=3)
        extended.thumbnail((330,480))
        sheet.paste(extended,(i*350+10,35))
        d.text((i*350+5,9),k,fill=(30,40,30))
        d.text((i*350+10,515),"Red rectangle = current crop",fill=(60,63,53))
        print("M3_ORIGINAL_SHEET",k,match[0],original.size,box)
b=BytesIO();sheet.save(b,"PNG",optimize=True)
print("M3_IMAGE_ORIGINAL_SHEETS",base64.b64encode(b.getvalue()).decode())
print("M3_IMAGE_ORIGINAL_SHEETS_BYTES",len(b.getvalue()))
