import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
test('Defense reserves visible ad boxes at common desktop widths without an ad provider',async()=>{
 const host=await readFile(new URL('../app/GodotDefenseGame.tsx',import.meta.url),'utf8');
 const css=await readFile(new URL('../app/godot-defense.css',import.meta.url),'utf8');
 assert.match(host,/window\.innerWidth >= 1400 && stage\.clientWidth >= 1340/);
 assert.equal((host.match(/showSideRails && <aside/g)||[]).length,2);
 assert.match(host,/is-placeholder/);assert.match(css,/width: 160px; height: 600px/);
 assert.match(css,/column-gap: 150px/);assert.match(css,/\.game-demo:has\(> \.godot-defense-game\)/);
 assert.match(css,/@container defense-panel \(max-width: 900px\)/);
 for(const width of [1440,1536]){const stage=width-60;assert.equal(stage-2*(160+150),width===1440?760:856);}
 for(const width of [390,768,1280])assert.equal(width>=1400,false);
});
