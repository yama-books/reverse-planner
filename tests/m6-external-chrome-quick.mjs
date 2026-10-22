// Quick remote preview diagnosis using Chrome installed on GitHub hosted runner.
// The origin is an untrusted shared third-party host; synthetic test data only.
import {chromium,devices} from "playwright";
import {mkdir,writeFile} from "node:fs/promises";
import path from "node:path";
const site="https://raw.githack.com/yama-books/reverse-planner/df0e33a9eaf447b4b96c3a253e7604eade6149ca/index.html";
const dir="test-screenshots/m6/quick";await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:"chrome",headless:true});
const context=await browser.newContext({...devices["iPhone 13"],viewport:{width:390,height:844},locale:"ja-JP",reducedMotion:"reduce",ignoreHTTPSErrors:false});
const page=await context.newPage();
const errors=[],failed=[],bad=[];
page.on("pageerror",e=>errors.push(e.message));
page.on("console",e=>{if(e.type()==="error")errors.push(e.text())});
page.on("requestfailed",req=>failed.push([req.url(),req.failure()?.errorText]));
page.on("response",res=>{if(res.status()>=400)bad.push([res.status(),res.url(),res.headers()["content-type"]]);});
const result={url:site,synthetic_data_only:true,chrome_channel:true};
let passed=false;
try{
 const res=await page.goto(site,{waitUntil:"domcontentloaded",timeout:25000});
 result.htmlStatus=res?.status();result.htmlMime=res?.headers()["content-type"];
 await page.waitForTimeout(3000);
 result.initial=await page.evaluate(()=>({title:document.title,home:!!document.querySelector("#screen-home"),hidden:document.querySelector("#screen-home")?.hidden,homeVisible:!!document.querySelector("#screen-home")&&getComputedStyle(document.querySelector("#screen-home")).display!=="none",bodyText:document.body.innerText.slice(0,350),scripts:[...document.scripts].map(s=>s.src).filter(Boolean),imgs:[...document.querySelectorAll("img")].slice(0,6).map(i=>({src:i.src,natural:i.naturalWidth,complete:i.complete})),scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
 result.initial.errors=errors;result.initial.failed=failed;result.initial.bad=bad;
 if(result.initial.title.includes("External Content Notice")){
  result.noticeLinks=await page.locator("a").evaluateAll(links=>links.map(a=>({text:a.textContent.trim(),href:a.href})).slice(0,20));
  result.noticeButtons=await page.locator("button").evaluateAll(btns=>btns.map(b=>({text:b.textContent.trim(),type:b.type})).slice(0,20));
  console.log("M6_NOTICE_LINKS",JSON.stringify({links:result.noticeLinks,buttons:result.noticeButtons}));
  const open=page.getByText("Open the page",{exact:true}).first();
  if(await open.count()){
   await open.click({timeout:5000});
   // Ignore failures from the external host's interstitial advertising.
   errors.length=0;failed.length=0;bad.length=0;
   await page.waitForTimeout(1000);
   result.afterNotice=await page.evaluate(()=>({url:location.href,title:document.title,home:!!document.querySelector("#screen-home"),screen:!!document.querySelector("#screen-home:not([hidden])"),excerpt:document.body.innerText.slice(0,260)}));
   console.log("M6_AFTER_NOTICE",JSON.stringify(result.afterNotice));
   if(result.afterNotice.home){result.initial.homeVisible=true;}
  }
 }

 await page.screenshot({path:path.join(dir,"live-page.png"),fullPage:true,animations:"disabled"});
 if(result.initial.homeVisible){
  await page.locator('[data-choose-scale="clock"]').click({timeout:4000});
  result.setupVisible=await page.locator("#screen-setup").isVisible();
  if(result.setupVisible){
   try{await page.waitForFunction(()=>{
     const i=document.querySelector('[data-preset="exam"] .m5-icon');
     return i?.complete && i.naturalWidth===128 && i.dataset.m2Ready==="true";
    },null,{timeout:15000});}catch(e){console.warn("M6_ICON_TIMEOUT",String(e));}
   result.exam=await page.locator('[data-preset="exam"] .m5-icon').evaluate(i=>({src:i.getAttribute("src"),natural:i.naturalWidth,hidden:i.hidden,ready:i.dataset.m2Ready,complete:i.complete}));
   result.assetStatus=await page.evaluate(async()=>{
    const u=new URL("./assets/icons/presets/review-v2/exam.png",document.baseURI);
    const r=await fetch(u);return {url:u.href,status:r.status,mime:r.headers.get("content-type")};
   });
   await page.screenshot({path:path.join(dir,"live-setup.png"),fullPage:true,animations:"disabled"});
   await page.locator('[data-preset="exam"]').tap();
   result.demoTasks=await page.locator("#task-list .task-row").count();
   await page.locator("#make-plan").tap();
   result.planVisible=await page.locator("#screen-plan").isVisible();
   await page.screenshot({path:path.join(dir,"live-plan.png"),fullPage:true,animations:"disabled"});
  }
 }
 const genuineErrors=errors.filter(e=>!e.startsWith("Failed to load resource:"));
 const severeFailures=failed.filter(x=>!new URL(x[0]).pathname.endsWith("/favicon.ico"));
 const severeStatus=bad.filter(x=>!new URL(x[1]).pathname.endsWith("/favicon.ico"));
 result.clientErrors=genuineErrors;result.otherNetworkFailures=severeFailures;result.assetErrors=severeStatus;
 result.verified=result.htmlStatus===200&&result.initial.homeVisible&&result.setupVisible&&result.exam?.natural===128&&result.demoTasks===3&&result.planVisible&&genuineErrors.length===0&&severeFailures.length===0&&severeStatus.length===0;
 passed=result.verified;
 console.log("M6_FAST_RESULT",JSON.stringify(result).slice(0,7000));
}catch(e){result.exception=String(e);console.error("M6_FAST_EXCEPTION",e);}
finally {await context.close();await browser.close();await writeFile(path.join(dir,"diagnostic.json"),JSON.stringify(result,null,2)+"\n");}
if(!passed)process.exitCode=1;
