// M7 browser evidence. WebKit emulation is not physical iPhone Safari.
import {chromium,webkit,devices} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,relative,extname} from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..'),engine=process.env.M7_BROWSER||'webkit';
const before=process.env.M7_BEFORE==='1',base='2d5b657ee8cd362693c5761d38f28fdca68413f4';
const out=resolve(root,'test-screenshots/m7',engine,before?'before':'after');
await mkdir(out,{recursive:true});
const types={'.html':'text/html;charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
  const path=resolve(root,'.'+(new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html')));
  if(relative(root,path).startsWith('..'))return res.writeHead(403).end();
  try{const body=before?execFileSync('git',['show',base+':'+relative(root,path).replaceAll('\\','/')],{cwd:root}):await readFile(path);
    res.writeHead(200,{'content-type':types[extname(path)]||'application/octet-stream'}).end(body);
  }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port,checks=[],errors=[],measurements=[];
const check=(ok,label)=>{assert.ok(ok,label);checks.push(label);};
let browser;
try{
  browser=await {chromium,webkit}[engine].launch();
  const context=await browser.newContext({...devices['iPhone 13'],defaultBrowserType:undefined,locale:'ja-JP',timezoneId:'Asia/Tokyo',reducedMotion:'reduce'});
  for(const width of [320,390,428]){
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));
    await page.setViewportSize({width,height:720});
    await page.goto(url);await page.evaluate(()=>localStorage.clear());await page.reload();
    let dialogs=0,accept=true;
    page.on('dialog',async d=>{dialogs++;if(accept)await d.accept();else await d.dismiss();});
    const shot=async name=>{
      await page.locator('.screen:not([hidden])').waitFor();
      await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
      const size=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
      measurements.push({name,...size});
      if(!before)check(size.scroll===width,name+' no horizontal overflow '+width);
      await page.screenshot({path:resolve(out,name+'-'+width+'.png'),fullPage:true});
    };
    await shot('home');
    // Use day mode to reproduce the reported CTA and remaining-work summary.
    await page.locator('[data-choose-scale="days"]').click();await page.locator('#screen-setup').waitFor({state:'visible'});
    await page.locator('[data-preset="homework"]').click();
    await shot('setup');
    if(!before){
      const saved=await page.evaluate(()=>localStorage.getItem('reverse-planner:prototype:v1'));
      await page.locator('[data-preset="homework"]').click();
      check(dialogs===0,'identical preset no confirmation '+width);
      check(saved===await page.evaluate(()=>localStorage.getItem('reverse-planner:prototype:v1')),'repeat preserves persisted IDs and state '+width);
      check(await page.locator('[data-preset="homework"]').getAttribute('aria-pressed')==='true','applied state '+width);
      await page.reload();await page.locator('[data-preset="homework"]').click();
      check(dialogs===0,'same preset after reload no confirmation '+width);
      await page.locator('[data-task-field="name"]').first().fill('編集した架空の課題');
      await page.locator('[data-task-field="name"]').first().press('Tab');
      check(await page.locator('[data-preset="homework"]').getAttribute('aria-pressed')==='false','edit clears applied state '+width);
      accept=false;await page.locator('[data-preset="homework"]').click();
      check(dialogs===1 && await page.locator('[data-task-field="name"]').first().inputValue()==='編集した架空の課題','cancel keeps edits '+width);
      accept=true;await page.locator('[data-preset="homework"]').click();
      await page.locator('[data-preset="exam"]').click();
      check(dialogs===3,'changed and different preset confirm '+width);
      // Return to a short, feasible example shared by before/after screenshots.
      await page.locator('[data-preset="homework"]').click();
      const box=await page.locator('#advanced-settings').boundingBox();
      check(box.height<=60,'collapsed details compact '+width+' height='+box.height);
      await page.locator('#advanced-settings summary').click();await shot('settings-open');
      await page.locator('#advanced-settings summary').click();
    }
    await page.locator('#make-plan').click();await page.locator('#screen-plan').waitFor({state:'visible'});
    await shot('plan');
    if(!before){
      check((await page.locator('#metrics').innerText()).includes('やること'),'remaining work labeled '+width);
      for(const id of ['start-plan','edit-plan']){
        const fits=await page.locator('#'+id).evaluate(b=>{const i=b.querySelector('img'),r=i.getBoundingClientRect(),p=b.getBoundingClientRect();return i.naturalWidth>0&&!i.hidden&&r.top>=p.top&&r.bottom<=p.bottom&&r.left>=p.left&&r.right<=p.right;});
        check(fits,id+' image fits CTA '+width);
      }
      await page.locator('#export-button').scrollIntoViewIfNeeded();
      await page.screenshot({path:resolve(out,'bottom-'+width+'.png')});
      // Approximate text enlargement and shortened Safari viewport separately.
      await page.addStyleTag({content:'h1,h2,p,small,strong,label,button,a,summary{font-size:200% !important}'});
      await page.setViewportSize({width,height:560});await shot('plan-large-text');
    }
    await page.locator('#start-plan').click();await page.locator('#screen-run').waitFor({state:'visible'});await shot('run');
    await page.close();
  }
  if(!before){
    const page=await context.newPage();await page.route(/\/assets\/icons\/.*\.(png|svg)$/,route=>route.abort());
    await page.goto(url+'/#plan');await page.locator('#screen-plan').waitFor({state:'visible'});
    await page.locator('#edit-plan [data-m2-fallback]').waitFor({state:'visible'});
    check(await page.locator('#start-plan [data-m2-fallback]').isVisible(),'CTA image failure retains symbols');
    await page.screenshot({path:resolve(out,'fallback-390.png'),fullPage:true});
  }
  check(errors.length===0,'no JavaScript exceptions');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
await writeFile(resolve(out,'report.json'),JSON.stringify({engine,before,checks,errors,measurements},null,2));
console.log('M7 '+engine+' '+(before?'before':'after')+' PASS '+checks.length+' checks; JS errors '+errors.length);
