import { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CrosswordGame } from './app/CrosswordGame';
import { CROSSWORD_BUILD } from './app/crossword-build';
import { learningThemes } from './app/content-themes';
import { CrosswordMusic } from './review/CrosswordMusic';
import { isImeKey } from './app/browser-hangul-input';
import { hasClueMeanings, loadClueMeanings } from './locale-meanings';
import { CROSSWORD_BRIDGE_CHANNEL, CROSSWORD_BRIDGE_VERSION, isCrosswordLocale, parseCrosswordState, validCrosswordEnvelope, type CrosswordHostState } from './crossword-studio-contract';
import './runtime.css';

const params = new URLSearchParams(location.search);
const session = params.get('session') ?? '';
const initialLocale = params.get('locale');
const initialTheme = params.get('theme') || undefined;
const initialState: CrosswordHostState = {
  locale: isCrosswordLocale(initialLocale) ? initialLocale : 'en', soundEnabled: params.get('sound') !== '0',
  themeId: learningThemes.some(theme => theme.id === initialTheme) ? initialTheme : undefined, suspended: true,
};

function post(type: string, payload: Record<string, unknown> = {}) {
  if (window.parent !== window) window.parent.postMessage({ channel: CROSSWORD_BRIDGE_CHANNEL, version: CROSSWORD_BRIDGE_VERSION, session, type, ...payload }, location.origin);
}


function StudioRuntime() {
  const [host, setHost] = useState(initialState);
  const [activeLocale, setActiveLocale] = useState(initialState.locale);
  const [localeReady, setLocaleReady] = useState(false);
  const [localeFailure, setLocaleFailure] = useState<{ locale: string; retry: number } | null>(null);
  const [localeRetry, setLocaleRetry] = useState(0);
  const [hidden, setHidden] = useState(document.hidden);
  const [connected, setConnected] = useState(false);
  const [disposed, setDisposed] = useState(false);
  const [localPause, setLocalPause] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const ko = host.locale === 'ko';
  // Accepted interface remains Korean/English; selected-locale clues are separate.
  const uiLocale = ko ? 'ko' : 'en';
  const changingLocale = !localeReady || activeLocale !== host.locale;
  const localeError = localeFailure?.locale === host.locale && localeFailure.retry === localeRetry;
  const suspended = host.suspended || hidden || !connected || disposed || changingLocale || localPause;
  const soundEnabled = host.soundEnabled;
  useEffect(() => {
    let live = true;
    void loadClueMeanings(host.locale).then(() => { if (live) { setActiveLocale(host.locale); setLocaleReady(true); setLocaleFailure(null); } }).catch(() => { if (live) { setLocaleFailure({ locale: host.locale, retry: localeRetry }); post('locale-error', { locale: host.locale }); } });
    return () => { live = false; };
  }, [host.locale, localeRetry]);
  useEffect(() => {
    const message = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== window.parent || !validCrosswordEnvelope(event.data, session)) return;
      if (event.data.type === 'viewport' && typeof event.data.height === 'number' && Number.isFinite(event.data.height)) {
        document.documentElement.style.setProperty('--studio-viewport-height', `${Math.max(320, Math.min(4320, event.data.height))}px`);
      } else if (event.data.type === 'configure') {
        const next = parseCrosswordState(event.data.state);
        if (!next) return;
        if (next.themeId && !learningThemes.some(theme => theme.id === next.themeId)) next.themeId = undefined;
        setHost(next); setConnected(true); setDisposed(false);
      } else if (event.data.type === 'suspend') setHost(previous => ({ ...previous, suspended: true }));
      else if (event.data.type === 'dispose') { setDisposed(true); window.speechSynthesis?.cancel(); }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || isImeKey(event)) return;
      const target = event.target instanceof Element ? event.target : null;
      const settings = target?.closest('details[open]') as HTMLDetailsElement | null;
      if (settings) { settings.open = false; settings.querySelector('summary')?.focus(); event.preventDefault(); event.stopPropagation(); return; }
      event.preventDefault(); setHost(previous => ({ ...previous, suspended: true })); post('request-exit');
    };
    const visibility = () => setHidden(document.hidden);
    const pageLeft = () => { setHidden(true); window.speechSynthesis?.cancel(); };
    window.addEventListener('message', message); window.addEventListener('keydown', escape, true); document.addEventListener('visibilitychange', visibility); window.addEventListener('pagehide', pageLeft); window.addEventListener('pageshow', visibility);
    post('ready', { revision: CROSSWORD_BUILD.revision, bridgeRevision: 'crossword-host-17' });
    return () => { window.removeEventListener('message', message); window.removeEventListener('keydown', escape, true); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', pageLeft); window.removeEventListener('pageshow', visibility); };
  }, []);
  useEffect(() => {
    document.documentElement.lang = uiLocale;
    document.documentElement.dir = 'ltr'; // Keep Korean board geometry and controls unmirrored.
    document.documentElement.dataset.clueLocale = activeLocale;
  }, [uiLocale, activeLocale]);
  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    let frame = 0;
    const resize = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => post('resize', { height: Math.ceil(root.getBoundingClientRect().height) + 2 })); };
    const observer = new ResizeObserver(resize); observer.observe(root); window.addEventListener('resize', resize); resize();
    document.fonts?.ready.then(resize).catch(() => {});
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('resize', resize); };
  }, []);
  const keySound = useCallback((code: string) => post('key', { code }), []);
  return <div ref={rootRef} className="atelier-review studio-integrated" data-build-revision={CROSSWORD_BUILD.revision} data-source-sha256={CROSSWORD_BUILD.sourceHash} data-tile-sha256={CROSSWORD_BUILD.tileHash} data-clue-locale={activeLocale} data-interface-locale={uiLocale} data-suspended={suspended}>
    <header className="review-toolbar" inert={host.suspended || disposed}>
      <span className="review-brand">seoul<span>keys</span></span>
      <nav aria-label={ko ? '게임 설정' : 'Game settings'}>
        <button type="button" aria-pressed={soundEnabled} onClick={() => { const enabled = !host.soundEnabled; setHost(previous => ({ ...previous, soundEnabled: enabled })); post('sound-preference', { enabled }); }}>{soundEnabled ? (ko ? '효과음 켜짐' : 'Effects on') : (ko ? '효과음 꺼짐' : 'Effects off')}</button>
        <CrosswordMusic koreanUi={ko} suspended={suspended}/>
        <button type="button" aria-pressed={localPause} onClick={() => setLocalPause(value => !value)}>{localPause ? (ko ? '게임으로 돌아가기' : 'Return to game') : (ko ? '잠시 쉬기' : 'Pause')}</button>
      </nav>
    </header>
    {changingLocale && <div className="studio-locale-status" role="status" aria-live="polite"><span>{localeError ? (ko ? '선택한 언어의 낱말 뜻을 불러오지 못했어요.' : 'Word meanings for the selected language could not load.') : (ko ? '낱말 뜻을 준비하고 있어요…' : 'Loading word meanings…')}</span>{localeError && <button type="button" onClick={() => { setLocaleRetry(value => value + 1); }}>{ko ? '다시 시도' : 'Retry'}</button>}</div>}
    <div className="review-workspace" data-ads="none"><main id="main" inert={suspended} aria-busy={changingLocale} style={{ visibility: changingLocale ? 'hidden' : undefined }}>
      {hasClueMeanings(activeLocale) && !disposed && <CrosswordGame koreanUi={ko} locale={uiLocale} clueLocale={activeLocale} soundEnabled={soundEnabled} onSuccessSound={() => {}} onKeySound={keySound} themeId={host.themeId} suspended={suspended}/>}
    </main></div>
    {localPause && <div className="studio-paused-note" role="status">{ko ? '시간과 입력, 음악을 잠시 멈췄어요.' : 'The clock, input and music are paused.'}</div>}
  </div>;
}

createRoot(document.getElementById('root')!).render(<StudioRuntime/>);
