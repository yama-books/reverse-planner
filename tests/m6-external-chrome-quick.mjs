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
 await page.screenshot({path:path.join(dir,"live-page.png"),fullPage:true,animations:"disabled"});
 if(result.initial.homeVisible){
  await page.locator('[data-choose-scale="clock"]').click({timeout:4000});
  result.setupVisible=await page.locator("#screen-setup").isVisible();
  if(result.setupVisible){
   result.exam=await page.locator('[data-preset="exam"] .m5-icon').evaluate(i=>({src:i.getAttribute("src"),natural:i.naturalWidth,hidden:i.hidden}));
   await page.screenshot({path:path.join(dir,"live-setup.png"),fullPage:true,animations:"disabled"});
  }
 }
 passed=result.htmlStatus===200&&result.initial.homeVisible&&result.setupVisible&&result.exam?.natural===128&&errors.length===0&&failed.length===0;
 result.verified=passed;
 console.log("M6_FAST_RESULT",JSON.stringify(result).slice(0,7000));
}catch(e){result.exception=String(e);console.error("M6_FAST_EXCEPTION",e);}
finally {await context.close();await browser.close();await writeFile(path.join(dir,"diagnostic.json"),JSON.stringify(result,null,2)+"\n");}
if(!passed)process.exitCode=1;
