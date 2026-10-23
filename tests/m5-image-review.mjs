// APP-004 M5: draft image, label, touch and fallback regression.
import {chromium,webkit,devices} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve,relative,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const ROOT=fileURLToPath(new URL('..',import.meta.url));
const engine=process.env.M5_BROWSER||'chromium';
const out=resolve(ROOT,'test-screenshots/m5',engine);
await mkdir(out,{recursive:true});
const mime={'.html':'text/html;charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.png':'image/png'};
const server=createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 const file=resolve(ROOT,'.'+(path==='/'?'/index.html':path));
 if(relative(ROOT,file).startsWith('..'))return res.writeHead(403).end();
 try{const bytes=await readFile(file);res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream'}).end(bytes);}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port+'/';
const checks=[],measurements=[],errors=[],screens=[];
const check=(ok,label)=>{assert.ok(ok,label);checks.push(label);};
let browser;
const shot=async(page,name)=>{await page.screenshot({path:resolve(out,name+'.png'),fullPage:true,animations:'disabled'});screens.push(name+'.png');};
const settle=async page=>{
 try {await page.waitForFunction(()=>[...document.querySelectorAll('.screen')].filter(x=>!x.hidden).every(x=>{
 const r=x.getBoundingClientRect();return Math.abs(r.left-(innerWidth-r.width)/2)<1.5;
 }),null,{timeout:5000});}catch(e){console.error('M5_LAYOUT_WAIT',await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(x=>(x.scrollWidth>x.clientWidth+1||x.getBoundingClientRect().right>320)&&x.getBoundingClientRect().width>0).map(x=>({tag:x.tagName,id:x.id,cls:typeof x.className==='string'?x.className:'',x:x.getBoundingClientRect().x,right:x.getBoundingClientRect().right,scroll:x.scrollWidth,client:x.clientWidth})).slice(0,15),screens:[...document.querySelectorAll('.screen')].filter(x=>!x.hidden).map(x=>({id:x.id,x:x.getBoundingClientRect().x,width:x.getBoundingClientRect().width}))})));throw e;}
 try {await page.waitForFunction(()=>[...document.querySelectorAll('.m5-icon')].every(i=>i.complete&&i.dataset.m2Ready==='true'));}catch(e){console.error('M5_IMAGE_WAIT',await page.locator('.m5-icon').evaluateAll(xs=>xs.map(i=>({src:i.src,complete:i.complete,ready:i.dataset.m2Ready,hidden:i.hidden,width:i.naturalWidth}))));throw e;}
};
const inspect=async(page,stage,width)=>{
 await page.setViewportSize({width,height:844});
 await page.locator('#screen-'+(stage.startsWith('setup')?'setup':stage==='done'?'run':stage)).waitFor({state:'visible'});await settle(page);
 const info=await page.evaluate(()=>{
 const current=[...document.querySelectorAll('.screen')].find(x=>!x.hidden);
 const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
 return {width:innerWidth,scroll:document.documentElement.scrollWidth,
 icons:[...document.querySelectorAll('.m5-icon')].filter(i=>i.getBoundingClientRect().width>0).map(i=>{
 const r=rect(i),parent=rect(i.parentElement),button=i.closest('button');
 const b=button?rect(button):parent;
 return {src:i.getAttribute('src'),r,button:button?b:null,loaded:!i.hidden&&i.naturalWidth===128,
 fit:r.x>=b.x-1&&r.right<=b.right+1&&r.y>=b.y-1&&r.bottom<=b.bottom+1,
 decorative:i.alt===''&&i.parentElement.getAttribute('aria-hidden')==='true',
 fallbackHidden:i.parentElement.querySelector('[data-m2-fallback]').hidden,
 pointer:getComputedStyle(i).pointerEvents};}),
 presets:[...current.querySelectorAll('[data-preset]')].map(b=>({label:b.getAttribute('aria-label')||b.querySelector('span:last-child').textContent,...rect(b)}))};
 });
 check(info.width===width&&info.width===info.scroll,stage+' '+width+' no horizontal scroll');
 check(info.icons.length>0&&info.icons.every(i=>i.loaded&&i.fit&&i.decorative&&i.fallbackHidden&&i.pointer==='none'),stage+' '+width+' images loaded, contained, decorative and noninteractive');
 if(stage.startsWith('setup'))check(info.presets.length===4&&info.presets.every(b=>b.height>=44&&b.width>=44),stage+' '+width+' all four preset touch targets >=44px');
 measurements.push({stage,...info});await shot(page,stage+'-'+width);
};
const add=async page=>{
 await page.locator('#new-task-name').fill('M5の画像確認');await page.locator('#new-task-minutes').fill('1');await page.locator('.add-submit').tap();
};
const finish=async page=>{
 await page.locator('#make-plan').tap();await page.locator('#screen-plan').waitFor({state:'visible'});
 await page.locator('#start-plan').tap();await page.locator('#screen-run').waitFor({state:'visible'});
 await page.locator('[data-run="start"]').tap();await page.locator('[data-run="done"]').tap();
 await page.getByRole('heading',{name:'全部できた！',exact:false}).last().waitFor({state:'visible'});
};
try{
 browser=await ({chromium,webkit}[engine]).launch();
 const options={...devices['iPhone 13'],defaultBrowserType:undefined,viewport:{width:390,height:844},locale:'ja-JP',timezoneId:'Asia/Tokyo',reducedMotion:'reduce'};
 const context=await browser.newContext(options),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(url);
 for(const w of [320,390,428])await inspect(page,'home',w);
 await page.locator('[data-choose-scale="clock"]').tap();
 for(const w of [320,390,428])await inspect(page,'setup',w);
 const examImage=await page.locator('[data-preset="exam"] .m5-icon').getAttribute('src');
 check(examImage.endsWith('/review-v2/exam.png'),'exam preset uses normalized review-v2 artwork');
 const sparkleImage=await page.locator('.privacy-note .m5-icon').getAttribute('src');
 check(sparkleImage.endsWith('/review-v2/sparkle.png'),'static sparkle uses centered review-v2 artwork');
 // Every preset still activates the original full button, including after rerender/cache hits.
 for(const [id,label] of [['daily','家事・支度'],['trip','おでかけ'],['homework','宿題'],['exam','テスト勉強']]){
 await page.getByRole('button',{name:label,exact:true}).tap();await settle(page);
 check(await page.locator('#task-list .task-row').count()===3&&await page.locator('[data-task-field="name"]').first().inputValue()===({daily:'買い物',trip:'着替える',homework:'国語',exam:'数学'}[id]),id+' applies clock preset and rerenders loaded icons');
 }
 // Start a fresh sheet for reproducible single-task RUN/DONE evidence.
 await context.clearCookies();await page.evaluate(()=>localStorage.clear());await page.goto(url);
 await page.locator('[data-choose-scale="clock"]').tap();await add(page);
 for(const w of [320,390,428])await inspect(page,'setup-added',w);
 await page.locator('#make-plan').tap();await page.locator('#screen-plan').waitFor({state:'visible'});
 for(const w of [320,390,428])await inspect(page,'plan',w);
 await page.locator('#start-plan').tap();await page.locator('#screen-run').waitFor({state:'visible'});
 for(const w of [320,390,428])await inspect(page,'run',w);
 await page.locator('[data-run="start"]').tap();await page.locator('[data-run="done"]').tap();
 for(const w of [320,390,428])await inspect(page,'done',w);
 await page.reload();await settle(page);
 check((await page.locator('#focus-task').textContent()).includes('全部できた'),'DONE restored after reload');
 await page.locator('#back-plan').tap();await page.locator('#screen-plan').waitFor({state:'visible'});await settle(page);
 check(await page.locator('#result-label .m5-icon').isVisible(),'completed PLAN sparkle is loaded');
 // A load error after a previous successful decode must restore text, and recover on reload.
 await page.locator('#result-label .m5-icon').evaluate(i=>{i.dataset.original=i.src;i.src='/missing-m5.png';});
 await page.locator('#result-label [data-m2-fallback]').waitFor({state:'visible'});
 check(await page.locator('#result-label .m5-icon').isHidden(),'post-load image error restores fallback');
 await page.locator('#result-label .m5-icon').evaluate(i=>i.src=i.dataset.original);await settle(page);
 check(await page.locator('#result-label [data-m2-fallback]').isHidden(),'image recovery hides fallback');
 const days=await browser.newContext(options),dp=await days.newPage();dp.on('pageerror',e=>errors.push(e.message));dp.on('dialog',d=>d.accept());
 await dp.goto(url);await dp.locator('[data-choose-scale="days"]').tap();await dp.locator('#screen-setup').waitFor({state:'visible'});
 for(const [id,n] of [['daily',3],['trip',3],['homework',3],['exam',4]]){
 await dp.locator('[data-preset="'+id+'"]').tap();await settle(dp);
 check(await dp.locator('#task-list .task-row').count()===n&&await dp.locator('[data-task-field="name"]').first().inputValue()===({daily:'持ち物を決める',trip:'調べる',homework:'課題を整理',exam:'数学ワーク'}[id]),id+' applies days preset');
 }
 await inspect(dp,'setup-days',320);await days.close();
 const normal=await browser.newContext({...options,viewport:{width:320,height:844},reducedMotion:'no-preference'}),np=await normal.newPage();
 np.on('pageerror',e=>errors.push(e.message));await np.goto(url);await np.locator('[data-choose-scale="clock"]').tap();await inspect(np,'setup-normal-motion',320);await normal.close();
 const large=await browser.newContext({...options,viewport:{width:320,height:844}}),lp=await large.newPage();
 lp.on('pageerror',e=>errors.push(e.message));await lp.goto(url);await lp.locator('[data-choose-scale="clock"]').tap();
 await lp.addStyleTag({content:'.preset-list button{font-size:24px !important;}'});
 await inspect(lp,'setup-large-text',320);await large.close();
 const broken=await browser.newContext({...options,viewport:{width:320,height:844}}),bp=await broken.newPage();bp.on('pageerror',e=>errors.push(e.message));
 await bp.route('**/assets/icons/{presets,decor}/**',r=>r.abort());
 await bp.goto(url);await bp.locator('[data-choose-scale="clock"]').tap();
 await bp.waitForFunction(()=>document.querySelectorAll('[data-preset]').length===4&&[...document.querySelectorAll('.m5-icon')].every(i=>i.complete&&i.dataset.m2Ready==='false'));
 for(const label of ['家事・支度','おでかけ','宿題','テスト勉強'])check(await bp.getByRole('button',{name:label,exact:true}).isVisible(),'missing images retain accessible label '+label);
 check(await bp.locator('[data-preset] [data-m2-fallback]:visible').count()===4,'all four missing preset images show original symbols');
 check(await bp.locator('[data-preset] .m5-icon:visible').count()===0,'broken images stay hidden');
 await shot(bp,'fallback-setup-320');await add(bp);await finish(bp);await shot(bp,'fallback-done-320');
 check(await bp.locator('#focus-task [data-m2-fallback]').isVisible(),'DONE image failure keeps star and completion text');
 check(await bp.evaluate(()=>document.documentElement.scrollWidth===innerWidth),'fallback DONE no horizontal scroll');await broken.close();
 // Actual M4 source at the specified base, rather than a simulated before image.
 const base='a46ae63e07b6bb3d26089604e820255b5be4e037';
 const originals=new Map(['index.html','assets/app.js','assets/app.css','assets/icons/ui/icon-mount.mjs'].map(p=>['/'+p,execFileSync('git',['show',base+':'+p],{cwd:ROOT})]));
 const before=await browser.newContext({...options,viewport:{width:320,height:844}}),old=await before.newPage();
 await old.route('**/*',route=>{const p=new URL(route.request().url()).pathname;const b=originals.get(p==='/'?'/index.html':p);return b?route.fulfill({body:b,contentType:mime[extname(p==='/'?'index.html':p)]}):route.continue();});
 await old.goto(url);await old.locator('[data-choose-scale="clock"]').tap();
 await old.locator('#preset-list').screenshot({path:resolve(out,'preset-before.png')});
 await page.locator('#edit-plan').tap();await page.locator('#screen-setup').waitFor({state:'visible'});await settle(page);
 await page.setViewportSize({width:320,height:844});await settle(page);
 await page.locator('#preset-list').screenshot({path:resolve(out,'preset-after.png')});await before.close();
 const gallery=await context.newPage();await gallery.setViewportSize({width:390,height:500});
 const png=async name=>'data:image/png;base64,'+(await readFile(resolve(out,name+'.png'))).toString('base64');
 await gallery.setContent('<html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:16px;background:#f6f2e8;color:#173e43;font:16px sans-serif}img{max-width:100%}h1{font-size:20px}</style><h1>M5 プリセット比較</h1><p>変更前 / M4</p><img src="'+await png('preset-before')+'"><p>変更後 / M5 レビュー候補</p><img src="'+await png('preset-after')+'"></html>');
 await shot(gallery,'preset-before-after');
 const names=['home-prep','outing','homework','exam'];
 const srcs=await Promise.all(names.map(async name=>'data:image/png;base64,'+(await readFile(resolve(ROOT,'assets/icons/presets',name==='exam'?'review-v2':'review-v1',name+'.png'))).toString('base64')));
 srcs.push('data:image/png;base64,'+(await readFile(resolve(ROOT,'assets/icons/decor/review-v2/sparkle.png'))).toString('base64'));
 await gallery.setContent('<html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;padding:12px;color:#173e43;font:14px sans-serif;background:#f6f2e8}h1{font-size:18px}.strip{display:flex;align-items:center;gap:20px;padding:14px;margin:5px 0}img{image-rendering:pixelated}section{margin-bottom:18px}</style><h1>M5 透過・背景・サイズ比較</h1><p>レビュー候補 / 左から16・24・32px</p>'+srcs.map((src,i)=>'<section><b>'+([...names,'sparkle'][i])+'</b>'+['#f6f2e8','#eef8f0','#bfe5d4','#36463e'].map(bg=>'<div class="strip" style="background:'+bg+'">'+[16,24,32].map(n=>'<img alt="" width="'+n+'" height="'+n+'" src="'+src+'">').join('')+'</div>').join('')+'</section>').join('')+'</html>');
 await shot(gallery,'background-size-comparison');await gallery.close();
 check(errors.length===0,'no uncaught browser errors: '+errors.join(';'));
 await context.close();
 await writeFile(resolve(out,'report.json'),JSON.stringify({engine,checksCount:checks.length,checks,measurements,screens,errors,physicalIPhoneTested:false},null,2)+'\n');
 console.log('M5_'+engine.toUpperCase()+'_PASS '+checks.length+' assertions; '+screens.length+' screenshots; JS errors '+errors.length);
}finally{await browser?.close();await new Promise(r=>server.close(r));}
