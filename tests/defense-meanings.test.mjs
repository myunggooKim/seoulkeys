import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { supportedLocaleCodes } from '../app/locale-detection.ts';
import { learningThemes } from '../app/content-themes.ts';
import { createDefenseConfig, isDefenseReadyMessage, postDefenseConfig } from '../app/godot-defense-bridge.ts';
import { validateDefenseMeaningPack, DEFENSE_FIGHTER_WORDS } from '../app/defense-meaning-pack.ts';
const packs = new Map(supportedLocaleCodes.map(locale => [locale, validateDefenseMeaningPack(JSON.parse(readFileSync(`public/i18n/defense/${locale}.json`,'utf8')),locale)]));
test('33 language packs have all theme, default and fighter definitions', () => {
 assert.equal(packs.size,33);
 for(const [locale,pack] of packs) {
  const base=createDefenseConfig(locale,true,false,undefined,true,pack);
  assert.equal(Object.keys(base.fighterMeanings).length,6);
  for(const theme of learningThemes) {
   const config=createDefenseConfig(locale,true,false,theme.words,true,pack);
   assert.equal(config.words.length,new Set(theme.words.slice(0,300).map(x=>x.word)).size);
   for(const word of config.words) assert.equal(word.meaning,pack.meanings[word.word]);
   for(const word of DEFENSE_FIGHTER_WORDS) assert.equal(config.fighterMeanings[word],pack.meanings[word]);
  }
 }
});
test('no unloaded or mismatched pack can silently produce English definitions', () => {
 assert.throws(()=>createDefenseConfig('ja',true,false));
 assert.throws(()=>createDefenseConfig('ja',true,false,undefined,true,packs.get('en')));
 assert.throws(()=>validateDefenseMeaningPack(packs.get('en'),'ja'));
 assert.throws(()=>createDefenseConfig('ja',true,false,[{word:'없는단어',meaningEn:'fake',meaningKo:'가짜'}],true,packs.get('ja')));
});
test('all independent master, music and suspension values survive bridge',()=>{
 for(const sound of [true,false])for(const music of [true,false])for(const suspended of [true,false]) {
  const config=createDefenseConfig('ko',sound,suspended,undefined,music,packs.get('ko'));
  assert.equal(config.soundEnabled,sound);assert.equal(config.musicEnabled,music);assert.equal(config.suspended,suspended);
  let result;postDefenseConfig({postMessage:(data,origin)=>result={data,origin}},'https://seoulkeys.com',config);
  assert.equal(result.origin,'https://seoulkeys.com');assert.equal(result.data.payload,config);
 }
});
test('ready handshake rejects unrelated windows and origins',()=>{
 const frame={},origin='https://seoulkeys.com', event={source:frame,origin,data:{type:'seoulkeys-defense-ready'}};
 assert.ok(isDefenseReadyMessage(event,frame,origin));
 assert.ok(!isDefenseReadyMessage({...event,source:{}},frame,origin));
 assert.ok(!isDefenseReadyMessage({...event,origin:'https://evil.example'},frame,origin));
});

test('site integration retains independent master and background music controls',()=>{
 const page=readFileSync('app/page.tsx','utf8');
 assert.match(page,/musicEnabled=\{defenseMusicEnabled\}/);
 assert.match(page,/onMusicEnabledChange=\{setDefenseMusicEnabled\}/);
 assert.match(page,/onSoundEnabledChange=\{setReturnSoundEnabled\}/);
});

test('dialog and background suspension retain distinct provenance',()=>{
 const config=createDefenseConfig('ko',true,true,undefined,true,packs.get('ko'),true,false);
 assert.equal(config.dialogSuspended,true);assert.equal(config.backgroundSuspended,false);
 const background=createDefenseConfig('ko',true,true,undefined,true,packs.get('ko'),false,true);
 assert.equal(background.dialogSuspended,false);assert.equal(background.backgroundSuspended,true);
});
