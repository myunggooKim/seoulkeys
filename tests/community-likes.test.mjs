import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import test from 'node:test';
import {readPostLike, setPostLike} from '../db/forum-likes.ts';
import {readFeed, readThread} from '../db/forum.ts';
import {likesCopy} from '../app/community/likes-copy.ts';
import {supportedLocaleCodes} from '../app/locale-detection.ts';

const forumMigration = await readFile(new URL('../migrations/0002_learner_forum.sql', import.meta.url), 'utf8');
const migration = await readFile(new URL('../migrations/0003_forum_likes.sql', import.meta.url), 'utf8');
const alice = 'alice@example.invalid';
const bob = 'bob@example.invalid';
function fixture() {
  const sql = new DatabaseSync(':memory:');
  sql.exec(`PRAGMA foreign_keys=ON; CREATE TABLE users(email TEXT PRIMARY KEY);
    CREATE TABLE learning_progress(user_email TEXT PRIMARY KEY,accuracy INTEGER);
    INSERT INTO learning_progress VALUES('preserved@example.invalid',99);`);
  for (const email of [alice,bob]) sql.prepare('INSERT INTO users VALUES(?)').run(email);
  sql.exec(forumMigration); sql.exec(migration);
  const db = {
    prepare(query) {
      return {values: [], bind(...values) {this.values = values; return this;},
        async first(column) {const row=sql.prepare(query).get(...this.values); return column ? row?.[column]??null : row??null;},
        async all() {return {results:sql.prepare(query).all(...this.values),success:true};},
        execute() {
          if (/^\s*SELECT/i.test(query)) return {success:true, results:sql.prepare(query).all(...this.values),meta:{changes:0}};
          const result=sql.prepare(query).run(...this.values); return {success:true,results:[],meta:{changes:Number(result.changes)}};
        }, async run() {return this.execute();},
      };
    },
    async batch(statements) {
      sql.exec('BEGIN');
      try {const results=statements.map(s=>s.execute()); sql.exec('COMMIT'); return results;}
      catch(error) {sql.exec('ROLLBACK'); throw error;}
    },
  };
  function post({parent=null,status='published',time=Date.now()}={}) {
    const id=crypto.randomUUID();
    sql.prepare(`INSERT INTO forum_entries(id,parent_id,author_id,author_alias,language,tag,title,body,status,created_at)
      VALUES(?,?,'author','Learner','es','question','A question','Learning Hangul',?,?)`).run(id,parent,status,time);
    return id;
  }
  return {sql,db,post};
}
const act=(id,liked=true,extra={})=>({action:'like',id,liked,...extra});

test('likes migration is additive, repeatable and preserves learning and community data',async()=>{
  const {sql,db,post}=fixture(); const id=post(); await setPostLike(db,alice,act(id));
  sql.exec(migration);
  assert.equal(sql.prepare('SELECT accuracy FROM learning_progress').get().accuracy,99);
  assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM users').get().n,2);
  assert.equal((await readPostLike(db,id)).likes,1);
  assert.doesNotMatch(migration,/(?:^|;)\s*(?:DROP|ALTER|DELETE|UPDATE)\b/i);
  assert.equal((await readThread(db,'welcome')).post.id,'welcome'); sql.close();
});

test('one like per account, retries and rapid duplicates are idempotent; unlike affects only the caller',async()=>{
  const {sql,db,post}=fixture(); const id=post();
  await Promise.all(Array.from({length:12},()=>setPostLike(db,alice,act(id))));
  assert.deepEqual(await readPostLike(db,id,alice),{likes:1,liked:true});
  assert.deepEqual(await setPostLike(db,bob,act(id)),{likes:2,liked:true});
  assert.deepEqual(await setPostLike(db,alice,act(id,false)),{likes:1,liked:false});
  assert.deepEqual(await setPostLike(db,alice,act(id,false)),{likes:1,liked:false});
  assert.deepEqual(await readPostLike(db,id,bob),{likes:1,liked:true}); sql.close();
});

test('public and personalized feeds expose totals, never emails or who liked a post',async()=>{
  const {sql,db,post}=fixture(); const id=post(); post({parent:id});
  await setPostLike(db,alice,act(id));
  const publicFeed=await readFeed(db,null,null); const ownFeed=await readFeed(db,null,null,alice);
  assert.equal(publicFeed.entries[0].replies,1); assert.equal(publicFeed.entries[0].likes,1); assert.equal(publicFeed.entries[0].liked,false);
  assert.equal(ownFeed.entries[0].liked,true); assert.equal((await readThread(db,id,null,bob)).post.liked,false);
  assert.equal((await readThread(db,id,null,alice)).post.liked,true);
  assert.doesNotMatch(JSON.stringify(ownFeed),/@|user_email|reporter_id/); sql.close();
});

test('likes do not alter feed ordering, pagination or reply counts',async()=>{
  const {sql,db,post}=fixture(); const now=Date.now();
  for(let i=0;i<23;i++) post({time:now-i});
  const before=await readFeed(db,null,null); await setPostLike(db,alice,act(before.entries[19].id));
  const after=await readFeed(db,null,null); assert.deepEqual(after.entries.map(p=>p.id),before.entries.map(p=>p.id));
  assert.equal(after.next,before.next); assert.equal((await readFeed(db,null,after.next)).entries.length,3); sql.close();
});

test('hidden, deleted, missing and reply targets cannot be liked; the operator welcome can',async()=>{
  const {sql,db,post}=fixture(); const root=post();
  for(const id of [post({status:'hidden'}),post({status:'deleted'}),post({parent:root}),crypto.randomUUID()]) {
    await assert.rejects(setPostLike(db,alice,act(id)),e=>e.code==='missing'&&e.status===404);
    await assert.rejects(readPostLike(db,id),e=>e.code==='missing');
  }
  assert.deepEqual(await setPostLike(db,alice,act('welcome')),{likes:1,liked:true}); sql.close();
});

test('blocked accounts cannot add or remove likes, and forged client identity is ignored',async()=>{
  const {sql,db,post}=fixture(); const id=post();
  await setPostLike(db,alice,act(id,true,{user_email:bob,email:bob,likes:999}));
  assert.equal((await readPostLike(db,id,alice)).liked,true); assert.equal((await readPostLike(db,id,bob)).liked,false);
  sql.prepare("INSERT INTO forum_profiles VALUES('blocked',?,'Learner',1,?)").run(alice,Date.now());
  for(const liked of [true,false]) await assert.rejects(setPostLike(db,alice,act(id,liked)),e=>e.code==='blocked'&&e.status===403);
  assert.equal((await readPostLike(db,id)).likes,1); assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM forum_translation_budget').get().n,0); sql.close();
});

test('invalid payloads cannot mutate likes and nonexistent accounts fail the foreign key',async()=>{
  const {sql,db,post}=fixture(); const id=post();
  for(const input of [{id,liked:1},{id,liked:'true'},{id},{id:'bad',liked:true}]) await assert.rejects(setPostLike(db,alice,input),e=>e.code==='invalid');
  await assert.rejects(setPostLike(db,'unknown@example.invalid',act(id)),/FOREIGN KEY/);
  assert.equal((await readPostLike(db,id)).likes,0); sql.close();
});

test('100 recent likes bound new additions without breaking retries or unlikes',async()=>{
  const {sql,db,post}=fixture(); const ids=[];
  for(let i=0;i<100;i++) {const id=post(); ids.push(id); await setPostLike(db,alice,act(id));}
  await assert.rejects(setPostLike(db,alice,act(post())),e=>e.code==='rate'&&e.status===429);
  assert.equal((await setPostLike(db,alice,act(ids[0]))).liked,true);
  assert.equal((await setPostLike(db,alice,act(ids[0],false))).liked,false); sql.close();
});

test('all 33 supported languages have human-written like and unlike labels',()=>{
  assert.equal(supportedLocaleCodes.length,33);
  for(const locale of supportedLocaleCodes) {
    const copy=likesCopy(locale); assert.ok(copy.like.length>0); assert.ok(copy.unlike.length>0); assert.notEqual(copy.like,copy.unlike);
  }
});

test('like endpoint retains authenticated same-origin writes and isolated accessible UI without polling or AI',async()=>{
  const route=await readFile(new URL('../app/api/community/route.ts',import.meta.url),'utf8');
  assert.ok(route.indexOf("if (!member) throw new ForumError('signIn',401)")<route.indexOf("if (input.action==='like')"));
  assert.match(route,/readForumRequest\(request\)/); assert.match(route,/setPostLike\(env.DB,email,input\)/);
  const ui=await readFile(new URL('../app/community/PostLikeButton.tsx',import.meta.url),'utf8');
  assert.match(ui,/aria-pressed=\{state.liked\}/); assert.match(ui,/type="button"/); assert.match(ui,/inFlight.current = true/);
  assert.match(ui,/if \(!response.ok\) throw/); assert.doesNotMatch(ui,/setInterval|\/translate|Workers AI|Vertex/);
  const feed=await readFile(new URL('../app/community/CommunityClient.tsx',import.meta.url),'utf8');
  assert.match(feed,/<\/Link><div className=\{styles.likeRow\}><PostLikeButton/);
});
