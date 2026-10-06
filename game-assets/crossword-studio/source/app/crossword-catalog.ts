import catalog from './crossword-catalog.json';
import type { CrosswordPuzzle } from './ProgressivePuzzles';

export const CROSSWORD_CATALOG_VERSION = catalog.version;
export const CROSSWORD_THEME_IDS = ['travel', 'business', 'friends', 'reading'] as const;
export type GardenDeck = { version: 1; seen: string[]; recent: string[][]; cycle: number; seed: number; lastId: string | null };
const themeNames: Record<string, [string, string]> = {travel: ['여행', 'Travel'], business: ['일과 업무', 'Work'], friends: ['친구와 일상', 'Friends and daily life'], reading: ['읽기와 생활', 'Reading and everyday signs']};
const byId = new Map(catalog.boards.map(board => [board.id, board]));
export function gardenThemeKey(themeId?: string) { return CROSSWORD_THEME_IDS.some(id => id === themeId) ? themeId! : 'core'; }
export function gardenCatalog(themeId?: string) { const theme = gardenThemeKey(themeId); return theme === 'core' ? catalog.boards : catalog.boards.filter(board => board.theme === theme); }
export function gardenCatalogBoard(id: string): CrosswordPuzzle | null {
 const source = byId.get(id); if (!source) return null;
 const [titleKo,titleEn] = themeNames[source.theme];
 return {id:source.id,size:source.size,titleKo,titleEn,entries:source.entries.map(([word,row,col,down],i)=>({...catalog.words[word],id:`${source.id}-${i}`,row,col,direction:down?'down':'across'}))};
}
export function createGardenDeck(seed = 0x41c64e6d): GardenDeck { return {version:1,seen:[],recent:[],cycle:0,seed:seed>>>0,lastId:null}; }
export function readGardenDeck(value: unknown, themeId?: string): GardenDeck | null {
 if (!value || typeof value !== 'object') return null;
 const v=value as GardenDeck, allowed=new Set(gardenCatalog(themeId).map(b=>b.id));
 if(v.version!==1||!Array.isArray(v.seen)||v.seen.length>allowed.size||v.seen.some(id=>typeof id!=='string'||!allowed.has(id))||new Set(v.seen).size!==v.seen.length)return null;
 if(!Array.isArray(v.recent)||v.recent.length>6||v.recent.some(row=>!Array.isArray(row)||row.length>7||row.some(w=>typeof w!=='string'||!/^[가-힣]{1,20}$/.test(w))))return null;
 if(!Number.isSafeInteger(v.cycle)||v.cycle<0||v.cycle>10000000||!Number.isSafeInteger(v.seed)||v.seed<0||v.seed>0xffffffff)return null;
 if(v.lastId!==null&&(typeof v.lastId!=='string'||!allowed.has(v.lastId)))return null;
 return {version:1,seen:[...v.seen],recent:v.recent.map(row=>[...row]),cycle:v.cycle,seed:v.seed,lastId:v.lastId};
}
/** Every answer set is visited once per deck; recent answers break ties before a fresh seeded shuffle. */
export function drawGardenBoard(previous: GardenDeck, index: number, themeId?: string): {puzzle: CrosswordPuzzle; deck: GardenDeck} {
 const source=gardenCatalog(themeId), seen=new Set(previous.seen);
 let candidates=source.filter(board=>!seen.has(board.id));
 let cycle=previous.cycle;
 if(!candidates.length){seen.clear();candidates=source.filter(board=>board.id!==previous.lastId);cycle++;}
 // Six-word opening rounds; after onboarding the full 6–7-word catalog remains available.
 if(index<3){const easy=candidates.filter(board=>board.entries.length===6 && board.size<=8);if(easy.length)candidates=easy;}
 const recent=previous.recent.map(row=>new Set(row));
 let seed=previous.seed,bestScore=Infinity,chosen=candidates[0];
 for(const candidate of candidates){
  const answers=candidate.entries.map(([word])=>catalog.words[word].answer);
  let penalty=0;
  recent.forEach((row,i)=>{penalty+=answers.filter(answer=>row.has(answer)).length * [1,4,16,64,256,4096][6-recent.length+i];});
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const score=penalty+seed/4294967296;
  if(score<bestScore){bestScore=score;chosen=candidate;}
 }
 const puzzle=gardenCatalogBoard(chosen.id)!;
 seen.add(chosen.id);
 return {puzzle,deck:{version:1,seen:[...seen],cycle,seed,lastId:chosen.id,recent:[...previous.recent,puzzle.entries.map(e=>e.answer)].slice(-6)}};
}
