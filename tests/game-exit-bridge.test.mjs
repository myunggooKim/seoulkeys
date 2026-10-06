import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
test('defense iframe Escape requests the site dialog without breaking IME or fullscreen',()=>{
 const shell=readFileSync('public/games/seoul-defense/index.html','utf8');
 const code=shell.match(/<script id="seoulkeys-host-exit-bridge">([\s\S]*?)<\/script>/)?.[1];assert.ok(code);
 let key, sent=[];
 const parent={document:{fullscreenElement:null},postMessage:(message,origin)=>sent.push({message,origin})};
 const window={parent,addEventListener:(name,callback,capture)=>{assert.equal(name,'keydown');assert.equal(capture,true);key=callback;}};
 const document={fullscreenElement:null};
 vm.runInNewContext(code,{window,document,location:{origin:'https://seoulkeys.com'}});
 const event=(extra={})=>({key:'Escape',isComposing:false,keyCode:27,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...extra});
 for(const e of [event({isComposing:true}),event({keyCode:229}),event({key:'Enter'})]){key(e);assert.ok(!e.prevented);}
 assert.equal(sent.length,0);
 parent.document.fullscreenElement={};const full=event();key(full);assert.ok(!full.prevented);assert.equal(sent.length,0);
 parent.document.fullscreenElement=null;const exit=event();key(exit);assert.ok(exit.prevented&&exit.stopped);assert.equal(sent.length,1);assert.equal(sent[0].origin,'https://seoulkeys.com');assert.equal(sent[0].message.type,'seoulkeys-defense-request-exit');
});
test('both game hosts enter the existing exit dialog and dialog buttons retain Enter behavior',()=>{
 const page=readFileSync('app/page.tsx','utf8');
 assert.equal((page.match(/onRequestExit=\{\(\) => setExitPromptOpen\(true\)\}/g)||[]).length,2);
 assert.match(page,/className="exit-confirm-card" tabIndex=\{-1\}/);
 assert.match(page,/document\.querySelector<HTMLElement>\("\.exit-confirm-card"\)\?\.focus\(\)/);
 assert.match(page,/event\.target instanceof HTMLElement && event\.target\.closest\("button"\)\) return/);
 const host=readFileSync('app/GodotDefenseGame.tsx','utf8');
 assert.match(host,/event\.source === frameRef\.current\?\.contentWindow && event\.origin === window\.location\.origin && event\.data\?\.type === "seoulkeys-defense-request-exit"/);
});
