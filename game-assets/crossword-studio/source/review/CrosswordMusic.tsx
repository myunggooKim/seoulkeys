import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { CROSSWORD_MUSIC_TRACK } from './crossword-music-track';

type Playback = 'off' | 'loading' | 'playing' | 'paused' | 'blocked' | 'error';
const STORAGE_KEY = 'seoulkeys-crossword-music-volume-v1';

function readPreferences(): { volume: number; muted: boolean } {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved.volume === 'number' && Number.isFinite(saved.volume)) {
      return { volume: Math.min(1, Math.max(0, saved.volume)), muted: saved.muted === true };
    }
  } catch { /* Music remains optional when storage is unavailable. */ }
  return { volume: 0.22, muted: false };
}

/** User-enabled, independent of speech/effects. Pauses with the game or tab. */
export function CrosswordMusic({ koreanUi, suspended, track = CROSSWORD_MUSIC_TRACK }: {
  koreanUi: boolean;
  suspended: boolean;
  track?: { src: string; titleEn: string; titleKo: string };
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const requestedRef = useRef(false);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(false);
  const [playback, setPlayback] = useState<Playback>('off');
  const [preferences, setPreferences] = useState(readPreferences);
  const [pageHidden, setPageHidden] = useState(() => document.hidden);
  const [resumeTick, setResumeTick] = useState(0);
  const statusId = useId();
  const volumeId = useId();
  const src = track.src.trim();
  const ko = koreanUi;
  const unavailable = !src;
  const temporarilyPaused = suspended || pageHidden;
  const isRequested = playback === 'playing' || playback === 'loading' || playback === 'paused';
  const { volume, muted } = preferences;

  const startPlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !src || suspended || document.hidden || !requestedRef.current) return;
    const requestId = ++requestIdRef.current;
    setPlayback('loading');
    try {
      // Called directly from the Play button on first use: no autoplay bypass.
      await audio.play();
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      if (!requestedRef.current || document.hidden) {
        audio.pause();
        return;
      }
      setPlayback('playing');
    } catch (error) {
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      requestedRef.current = false;
      setPlayback(error instanceof DOMException && error.name === 'NotAllowedError' ? 'blocked' : 'error');
    }
  }, [src, suspended]);

  useEffect(() => {
    const audio = audioRef.current;
    const requestCounter = requestIdRef;
    mountedRef.current = true;
    if (audio && src) audio.src = src;
    const visibilityChanged = () => {
      const hidden = document.hidden;
      if (hidden) {
        ++requestIdRef.current;
        audio?.pause();
      }
      setPageHidden(hidden);
    };
    const pageLeft = () => {
      ++requestIdRef.current;
      audio?.pause();
    };
    const pageReturned = () => {
      setPageHidden(document.hidden);
      setResumeTick(value => value + 1);
    };
    document.addEventListener('visibilitychange', visibilityChanged);
    window.addEventListener('pagehide', pageLeft);
    window.addEventListener('pageshow', pageReturned);
    return () => {
      mountedRef.current = false;
      requestedRef.current = false;
      ++requestCounter.current;
      document.removeEventListener('visibilitychange', visibilityChanged);
      window.removeEventListener('pagehide', pageLeft);
      window.removeEventListener('pageshow', pageReturned);
      audio?.pause();
      audio?.removeAttribute('src');
      audio?.load();
    };
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.muted = muted || volume === 0;
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)); } catch { /* Optional. */ }
  }, [preferences, volume, muted]);

  useEffect(() => {
    if (temporarilyPaused) {
      ++requestIdRef.current;
      audioRef.current?.pause();
    } else if (requestedRef.current) {
      // Resume only an explicitly enabled track. A browser rejection shows Retry.
      void startPlayback();
    }
  }, [temporarilyPaused, startPlayback, resumeTick]);

  function togglePlayback() {
    if (requestedRef.current) {
      requestedRef.current = false;
      ++requestIdRef.current;
      audioRef.current?.pause();
      setPlayback('off');
    } else {
      requestedRef.current = true;
      // Retrying a failed source reinitializes the media element, not the game.
      if (playback === 'error') audioRef.current?.load();
      void startPlayback();
    }
  }

  const status = unavailable
    ? (ko ? '음악 파일을 준비하고 있어요.' : 'Music is not available yet.')
    : playback === 'blocked'
      ? (ko ? '브라우저에서 재생을 멈췄어요. 음악 재생을 눌러 주세요.' : 'Your browser paused music. Press Play music to resume.')
      : playback === 'error'
        ? (ko ? '음악을 불러오지 못했어요. 다시 재생해 주세요.' : 'Music could not load. Try Play music again.')
        : temporarilyPaused && isRequested
          ? (ko ? '게임이나 탭을 다시 열면 이어서 재생돼요.' : 'Music resumes when you return to the game.')
          : playback === 'loading'
            ? (ko ? '음악을 불러오는 중…' : 'Loading music…')
            : playback === 'playing'
              ? (ko ? '재생 중 · 조용히 반복돼요.' : 'Playing · softly on repeat.')
              : (ko ? '음악 재생을 누르면 시작해요.' : 'Press Play music to begin.');
  const buttonText = isRequested
    ? (ko ? '음악 정지' : 'Pause music')
    : (ko ? '음악 재생' : 'Play music');

  return <div className="review-music" data-playback={unavailable ? 'unavailable' : playback}>
    <audio ref={audioRef} preload="none" loop aria-hidden="true"
      onPlaying={() => {
        if (!requestedRef.current || suspended || document.hidden) { audioRef.current?.pause(); return; }
        setPlayback('playing');
      }}
      onPause={() => {
        if (mountedRef.current) setPlayback(previous => previous === 'blocked' || previous === 'error' ? previous : requestedRef.current ? 'paused' : 'off');
      }}
      onError={() => {
        if (!mountedRef.current || !src) return;
        ++requestIdRef.current;
        requestedRef.current = false;
        setPlayback('error');
      }}/>
    <button className="review-music-play" type="button" disabled={unavailable || suspended}
      aria-pressed={isRequested} aria-describedby={statusId} onClick={togglePlayback}>
      <span aria-hidden="true">{isRequested ? 'Ⅱ' : '♪'}</span> {buttonText}
    </button>
    <details className="review-music-settings" onKeyDown={event => {
      if (event.key === 'Escape') {
        event.currentTarget.open = false;
        event.currentTarget.querySelector('summary')?.focus();
      }
    }} onBlur={event => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
    }}>
      <summary aria-label={ko ? '음악 음량과 설정' : 'Music volume and settings'}>{ko ? '음량' : 'Volume'}</summary>
      <div className="review-music-panel">
        <strong>{ko ? track.titleKo : track.titleEn}</strong>
        <p id={statusId} role="status">{status}</p>
        <label htmlFor={volumeId}><span>{ko ? '음악 음량' : 'Music volume'}</span><output htmlFor={volumeId}>{Math.round(volume * 100)}%</output></label>
        <input id={volumeId} aria-label={ko ? '음악 음량' : 'Music volume'} type="range" min="0" max="100" step="1"
          disabled={unavailable} value={Math.round(volume * 100)}
          onChange={event => setPreferences({ volume: Number(event.target.value) / 100, muted: false })}/>
        <button className="review-music-mute" type="button" disabled={unavailable} aria-pressed={muted || volume === 0}
          onClick={() => setPreferences(previous => ({
            volume: previous.volume === 0 ? 0.22 : previous.volume,
            muted: previous.volume === 0 ? false : !previous.muted,
          }))}>{muted || volume === 0 ? (ko ? '음악 음소거 해제' : 'Unmute music') : (ko ? '음악 음소거' : 'Mute music')}</button>
        <small>{ko ? '다른 탭을 보거나 잠시 쉬면 음악도 멈춰요.' : 'Music pauses with the game or when this tab is hidden.'}</small>
      </div>
    </details>
    {(playback === 'blocked' || playback === 'error') && <span className="review-music-error" role="status">{ko ? '재생을 다시 눌러 주세요' : 'Press Play to retry'}</span>}
  </div>;
}
