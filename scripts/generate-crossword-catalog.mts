/** Offline deterministic construction; the runtime never generates speculative grids. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { learningThemes } from '../game-assets/crossword-studio/source/app/content-themes';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'game-assets/crossword-studio/source');
const manifest = JSON.parse(fs.readFileSync(path.join(source, 'locale-manifest.json'), 'utf8'));
const packs = Object.fromEntries(Object.entries(manifest.files).map(([locale, file]) => [locale, JSON.parse(fs.readFileSync(path.join(root, 'public/games/crossword-studio-v17/locales', file as string), 'utf8')).meanings]));
const words = manifest.requiredWords.filter((answer: string) => /^[가-힣]{2,7}$/.test(answer)).map((answer: string) => ({answer, clueKo: packs.ko[answer], clueEn: packs.en[answer], difficulty: Math.max(1, ...learningThemes.flatMap(t => t.words.filter(w => w.word === answer).map(w => w.difficulty ?? 2)))}));
for (const word of words) for (const locale of Object.keys(packs)) if (!packs[locale][word.answer]?.trim()) throw new Error(`Missing ${locale}/${word.answer}`);
type Placement = {word: number; row: number; col: number; down: number};
type Cell = {letter: string; down: number[]};
const letters: string[][] = words.map((w: {answer: string}) => Array.from(w.answer) as string[]);
const shared = letters.map((chars: string[]) => letters.map((other: string[], id: number) => other.some(c => chars.includes(c)) ? id : -1).filter((id: number) => id >= 0));
let state = 0x217b51;
const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
const key = (r: number,c: number) => `${r},${c}`;
function bounds(entries: Placement[]) {
 const rs = entries.flatMap(e => [e.row, e.row + (e.down ? letters[e.word].length - 1 : 0)]), cs = entries.flatMap(e => [e.col, e.col + (e.down ? 0 : letters[e.word].length - 1)]);
 return {r: Math.min(...rs), c: Math.min(...cs), rows: Math.max(...rs)-Math.min(...rs)+1, cols: Math.max(...cs)-Math.min(...cs)+1};
}
const usedGlobal = new Set<string>();
const boards: {id: string; theme: string; size: number; entries: number[][]}[] = [];
const reports: Record<string, unknown> = {};
for (const theme of learningThemes) {
 const themed = new Set<number>(words.map((w: {answer:string}, i: number) => theme.words.some(v => v.word === w.answer) ? i : -1).filter((i:number) => i >= 0));
 const frequency = new Array(words.length).fill(0);
 const anchorAttempts = new Array(words.length).fill(0);
 const acceptedSets: Set<number>[] = [];
 let attempts = 0;
 for (let number=0; number<256; number++) {
  const target = number < 64 ? 6 : 7;
  let accepted = false;
  while (!accepted) {
   if (++attempts > 60000) throw new Error(`Insufficient ${theme.id}: ${number}`);
   const candidates = [...themed].filter(w => shared[w].length >= 4).map(w => ({w,score: frequency[w] + anchorAttempts[w]*.7 + random()*30})).sort((a,b)=>a.score-b.score);
   const first = candidates[0].w; anchorAttempts[first]++;
   const entries: Placement[] = [{word:first,row:0,col:0,down:random()<.5?1:0}];
   const occupied = new Map<string, Cell>();
   function add(entry: Placement) { letters[entry.word].forEach((letter,index)=>{ const k=key(entry.row+(entry.down?index:0),entry.col+(entry.down?0:index));const old=occupied.get(k);occupied.set(k,{letter,down:[...(old?.down??[]),entry.down]}); }); }
   add(entries[0]);
   while(entries.length < target) {
    const present = new Set(entries.map(e=>e.word));
    const thematicCount = entries.filter(e=>themed.has(e.word)).length;
    const choices = [...new Set<number>(entries.flatMap(e=>shared[e.word]))].filter(w=>!present.has(w) && (themed.has(w) || entries.length-thematicCount<(target===7?3:2)));
    let best: (Placement & {score:number}) | null = null;
    for(const w of choices) {
     for(let index=0;index<letters[w].length;index++) for(const [k,cell] of occupied) {
      if(cell.letter!==letters[w][index] || cell.down.length>1)continue;
      const [cr,cc]=k.split(',').map(Number),down=1-cell.down[0],row=cr-(down?index:0),col=cc-(down?0:index);
      const before=key(row-(down?1:0),col-(down?0:1)),after=key(row+(down?letters[w].length:0),col+(down?0:letters[w].length));
      if(occupied.has(before)||occupied.has(after))continue;
      let cross=0,valid=true;
      for(let j=0;j<letters[w].length;j++) {
       const r=row+(down?j:0),c=col+(down?0:j),old=occupied.get(key(r,c));
       if(old) {if(old.letter!==letters[w][j]||old.down.includes(down)){valid=false;break;}cross++;}
       else if(occupied.has(key(r+(down?0:1),c+(down?1:0)))||occupied.has(key(r-(down?0:1),c-(down?1:0)))){valid=false;break;}
      }
      if(!valid||!cross)continue;
      const placement={word:w,row,col,down},b=bounds([...entries,placement]);
      if(Math.max(b.rows,b.cols)>10)continue;
      const score = (themed.has(w)?40:0) - frequency[w]*1.9 + random()*35 + cross*3 - Math.max(b.rows,b.cols)*.9 - (target===6?words[w].difficulty*3:0);
      if(!best||score>best.score)best={...placement,score};
     }
    }
    if(!best)break;
    entries.push(best);add(best);
   }
   if(entries.length!==target || entries.filter(e=>themed.has(e.word)).length<4)continue;
   const ids=entries.map(e=>e.word).sort((a,b)=>a-b),signature=ids.join(',');
   if(usedGlobal.has(signature)||acceptedSets.some(set=>ids.filter(i=>set.has(i)).length>Math.min(set.size,target)-2))continue;
   const b=bounds(entries),id=`${theme.id}-${createHash('sha256').update(signature).digest('hex').slice(0,12)}`;
   boards.push({id,theme:theme.id,size:Math.max(b.rows,b.cols),entries:entries.map(e=>[e.word,e.row-b.r,e.col-b.c,e.down])});
   usedGlobal.add(signature);acceptedSets.push(new Set(ids));ids.forEach(i=>frequency[i]++);accepted=true;
  }
 }
 const themedBoards=boards.filter(b=>b.theme===theme.id), covered=new Set(themedBoards.flatMap(b=>b.entries.map(e=>e[0])));
 reports[theme.id]={boards:themedBoards.length,attempts,uniqueWords:covered.size,themedWords:[...covered].filter(w=>themed.has(w)).length,themedPool:themed.size,uncoveredThemed:[...themed].filter(w=>!covered.has(w)).map(i=>words[i].answer),maxUsage:Math.max(...frequency),sixWords:themedBoards.filter(b=>b.entries.length===6).length,sevenWords:themedBoards.filter(b=>b.entries.length===7).length};
 console.log(theme.id,JSON.stringify(reports[theme.id]));
}
const catalog={version:1,words,boards};
fs.writeFileSync(path.join(source,'app/crossword-catalog.json'),JSON.stringify(catalog));
const reportDir=path.join(root,'outputs','crossword-variety');
fs.mkdirSync(reportDir,{recursive:true});
fs.writeFileSync(path.join(reportDir,'catalog-statistics.json'),JSON.stringify({version:1,totalBoards:boards.length,uniqueWordSets:usedGlobal.size,eligibleWords:words.length,coveredWords:new Set(boards.flatMap(b=>b.entries.map(e=>e[0]))).size,locales:Object.keys(packs).length,themes:reports},null,2));
console.log(`Wrote ${boards.length} candidate boards. Run structural validation tests before accepting.`);
