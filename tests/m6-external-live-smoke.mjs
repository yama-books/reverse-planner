// APP-004 M6: verify an immutable public-code preview without any Pages deployment.
// Only synthetic demo tasks. This browser is Linux WebKit/Chromium, NOT physical iPhone Safari.
import {chromium,webkit,devices} from "playwright";
import {writeFile,mkdir} from "node:fs/promises";
import assert from "node:assert/strict";
import path from "node:path";
import {fileURLToPath} from "node:url";

const COMMIT="df0e33a9eaf447b4b96c3a253e7604eade6149ca";
const BASE="https://raw.githack.com/yama-books/reverse-planner/"+COMMIT+"/";
const ENGINE=process.env.M6_BROWSER==="webkit"?"webkit":"chromium";
const OUTPUT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../test-screenshots/m6");
await mkdir(OUTPUT,{recursive:true});
let browser,context;
const passed=[];
const errors=[];
const requests=[];
const badResponses=[];
const check=(x,name)=>{assert.ok(x,name);passed.push(name);};
try{
 browser=await ({chromium,webkit})[ENGINE].launch({headless:true});
 context=await browser.newContext({...devices["iPhone 13"],viewport:{width:390,height:844},locale:"ja-JP",timezoneId:"Asia/Tokyo",reducedMotion:"reduce"});
 const page=await context.newPage();
 page.on("pageerror",err=>errors.push(err.message));
 page.on("response",r=>{if(r.status()>=400)badResponses.push({status:r.status(),url:r.url(),mime:r.headers()["content-type"]});});
 page.on("console",m=>{if(m.type()==="error")errors.push("CONSOLE "+m.text());});
 page.on("requestfailed",req=>requests.push({path:new URL(req.url()).pathname,reason:req.failure()?.errorText}));
 const response=await page.goto(BASE+"index.html",{waitUntil:"domcontentloaded",timeout:35000});
 check(response?.status()===200,"external HTML returns HTTP 200");
 check((response?.headers()["content-type"]||"").toLowerCase().includes("text/html"),"external HTML has executable text/html content type");
 try {
 await page.waitForFunction(()=>!!document.querySelector("#screen-home:not([hidden])")&&!!document.querySelector("#screen-home .decorative-cat img")?.complete,null,{timeout:12000});
}catch(err){
 const diagnostic=await page.evaluate(()=>({title:document.title,head:document.head.innerHTML.slice(0,1300),body:document.body.innerText.slice(0,900),homeExists:!!document.querySelector("#screen-home"),homeHidden:document.querySelector("#screen-home")?.hidden,imgExists:!!document.querySelector("#screen-home .decorative-cat img"),img:([...document.querySelectorAll("img")].slice(0,12).map(i=>({src:i.src,complete:i.complete,natural:i.naturalWidth}))),html:document.documentElement.outerHTML.slice(0,850)}));
 console.error("M6_STARTUP_DIAGNOSTIC",JSON.stringify({diagnostic,errors,requests,badResponses},null,2));
 await page.screenshot({path:path.join(OUTPUT,ENGINE+"-diagnostic.png"),fullPage:true});
 await writeFile(path.join(OUTPUT,ENGINE+"-diagnostic.json"),JSON.stringify({diagnostic,errors,requests,badResponses},null,2)+"\n");
 throw err;
}
 check(await page.locator("#screen-home").isVisible(),"HOME screen renders");
 const modules=await page.evaluate(async()=>{
  const paths=["assets/app.js","assets/app.css","assets/state.mjs","assets/core.mjs","assets/icons/presets/review-v2/exam.png","assets/icons/decor/review-v2/sparkle.png","assets/icons/cats/review-v2/RP-CATWORK-S09-I01.png"];
  return Promise.all(paths.map(async p=>{
   const r=await fetch(new URL(p,document.baseURI));
   return {path:p,status:r.status,mime:r.headers.get("content-type"),bytes:Number(r.headers.get("content-length")||0)};
  }));
 });
 check(modules.every(x=>x.status===200),"all required JS/CSS and reviewed image assets load");
 check(modules.filter(x=>x.path.endsWith(".js")||x.path.endsWith(".mjs")).every(x=>/javascript|ecmascript/.test(x.mime||"")),"ES modules have executable JavaScript MIME type");
 check(modules.filter(x=>x.path.endsWith(".png")).every(x=>/image\/png/.test(x.mime||"")),"PNG image MIME types are correct");
 await page.locator('[data-choose-scale="clock"]').tap();
 await page.locator("#screen-setup").waitFor({state:"visible",timeout:8000});
 await page.locator('[data-preset="exam"] .m5-icon').waitFor({state:"visible",timeout:8000});
 check(await page.locator('[data-preset]').count()===4,"SETUP has four tappable presets");
 check(await page.locator('[data-preset="exam"] .m5-icon').isVisible(),"normalized exam art loads in live preview");
 const exam=await page.locator('[data-preset="exam"] .m5-icon').evaluate(i=>({natural:i.naturalWidth,src:i.getAttribute("src"),fallback:i.parentElement.querySelector("[data-m2-fallback]")?.hidden}));
 check(exam.natural===128&&exam.src?.endsWith("/review-v2/exam.png")&&exam.fallback===true,"real network displays M5 refined image and hides fallback");
 await page.locator('[data-preset="exam"]').tap();
 check(await page.locator("#task-list .task-row").count()===3,"tap on test-study preset updates sample tasks");
 await page.screenshot({path:path.join(OUTPUT,ENGINE+"-live-setup.png"),fullPage:true,animations:"disabled"});
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"no horizontal overflow in live SETUP");
 // Clear synthetic storage in the testing context, never access user device data.
 await page.evaluate(()=>localStorage.clear());
 await page.reload({waitUntil:"domcontentloaded"});
 check(await page.locator("#screen-home").isVisible(),"synthetic storage clears and HOME returns");
 check(errors.length===0,"no uncaught JavaScript exception");
 check(requests.length===0,"no failed network requests");
 const report={engine:ENGINE,environment:"Linux Playwright device approximation, NOT real iPhone Safari",source_commit:COMMIT,preview:BASE+"index.html",checks:passed,requests_failed:requests,page_errors:errors,assets:modules,synthetic_data_only:true,production_pages_modified:false,privacy_note:"Third-party CDN shares origin between repos; use only fictitious data in private Safari tab."};
 await writeFile(path.join(OUTPUT,ENGINE+"-report.json"),JSON.stringify(report,null,2)+"\n");
 console.log("APP004_M6_EXTERNAL_PREVIEW_SUCCESS",ENGINE,passed.length,"checks");
}catch(err){
 console.error("APP004_M6_EXTERNAL_PREVIEW_FAILURE",ENGINE,String(err));
 throw err;
}finally{
 await context?.close();
 await browser?.close();
}
