"""APP-004 M5: derive two reversible composition-normalized candidates.

Pixel artwork is not repainted. The original review-v1 PNGs are retained byte for byte.
Output files are always in review-v2 so reviewers can compare and roll back.
"""
from pathlib import Path
from PIL import Image
import json
BASE=Path(__file__).resolve().parents[1]
def normalized(source,output,target_size):
    img=Image.open(BASE/source).convert("RGBA")
    assert img.size==(128,128)
    bounds=img.getchannel("A").getbbox()
    assert bounds is not None
    crop=img.crop(bounds)
    if target_size is None:
        w,h=crop.size
        # Move the existing sparkle without scaling or repainting.
        piece=crop
    else:
        factor=target_size / crop.width
        w,h=round(crop.width*factor),round(crop.height*factor)
        piece=crop.resize((w,h),Image.Resampling.NEAREST)
    assert max(w,h)<=104,(source,w,h)
    result=Image.new("RGBA",(128,128),(0,0,0,0))
    result.alpha_composite(piece,((128-w)//2,(128-h)//2))
    out=BASE/output
    out.parent.mkdir(parents=True,exist_ok=True)
    result.save(out,optimize=True)
    box=result.getchannel("A").getbbox()
    assert box and min(box[0],box[1],128-box[2],128-box[3])>=12
    return {"src":str(source),"out":str(output),"before_bbox":bounds,"after_bbox":box,"before_px":(bounds[2]-bounds[0],bounds[3]-bounds[1]),"after_px":(box[2]-box[0],box[3]-box[1])}
items=[
 normalized(Path("assets/icons/presets/review-v1/exam.png"),Path("assets/icons/presets/review-v2/exam.png"),67),
 normalized(Path("assets/icons/decor/review-v1/sparkle.png"),Path("assets/icons/decor/review-v2/sparkle.png"),None)
]
for item in items:print("M5_NORMALIZED",json.dumps(item,ensure_ascii=False))
