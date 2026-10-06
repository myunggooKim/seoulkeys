import { isSupportedLocale, type Locale } from '../locale-detection';

export const forumTags = ['question', 'struggle', 'win', 'chat'] as const;
export type ForumTag = typeof forumTags[number];
export type ForumEntry = {
  id: string; parent_id: string | null; author_id: string; author_alias: string;
  language: Locale; tag: ForumTag | 'notice'; title: string; body: string;
  created_at: number; revision: number; replies?: number; likes?: number; liked?: boolean;
};
export type ForumViewer = { authorId: string | null; alias: string; moderator: boolean };
export class ForumError extends Error {
  constructor(public code: string, public status = 400) { super(code); }
}
export function validId(value: unknown): value is string {
  return typeof value === 'string' && (value === 'welcome' || /^[a-f0-9-]{36}$/.test(value));
}
export function textField(value: unknown, max: number, min = 1): string {
  if (typeof value !== 'string') throw new ForumError('invalid');
  const text = value.normalize('NFC').replace(/\r\n?/g, '\n').trim();
  if (text.length < min || text.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) throw new ForumError('invalid');
  return text;
}
export function validatePost(input: Record<string, unknown>) {
  if (input.website || input.consent !== true) throw new ForumError('rules');
  if (!isSupportedLocale(typeof input.language === 'string' ? input.language : null)) throw new ForumError('language');
  const language = input.language as Locale;
  const alias = textField(input.alias, 32, 2);
  if (/@|https?:|www\.|operator|admin|운영자|관리자/i.test(alias)) throw new ForumError('alias');
  const comment = input.kind === 'comment';
  if (input.kind !== 'post' && !comment) throw new ForumError('invalid');
  if (comment && !validId(input.parentId)) throw new ForumError('invalid');
  if (!comment && !forumTags.includes(input.tag as ForumTag)) throw new ForumError('invalid');
  if (!validId(input.id) || input.id === 'welcome') throw new ForumError('invalid');
  return { id: input.id, alias, language, parentId: comment ? input.parentId as string : null,
    title: comment ? '' : textField(input.title, 120, 3), body: textField(input.body, comment ? 1500 : 3000, 2),
    tag: comment ? 'chat' : input.tag as ForumTag };
}

// Reject cross-origin writes and bound even chunked bodies before JSON parsing.
export async function readForumRequest(request: Request): Promise<Record<string, unknown>> {
  if (request.headers.get('origin') !== new URL(request.url).origin) throw new ForumError('origin', 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new ForumError('invalid', 415);
  const reader = request.body?.getReader();
  if (!reader) throw new ForumError('invalid');
  const chunks: Uint8Array[] = []; let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 20_000) { await reader.cancel(); throw new ForumError('tooLarge', 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    const data: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
    return data as Record<string, unknown>;
  } catch { throw new ForumError('invalid'); }
}
