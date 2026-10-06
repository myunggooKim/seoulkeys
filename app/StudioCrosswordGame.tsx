'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { CROSSWORD_BRIDGE_CHANNEL, CROSSWORD_BRIDGE_VERSION, CROSSWORD_RUNTIME_PATH, validCrosswordEnvelope, type CrosswordHostState, type CrosswordLocale } from './crossword-studio-contract';
import './studio-crossword-host.css';
import { useGameActivity } from './use-game-activity';
import { isCrosswordActivityRunning } from './frame-game-activity';

type Props = {
  koreanUi: boolean; locale: CrosswordLocale; soundEnabled: boolean;
  onSuccessSound: () => void; onKeySound: (code: string) => void;
  onSoundEnabledChange?: (enabled: boolean) => void;
  onRequestExit?: () => void;
  themeId?: string; suspended?: boolean; activityTracking?: boolean;
};

/** Keeps the accepted studio game's CSS/renderer isolated from the main site. */
export function StudioCrosswordGame({ locale, soundEnabled, onSuccessSound, onKeySound, onSoundEnabledChange, onRequestExit, themeId, suspended = false, activityTracking = false }: Props) {
  const session = useId();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const activityRootRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [height, setHeight] = useState(960);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const stateRef = useRef<CrosswordHostState>({ locale, soundEnabled, suspended, themeId });
  const callbacks = useRef({ onSuccessSound, onKeySound, onSoundEnabledChange, onRequestExit });
  const [boot, setBoot] = useState(() => ({ locale, soundEnabled, themeId }));
  useGameActivity(activityRootRef, 'crossword', ready && !failed && !suspended, activityTracking, iframeRef, isCrosswordActivityRunning);
  const send = useCallback((type: string, payload: Record<string, unknown> = {}) => {
    iframeRef.current?.contentWindow?.postMessage({ channel: CROSSWORD_BRIDGE_CHANNEL, version: CROSSWORD_BRIDGE_VERSION, session, type, ...payload }, window.location.origin);
  }, [session]);
  useLayoutEffect(() => {
    stateRef.current = { locale, soundEnabled, suspended, themeId };
    callbacks.current = { onSuccessSound, onKeySound, onSoundEnabledChange, onRequestExit };
    send('configure', { state: stateRef.current });
  }, [locale, soundEnabled, suspended, themeId, onSuccessSound, onKeySound, onSoundEnabledChange, onRequestExit, send]);
  useEffect(() => {
    let alive = true;
    const mountedFrameWindow = iframeRef.current?.contentWindow;
    const onMessage = (event: MessageEvent) => {
      const frameWindow = iframeRef.current?.contentWindow;
      if (!alive || !frameWindow || event.origin !== window.location.origin || event.source !== frameWindow || !validCrosswordEnvelope(event.data, session)) return;
      const message = event.data;
      if (message.type === 'ready') { setReady(true); setFailed(false); send('configure', { state: stateRef.current }); send('viewport', { height: window.visualViewport?.height ?? window.innerHeight }); }
      if (message.type === 'resize' && typeof message.height === 'number' && Number.isFinite(message.height)) setHeight(Math.max(520, Math.min(6000, Math.ceil(message.height))));
      if (message.type === 'error') setFailed(true);
      if (message.type === 'request-exit' && !stateRef.current.suspended) { if (callbacks.current.onRequestExit) callbacks.current.onRequestExit(); else send('configure', { state: stateRef.current }); }
      if (message.type === 'sound-preference' && !stateRef.current.suspended && typeof message.enabled === 'boolean') { callbacks.current.onSoundEnabledChange?.(message.enabled); }
      if (message.type === 'key' && !stateRef.current.suspended && stateRef.current.soundEnabled && !document.hidden && typeof message.code === 'string' && /^[A-Za-z0-9]{1,24}$/.test(message.code)) callbacks.current.onKeySound(message.code);
      // The studio game owns its accepted confirmation cue. Do not duplicate it
      // through onSuccessSound; the callback remains API-compatible for callers.
    };
    const visibility = () => send('configure', { state: { ...stateRef.current, suspended: stateRef.current.suspended || document.hidden } });
    const leave = () => send('suspend');
    const resize = () => send('viewport', { height: window.visualViewport?.height ?? window.innerHeight });
    const returned = () => { visibility(); resize(); };
    window.addEventListener('message', onMessage);
    window.addEventListener('pagehide', leave);
    window.addEventListener('pageshow', returned);
    window.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', visibility);
    const timer = window.setTimeout(() => { if (alive && !iframeRef.current?.dataset.ready) setFailed(true); }, 20000);
    return () => { alive = false; mountedFrameWindow?.postMessage({ channel: CROSSWORD_BRIDGE_CHANNEL, version: CROSSWORD_BRIDGE_VERSION, session, type: 'dispose' }, window.location.origin); window.clearTimeout(timer); window.removeEventListener('message', onMessage); window.removeEventListener('pagehide', leave); window.removeEventListener('pageshow', returned); window.removeEventListener('resize', resize); window.visualViewport?.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', visibility); };
  }, [session, send, attempt]);
  const query = new URLSearchParams({ session, locale: boot.locale, sound: boot.soundEnabled ? '1' : '0' });
  if (boot.themeId) query.set('theme', boot.themeId);
  return <section ref={activityRootRef} className="studio-crossword-game studio-crossword-host" aria-busy={!ready} data-runtime="studio-candidate-10c-music" inert={suspended}>
    {(!ready || failed) && <div className="studio-crossword-loading" role="status">
      <span>{failed ? (locale === 'ko' ? '게임을 불러오지 못했어요.' : 'The game could not load.') : (locale === 'ko' ? '퍼즐을 준비하고 있어요…' : 'Preparing the puzzle…')}</span>
      {failed && <button type="button" onClick={() => { setBoot({ locale, soundEnabled, themeId }); setReady(false); setFailed(false); setAttempt(value => value + 1); }}>{locale === 'ko' ? '다시 시도' : 'Retry'}</button>}
    </div>}
    <aside className="studio-crossword-ad-reservation studio-crossword-ad-left" aria-hidden="true" />
    <iframe key={attempt} ref={iframeRef} data-ready={ready ? 'true' : undefined} className="studio-crossword-frame" title={locale === 'ko' ? '한글 가로세로 아틀리에' : 'Hangul Crossword Atelier'} src={`${CROSSWORD_RUNTIME_PATH}?${query}`} style={{ height }} onLoad={() => send('configure', { state: stateRef.current })} onError={() => setFailed(true)} allow="autoplay" referrerPolicy="same-origin" />
    <aside className="studio-crossword-ad-reservation studio-crossword-ad-right" aria-hidden="true" />
  </section>;
}
export { StudioCrosswordGame as CrosswordGame };
