"use client";

import { useEffect, useRef, useState } from "react";
import { gameIds, gameNames, type GameActivitySummary } from "../game-activity-model";
import styles from "./MemberTable.module.css";

export function MemberGameActivity({ email, name, onClose }: { email: string; name: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [games, setGames] = useState<GameActivitySummary[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const element = dialog.current;
    element?.showModal();
    return () => {
      element?.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController(); let live = true;
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    setError(false); setGames(null);
    void fetch(`/api/admin/game-activity?email=${encodeURIComponent(email)}`, { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error();
        const data: { games?: GameActivitySummary[] } = await response.json();
        if (!Array.isArray(data.games) || data.games.length !== gameIds.length
          || new Set(data.games.map(item => item?.game)).size !== gameIds.length
          || data.games.some(item => !item || !gameIds.includes(item.game) || !Number.isSafeInteger(item.seconds) || item.seconds < 0
            || !Number.isSafeInteger(item.lastPlayedAt) || item.lastPlayedAt < 0 || item.lastPlayedAt > 8_640_000_000_000_000)) throw new Error();
        return { games: data.games };
      })
      .then(data => { if (live) setGames(data.games); })
      .catch(() => { if (live) setError(true); })
      .finally(() => window.clearTimeout(timeout));
    return () => { live = false; controller.abort(); window.clearTimeout(timeout); };
  }, [email, attempt]);
  return (
    <dialog ref={dialog} className={styles.gameDialog} aria-labelledby="member-game-title" onCancel={onClose}>
      <header><h2 id="member-game-title">{name} · 게임 이용 기록</h2><button type="button" onClick={onClose} autoFocus aria-label="게임 기록 닫기">닫기</button></header>
      <p className={styles.gameNote}>기록 기능 적용 이후 로그인한 상태에서 입력 활동이 있었던 시간입니다.<br />다른 탭·나가기 확인·60초 넘는 무입력은 제외합니다.</p>
      {!games && !error && <p role="status">기록을 불러오는 중입니다…</p>}
      {error && <div role="alert"><p>기록을 불러오지 못했습니다. 기존 회원 정보에는 영향이 없습니다.</p><button type="button" onClick={() => setAttempt(value => value + 1)}>다시 시도</button></div>}
      {games && <ul className={styles.gameList}>{games.map(item => <li key={item.game}>
        <b>{gameNames[item.game]}</b><strong>{item.seconds < 60 ? `${item.seconds}초` : `${Math.floor(item.seconds / 60)}분 ${item.seconds % 60}초`}</strong>
        <span>{item.lastPlayedAt ? `최근 플레이 ${new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(item.lastPlayedAt)} (한국 시간)` : "아직 기록 없음"}</span>
      </li>)}</ul>}
      {games?.every(item => item.seconds === 0) && <p className={styles.gameNote}>과거 플레이 기록은 수집되지 않았으므로 0초가 실제 미이용을 뜻하지는 않습니다.</p>}
      <p className={styles.gameNote}>입력 활동 기준의 추정 시간입니다. 도시 방어전 내부의 대기·일시정지는 마지막 입력 후 최대 60초까지 포함될 수 있습니다.<br />네트워크 장애나 브라우저 강제 종료 시 일부 기록이 누락될 수 있습니다.</p>
    </dialog>
  );
}
