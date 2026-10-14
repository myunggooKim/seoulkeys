"use client";

import "./godot-defense.css";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { ThemeWord } from "./content-themes";
import type { Locale } from "./locale-detection";
import { tr } from "./ui-i18n";
import { loadDefenseMeaningPack, type DefenseMeaningPack } from "./defense-meaning-pack";
import { createDefenseConfig, GODOT_DEFENSE_URL, isDefenseReadyMessage, postDefenseConfig } from "./godot-defense-bridge";
import { DefenseAudioSwitch } from "./DefenseAudioSwitch";
import { useGameActivity } from "./use-game-activity";

type LoadState = "idle" | "loading" | "ready" | "delayed" | "unsupported" | "error";

type GodotDefenseGameProps = {
  koreanUi: boolean;
  locale: Locale;
  soundEnabled: boolean;
  musicEnabled?: boolean;
  onSoundEnabledChange?: (enabled: boolean) => void;
  onMusicEnabledChange?: (enabled: boolean) => void;
  onRequestExit?: () => void;
  onSuccessSound: () => void;
  onKeySound: (code: string) => void;
  suspended?: boolean;
  activityTracking?: boolean;
  themeWords?: ThemeWord[];
  /** Optional fixed 160 × 600 desktop creatives. No publisher or ad request is created here.
   * Slots mount only when both the viewport and measured stage can safely contain them.
   * Supply a component element, not a component that requests an ad before it mounts.
   */
  desktopStartAd?: ReactNode;
  desktopEndAd?: ReactNode;
};

function supportsGame(): boolean {
  if (typeof WebAssembly !== "object") return false;
  const probe = document.createElement("canvas");
  try {
    const gl = probe.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** The Godot runtime owns gameplay and audio; legacy sound callbacks are retained for API compatibility. */
export function GodotDefenseGame({ locale, soundEnabled, musicEnabled = true, onSoundEnabledChange, onMusicEnabledChange, onRequestExit, suspended = false, activityTracking = false, themeWords, desktopStartAd, desktopEndAd }: GodotDefenseGameProps) {
  const text = (en: string, ko: string) => tr(locale, en, ko);
  const titleId = useId();
  const helpId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const fullscreenButtonRef = useRef<HTMLButtonElement>(null);
  const fullscreenActiveRef = useRef(false);
  const wasSuspended = useRef(suspended);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [session, setSession] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenMessage, setFullscreenMessage] = useState("");
  const [sideRailSpace, setSideRailSpace] = useState({ wide: false, tall: false });
  const showSideRails = false;
  const showSideAds = showSideRails && sideRailSpace.tall && !suspended && !hidden;
  const [meaningPack, setMeaningPack] = useState<DefenseMeaningPack | null>(null);
  const [meaningErrorRequest, setMeaningErrorRequest] = useState<string | null>(null);
  const [meaningRetry, setMeaningRetry] = useState(0);
  const meaningRequest = `${locale}:${meaningRetry}`;
  const meaningError = meaningErrorRequest === meaningRequest;
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => { if (active) setMeaningErrorRequest(meaningRequest); controller.abort(); }, 15_000);
    void loadDefenseMeaningPack(locale, controller.signal).then((pack) => {
      if (!controller.signal.aborted) setMeaningPack(pack);
    }).catch(() => {
      if (!controller.signal.aborted) setMeaningErrorRequest(meaningRequest);
    }).finally(() => window.clearTimeout(timeout));
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [locale, meaningRequest]);
  const configState = useMemo(() => {
    if (!meaningPack || meaningPack.locale !== locale) return { config: null, invalid: false };
    try { return { config: createDefenseConfig(locale, soundEnabled, suspended || hidden, themeWords, musicEnabled, meaningPack, suspended, hidden), invalid: false }; }
    catch { return { config: null, invalid: true }; }
  }, [locale, soundEnabled, musicEnabled, suspended, hidden, themeWords, meaningPack]);
  const config = configState.config;
  const meaningsReady = config !== null;
  const blocked = suspended || !meaningsReady;
  const launched = session > 0;
  const ready = loadState === "ready";
  const loading = loadState === "loading" || loadState === "delayed";
  // The accepted Godot pack is unchanged. Its internal phase is not exported;
  // this is focused recent-input time, not an exact engine play-session timer.
  useGameActivity(rootRef, "falling-words", ready && !blocked && !hidden, activityTracking, frameRef);

  const sendConfig = useCallback(() => {
    if (config) postDefenseConfig(frameRef.current?.contentWindow ?? null, window.location.origin, config);
    else frameRef.current?.contentWindow?.postMessage({ type: "seoulkeys-defense-config", payload: { suspended: true, dialogSuspended: suspended, backgroundSuspended: hidden } }, window.location.origin);
  }, [config, suspended, hidden]);

  const focusGame = useCallback(() => {
    if (blocked || document.hidden) return;
    frameRef.current?.focus({ preventScroll: true });
    frameRef.current?.contentWindow?.focus();
  }, [blocked]);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source === frameRef.current?.contentWindow && event.origin === window.location.origin && event.data?.type === "seoulkeys-defense-request-exit") {
        if (!document.fullscreenElement && !suspended) onRequestExit?.();
        return;
      }
      if (event.source === frameRef.current?.contentWindow && event.origin === window.location.origin && event.data?.type === "seoulkeys-defense-audio") {
        if (typeof event.data.soundEnabled === "boolean") onSoundEnabledChange?.(event.data.soundEnabled);
        if (typeof event.data.musicEnabled === "boolean") onMusicEnabledChange?.(event.data.musicEnabled);
        return;
      }
      if (!isDefenseReadyMessage(event, frameRef.current?.contentWindow ?? null, window.location.origin)) return;
      setLoadState("ready");
      sendConfig();
      // Do not steal focus if the learner moved to other page controls while loading.
      if (document.activeElement === document.body || document.activeElement === frameRef.current) focusGame();
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [focusGame, sendConfig, onSoundEnabledChange, onMusicEnabledChange, onRequestExit, suspended]);

  useEffect(() => {
    if (launched) sendConfig();
  }, [launched, sendConfig, session]);

  useEffect(() => {
    const visibilityChanged = () => {
      // Focus entering our same-page iframe is not an OS/app background event.
      const background = document.hidden || !document.hasFocus();
      if (background) frameRef.current?.contentWindow?.postMessage({
        type: "seoulkeys-defense-config", payload: { suspended: true, backgroundSuspended: true },
      }, window.location.origin);
      setHidden(background);
    };
    const fullscreenChanged = () => {
      const active = document.fullscreenElement === rootRef.current;
      const exited = fullscreenActiveRef.current && !active;
      fullscreenActiveRef.current = active;
      setFullscreen(active);
      // Escape and the exit action return to the visible control, without stealing a pause dialog's focus.
      if (exited && !suspended) fullscreenButtonRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener("visibilitychange", visibilityChanged);
    window.addEventListener("focus", visibilityChanged);
    window.addEventListener("blur", visibilityChanged);
    document.addEventListener("fullscreenchange", fullscreenChanged);
    return () => {
      document.removeEventListener("visibilitychange", visibilityChanged);
      window.removeEventListener("focus", visibilityChanged);
      window.removeEventListener("blur", visibilityChanged);
      document.removeEventListener("fullscreenchange", fullscreenChanged);
    };
  }, [suspended]);

  useEffect(() => {
    const stage = layoutRef.current;
    if (!stage) return;
    const measure = () => {
      // 760 px minimum game + 2 × (160 px rail + 150 px safety gap) = 1380 px.
      // At a 1440 px viewport the full-site stage is 1380 px, leaving a 760 px game.
      // Reserved boxes remain visible without an ad provider; actual creatives keep the height guard.
      const wide = !document.fullscreenElement && window.innerWidth >= 1400 && stage.clientWidth >= 1380;
      const tall = window.innerHeight >= 900 && stage.clientHeight >= 780;
      setSideRailSpace((previous) => previous.wide === wide && previous.tall === tall ? previous : { wide, tall });
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(stage);
    window.addEventListener("resize", measure);
    document.addEventListener("fullscreenchange", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      document.removeEventListener("fullscreenchange", measure);
    };
  }, []);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setLoadState((state) => state === "loading" ? "delayed" : state), 60_000);
    return () => window.clearTimeout(timer);
  }, [loading, session]);

  useEffect(() => {
    if (suspended) {
      frameRef.current?.blur();
      // The page's exit confirmation must stay visible even after fullscreen play.
      if (document.fullscreenElement === rootRef.current) void document.exitFullscreen().catch(() => {});
    } else if (wasSuspended.current && ready) {
      focusGame();
    }
    wasSuspended.current = suspended;
  }, [suspended, ready, focusGame]);

  const launch = () => {
    if (blocked) return;
    setFullscreenMessage("");
    if (!supportsGame()) {
      setLoadState("unsupported");
      return;
    }
    setLoadState("loading");
    setSession((value) => value + 1);
  };

  const toggleFullscreen = async (returnToGame: boolean) => {
    setFullscreenMessage("");
    try {
      if (document.fullscreenElement === rootRef.current) {
        await document.exitFullscreen();
      } else if (rootRef.current?.requestFullscreen) {
        await rootRef.current.requestFullscreen();
        // Pointer users can resume typing immediately; keyboard users can keep tabbing through settings.
        if (returnToGame) focusGame();
      }
      else throw new Error("Fullscreen unavailable");
    } catch {
      setFullscreenMessage(text("Fullscreen is unavailable here. You can keep playing in this view.", "전체 화면을 사용할 수 없습니다. 현재 화면에서 계속 플레이할 수 있어요."));
    }
  };

  return (
    <section ref={rootRef} className={`godot-defense-game${launched ? " is-launched" : ""}`} aria-labelledby={titleId}>
      <div ref={layoutRef} className={`gd-layout${showSideRails ? " has-side-rails" : ""}`}>
      {showSideRails && <aside className="gd-side-ad gd-side-ad-start" aria-label={text("Advertisements", "광고")}>
        <p className="gd-ad-label">{text("Advertisements", "광고")}</p>
        <div className={`gd-ad-slot${showSideAds && desktopStartAd != null ? "" : " is-placeholder"}`}>
          {showSideAds && desktopStartAd != null ? desktopStartAd : <span data-ad-placeholder="start" aria-hidden="true">160 × 600</span>}
        </div>
      </aside>}
      <div ref={panelRef} className="gd-game-panel">
      <header className="gd-header">
        <div>
          <p className="gd-eyebrow">Seoul after dark</p>
          <h2 id={titleId}>{text("City Defense", "도시 방어전")}</h2>
        </div>
        {launched && <div className="gd-tools">
          {fullscreen && <div className="gd-audio-settings" role="group" aria-label={text("Audio settings", "오디오 설정")}>
            <DefenseAudioSwitch label={text("Sound", "전체 소리")} checked={soundEnabled} onCheckedChange={(enabled) => onSoundEnabledChange?.(enabled)} onLabel={text("On", "켜짐")} offLabel={text("Off", "꺼짐")} disabled={suspended || !onSoundEnabledChange} />
            <DefenseAudioSwitch label={text("Music", "배경음악")} checked={musicEnabled} onCheckedChange={(enabled) => onMusicEnabledChange?.(enabled)} onLabel={text("On", "켜짐")} offLabel={text("Off", "꺼짐")} disabled={suspended || !onMusicEnabledChange} />
          </div>}
          <button type="button" onClick={focusGame} disabled={!ready || blocked}>{text("Return to game", "게임으로 돌아가기")}</button>
          <button ref={fullscreenButtonRef} type="button" onClick={(event) => void toggleFullscreen(event.detail > 0)} disabled={!ready || blocked}>
            {fullscreen ? text("Exit fullscreen", "전체 화면 나가기") : text("Fullscreen", "전체 화면")}
          </button>
        </div>}
      </header>

      {!launched ? <div className="gd-launch">
        <div className="gd-launch-copy">
        <p className="gd-launch-label">{text("A city worth protecting", "당신의 단어로 지키는 도시")}</p>
        <h3>{text("Light up the night.", "한글로 밝히는 서울의 밤.")}</h3>
        <p>{text("Type the falling Korean words and defend a miniature Seoul. Choose your pace inside the game.", "떨어지는 한국어 단어를 입력해 작은 서울을 지켜주세요. 게임 안에서 나에게 맞는 속도를 고를 수 있어요.")}</p>
        <button type="button" className="gd-launch-button" onClick={launch} disabled={blocked}>{text("Launch 3D game", "3D 게임 시작")}</button>
        <small>{text("The game engine downloads only when you launch. The first load may take a moment.", "시작 버튼을 누르면 게임 엔진을 내려받습니다. 처음에는 시간이 조금 걸릴 수 있어요.")}</small>
        </div>
        <figure className="gd-preview">
          {/* eslint-disable-next-line @next/next/no-img-element -- This is the original native capture, with no image-proxy processing. */}
          <img src="/games/seoul-defense/preview.png?v=10.0" alt={text("Native Godot gameplay: a 3D Seoul skyline, Namsan Tower, and incoming Korean word targets", "실제 Godot 게임 화면: 3D 서울 전경과 남산 타워, 다가오는 한글 단어 표적")} width={1180} height={812} loading="lazy" decoding="async" />
          <figcaption>{text("Native Godot gameplay preview", "Godot 실제 게임 화면 · [VER v10.0 · 천궁-II KM-SAM]")}</figcaption>
        </figure>
      </div> : <div className="gd-viewport" aria-busy={loading}>
        <iframe
          key={session}
          ref={frameRef}
          src={GODOT_DEFENSE_URL}
          title={text("City Defense: Godot 3D Korean typing game", "도시 방어전: Godot 3D 한글 타자 게임")}
          aria-describedby={helpId}
          allow="autoplay; fullscreen"
          allowFullScreen
          referrerPolicy="no-referrer"
          tabIndex={blocked ? -1 : 0}
          inert={blocked}
          style={!meaningsReady ? { visibility: "hidden" } : undefined}
          onLoad={sendConfig}
          onError={() => setLoadState("error")}
        />
      </div>}

      <div className="gd-feedback" role="status" aria-live="polite">
        {!meaningsReady && !(meaningError || configState.invalid) && <p>{text("Loading...", "불러오는 중…")} ({locale})</p>}
        {!meaningsReady && (meaningError || configState.invalid) && <p role="alert">{text("The activity could not load. Reload the page to try again.", "활동을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.")} ({locale}) <button type="button" onClick={() => { setMeaningPack(null); setMeaningRetry((value) => value + 1); }}>{text("Try again", "다시 시도")}</button></p>}
        {loadState === "loading" && <p>{text("Loading the 3D engine… Keep this tab open while the game prepares.", "3D 엔진을 불러오는 중… 게임이 준비되는 동안 이 탭을 열어두세요.")}</p>}
        {loadState === "delayed" && <p>{text("Still waiting for the game. A slow connection can take longer; if the view is blank or shows an error, try reloading the game.", "아직 게임을 기다리고 있어요. 연결이 느리면 더 걸릴 수 있습니다. 화면이 비어 있거나 오류가 보이면 게임을 다시 불러오세요.")}</p>}
        {loadState === "unsupported" && <p>{text("This browser could not start WebGL 2 and WebAssembly. Try an up-to-date browser with hardware acceleration enabled.", "이 브라우저에서 WebGL 2와 WebAssembly를 시작할 수 없습니다. 하드웨어 가속을 켠 최신 브라우저에서 시도해주세요.")}</p>}
        {loadState === "error" && <p>{text("The game did not load. Check your connection, then reload the game.", "게임을 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 다시 불러오세요.")}</p>}
        {suspended && launched && <p>{text("Game paused while you choose whether to leave.", "나갈지 선택하는 동안 게임이 일시정지됩니다.")}</p>}
        {fullscreenMessage && <p>{fullscreenMessage}</p>}
        {(loadState === "delayed" || loadState === "error") && <button type="button" onClick={launch} disabled={blocked}>{text("Reload game", "게임 다시 불러오기")}</button>}
      </div>

      <footer className="gd-help" id={helpId}>
        <p>{text("Requires WebGL 2 and WebAssembly. A desktop browser and keyboard are recommended. Click inside the game to type; use Esc to leave fullscreen.", "WebGL 2와 WebAssembly가 필요합니다. 데스크톱 브라우저와 키보드를 권장해요. 게임 안을 클릭하면 입력할 수 있고, Esc로 전체 화면을 나갈 수 있어요.")}</p>
        <span>Godot · Blender · VER v10.0 (천궁-II KM-SAM)</span>
      </footer>
      </div>
      {showSideRails && <aside className="gd-side-ad gd-side-ad-end" aria-label={text("Advertisements", "광고")}>
        <p className="gd-ad-label">{text("Advertisements", "광고")}</p>
        <div className={`gd-ad-slot${showSideAds && desktopEndAd != null ? "" : " is-placeholder"}`}>
          {showSideAds && desktopEndAd != null ? desktopEndAd : <span data-ad-placeholder="end" aria-hidden="true">160 × 600</span>}
        </div>
      </aside>}
      </div>
    </section>
  );
}
