import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {Window} from 'happy-dom';
const root=path.resolve(import.meta.dirname,'..'),output=path.join(root,'public/games/crossword-studio-v17');
const html=await readFile(path.join(output,'index.html'),'utf8'),code=await readFile(path.join(output,html.match(/runtime\.[a-f0-9]+\.js/)[0]),'utf8');
const catalog=JSON.parse(await readFile(path.join(root,'game-assets/crossword-studio/source/app/crossword-catalog.json'),'utf8'));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){const end=Date.now()+5000;while(!fn()&&Date.now()<end)await wait(8);assert.ok(fn(),'runtime state timed out');}
function create(storage={},theme='travel',locale='en'){
 const w=new Window({url:`https://seoulkeys.test/games/crossword-studio-v17/index.html?session=variety&locale=${locale}&theme=${theme}&sound=0`,settings:{enableJavaScriptEvaluation:true,suppressInsecureJavaScriptEnvironmentWarning:true}});
 w.document.body.innerHTML='<div id="root"></div>';
 w.fetch=async url=>new w.Response(await readFile(path.join(output,'locales',String(url).split('/').pop()),'utf8'),{status:200});
 w.HTMLMediaElement.prototype.play=()=>Promise.resolve();w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.load=function(){};
 for(const [key,value]of Object.entries(storage))w.localStorage.setItem(key,value);
 const failures=[];w.addEventListener('error',e=>failures.push(e.message));w.eval(code);
 const q=s=>w.document.querySelector(s),send=(state={})=>w.dispatchEvent(new w.MessageEvent('message',{origin:'https://seoulkeys.test',source:w.eval('window.parent'),data:{channel:'seoulkeys:crossword-studio',version:1,session:'variety',type:'configure',state:{locale,themeId:theme,soundEnabled:false,suspended:false,...state}}}));
 const snapshot=()=>Object.fromEntries(Array.from({length:w.localStorage.length},(_,i)=>{const key=w.localStorage.key(i);return[key,w.localStorage.getItem(key)];}));
 const saved=(name=theme)=>JSON.parse(w.localStorage.getItem(`seoulkeys-atelier-catalog-v1-${name}`));
 const ready=async()=>{await until(()=>q('.crossword-expedition')?.dataset.progressReady==='true');send();await until(()=>!q('#crossword-word-input').disabled);};
 const type=async text=>{const input=q('#crossword-word-input');Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set.call(input,text);input.dispatchEvent(new w.Event('input',{bubbles:true}));await wait(12);};
 return {w,q,send,snapshot,saved,ready,type,failures};
}
const answerFor=id=>{const board=catalog.boards.find(b=>id.startsWith(b.id+'-'));return catalog.words[board.entries[Number(id.slice(board.id.length+1))][0]].answer;};
async function solveOne(r){
 const before=r.saved().solved.length;const id=r.q('.crossword-expedition').dataset.entryId;
 await r.type(answerFor(id));r.q('#crossword-word-input').dispatchEvent(new r.w.KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true}));
 await until(()=>r.saved().solved.length===before+1);
 if(r.saved().solved.length<r.saved().deck.recent.at(-1).length){r.q('.crossword-next-clue').click();await until(()=>r.q('.crossword-expedition').dataset.entryId!==id);}
}

test('draft, solved word, selected clue, score, history and locale survive reload and theme return',async()=>{
 let r=create();try{
 await r.ready();assert.equal(r.w.document.querySelectorAll('[data-active-word="true"]').length,answerFor(r.q('.crossword-expedition').dataset.entryId).length);
 assert.equal(r.w.document.querySelectorAll('[data-input-position="true"]').length,1);
 await solveOne(r);await r.type('가');
 const travel=r.saved(),id=travel.activeEntryId,storage=r.snapshot();assert.equal(travel.solved.length,1);assert.ok(travel.score>0);
 await r.w.happyDOM.close();r=create(storage);await r.ready();
 assert.equal(r.q('#crossword-word-input').value,'가');assert.equal(r.q('.crossword-expedition').dataset.entryId,id);assert.equal(r.saved().puzzleId,travel.puzzleId);assert.deepEqual(r.saved().deck,travel.deck);assert.equal(r.saved().score,travel.score);assert.equal(r.saved().solved.length,1);
 r.send({locale:'ar'});await until(()=>r.q('.studio-integrated').dataset.clueLocale==='ar');assert.equal(r.q('#crossword-word-input').value,'가');assert.equal(r.saved().puzzleId,travel.puzzleId);
 r.send({themeId:'friends',locale:'ar'});await until(()=>r.saved('friends')&&r.q('.crossword-expedition').dataset.entryId.startsWith('friends-'));
 await r.type('나');const friend=r.saved('friends');
 r.send({themeId:'travel',locale:'ko'});await until(()=>r.q('.crossword-expedition').dataset.entryId===id&&r.q('.studio-integrated').dataset.clueLocale==='ko');assert.equal(r.q('#crossword-word-input').value,'가');assert.deepEqual(r.saved().deck,travel.deck);assert.equal(r.saved('friends').puzzleId,friend.puzzleId);
 const input=r.q('#crossword-word-input');input.setSelectionRange(0,0);input.dispatchEvent(new r.w.KeyboardEvent('keyup',{key:'ArrowLeft',bubbles:true}));await wait(20);assert.equal(r.w.document.querySelectorAll('[data-input-position="true"]').length,1);
 assert.deepEqual(r.failures,[]);
 }finally{await r.w.happyDOM.close();}
});

test('24 live completed rounds keep distinct puzzles; completed reload never awards twice or consumes another card',async()=>{
 let r=create();try{
 await r.ready();const ids=new Set(),sets=new Set();let last=[];
 for(let round=0;round<24;round++){
  const before=r.saved();assert.ok(!ids.has(before.puzzleId));ids.add(before.puzzleId);const answers=before.deck.recent.at(-1);assert.ok(!sets.has([...answers].sort().join('|')));sets.add([...answers].sort().join('|'));assert.equal(answers.filter(w=>last.includes(w)).length,0);last=answers;
  for(let n=before.solved.length;n<answers.length;n++)await solveOne(r);
  await until(()=>r.q('.crossword-finish'));
  if(round===3){const saved=r.saved(),storage=r.snapshot();await r.w.happyDOM.close();r=create(storage);await until(()=>r.q('.crossword-finish'));r.send();await wait(20);assert.equal(r.saved().score,saved.score);assert.equal(r.saved().stars,saved.stars);assert.deepEqual(r.saved().deck,saved.deck);}
  const previousId=r.saved().puzzleId;
  r.q('.crossword-expedition').dispatchEvent(new r.w.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
  await until(()=>r.saved().puzzleId!==previousId);assert.equal(r.saved().index,round+1);assert.equal(r.saved().solved.length,0);
 }
 assert.equal(ids.size,24);assert.deepEqual(r.failures,[]);
 }finally{await r.w.happyDOM.close();}
});
