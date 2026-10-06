import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import test from 'node:test';
import {build} from 'esbuild';
import {validateGameActivity, readGameActivityRequest} from '../app/game-activity-model.ts';
import {GameActivityTracker} from '../app/game-activity-tracker.ts';
import {recordGameActivity, readGameActivity} from '../db/game-activity.ts';

const migration = await readFile(new URL('../migrations/0004_game_activity.sql', import.meta.url), 'utf8');
const alice = 'alice@example.invalid', bob = 'bob@example.invalid';
const wall = Date.parse('2026-10-06T08:00:00Z');
const packet = (seconds = 60, game = 'falling-words', extra = {}) => ({id:crypto.randomUUID(), game, seconds, playedAt:wall, ...extra});
function fixture() {
  const sql = new DatabaseSync(':memory:');
  sql.exec(`PRAGMA foreign_keys=ON; CREATE TABLE users(email TEXT PRIMARY KEY);
    CREATE TABLE learning_progress(user_email TEXT PRIMARY KEY, accuracy INTEGER, typing_seconds INTEGER);
    INSERT INTO learning_progress VALUES('preserved@example.invalid',99,777);
    CREATE TABLE forum_entries(id TEXT PRIMARY KEY,body TEXT); INSERT INTO forum_entries VALUES('welcome','Preserve this');`);
  for (const email of [alice,bob]) sql.prepare('INSERT INTO users VALUES(?)').run(email);
  sql.exec(migration);
  const db = {prepare(query) {return {values:[], bind(...values) {this.values=values;return this;},
    async all() {return {results:sql.prepare(query).all(...this.values),success:true};},
    execute() {if (/^\s*SELECT/i.test(query)) return {success:true,results:sql.prepare(query).all(...this.values)};
      const result=sql.prepare(query).run(...this.values);return {success:true,results:[],meta:{changes:Number(result.changes)}};}};},
    async batch(statements) {sql.exec('BEGIN');try {const rows=statements.map(s=>s.execute());sql.exec('COMMIT');return rows;}catch(e){sql.exec('ROLLBACK');throw e;}}};
  return {sql,db};
}
function clock(sender = async () => 'ok') {
  let time=0;const sent=[];
  const tracker=new GameActivityTracker('crossword',()=>time,()=>wall+time,()=>crypto.randomUUID(),async(p,k)=>{sent.push({...p,keepalive:k});return sender(p,k);});
  const tick=(seconds)=>{for(let i=0;i<seconds;i++){time+=1000;tracker.advance();}};
  return {tracker,sent,tick,jump:ms=>{time+=ms;tracker.advance();}};
}
const settled=()=>new Promise(resolve=>setImmediate(resolve));

test('migration is additive and repeatable, preserves old data, and deletes account-owned records with account',async()=>{
  const {sql,db}=fixture(); await recordGameActivity(db,alice,packet(),wall); sql.exec(migration);
  assert.deepEqual({...sql.prepare('SELECT * FROM learning_progress').get()},{user_email:'preserved@example.invalid',accuracy:99,typing_seconds:777});
  assert.equal(sql.prepare('SELECT body FROM forum_entries').get().body,'Preserve this');
  assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM game_activity').get().n,1);
  assert.doesNotMatch(migration,/(?:^|;)\s*(?:DROP|ALTER|DELETE|UPDATE)\b/i);
  sql.prepare('DELETE FROM users WHERE email=?').run(alice);
  assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM game_activity').get().n,0);sql.close();
});
test('short-lived dedup receipts expire in bounded indexed cleanup while long-term game totals remain',async()=>{
  const {sql,db}=fixture();for(let i=0;i<110;i++)await recordGameActivity(db,alice,packet(1),wall);
  const later=wall+172_800_001;await recordGameActivity(db,bob,packet(5,'crossword',{playedAt:later}),later);
  assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM game_activity WHERE user_email=?').get(alice).n,10);
  assert.equal((await readGameActivity(db,alice))[0].seconds,110);
  await recordGameActivity(db,bob,packet(1,'missing-letter',{playedAt:later}),later);
  assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM game_activity WHERE user_email=?').get(alice).n,0);
  assert.equal((await readGameActivity(db,alice))[0].seconds,110);
  sql.prepare('DELETE FROM users WHERE email=?').run(alice);
  assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM game_activity_totals WHERE user_email=?').get(alice).n,0);sql.close();
});
test('immutable batch retries, reordered delivery, member isolation and game breakdown are correct',async()=>{
  const {sql,db}=fixture();const first=packet(60), second=packet(15,'crossword',{playedAt:wall-1000});
  await Promise.all(Array.from({length:10},()=>recordGameActivity(db,alice,first,wall)));
  await recordGameActivity(db,alice,second,wall);await recordGameActivity(db,bob,first,wall);
  const rows=await readGameActivity(db,alice);assert.deepEqual(rows.map(r=>r.seconds),[60,0,15]);
  assert.equal(rows[2].lastPlayedAt,wall-1000);assert.equal((await readGameActivity(db,bob))[0].seconds,60);
  await assert.rejects(recordGameActivity(db,alice,{...first,game:'crossword'},wall),e=>e.status===409);
  await assert.rejects(recordGameActivity(db,alice,{...first,seconds:59},wall),e=>e.status===409);
  assert.equal(sql.prepare('SELECT SUM(active_seconds) AS s FROM game_activity WHERE user_email=?').get(alice).s,75);sql.close();
});
test('per-account hourly time and packet caps are atomic and duplicate packets still succeed at cap',async()=>{
  const {sql,db}=fixture(); const first=packet();await recordGameActivity(db,alice,first,wall);
  for(let i=1;i<60;i++)await recordGameActivity(db,alice,packet(),wall);
  await assert.rejects(recordGameActivity(db,alice,packet(1),wall),e=>e.status===429);
  await recordGameActivity(db,alice,first,wall);await recordGameActivity(db,bob,packet(),wall);
  await recordGameActivity(db,alice,packet(),wall+3_600_001);
  sql.exec('DELETE FROM game_activity');
  for(let i=0;i<240;i++)await recordGameActivity(db,alice,packet(1),wall);
  await assert.rejects(recordGameActivity(db,alice,packet(1),wall),e=>e.status===429);sql.close();
});
test('indexed member reads, no other user identity in summary, and no unknown games',async()=>{
  const {sql,db}=fixture();const summary=await readGameActivity(db,alice);
  assert.equal(summary.length,3);assert.ok(summary.every(r=>r.seconds===0&&r.lastPlayedAt===0));
  assert.doesNotMatch(JSON.stringify(summary),/@|email|batch_id/);
  const plan=sql.prepare('EXPLAIN QUERY PLAN SELECT * FROM game_activity WHERE user_email=? AND received_at>?').all(alice,0);
  assert.match(JSON.stringify(plan),/USING INDEX|USING COVERING INDEX/);sql.close();
});
test('payload accepts bounded telemetry only, rejects forged values, and discards claimed identity',()=>{
  const valid=packet();assert.deepEqual(validateGameActivity({...valid,email:bob,score:999},wall),valid);
  for(const change of [{seconds:0},{seconds:61},{seconds:NaN},{seconds:1.5},{game:'unknown'},{id:'x'},{playedAt:wall+10001},{playedAt:wall-86400001}])
    assert.throws(()=>validateGameActivity({...valid,...change},wall));
  for(const value of [null,[],true,''])assert.throws(()=>validateGameActivity(value,wall));
});
test('POST body rejects cross-origin, wrong type, malformed JSON and oversized chunked requests',async()=>{
  const make=(body,headers={})=>new Request('https://seoulkeys.com/api/game-activity',{method:'POST',headers:{origin:'https://seoulkeys.com','content-type':'application/json',...headers},body});
  assert.equal((await readGameActivityRequest(make(JSON.stringify({...packet(),playedAt:Date.now()})))).seconds,60);
  for(const [body,headers,status] of [['{}',{origin:'https://attacker.invalid'},403],['{}',{'content-type':'text/plain'},415],['{',{},400],[' '.repeat(1025),{},413]])
    await assert.rejects(readGameActivityRequest(make(body,headers)),e=>e.status===status);
});
test('clock counts only started foreground interaction, stops exactly at 60 seconds idle',async()=>{
  const {tracker,sent,tick}=clock();tracker.setRunning(true);tracker.setForeground(true);tick(20);tracker.flush();await settled();assert.equal(sent.length,0);
  tracker.interact();tick(80);tracker.flush();await settled();assert.equal(sent.reduce((sum,p)=>sum+p.seconds,0),60);
  tick(60);tracker.flush();await settled();assert.equal(sent.length,1);
});
test('pause, solved/locked states, blur and hidden tabs do not count; returning requires fresh interaction',async()=>{
  const {tracker,sent,tick}=clock();tracker.setRunning(true);tracker.setForeground(true);tracker.interact();tick(8);
  tracker.setRunning(false);tick(100);tracker.setRunning(true);tick(1);tracker.interact();tick(6);
  tracker.setForeground(false);tick(100);tracker.setForeground(true);tick(10);tracker.interact();tick(4);
  tracker.flush(true);await settled();assert.equal(sent.reduce((sum,p)=>sum+p.seconds,0),18);assert.ok(sent.every(p=>p.keepalive));
});
test('IME/touch interactions resume clock without altering answers; suspended computer adds no time',async()=>{
  const {tracker,sent,tick,jump}=clock();tracker.setRunning(true);tracker.setForeground(true);tracker.interact();tick(3);
  jump(60*60*1000);tick(2);tracker.interact();tick(5);tracker.flush();await settled();assert.equal(sent[0].seconds,8);
});
test('failed writes never throw into game, retry uses same ID and boundary/in-flight sends are idempotent',async()=>{
  let ok=false;const {tracker,sent,tick}=clock(async()=>{if(!ok)throw new Error('offline');return 'ok';});
  tracker.setRunning(true);tracker.setForeground(true);tracker.interact();tick(30);tracker.flush();await settled();
  ok=true;tracker.flush();await settled();assert.equal(sent.length,2);assert.equal(sent[0].id,sent[1].id);
  tracker.flush();await settled();assert.equal(sent.length,2);
  let resolve;const c=clock(()=>new Promise(done=>{resolve=done;}));c.tracker.setRunning(true);c.tracker.setForeground(true);c.tracker.interact();c.tick(2);
  c.tracker.flush();c.tracker.flush(true);assert.equal(c.sent[0].id,c.sent[1].id);resolve('ok');
});
test('signed-out/expired auth stops future writes and offline queue is bounded',async()=>{
  const {tracker,sent,tick}=clock(async()=>'stop');tracker.setRunning(true);tracker.setForeground(true);tracker.interact();tick(3);tracker.flush();await settled();
  tracker.interact();tick(5);tracker.flush();await settled();assert.equal(sent.length,1);
  const c=clock(async()=>'retry');c.tracker.setRunning(true);c.tracker.setForeground(true);
  for(let i=0;i<100;i++){c.tracker.interact();c.tick(60);c.tracker.flush();await settled();}
  assert.ok(new Set(c.sent.map(p=>p.id)).size<=10);
});
test('full API handlers enforce sign-in/owner authorization, use session identity, and fail closed without migration',async()=>{
  const {sql,db}=fixture();globalThis.__gameActivityTest={db,member:null,admin:null};
  async function route(name){const {outputFiles}=await build({entryPoints:[fileURLToPath(new URL(name,import.meta.url))],bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'isolate-auth',setup(b){
    b.onResolve({filter:/cloudflare:workers$|server-auth$|admin-auth$/},args=>({path:args.path,namespace:'fixture'}));
    b.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:args.path==='cloudflare:workers'?'export const env={get DB(){return globalThis.__gameActivityTest.db}};':args.path.endsWith('server-auth')?'export async function getAuthenticatedMember(){return globalThis.__gameActivityTest.member;}':'export async function getAdminUser(){return globalThis.__gameActivityTest.admin;}'}));
  }}]});return import('data:text/javascript;base64,'+Buffer.from(outputFiles[0].text).toString('base64'));}
  const write=await route('../app/api/game-activity/route.ts'),read=await route('../app/api/admin/game-activity/route.ts');
  const req=()=>new Request('https://seoulkeys.com/api/game-activity',{method:'POST',headers:{origin:'https://seoulkeys.com','content-type':'application/json'},body:JSON.stringify({...packet(20),playedAt:Date.now(),email:bob})});
  assert.equal((await write.POST(req())).status,401);assert.equal((await read.GET(new Request('https://seoulkeys.com/api/admin/game-activity?email='+alice))).status,403);
  globalThis.__gameActivityTest.member={identity:{email:alice}};assert.equal((await write.POST(req())).status,200);
  assert.equal((await readGameActivity(db,alice))[0].seconds,20);assert.equal((await readGameActivity(db,bob))[0].seconds,0);
  globalThis.__gameActivityTest.admin={email:alice};const response=await read.GET(new Request('https://seoulkeys.com/api/admin/game-activity?email='+alice));
  assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal((await response.json()).games[0].seconds,20);
  sql.exec('DROP TABLE game_activity; DROP TABLE game_activity_totals');assert.equal((await write.POST(req())).status,503);assert.equal((await read.GET(new Request('https://seoulkeys.com/api/admin/game-activity?email='+alice))).status,503);
  delete globalThis.__gameActivityTest;sql.close();
});
test('tracking is explicitly wired to all three games, and passive listeners preserve keyboard/IME/game behavior',async()=>{
  const home=await readFile(new URL('../app/page.tsx',import.meta.url),'utf8');
  for(const name of ['FallingWordsGame','MissingLetterGame','CrosswordGame'])assert.match(home,new RegExp(`<${name}[^\\n]*suspended=\\{exitPromptOpen\\}[^\\n]*activityTracking=\\{signedIn === true\\}`));
  const hook=await readFile(new URL('../app/use-game-activity.ts',import.meta.url),'utf8');
  assert.match(hook,/if \(!signedIn \|\| !element\) return/);assert.match(hook,/event\.isTrusted/);assert.match(hook,/compositionend/);assert.match(hook,/document\.hasFocus/);
  assert.doesNotMatch(hook,/preventDefault|stopPropagation|localStorage|sessionStorage|\.key\b|\.value\b|vertex|ai\.run/);
  assert.match(hook,/clearInterval/);assert.match(hook,/removeEventListener/);
});
