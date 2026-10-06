import { CROSSWORD_CATALOG_VERSION, gardenCatalogBoard, gardenThemeKey, readGardenDeck, type GardenDeck } from './crossword-catalog';
import type { CrosswordEntry } from './ProgressivePuzzles';
export type GardenCheckpoint = {
 version: 1; catalogVersion: number; theme: string; puzzleId: string; index: number; deck: GardenDeck;
 score: number; stars: number; best: number; words: Array<Pick<CrosswordEntry, 'answer'|'clueEn'|'clueKo'>>;
 activeEntryId: string; drafts: Record<string,string>; solved: string[]; assisted: string[]; revealed: string[];
 seconds: number; hints: number; mistakes: number; streak: number;
};
export function gardenCheckpointKey(themeId?: string) { return `seoulkeys-atelier-catalog-v1-${gardenThemeKey(themeId)}`; }
export function readGardenCheckpoint(raw: string|null, themeId?: string): GardenCheckpoint|null {
 try {
  if(!raw||raw.length>300000)return null;
  const v=JSON.parse(raw) as GardenCheckpoint;
  if(!v||v.version!==1||v.catalogVersion!==CROSSWORD_CATALOG_VERSION||v.theme!==gardenThemeKey(themeId))return null;
  const deck=readGardenDeck(v.deck,themeId),puzzle=gardenCatalogBoard(v.puzzleId);
  if(!deck||!puzzle||!deck.seen.includes(puzzle.id)||deck.lastId!==puzzle.id)return null;
  const ids=new Set(puzzle.entries.map(e=>e.id));
  if(!ids.has(v.activeEntryId))return null;
  for(const field of ['index','score','stars','best','seconds','hints','mistakes','streak'] as const)if(!Number.isSafeInteger(v[field])||v[field]<0||v[field]>10000000)return null;
  if(!v.drafts||typeof v.drafts!=='object'||Array.isArray(v.drafts)||Object.entries(v.drafts).some(([id,draft])=>!ids.has(id)||typeof draft!=='string'||draft.length>20))return null;
  for(const field of ['solved','assisted','revealed'] as const)if(!Array.isArray(v[field])||v[field].length>7||new Set(v[field]).size!==v[field].length||v[field].some(id=>!ids.has(id)))return null;
  if(v.solved.some(id=>v.drafts[id]!==puzzle.entries.find(e=>e.id===id)!.answer))return null;
  if(!Array.isArray(v.words)||v.words.length>500||v.words.some(w=>!w||typeof w.answer!=='string'||!/^[가-힣]{1,20}$/.test(w.answer)||typeof w.clueKo!=='string'||w.clueKo.length>300||typeof w.clueEn!=='string'||w.clueEn.length>300))return null;
  return {...v,deck};
 }catch{return null;}
}
