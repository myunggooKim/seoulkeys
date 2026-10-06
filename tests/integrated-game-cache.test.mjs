import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
test('service worker never freezes integrated game files or selected-language definitions',()=>{
 const source=readFileSync('public/sw.js','utf8');
 const fn=source.match(/function isCacheableAsset\(request, url\) \{[\s\S]*?\n\}/)[0];
 const context={};vm.runInNewContext(fn+';this.shouldCache=isCacheableAsset;',context);
 const request={mode:'cors',destination:'image',headers:{get:()=>null}};
 for(const pathname of ['/games/seoul-defense/index.pck','/games/seoul-defense/preview.png','/games/crossword/board.html','/games/crossword/music.mp3','/i18n/defense/ar.json','/i18n/crossword/ja.json'])assert.equal(context.shouldCache(request,new URL('https://seoulkeys.com'+pathname)),false,pathname);
 assert.equal(context.shouldCache(request,new URL('https://seoulkeys.com/images/unrelated.png')),true);
});
test('game cache rules survive the production build without changing shared site cache policy',()=>{
 const source=readFileSync('public/_headers','utf8');
 assert.equal(readFileSync('dist/client/_headers','utf8'),source);
 for(const scope of ['/games/seoul-defense/*','/games/crossword-studio-v17/*','/i18n/defense/*','/i18n/crossword/*'])assert.ok(source.includes(scope+'\n  Cache-Control: public, max-age=0, must-revalidate'));
 assert.doesNotMatch(source,/Access-Control-Allow-Origin|Content-Security-Policy|X-Frame-Options/);
});
