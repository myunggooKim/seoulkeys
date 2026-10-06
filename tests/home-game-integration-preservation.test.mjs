import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {applyHomeGameIntegrationDelta,withoutCommunityAuthorizedHeader} from './helpers/home-game-integration-delta.mjs';

const home=(await readFile(new URL('../app/page.tsx',import.meta.url),'utf8')).replace(/\r\n/g,'\n');
const delta=JSON.parse(await readFile(new URL('./fixtures/home-game-integration-delta.json',import.meta.url),'utf8'));
const baseline=JSON.parse(await readFile(new URL('./fixtures/community-preservation.json',import.meta.url),'utf8'));
const sha256=(source)=>createHash('sha256').update(source).digest('hex');
const upstreamHome=applyHomeGameIntegrationDelta(home,delta);
const preservedDigest=(source)=>sha256(withoutCommunityAuthorizedHeader(applyHomeGameIntegrationDelta(source,delta)));
const assertPreserved=(source)=>assert.equal(preservedDigest(source),baseline.homeWithoutHeaderSha256);

test('reviewed integration reverses to the exact recorded upstream commit and original community digest',()=>{
  assert.equal(delta.upstream.repository,'https://github.com/myunggooKim/seoulkeys');
  assert.equal(delta.upstream.commit,'86491f5f218e2cbba1db680aded59e9868e2a0e8');
  assert.equal(delta.upstream.path,'app/page.tsx');
  assert.equal(delta.communityBaselineFixture,'tests/fixtures/community-preservation.json');
  assert.equal(sha256(upstreamHome),delta.upstream.sha256);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(upstreamHome)}\0`).update(upstreamHome).digest('hex'),delta.upstream.gitBlobSha1);
  assert.equal(sha256(home),delta.integratedSha256);
  assert.equal(baseline.homeWithoutHeaderSha256,'9c0305bb216a5cd635515cd7911580db07597a3f265d82fff6cc6730bf433f82');
  assertPreserved(home);
});

test('every before and after hunk matches exactly once at its recorded line and roundtrips without loss',()=>{
  assert.equal(delta.hunks.length,8);
  for(const hunk of delta.hunks){
    for(const [source,fragment,line] of [[upstreamHome,hunk.before,hunk.upstreamStartLine],[home,hunk.after,hunk.integratedStartLine]]){
      const index=source.indexOf(fragment);
      assert.notEqual(index,-1,hunk.id);
      assert.equal(source.indexOf(fragment,index+1),-1,hunk.id);
      assert.equal(source.slice(0,index).split('\n').length,line,hunk.id);
    }
  }
  assert.equal(applyHomeGameIntegrationDelta(upstreamHome,delta,'forward'),home);
  assert.equal(applyHomeGameIntegrationDelta(applyHomeGameIntegrationDelta(upstreamHome,delta,'forward'),delta),upstreamHome);
  assert.equal(applyHomeGameIntegrationDelta(home.replace(/\n/g,'\r\n'),delta),upstreamHome);
});

// These changes lie outside the reviewed hunks. Reversal must leave each
// alteration intact so the unchanged original digest rejects it.
for(const [area,original,replacement] of [
  ['practice UI','<div className="hero-copy">','<div className="hero-copy changed">'],
  ['practice handler','function beginPracticeFocusTransition() {','function beginPracticeFocusTransition() { return;'],
  ['audio handler','function playTypewriterReturnSound() {','function playTypewriterReturnSound() { return;'],
  ['progress synchronization','if (!active || !profile?.user || !profile?.progress) return;','if (!active || !profile?.user) return;'],
  ['account state','if (active) setSignedIn(response.ok);','if (active) setSignedIn(true);'],
  ['another game','words={themeWords} />','words={[]} />'],
]){
  test(`unrelated ${area} changes still fail the original community digest`,()=>{
    const index=home.indexOf(original);
    assert.notEqual(index,-1,'Mutation must exercise existing source');
    assert.equal(home.indexOf(original,index+1),-1,'Mutation target must be unique');
    const changed=home.replace(original,replacement);
    assert.notEqual(applyHomeGameIntegrationDelta(changed,delta),upstreamHome);
    assert.throws(()=>assertPreserved(changed),{code:'ERR_ASSERTION'});
  });
}

test('unreviewed changes inside hunk context fail rather than disappearing during reversal',()=>{
  const changed=home.replace('const [autoSpeak, setAutoSpeak] = useState(true);','const [autoSpeak, setAutoSpeak] = useState(false);');
  assert.notEqual(changed,home);
  assert.throws(()=>assertPreserved(changed),/defense-music-state: expected hunk to match exactly once \(found 0\)/);
});

test('the original header exclusion remains narrow and does not absorb following practice UI',()=>{
  const changed=home.replace(/      <header\b[\s\S]*?<\/header>/,'      <header>Separately authorized header change</header>');
  assert.notEqual(changed,home);
  assertPreserved(changed);
  assert.throws(()=>assertPreserved(changed.replace('<div className="hero-copy">','<div className="changed">')),{code:'ERR_ASSERTION'});
});

for(const hunk of delta.hunks){
  for(const direction of ['forward','reverse']){
    const source=direction==='forward'?upstreamHome:home;
    const fragment=direction==='forward'?hunk.before:hunk.after;
    test(`${direction}: ${hunk.id} rejects missing and duplicate matches`,()=>{
      assert.throws(()=>applyHomeGameIntegrationDelta(source.replace(fragment,''),delta,direction),/expected hunk to match exactly once \(found 0\)/);
      assert.throws(()=>applyHomeGameIntegrationDelta(`${source}\n${fragment}`,delta,direction),/expected hunk to match exactly once \(found multiple\)/);
    });
  }
}

test('overlapping or replacement-created matches cannot erase unreviewed source',()=>{
  assert.throws(()=>applyHomeGameIntegrationDelta('abcdef',{version:1,hunks:[
    {id:'first',before:'old first',after:'abc'},
    {id:'second',before:'old second',after:'bcd'},
  ]}),/must not overlap/);
  assert.throws(()=>applyHomeGameIntegrationDelta('first',{version:1,hunks:[
    {id:'first',before:'second',after:'first'},
    {id:'second',before:'third',after:'second'},
  ]}),/second: expected hunk to match exactly once \(found 0\)/);
});

test('malformed delta fixtures fail closed',()=>{
  const hunk=delta.hunks[0];
  for(const malformed of [
    {...delta,version:2},
    {...delta,hunks:[]},
    {...delta,hunks:[hunk,hunk]},
    {...delta,hunks:[{...hunk,before:''}]},
    {...delta,hunks:[{...hunk,after:''}]},
    {...delta,hunks:[{...hunk,before:hunk.after}]},
  ])assert.throws(()=>applyHomeGameIntegrationDelta(home,malformed),{code:'ERR_ASSERTION'});
  assert.throws(()=>applyHomeGameIntegrationDelta(home,delta,'unknown'),/Unknown home integration delta direction/);
});
