import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import test from 'node:test';
import {createEntry,readFeed,readThread,removeOrModerate,reportEntry,moderationQueue,forumViewer} from '../db/forum.ts';
import {reserveTranslation,cachedTranslation,finishTranslation,translationEntry} from '../db/forum-translations.ts';
import {readForumRequest,validatePost} from '../app/community/model.ts';
import {modelResponseText,protectLearningExamples,restoreLearningExamples,translationMessages,parseTranslation,translationMonth,translationPricingExpires,translationMaxOutputTokens} from '../app/community/translation-policy.ts';

const migration=await readFile(new URL('../migrations/0002_learner_forum.sql',import.meta.url),'utf8');
const likesMigration=await readFile(new URL('../migrations/0003_forum_likes.sql',import.meta.url),'utf8');
function fixture(){
  const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON; CREATE TABLE users(email TEXT PRIMARY KEY); CREATE TABLE learning_progress(user_email TEXT PRIMARY KEY,accuracy INTEGER); INSERT INTO users VALUES(\'untouched@example.invalid\'); INSERT INTO learning_progress VALUES(\'untouched@example.invalid\',99);');sql.exec(migration);sql.exec(likesMigration);
  const db={prepare(query){return {values:[],bind(...values){this.values=values;return this;},async first(column){const row=sql.prepare(query).get(...this.values);return column?row?.[column]??null:row??null;},async all(){return {results:sql.prepare(query).all(...this.values),success:true};},async run(){const result=sql.prepare(query).run(...this.values);return {success:true,meta:{changes:Number(result.changes)}};}};},async batch(statements){sql.exec('BEGIN');try{const result=[];for(const statement of statements)result.push(await statement.run());sql.exec('COMMIT');return result;}catch(error){sql.exec('ROLLBACK');throw error;}}};
  return {db,sql};
}
const post=(values={})=>({action:'create',id:crypto.randomUUID(),kind:'post',alias:'Learner',language:'es',tag:'question',title:'How do I type this?',body:'Me cuesta escribir ㄱ + ㅏ = 가. D → ㅇ',consent:true,website:'',...values});
const email='learner@example.invalid';
test('forum migration is additive, repeatable and preserves existing learning records',()=>{
 const {sql}=fixture();sql.exec(migration);assert.equal(sql.prepare('SELECT accuracy FROM learning_progress').get().accuracy,99);assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM users').get().n,1);assert.equal(sql.prepare("SELECT COUNT(*) AS n FROM forum_entries WHERE id='welcome'").get().n,1);assert.doesNotMatch(migration,/\b(?:DROP|ALTER|DELETE|UPDATE)\s+(?:TABLE\s+)?(?:users|learning_progress|classes|visitors|presence)\b/i);sql.close();
});
test('welcome has real paragraph breaks rather than literal escape sequences',()=>{
 const {sql}=fixture();const body=sql.prepare("SELECT body FROM forum_entries WHERE id='welcome'").get().body;assert.ok(body.includes('\n\n'));assert.ok(!body.includes('\\n'));sql.close();
});
test('post validation rejects impersonation, contact nicknames, invalid languages and oversized content',()=>{
 for(const values of [{alias:'admin'},{alias:'x@example.com'},{alias:'운영자'},{language:'xx'},{body:'x'.repeat(3001)},{title:'xx'},{consent:false},{website:'spam'},{id:'welcome'},{body:'a\u0000b'}])assert.throws(()=>validatePost(post(values)));
 assert.equal(validatePost(post({body:'가\r\n나'})).body,'가\n나');
});
test('writes require same-origin JSON and bound chunked request bodies',async()=>{
 const make=(headers,body='{}')=>new Request('https://seoulkeys.com/api/community',{method:'POST',headers,body});
 await assert.rejects(readForumRequest(make({'origin':'https://evil.invalid','content-type':'application/json'})),/origin/);
 await assert.rejects(readForumRequest(make({'origin':'https://seoulkeys.com','content-type':'text/plain'})),/invalid/);
 await assert.rejects(readForumRequest(make({'origin':'https://seoulkeys.com','content-type':'application/json'},'x'.repeat(20001))),/tooLarge/);
 assert.deepEqual(await readForumRequest(make({'origin':'https://seoulkeys.com','content-type':'application/json'},'{"action":"create"}')),{action:'create'});
});
test('a post, reply and public feed roundtrip without exposing private account email',async()=>{
 const {db,sql}=fixture();const input=post();await createEntry(db,email,input);await createEntry(db,email,post({kind:'comment',parentId:input.id,body:'Gracias, ㅎ + ㅏ = 하'}));
 const feed=await readFeed(db,null,null);assert.equal(feed.entries.length,1);assert.equal(feed.entries[0].replies,1);assert.equal((await readThread(db,input.id)).comments.length,1);assert.ok(!(JSON.stringify(feed).includes(email)));assert.ok(!(JSON.stringify(await readThread(db,input.id)).includes(email)));assert.match((await forumViewer(db,email,false)).authorId,/^[a-f0-9-]{36}$/);sql.close();
});
test('idempotent submission and atomic account rate limits cannot produce extra posts',async()=>{
 const {db,sql}=fixture();const first=post();await createEntry(db,email,first);await createEntry(db,email,first);for(let i=0;i<4;i++)await createEntry(db,email,post({body:`Distinct message ${i}`}));
 await assert.rejects(createEntry(db,email,post({body:'sixth message'})),/rate/);assert.equal((await readFeed(db,null,null)).entries.length,5);sql.close();
});
test('pagination has stable cursors at equal timestamps and filters by topic',async()=>{
 const {db,sql}=fixture();for(let i=0;i<25;i++)await createEntry(db,`learner${i}@example.invalid`,post({tag:i%2?'chat':'question',body:`Message ${i}`}),100000);
 const first=await readFeed(db,null,null);const second=await readFeed(db,null,first.next);assert.equal(first.entries.length,20);assert.equal(second.entries.length,5);assert.equal(new Set([...first.entries,...second.entries].map(e=>e.id)).size,25);assert.equal((await readFeed(db,'question',null)).entries.length,13);await assert.rejects(readFeed(db,null,'0:bad'),/invalid/);sql.close();
});
test('deletion is owner-only and recoverable; hidden parents make replies unavailable',async()=>{
 const {db,sql}=fixture();const input=post();await createEntry(db,email,input);await createEntry(db,email,post({kind:'comment',parentId:input.id,body:'A reply'}));
 await assert.rejects(removeOrModerate(db,'another@example.invalid',false,{action:'delete',id:input.id}),/forbidden/);
 await assert.rejects(removeOrModerate(db,email,false,{action:'hide',id:input.id}),/forbidden/);
 const reply=sql.prepare('SELECT id FROM forum_entries WHERE parent_id=?').get(input.id).id;
 await removeOrModerate(db,email,false,{action:'delete',id:input.id});await assert.rejects(readThread(db,input.id),/missing/);assert.equal(await translationEntry(db,reply),null);assert.equal(sql.prepare('SELECT body FROM forum_entries WHERE id=?').get(input.id).body,input.body);sql.close();
});
test('reports are deduplicated, do not automatically hide content and show reasons only in moderation',async()=>{
 const {db,sql}=fixture();const input=post();await createEntry(db,email,input);await reportEntry(db,email,{id:input.id,reason:'Spam concern'});await reportEntry(db,email,{id:input.id,reason:'Spam concern'});
 assert.equal((await readFeed(db,null,null)).entries.length,1);const queue=await moderationQueue(db);assert.equal(queue[0].reports,1);assert.equal(queue[0].report_reasons,'Spam concern');assert.ok(!JSON.stringify(await readFeed(db,null,null)).includes('Spam concern'));sql.close();
});
test('moderator actions are audited and blocked profiles cannot publish',async()=>{
 const {db,sql}=fixture();const input=post();await createEntry(db,email,input);await removeOrModerate(db,'owner@example.invalid',true,{action:'block',id:input.id});await assert.rejects(createEntry(db,email,post({body:'blocked new message'})),/blocked/);await removeOrModerate(db,'owner@example.invalid',true,{action:'unblock',id:input.id});await createEntry(db,email,post({body:'allowed again'}));assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM forum_moderation').get().n,2);sql.close();
});
test('only one translation job claims a locale and reserves budget, even before success',async()=>{
 const {db,sql}=fixture();const input=post();await createEntry(db,email,input);const first=await reserveTranslation(db,input.id,1,'ja',email);const second=await reserveTranslation(db,input.id,1,'ja',email);assert.equal(first.owned,true);assert.equal(second.owned,false);assert.equal(sql.prepare('SELECT reserved_krw FROM forum_translation_budget').get().reserved_krw,100);await finishTranslation(db,first.requestId,{title:'質問',body:'テスト ㄱ'});assert.equal((await cachedTranslation(db,input.id,1,'ja')).status,'ready');sql.close();
});
test('monthly translation budget fails closed at 100 reservations without calling AI',async()=>{
 const {db,sql}=fixture();const input=post();await createEntry(db,email,input);const now=Date.now();sql.prepare('INSERT INTO forum_translation_budget(month,reserved_krw) VALUES(?,9900)').run(translationMonth(now));await reserveTranslation(db,input.id,1,'ja',email,now);await assert.rejects(reserveTranslation(db,input.id,1,'en',email,now),/translationLimit/);assert.equal(sql.prepare('SELECT reserved_krw FROM forum_translation_budget').get().reserved_krw,10000);assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM forum_translations').get().n,1);sql.close();
});
test('failed translations never refund uncertain billed requests or automatically retry',async()=>{
 const {db,sql}=fixture();const input=post();await createEntry(db,email,input);const first=await reserveTranslation(db,input.id,1,'ja',email);await finishTranslation(db,first.requestId,null);const next=await reserveTranslation(db,input.id,1,'ja',email);assert.equal(next.owned,false);assert.equal((await cachedTranslation(db,input.id,1,'ja')).status,'failed');assert.equal(sql.prepare('SELECT reserved_krw FROM forum_translation_budget').get().reserved_krw,100);sql.close();
});
test('global and member daily translation limits are independent of the monthly limit',async()=>{
 const {db,sql}=fixture();const input=post();await createEntry(db,email,input);for(const lang of ['ja','en','ko'])await reserveTranslation(db,input.id,1,lang,email);await assert.rejects(reserveTranslation(db,input.id,1,'fr',email),/translationLimit/);sql.close();
});
test('Hangul examples, key sequences and backticks survive while Korean prose remains translatable',()=>{
 const source='No entiendo ㄱ + ㅏ = 가 ni D → ㅇ ni `KeyA`.';const p=protectLearningExamples(source,'es');assert.equal(restoreLearningExamples(p.text,p.examples),source);assert.equal(p.examples.length,3);
 const korean=protectLearningExamples('안녕하세요. "가"와 ㄱ을 연습합니다.','ko');assert.match(korean.text,/안녕하세요/);assert.ok(korean.examples.includes('"가"'));assert.ok(korean.examples.includes('ㄱ'));assert.throws(()=>restoreLearningExamples('__SK0__ __SK0__',['가']));assert.throws(()=>restoreLearningExamples('missing',['가']));
});
test('translation result schema, placeholders and token limits reject incomplete output',()=>{
 const p=translationMessages('Mi pregunta','Quiero escribir 하 y G → ㅎ','es','ja');const result=parseTranslation(JSON.stringify({title:p.protectedTitle.text,body:p.protectedBody.text}),p);assert.equal(result.body,'Quiero escribir 하 y G → ㅎ');assert.throws(()=>parseTranslation('{"body":"invented"}',p));assert.throws(()=>parseTranslation('not json',p));assert.ok(translationMaxOutputTokens<=4096);assert.equal(translationMonth(Date.parse('2026-10-31T16:00:00Z')),'2026-11');assert.ok(translationPricingExpires>Date.parse('2026-10-04T00:00:00Z'));
 assert.equal(modelResponseText({choices:[{message:{content:'valid'}}]}),'valid');assert.equal(modelResponseText({response:'legacy'}),'legacy');assert.throws(()=>modelResponseText({choices:[]}));
});
test('community navigation remounts feed and individual threads rather than retaining another page state',async()=>{
 const feed=await readFile(new URL('../app/community/page.tsx',import.meta.url),'utf8');
 const thread=await readFile(new URL('../app/community/[id]/page.tsx',import.meta.url),'utf8');
 assert.match(feed,/<CommunityClient key="community-feed"/);
 assert.match(thread,/<CommunityClient key=\{`community-thread-\$\{id\}`\}/);
});
test('community is isolated from existing typing UI and never calls Vertex or an arbitrary paid URL',async()=>{
 const home=await readFile(new URL('../app/page.tsx',import.meta.url),'utf8');const baseline=JSON.parse(await readFile(new URL('./fixtures/community-preservation.json',import.meta.url),'utf8'));
 // The separately authorized header redesign is deliberately excluded; every
 // existing practice, game, audio, progress and account handler stays identical.
 const withoutHeader=(source)=>source.replace(/\r\n/g,'\n').replace(/      <header\b[\s\S]*?<\/header>/,'').replace(/^import (?:headerStyles|\{ HomeHeaderIcon \}|\{ homeGuideLabel, homeNavigation \}).*\n/gm,'').replace('          <Link href="/community">{tr(locale, "Community", "커뮤니티")}</Link>\n','');
 assert.equal(createHash('sha256').update(withoutHeader(home)).digest('hex'),baseline.homeWithoutHeaderSha256);
 const route=await readFile(new URL('../app/api/community/translate/route.ts',import.meta.url),'utf8');assert.doesNotMatch(route,/aiplatform|vertex|fetch\(/i);assert.match(route,/reserveTranslation[\s\S]*ai.run/);assert.match(route,/getAuthenticatedMember/);
});
