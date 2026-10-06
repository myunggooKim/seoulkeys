import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base=new URL('../public/games/seoul-defense/',import.meta.url);
const sha=b=>createHash('sha256').update(b).digest('hex');
const patch='093b7ba57eea50b14aa548f6182be078229a15ccb8bfa059a5baad7976881460';
test('Reviewed browser audio transport is actually shipped and cache-versioned',async()=>{
 const js=await readFile(new URL('index.js',base));
 const html=await readFile(new URL('index.html',base),'utf8');
 assert.equal(sha(js),patch);
 assert.match(html,/src="index\.js\?audio=093b7ba57eea"/);
 assert.match(js.toString(),/seoulDefenseSampleAudio/);
});
test('Patched export manifest matches final engine, HTML and packed game bytes',async()=>{
 const manifest=JSON.parse(await readFile(new URL('audio-stability-build.json',base),'utf8'));
 assert.equal(manifest.sample_audio_patch,patch);
 for(const file of ['index.js','index.html','index.pck']) assert.equal(sha(await readFile(new URL(file,base))),manifest.files[file]);
});
