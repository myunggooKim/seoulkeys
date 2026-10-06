import type {Locale} from '../app/locale-detection';
import {ForumError, type ForumEntry} from '../app/community/model';
import {translationMonth,translationReservationKrw,translationMonthlyLimitKrw} from '../app/community/translation-policy';

export type StoredTranslation={status:'pending'|'ready'|'failed';title:string;body:string;created_at:number};
export async function translationEntry(db:D1Database,id:string) {
  return db.prepare(`SELECT e.id,e.title,e.body,e.language,e.revision FROM forum_entries e WHERE e.id=? AND e.status='published'
    AND (e.parent_id IS NULL OR EXISTS(SELECT 1 FROM forum_entries p WHERE p.id=e.parent_id AND p.status='published'))`)
    .bind(id).first<Pick<ForumEntry,'id'|'title'|'body'|'language'|'revision'>>();
}
export async function cachedTranslation(db:D1Database,id:string,revision:number,language:Locale) {
  return db.prepare('SELECT status,title,body,created_at FROM forum_translations WHERE entry_id=? AND revision=? AND language=?')
    .bind(id,revision,language).first<StoredTranslation>();
}
export async function reserveTranslation(db:D1Database,id:string,revision:number,language:Locale,email:string,now=Date.now()) {
  const requestId=crypto.randomUUID(); const month=translationMonth(now);
  // The claim, budget check, rate check and debit are one D1 atomic batch.
  // Permanent failed claims prevent automatic retries from charging again.
  await db.batch([
    db.prepare('INSERT OR IGNORE INTO forum_translation_budget(month,reserved_krw) VALUES(?,0)').bind(month),
    db.prepare(`INSERT OR IGNORE INTO forum_translations(entry_id,revision,language,status,request_id,created_at)
      SELECT ?,?,?,'pending',?,? WHERE
      (SELECT reserved_krw FROM forum_translation_budget WHERE month=?)<=?
      AND NOT EXISTS(SELECT 1 FROM forum_profiles WHERE user_email=? AND blocked=1)
      AND (SELECT COUNT(*) FROM forum_translation_reservations WHERE requester_id=? AND created_at>?)<3
      AND (SELECT COUNT(*) FROM forum_translation_reservations WHERE created_at>?)<10`)
      .bind(id,revision,language,requestId,now,month,translationMonthlyLimitKrw-translationReservationKrw,email,email,now-86_400_000,now-86_400_000),
    db.prepare(`INSERT INTO forum_translation_reservations(id,month,requester_id,created_at)
      SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM forum_translations WHERE request_id=?)`).bind(requestId,month,email,now,requestId),
    db.prepare(`UPDATE forum_translation_budget SET reserved_krw=reserved_krw+?
      WHERE month=? AND EXISTS(SELECT 1 FROM forum_translation_reservations WHERE id=?)`).bind(translationReservationKrw,month,requestId),
  ]);
  const claimed=await db.prepare('SELECT request_id FROM forum_translations WHERE entry_id=? AND revision=? AND language=?').bind(id,revision,language).first<{request_id:string}>();
  if (!claimed) throw new ForumError('translationLimit',429);
  return {owned:claimed.request_id===requestId,requestId};
}
export async function finishTranslation(db:D1Database,requestId:string,result:{title:string;body:string}|null) {
  await db.prepare('UPDATE forum_translations SET status=?,title=?,body=? WHERE request_id=? AND status=\'pending\'')
    .bind(result?'ready':'failed',result?.title??'',result?.body??'',requestId).run();
}
