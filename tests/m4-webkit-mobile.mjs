// APP-004 M4: Linux WebKit mobile-viewport regression, not a physical iPhone test.
import {webkit,devices} from "playwright";
import {createServer} from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname} from "node:path";
import {fileURLToPath} from "node:url";
import assert from "node:assert/strict";

const ROOT=resolve(fileURLToPath(new URL("..",import.meta.url)));
const screenshots=resolve(ROOT,"test-screenshots/m4");
await mkdir(screenshots,{recursive:true});
const types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".png":"image/png",".json":"application/json"};
const server=createServer(async(req,res)=>{
  const url=new URL(req.url,"http://127.0.0.1");
  const file=resolve(ROOT,"."+(url.pathname==="/"?"/index.html":url.pathname));
  if(!file.startsWith(ROOT+"/")){res.writeHead(403).end();return}
  try{
    res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":"no-store"});
    res.end(await readFile(file));
  }catch{res.writeHead(404).end("Not found")}
});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
const url="http://127.0.0.1:"+server.address().port+"/";
const datestring=d=>{
  const p=n=>String(n).padStart(2,"0");
  return [d.getFullYear(),p(d.getMonth()+1),p(d.getDate())].join("-")+"T"+p(d.getHours())+":"+p(d.getMinutes());
};
let browser;
const checks=[],screens=[],issues=[],measurements=[];
const check=(condition,label,details)=>{assert.ok(condition,label+(details?" "+JSON.stringify(details):""));checks.push(label);};
const collect=async(page,stage,width)=>{
  await page.setViewportSize({width,height:844});
  // WebKit may retain CSS screen-in translation for a frame after a route
  // becomes visible. Check layout only once its actual onscreen position settles.
  await page.waitForFunction(()=>{
    const visible=[...document.querySelectorAll(".screen")].find(s=>!s.hidden);
    if(!visible)return false;
    const rect=visible.getBoundingClientRect();
    return Math.abs(rect.left-(innerWidth-rect.width)/2)<1.5;
  },null,{timeout:6000});
  const data=await page.evaluate(()=>{
    const v=document.documentElement;
    const loc=[...document.querySelectorAll('.screen')].find(s=>!s.hidden);
    const buttons=[...loc.querySelectorAll("button,summary")].filter(el=>{
      let rect=el.getBoundingClientRect();
      return rect.width>0&&rect.height>0
    }).map(el=>{
      const r=el.getBoundingClientRect();
      return {name:(el.id||el.getAttribute("data-choose-scale")||el.textContent.trim()).slice(0,35),width:Math.round(r.width),height:Math.round(r.height)}
    });
    const cats=[...loc.querySelectorAll("[data-cat-slot]")].filter(x=>!x.hidden).map(el=>{
      const i=el.querySelector("img"),r=i?.getBoundingClientRect();
      return {slot:el.dataset.catSlot,valid:!!i?.complete&&i.naturalWidth===256,
        width:Math.round(r?.width||0),height:Math.round(r?.height||0)}
    });
    const icons=[...loc.querySelectorAll("img.m2-icon[data-m2-icon]")].filter(i=>!i.hidden).map(i=>{
      let b=i.closest("button,summary"),a=i.getBoundingClientRect(),p=b?.getBoundingClientRect();
      return {src:i.src.split("/").at(-1),loaded:i.complete&&i.naturalWidth===128,
        fits:!!p&&a.top>=p.top-1&&a.bottom<=p.bottom+1&&a.left>=p.left-1&&a.right<=p.right+1,
        transparent:getComputedStyle(i).backgroundColor==="rgba(0, 0, 0, 0)"}
    });
    const overflowElements=[...document.querySelectorAll("body *")].filter(el=>{
      const r=el.getBoundingClientRect(),css=getComputedStyle(el);
      return css.display!=="none"&&r.width>0&&r.height>0&&(r.right>innerWidth+2||r.left< -2)
    }).slice(0,14).map(el=>{
      let r=el.getBoundingClientRect();
      return {tag:el.tagName,cls:typeof el.className==="string"?el.className.slice(0,70):"",id:el.id,
        right:Math.round(r.right),left:Math.round(r.left),width:Math.round(r.width)};
    });
    return {viewport:innerWidth,scroll:v.scrollWidth,stage:loc?.id,cats,icons,buttons,overflowElements,
      textScale:getComputedStyle(document.documentElement).fontSize};
  });
  if(data.scroll>data.viewport+2)console.warn("M4_OVERFLOW_DIAGNOSTIC "+JSON.stringify({stage,width,...data}));
  check(data.scroll<=data.viewport+2,stage+" no page horizontal clipping at "+width,data);
  check(data.cats.length===1&&data.cats.every(x=>x.valid&&x.width>0),
    stage+" correct decorative cat displayed at "+width,data.cats);
  check(data.icons.every(x=>x.loaded&&x.fits&&x.transparent),
    stage+" loaded icons fit original controls at "+width,data.icons);
  if(["setup","setup-added"].includes(stage)){
    const chips=data.buttons.filter(x=>/^(5分|10分|15分|30分|60分|☕|✿|✎|▦)/.test(x.name));
    check(chips.every(x=>x.height>=44),stage+" template and duration choices are at least 44px tall",chips);
  }
  if(stage==="setup-added"){
    const rowActions=data.buttons.filter(x=>["↑","↓","×"].includes(x.name));
    check(rowActions.length===3&&rowActions.every(x=>x.width>=44&&x.height>=44),
      "Mobile reorder and delete actions have usable 44px touch targets",rowActions);
  }
  measurements.push({stage,width,...data});
  await page.screenshot({path:resolve(screenshots,stage+"-"+width+".png"),fullPage:true,animations:"disabled"});
  screens.push(stage+"-"+width+".png");
  return data;
};
try{
  browser=await webkit.launch({headless:true});
  const device=devices["iPhone 13"];
  if(!device)throw Error("Expected Playwright iPhone 13 device descriptor");
  const context=await browser.newContext({...device,viewport:{width:390,height:844},locale:"ja-JP",timezoneId:"Asia/Tokyo",reducedMotion:"reduce"});
  const page=await context.newPage();
  page.on("pageerror",e=>issues.push(e.message));
  await page.goto(url);
  await page.locator('[data-cat-slot="home"]').waitFor({state:"visible"});
  await page.locator(".choice-card").first().locator("img").evaluate(x=>x.decode());
  check(await page.locator(".choice-card").count()===2,"WebKit home choices present");
  for(const w of [320,390,428])await collect(page,"home",w);
  await page.setViewportSize({width:390,height:844});
  await page.locator('[data-choose-scale="clock"]').tap();
  await page.locator("#screen-setup").waitFor({state:"visible"});
  await page.locator('[data-cat-slot="setup"]').waitFor({state:"visible"});
  for(const w of [320,390])await collect(page,"setup",w);
  await page.setViewportSize({width:390,height:844});
  await page.locator("#advanced-settings summary").tap();
  check(await page.locator("#advanced-settings").evaluate(x=>x.open),"WebKit details summary touch opens");
  await page.locator("#advanced-settings summary").tap();
  check(!await page.locator("#advanced-settings").evaluate(x=>x.open),"WebKit details summary touch closes");
  const deadline=await page.evaluate(()=>{const d=new Date(Date.now()+5*3600_000);const p=n=>String(n).padStart(2,"0");return [d.getFullYear(),p(d.getMonth()+1),p(d.getDate())].join("-")+"T"+p(d.getHours())+":"+p(d.getMinutes())});
  await page.locator("#clock-deadline").fill(deadline);
  await page.locator("#new-task-name").fill("WebKitの確認");
  await page.locator("#new-task-minutes").fill("30");
  await page.locator(".add-submit").tap();
  check(await page.locator("#task-list .task-row").count()===1,"WebKit touch adds task");
  await collect(page,"setup-added",390);
  await collect(page,"setup-added",320);
  await page.setViewportSize({width:390,height:844});
  await page.locator("#make-plan").tap();
  await page.locator("#screen-plan").waitFor({state:"visible"});
  await page.locator('[data-cat-slot="plan"]').waitFor({state:"visible"});
  check(await page.locator("#start-plan").isEnabled(),"WebKit feasible plan enables start");
  for(const w of [320,390])await collect(page,"plan",w);
  await page.setViewportSize({width:390,height:844});
  await page.locator("#start-plan").tap();
  await page.locator("#screen-run").waitFor({state:"visible"});
  await page.locator('[data-cat-slot="run"]').waitFor({state:"visible"});
  for(const w of [320,390])await collect(page,"run",w);
  await page.setViewportSize({width:390,height:844});
  await page.locator('[data-run="start"]').tap();
  check(await page.locator("#timer-clock").isVisible(),"WebKit touch starts timer");
  await page.locator('[data-run="done"]').tap();
  await page.locator('[data-cat-slot="done"]').waitFor({state:"visible"});
  check((await page.locator("#run-title").textContent()).includes("全部できた"),"WebKit completion heading matches the DONE state");
  check(await page.locator('[data-cat-slot="run"]').isHidden(),"WebKit hides running cat on completion");
  for(const w of [320,390])await collect(page,"done",w);
  await page.reload();
  await page.locator("#screen-run").waitFor({state:"visible"});
  check((await page.locator("#focus-task").textContent()).includes("全部できた"),"WebKit storage restores DONE after reload");
  // Text size accessibility approximation: browser CSS typography enlargement,
  // NOT actual system-level iOS Dynamic Type.
  const large=await browser.newContext({...device,viewport:{width:320,height:844},locale:"ja-JP",reducedMotion:"reduce"});
  const larger=await large.newPage();
  larger.on("pageerror",e=>issues.push(e.message));
  await larger.goto(url);
  await larger.addStyleTag({content:"html{font-size:200% !important;} body{font-size:200% !important;} .choice-copy strong{font-size:2em !important;} .choice-copy span{font-size:1em !important;}"});
  await collect(larger,"home-large-text",320);
  await large.close();
  // Aborted all small icon assets should retain CSS and emoji controls.
  const blocked=await browser.newContext({...device,viewport:{width:390,height:844},locale:"ja-JP"});
  const broken=await blocked.newPage();
  broken.on("pageerror",e=>issues.push(e.message));
  await broken.route("**/assets/icons/ui/review-v2/*.png",r=>r.abort());
  await broken.goto(url);
  await broken.locator(".pixel-clock").waitFor({state:"visible"});
  check(await broken.locator(".pixel-clock").isVisible(),"WebKit image failure restores CSS clock");
  await broken.locator('[data-choose-scale="clock"]').tap();
  await broken.locator("#screen-setup").waitFor({state:"visible"});
  await broken.locator(".add-submit [data-m2-fallback]").waitFor({state:"visible"});
  check(await broken.locator(".add-submit [data-m2-fallback]").isVisible(),"WebKit missing plus icon retains label");
  await broken.screenshot({path:resolve(screenshots,"missing-icon-fallback-390.png"),fullPage:true});
  await blocked.close();
  check(issues.length===0,"No uncaught JavaScript errors in WebKit",issues);
  await context.close();
}finally{
  await browser?.close();
  await new Promise(r=>server.close(r));
}
const result={environment:"Playwright Linux WebKit, iPhone 13 descriptor; not an iPhone Safari device",screens,checksCount:checks.length,checks,measurements,issues,review_status:"automated QA only, visual approval and real-device check outstanding"};
await writeFile(resolve(screenshots,"webkit-report.json"),JSON.stringify(result,null,2)+"\n");
console.log("M4_WEBKIT_PASS "+checks.length+" assertions, "+screens.length+" screenshots, no unhandled exceptions");
