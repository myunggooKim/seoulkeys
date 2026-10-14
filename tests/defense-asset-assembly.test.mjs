import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,cp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {assembleDefenseAssets} from '../scripts/assemble-defense-assets.mjs';
test('fresh checkout reconstructs the exact pack, is idempotent and rejects corrupted parts',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'seoulkeys-defense-assets-'));
 try{
  await cp('game-assets/seoul-defense',path.join(root,'game-assets/seoul-defense'),{recursive:true});
  await mkdir(path.join(root,'public/games/seoul-defense'),{recursive:true});
  await writeFile(path.join(root,'public/games/seoul-defense/unrelated.txt'),'keep');
  const first=await assembleDefenseAssets(root);assert.equal(first.changed,true);assert.equal(first.sha256,'f95d559d9f2ef7a8ec5c38d6f99734d118b07492e6a6ffb49ba6390ed2af0819');
  assert.equal((await assembleDefenseAssets(root)).changed,false);
  assert.deepEqual(await readFile(path.join(root,'public/games/seoul-defense/index.pck')),await readFile('public/games/seoul-defense/index.pck'));
  await writeFile(path.join(root,'game-assets/seoul-defense/index.pckpart1'),'corrupt');
  await assert.rejects(assembleDefenseAssets(root),/integrity check/);
  assert.equal(await readFile(path.join(root,'public/games/seoul-defense/unrelated.txt'),'utf8'),'keep');
 }finally{await rm(root,{recursive:true,force:true});}
});
