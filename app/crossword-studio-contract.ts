/** Same-origin, source-window and per-mount session checked on both sides. */
export const CROSSWORD_BRIDGE_CHANNEL = 'seoulkeys:crossword-studio';
export const CROSSWORD_BRIDGE_VERSION = 1;
export const CROSSWORD_RUNTIME_PATH = '/games/crossword-studio-v17/index.html';
export const CROSSWORD_LOCALES = ['en','ko','es','pt-BR','ja','zh-Hans','zh-Hant','fr','de','it','pl','nl','ru','tr','ar','fa','ur','fil','th','id','ms','vi','my','km','lo','hi','bn','ta','ne','si','kk','uz','mn'] as const;
export type CrosswordLocale = typeof CROSSWORD_LOCALES[number];
export type CrosswordHostState = { locale: CrosswordLocale; soundEnabled: boolean; suspended: boolean; themeId?: string };
export type CrosswordEnvelope = { channel: typeof CROSSWORD_BRIDGE_CHANNEL; version: 1; session: string; type: string; [key: string]: unknown };
export function isCrosswordLocale(value: unknown): value is CrosswordLocale { return typeof value === 'string' && (CROSSWORD_LOCALES as readonly string[]).includes(value); }
export function validCrosswordEnvelope(value: unknown, session: string): value is CrosswordEnvelope {
  if (!value || typeof value !== 'object') return false;
  const message = value as Record<string, unknown>;
  return message.channel === CROSSWORD_BRIDGE_CHANNEL && message.version === CROSSWORD_BRIDGE_VERSION && message.session === session && typeof message.type === 'string';
}
export function parseCrosswordState(value: unknown): CrosswordHostState | null {
  if (!value || typeof value !== 'object') return null;
  const state = value as Record<string, unknown>;
  if (!isCrosswordLocale(state.locale) || typeof state.soundEnabled !== 'boolean' || typeof state.suspended !== 'boolean') return null;
  if (state.themeId !== undefined && (typeof state.themeId !== 'string' || !/^[a-z0-9-]{1,80}$/.test(state.themeId))) return null;
  return { locale: state.locale, soundEnabled: state.soundEnabled, suspended: state.suspended, themeId: state.themeId as string | undefined };
}
