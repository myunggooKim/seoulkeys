import assert from 'node:assert/strict';

// Keep the original community-launch exclusions unchanged. Game integration is
// accounted for separately, by reversing exact reviewed hunks, not by excluding
// entire game, audio, state, or keyboard-handler sections from the digest.
export const withoutCommunityAuthorizedHeader=(source)=>source.replace(/\r\n/g,'\n').replace(/      <header\b[\s\S]*?<\/header>/,'').replace(/^import (?:headerStyles|\{ HomeHeaderIcon \}|\{ homeGuideLabel, homeNavigation \}).*\n/gm,'').replace('          <Link href="/community">{tr(locale, "Community", "커뮤니티")}</Link>\n','');

// Oct 7: the authorized account-only time recording adds exactly these three
// call-site props. No input, audio, progress or gameplay handler is excluded.
export const withoutGameActivityProps=(source)=>source.replace(/\r\n/g,'\n')
  .replace(/(<(?:FallingWordsGame|CrosswordGame)[^\n]*?) activityTracking=\{signedIn === true\}(?= \/>)/g,'$1')
  .replace(/(<MissingLetterGame[^\n]*?) suspended=\{exitPromptOpen\} activityTracking=\{signedIn === true\}(?= \/>)/g,'$1');

export function applyHomeGameIntegrationDelta(source, delta, direction = 'reverse') {
  assert.ok(direction === 'forward' || direction === 'reverse', 'Unknown home integration delta direction');
  assert.equal(delta.version, 1, 'Unsupported home integration delta version');
  assert.ok(Array.isArray(delta.hunks) && delta.hunks.length > 0, 'Home integration delta must have explicit hunks');
  const normalized = withoutGameActivityProps(source);
  const ids = new Set();
  const edits = delta.hunks.map((hunk) => {
    assert.ok(typeof hunk.id === 'string' && hunk.id.length > 0 && !ids.has(hunk.id), 'Home integration hunk IDs must be unique');
    ids.add(hunk.id);
    assert.ok(typeof hunk.before === 'string' && hunk.before.length > 0, `${hunk.id}: before hunk must include exact context`);
    assert.ok(typeof hunk.after === 'string' && hunk.after.length > 0, `${hunk.id}: after hunk must include exact context`);
    assert.notEqual(hunk.before, hunk.after, `${hunk.id}: hunk must describe a change`);
    const from = direction === 'reverse' ? hunk.after : hunk.before;
    const to = direction === 'reverse' ? hunk.before : hunk.after;
    const start = normalized.indexOf(from);
    assert.ok(start !== -1, `${hunk.id}: expected hunk to match exactly once (found 0)`);
    assert.equal(normalized.indexOf(from, start + 1), -1, `${hunk.id}: expected hunk to match exactly once (found multiple)`);
    return { id: hunk.id, start, end: start + from.length, to };
  }).sort((left, right) => left.start - right.start);

  // Validate every match against the original input before changing any bytes;
  // a replacement must never create a match for a later hunk or hide overlap.
  for (let i = 1; i < edits.length; i += 1) {
    assert.ok(edits[i - 1].end <= edits[i].start, `${edits[i].id}: home integration hunks must not overlap`);
  }
  let result = normalized;
  for (const { start, end, to } of edits.toReversed()) {
    result = result.slice(0, start) + to + result.slice(end);
  }
  return result;
}
