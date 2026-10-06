import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createGardenDeck, drawGardenBoard, gardenCatalog, gardenCatalogBoard, readGardenDeck, gardenThemeKey } from '../game-assets/crossword-studio/source/app/crossword-catalog.ts';
import { gardenCheckpointKey, readGardenCheckpoint } from '../game-assets/crossword-studio/source/app/crossword-checkpoint.ts';
const entryCells = entry => Array.from(entry.answer).map((solution,index)=>({solution,row:entry.row+(entry.direction==='down'?index:0),col:entry.col+(entry.direction==='across'?index:0)}));
const source=path.resolve(import.meta.dirname,'../game-assets/crossword-studio/source');
const catalog=JSON.parse(fs.readFileSync(path.join(source,'app/crossword-catalog.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(source,'locale-manifest.json'),'utf8'));
const signature=p=>p.entries.map(e=>e.answer).sort().join('|');

test('1,024 truly distinct answer sets; 256 per theme; every grid validates independently',()=>{
 assert.equal(catalog.boards.length,1024);const signatures=new Set();
 for(const theme of ['travel','business','friends','reading'])assert.equal(gardenCatalog(theme).length,256);
 for(const raw of catalog.boards){
  const p=gardenCatalogBoard(raw.id);signatures.add(signature(p));
  assert.ok(p.entries.length===6||p.entries.length===7);assert.ok(p.size<=10);
  const occupied=new Map();
  for(const entry of p.entries){
   assert.match(entry.answer,/^[가-힣]{2,7}$/);
   for(const cell of entryCells(entry)){
    assert.ok(cell.row>=0&&cell.col>=0&&cell.row<p.size&&cell.col<p.size);
    const key=`${cell.row},${cell.col}`,old=occupied.get(key)||[];
    assert.ok(!old.some(other=>other.direction===entry.direction),'parallel overlap');
    assert.ok(old.every(other=>other.solution===cell.solution),'crossing mismatch');
    occupied.set(key,[...old,{...cell,id:entry.id,direction:entry.direction}]);
   }
  }
  const reached=new Set([p.entries[0].id]);for(let i=0;i<p.entries.length;i++)for(const cell of occupied.values())if(cell.some(c=>reached.has(c.id)))cell.forEach(c=>reached.add(c.id));
  assert.equal(reached.size,p.entries.length,'disconnected grid');
  for(const entry of p.entries){
   const cells=entryCells(entry),first=cells[0],last=cells.at(-1),down=entry.direction==='down';
   assert.ok(!occupied.has(`${first.row-(down?1:0)},${first.col-(down?0:1)}`),'word-end touching');
   assert.ok(!occupied.has(`${last.row+(down?1:0)},${last.col+(down?0:1)}`),'word-end touching');
   for(const cell of cells)if(occupied.get(`${cell.row},${cell.col}`).length===1){
    assert.ok(!occupied.has(`${cell.row+(down?0:1)},${cell.col+(down?1:0)}`),'side touching');
    assert.ok(!occupied.has(`${cell.row-(down?0:1)},${cell.col-(down?1:0)}`),'side touching');
   }
  }
 }
 assert.equal(signatures.size,1024,'ids/layout variants are not counted as new puzzles');
 for(const theme of ['travel','business','friends','reading']){
  const sets=gardenCatalog(theme).map(b=>new Set(b.entries.map(e=>e[0])));
  for(let i=0;i<sets.length;i++)for(let j=i+1;j<sets.length;j++)assert.ok([...sets[i]].filter(w=>sets[j].has(w)).length<=Math.min(sets[i].size,sets[j].size)-2,'near-duplicate with only one answer changed');
 }
});

test('all used answers retain reviewed exact contextual meanings in all 33 languages',()=>{
 assert.equal(Object.keys(manifest.files).length,33);
 const ids=new Set(catalog.boards.flatMap(b=>b.entries.map(e=>e[0])));
 for(const [locale,filename] of Object.entries(manifest.files)){
  const pack=JSON.parse(fs.readFileSync(path.resolve(source,`../../../public/games/crossword-studio-v17/locales/${filename}`),'utf8'));
  for(const id of ids){const w=catalog.words[id];assert.ok(pack.meanings[w.answer]?.trim(),`${locale}/${w.answer}`);if(locale==='ko')assert.equal(w.clueKo,pack.meanings[w.answer]);if(locale==='en')assert.equal(w.clueEn,pack.meanings[w.answer]);}
 }
});

test('every theme and core completes two whole decks without repeat; serialized reload retains exact order',()=>{
 const result={};
 for(const theme of [undefined,'travel','business','friends','reading']){
  let deck=createGardenDeck(42),seen=new Set(),last=null,totalOverlap=0,maxOverlap=0,avoidableRepeats=0;
  const count=gardenCatalog(theme).length;
  for(let i=0;i<count*2;i++){
   const old=deck,draw=drawGardenBoard(deck,i,theme);deck=draw.deck;
   if(i%count===0)seen=new Set();
   assert.ok(!seen.has(signature(draw.puzzle)));seen.add(signature(draw.puzzle));
   if(i<3)assert.equal(draw.puzzle.entries.length,6);
   if(last){
    const answers=new Set(draw.puzzle.entries.map(e=>e.answer)),overlap=last.entries.filter(e=>answers.has(e.answer)).length;
    totalOverlap+=overlap;maxOverlap=Math.max(maxOverlap,overlap);assert.notEqual(draw.puzzle.id,last.id);
    const remaining=gardenCatalog(theme).filter(b=>!old.seen.includes(b.id));
    if(overlap&&remaining.some(b=>b.entries.every(([w])=>!last.entries.some(e=>e.answer===catalog.words[w].answer))))avoidableRepeats++;
   }
   assert.deepEqual(drawGardenBoard(readGardenDeck(JSON.parse(JSON.stringify(old)),theme),i,theme),draw);
   last=draw.puzzle;
  }
  assert.equal(avoidableRepeats,0,'never repeat an adjacent word when a disjoint unused puzzle exists');
  result[theme||'core']={count,rounds:count*2,averageAdjacentOverlap:totalOverlap/(count*2-1),maxAdjacentOverlap:maxOverlap};
 }
 // Tests validate in memory and never write outside the checkout.
 assert.equal(Object.keys(result).length,5);
});

test('checkpoint preserves active round and rejects corrupt/cross-theme data; language is not a reset key',()=>{
 const {puzzle,deck}=drawGardenBoard(createGardenDeck(8),0,'travel');
 const p={version:1,catalogVersion:1,theme:'travel',puzzleId:puzzle.id,index:0,deck,score:0,stars:0,best:0,words:[],activeEntryId:puzzle.entries[0].id,drafts:{[puzzle.entries[0].id]:'가'},solved:[],assisted:[],revealed:[],seconds:30,hints:0,mistakes:0,streak:0};
 assert.deepEqual(readGardenCheckpoint(JSON.stringify(p),'travel'),p);
 assert.equal(readGardenCheckpoint(JSON.stringify(p),'friends'),null);
 for(const value of [{...p,version:2},{...p,puzzleId:'fake'},{...p,solved:[puzzle.entries[0].id]},{...p,score:-1},{...p,deck:{...deck,seen:[]}},null])assert.equal(readGardenCheckpoint(JSON.stringify(value),'travel'),null);
 assert.notEqual(gardenCheckpointKey('travel'),gardenCheckpointKey('reading'));
 assert.equal(gardenThemeKey('unexpected'),'core');
 assert.equal(readGardenDeck({...deck,seen:[...deck.seen,...deck.seen]},'travel'),null);
});
