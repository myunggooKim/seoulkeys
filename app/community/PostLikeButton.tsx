"use client";

import {useEffect, useRef, useState} from 'react';
import {GoogleSignIn} from '../GoogleSignIn';
import type {Locale} from '../locale-detection';
import {communityCopy} from './copy';
import {likesCopy} from './likes-copy';
import type {ForumEntry} from './model';
import styles from './community.module.css';

export default function PostLikeButton({entry, locale, signedIn, ready}: {
  entry: ForumEntry; locale: Locale; signedIn: boolean; ready: boolean;
}) {
  const c = communityCopy(locale);
  const copy = likesCopy(locale);
  const [state, setState] = useState({likes: entry.likes ?? 0, liked: Boolean(entry.liked)});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const inFlight = useRef(false);
  useEffect(() => {
    setState({likes: entry.likes ?? 0, liked: Boolean(entry.liked)});
  }, [entry.id, entry.likes, entry.liked]);

  async function react() {
    if (!ready || inFlight.current) return;
    if (!signedIn) {setShowLogin(true); return;}
    inFlight.current = true;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/community', {
        method: 'POST', cache: 'no-store', headers: {'content-type': 'application/json'},
        body: JSON.stringify({action: 'like', id: entry.id, liked: !state.liked}),
      });
      const data = await response.json() as {error?: string; likes?: number; liked?: boolean};
      if (!response.ok) throw new Error(data.error ?? 'unavailable');
      if (!Number.isSafeInteger(data.likes) || (data.likes ?? -1) < 0 || typeof data.liked !== 'boolean') throw new Error('unavailable');
      // No optimistic totals: an unsuccessful request leaves the confirmed state intact.
      setState({likes: data.likes!, liked: data.liked});
    } catch (failure) {
      const code = failure instanceof Error ? failure.message : 'unavailable';
      if (code === 'signIn') setShowLogin(true);
      setError(code === 'blocked' ? c.forbidden : code in c ? c[code as keyof typeof c] : c.unavailable);
    } finally {inFlight.current = false; setBusy(false);}
  }

  return <div className={styles.likeControl}>
    <button type="button" className={styles.likeButton} aria-pressed={state.liked}
      aria-label={`${state.liked ? copy.unlike : copy.like} · ${state.likes}`}
      disabled={!ready || busy} onClick={() => void react()}>
      <svg viewBox="0 0 24 24" aria-hidden="true" fill={state.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>
      </svg>
      <span>{copy.like}</span><span className={styles.likeCount}>{state.likes}</span>
    </button>
    {error && <p className={styles.note} role="alert">{error}</p>}
    {showLogin && <div className={styles.login}><p>{copy.like} · {c.signIn}</p>
      <GoogleSignIn locale={locale} redirectTo={typeof window === 'undefined' ? '/community' : window.location.pathname} showRoleChoice={false}/>
    </div>}
  </div>;
}
