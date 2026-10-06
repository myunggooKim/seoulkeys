"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import type { GameId } from "./game-activity-model";
import { GameActivityTracker } from "./game-activity-tracker";
import { observeGameFrame } from "./frame-game-activity";

export function useGameActivity(root: RefObject<HTMLElement | null>, game: GameId, running: boolean, signedIn: boolean,
  frame?: RefObject<HTMLIFrameElement | null>, readFrameRunning?: (document: Document) => boolean) {
  const tracker = useRef<GameActivityTracker | null>(null);
  const currentRunning = useRef(running);
  useLayoutEffect(() => {
    currentRunning.current = running;
    tracker.current?.setRunning(running);
  }, [running]);

  useEffect(() => {
    const element = root.current;
    if (!signedIn || !element) return;
    const clock = new GameActivityTracker(game, () => performance.now(), () => Date.now(), () => crypto.randomUUID(), async (packet, keepalive) => {
      const response = await fetch("/api/game-activity", {
        method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" },
        body: JSON.stringify(packet), keepalive,
      });
      if (response.status === 401 || response.status === 403 || response.status === 400 || response.status === 409) return "stop";
      return response.ok ? "ok" : "retry";
    });
    tracker.current = clock;
    clock.setRunning(currentRunning.current);
    let observedFrame: HTMLIFrameElement | null = null;
    let observation: ReturnType<typeof observeGameFrame> | null = null;
    const isRunning = () => {
      if (!currentRunning.current) return false;
      if (!frame) return true;
      const document = observation?.document();
      return !!document && (!readFrameRunning || readFrameRunning(document));
    };
    const foreground = () => document.visibilityState === "visible" && document.hasFocus();
    clock.setForeground(foreground());
    const interact = (event: Event) => {
      clock.setRunning(isRunning()); clock.setForeground(foreground());
      if (event.isTrusted && isRunning()) clock.interact();
    };
    const wake = () => {
      clock.setForeground(foreground());
      if (!foreground()) clock.flush(true);
    };
    const leave = () => { clock.setForeground(false); clock.flush(true); };
    // Capture observes IME/touch/Latin input without preventing or replacing it.
    const events = ["keydown", "input", "compositionend", "pointerdown"];
    for (const name of events) element.addEventListener(name, interact, true);
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("focus", wake);
    window.addEventListener("blur", wake);
    window.addEventListener("pagehide", leave);
    let ticks = 0;
    const timer = window.setInterval(() => {
      if (frame && frame.current !== observedFrame) {
        observation?.dispose(); observedFrame = frame.current;
        observation = observedFrame ? observeGameFrame(observedFrame, interact, wake) : null;
      }
      clock.setRunning(isRunning()); clock.setForeground(foreground());
      clock.advance(); if (++ticks % 60 === 0) clock.flush();
    }, 1000);
    return () => {
      leave(); window.clearInterval(timer);
      observation?.dispose();
      for (const name of events) element.removeEventListener(name, interact, true);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("focus", wake); window.removeEventListener("blur", wake); window.removeEventListener("pagehide", leave);
      if (tracker.current === clock) tracker.current = null;
    };
  }, [game, root, signedIn, frame, readFrameRunning]);
}
