import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {observeGameFrame,isCrosswordActivityRunning} from '../app/frame-game-activity.ts';
import {withoutGameActivityProps} from './helpers/home-game-integration-delta.mjs';

function fixture(origin='https://seoulkeys.com') {
  const window=new EventTarget(); const document={defaultView:window,location:{origin}};
  const frame=new EventTarget();frame.contentDocument=document;frame.ownerDocument={location:{origin:'https://seoulkeys.com'}};
  return {frame,document,window};
}
test('iframe input/IME/pointer observers never consume events and detach after unmount',()=>{
  const f=fixture();let count=0;let wakes=0;
  const observation=observeGameFrame(f.frame,()=>count++,()=>wakes++);
  assert.equal(observation.document(),f.document);
  for(const type of ['keydown','input','compositionend','pointerdown']){
    const event=new Event(type,{cancelable:true});f.window.dispatchEvent(event);assert.equal(event.defaultPrevented,false);
  }
  f.window.dispatchEvent(new Event('focus'));assert.equal(wakes,1);assert.equal(count,4);
  observation.dispose();f.window.dispatchEvent(new Event('keydown'));f.window.dispatchEvent(new Event('blur'));
  assert.equal(count,4);assert.equal(wakes,1);assert.equal(observation.document(),null);
});
test('reload disconnects old frame window, connects new document once, and rejects other origins',()=>{
  const f=fixture();let count=0;const observation=observeGameFrame(f.frame,()=>count++,()=>{});
  const next=fixture();f.frame.contentDocument=next.document;f.frame.dispatchEvent(new Event('load'));
  f.window.dispatchEvent(new Event('input'));next.window.dispatchEvent(new Event('input'));assert.equal(count,1);
  f.frame.dispatchEvent(new Event('load'));next.window.dispatchEvent(new Event('input'));assert.equal(count,2);
  const foreign=fixture('https://elsewhere.invalid');f.frame.contentDocument=foreign.document;f.frame.dispatchEvent(new Event('load'));
  next.window.dispatchEvent(new Event('input'));foreign.window.dispatchEvent(new Event('input'));assert.equal(count,2);
  assert.equal(observation.document(),null);observation.dispose();
});
test('inaccessible or missing iframe documents fail closed without breaking the game',()=>{
  for(const frame of [Object.assign(new EventTarget(),{contentDocument:null}),Object.defineProperty(new EventTarget(),'contentDocument',{get(){throw new Error('SecurityError');}})]){
    const observation=observeGameFrame(frame,()=>assert.fail(),()=>{});assert.equal(observation.document(),null);observation.dispose();
  }
});
test('studio loading, locale change, manual/host pause, completed puzzle and absent board do not count',()=>{
  const doc=(suspended,board,solved)=>({querySelector(selector){
    if(selector==='.studio-integrated')return suspended===null?null:{getAttribute:()=>suspended};
    if(selector==='.crossword-game-wrap')return board?{}:null;
    if(selector==='.crossword-game-wrap.solved')return solved?{}:null;
  }});
  assert.equal(isCrosswordActivityRunning(doc('false',true,false)),true);
  for(const values of [['true',true,false],[null,true,false],['false',false,false],['false',true,true]])assert.equal(isCrosswordActivityRunning(doc(...values)),false);
});
test('new accepted games receive signed-in tracking at their iframe hosts, not the retired widgets',async()=>{
  const defense=await readFile(new URL('../app/GodotDefenseGame.tsx',import.meta.url),'utf8');
  const crossword=await readFile(new URL('../app/StudioCrosswordGame.tsx',import.meta.url),'utf8');
  assert.match(defense,/useGameActivity\(rootRef, "falling-words", ready && !blocked && !hidden, activityTracking, frameRef\)/);
  assert.match(crossword,/useGameActivity\(activityRootRef, 'crossword', ready && !failed && !suspended, activityTracking, iframeRef, isCrosswordActivityRunning\)/);
  for(const name of ['FallingWordsGame','CrosswordGame'])assert.doesNotMatch(await readFile(new URL(`../app/${name}.tsx`,import.meta.url),'utf8'),/useGameActivity/);
});
test('preservation normalization allows only approved telemetry props, not changed auth or gameplay props',async()=>{
  const home=await readFile(new URL('../app/page.tsx',import.meta.url),'utf8');
  assert.equal((home.match(/activityTracking=\{signedIn === true\}/g)||[]).length,3);
  assert.doesNotMatch(withoutGameActivityProps(home),/activityTracking/);
  const changed=home.replace('activityTracking={signedIn === true}','activityTracking={true}');
  assert.match(withoutGameActivityProps(changed),/activityTracking=\{true\}/);
  const props=home.replace('musicEnabled={defenseMusicEnabled}','musicEnabled={false}');
  assert.match(withoutGameActivityProps(props),/musicEnabled=\{false\}/);
});
