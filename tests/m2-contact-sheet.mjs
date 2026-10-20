/** QA contact sheet for original RGB icon crops and 64px user-facing draft assets. */
import {chromium} from "playwright";
import {mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
const icons=[
  ["RP-PLAN-S02-I04","時計 / HOME"],
  ["RP-PLAN-S02-I01","カレンダー / HOME"],
  ["RP-TASK-S03-I01","追加 / SETUP"],
  ["RP-UI-S01-I05","設定 / SETUP"],
  ["RP-TIMER-S04-I01","再生 / PLAN"]
];
const pageMarkup=`<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
*{box-sizing:border-box}body{margin:0;padding:22px;background:#F6F2E8;color:#36463E;font-family:system-ui,sans-serif}
h1{font-size:24px;margin:0 0 8px}p{font-size:13px;line-height:1.6;margin:0 0 16px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(290px,100%),1fr));gap:13px}
.card{border:2px solid #536A59;border-radius:12px;padding:12px;background:#FFFDF7}
.card h2{font-size:15px;margin:0 0 10px;overflow-wrap:anywhere}
.original{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.original img{width:100px;height:100px;object-fit:contain;flex:none}
.original span{font-size:11px}
.strip{display:flex;gap:3px;flex-wrap:wrap}
.cell{flex:1;min-width:72px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:5px;padding:9px 4px;border-radius:7px;}
.cell small{font-size:10px}.cell img{object-fit:contain}.cream{background:#F6F2E8}.mint{background:#BFE5D4}.charcoal{background:#36463E;color:#fff}
</style></head><body><h1>M2 操作アイコン候補 5点</h1><p>QC-v4 元画像。64pxは背景付きRGBで透過なし。絵柄・縁・視認性は未承認。24/32/64pxを背景3色で比較。</p><div class="grid">`+
icons.map(([id,label])=>`<section class="card"><h2>${id}<br>${label}</h2><div class="original"><img src="./m2-originals/${id}.png" alt=""><span>左：原画像256px候補<br>右：64pxを各表示寸法に縮小</span></div><div class="strip">`+
  ["cream","mint","charcoal"].map(bg=>`<div class="cell ${bg}">`+[24,32,64].map(size=>`<img src="../assets/icons/ui/${id}.png" style="width:${size}px;height:${size}px" alt=""><small>${size}px</small>`).join("")+`</div>`).join("")+
`</div></section>`).join("")+`</div></body></html>`;
await mkdir("test-screenshots",{recursive:true});
await writeFile("test-screenshots/m2-quality.html",pageMarkup,"utf8");
// Place under repository root so relative asset paths resolve for file:/// previews.
await writeFile("m2-icon-quality.local.html",pageMarkup.replaceAll('./m2-originals/','./test-screenshots/m2-originals/').replaceAll('../assets/icons/ui/','./assets/icons/ui/'),"utf8");
let browser;
try {
  browser=await chromium.launch({channel:"chrome",headless:true,args:["--no-sandbox"]});
  for(const width of [390,1000]){
    const page=await browser.newPage({viewport:{width,height:920},deviceScaleFactor:1});
    await page.goto(pathToFileURL(resolve("m2-icon-quality.local.html")).href);
    const imageStates=await page.locator(".card img").evaluateAll(images=>images.map(el=>({complete:el.complete,width:el.naturalWidth})));
    if(imageStates.length!==50||imageStates.some(x=>!x.complete||!x.width))
      throw new Error("M2 contact sheet has missing images: "+JSON.stringify(imageStates));
    const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:innerWidth}));
    if(dims.scroll>dims.view+2)throw Error("M2 contact sheet overflows "+width+"px: "+JSON.stringify(dims));
    await page.screenshot({path:"test-screenshots/m2-icon-quality-"+width+".png",fullPage:true});
    console.log("M2_CONTACT_SHEET "+width+"px 50/50 images visible, no overflow");
    await page.close();
  }
} finally {
  await browser?.close();
}
