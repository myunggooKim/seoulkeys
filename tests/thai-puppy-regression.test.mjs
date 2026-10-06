import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
test('shared Thai puppy entry and regeneration override preserve the approved correction',()=>{
 const shared=JSON.parse(readFileSync('public/i18n/th.json','utf8'));
 assert.equal(shared.puppy,'ลูกสุนัข');
 const game=JSON.parse(readFileSync('public/i18n/defense/th.json','utf8'));
 assert.equal(game.meanings['강아지'],'ลูกสุนัข');
 // Inspect only the literal override table, without importing translation models or calling a service.
 const result=spawnSync(process.platform === 'win32' ? 'python' : 'python3',['-c',`import ast,json\ns=ast.parse(open('scripts/generate-static-i18n-packs.py').read())\na=next(x for x in s.body if isinstance(x,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='MANUAL_OVERRIDES' for t in x.targets))\nprint(json.dumps(ast.literal_eval(a.value)['th']['puppy'],ensure_ascii=False))`],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout),'ลูกสุนัข');
 const generator=readFileSync('scripts/generate-static-i18n-packs.py','utf8');
 assert.match(generator,/completed\.update\(MANUAL_OVERRIDES\.get\(locale, \{\}\)\)/);
});
