import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { crosswordCeramicPalette } from '../game-assets/crossword-studio/source/app/crossword-tile-style.ts';
test('active words are visibly blue; focus is stronger; solved intersections stay jade',()=>{
 const neutral=crosswordCeramicPalette(false,false,false),active=crosswordCeramicPalette(false,true,false),focused=crosswordCeramicPalette(false,true,true),solved=crosswordCeramicPalette(true,false,false),intersection=crosswordCeramicPalette(true,true,true);
 assert.notDeepEqual(active,neutral);assert.notDeepEqual(active,focused);assert.deepEqual(solved,intersection);
 const renderer=fs.readFileSync(new URL('../game-assets/crossword-studio/source/app/crossword-scene.ts',import.meta.url),'utf8');
 assert.match(renderer,/crosswordCeramicPalette\(cell\.solved,\s*cell\.active,\s*focused\)/);
 const diorama=fs.readFileSync(new URL('../game-assets/crossword-studio/source/app/CrosswordDiorama.tsx',import.meta.url),'utf8');
 assert.match(diorama,/data-active-word/);assert.match(diorama,/data-input-position/);assert.match(diorama,/aria-current/);
});
