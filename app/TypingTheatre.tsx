"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { CinemaScene, CinemaState } from "./cinema-scene";
import { loadCinemaHandData } from "./cinema-assets";
type Props = { state: CinemaState; legend: (code: string) => string; onFailure: () => void };

let sceneModule: Promise<typeof import("./cinema-scene")> | null = null;
function loadSceneModule() {
  return sceneModule ??= import("./cinema-scene").catch(error => { sceneModule = null; throw error; });
}

/** Warm code and model bytes, without allocating a canvas or running animations. */
export function preloadTypingTheatre() {
  void Promise.all([
    loadSceneModule(),
    import("three/src/renderers/WebGLRenderer.js"),
    loadCinemaHandData("left"),
    loadCinemaHandData("right"),
  ]).catch(() => {}); // A failed warm-up must not affect basic typing; entry retries.
}

/** Decoration only. The one existing HangulInput owns IME, grading and progress. */
export function TypingTheatre({ state, legend, onFailure }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<CinemaScene | null>(null);
  const latest = useRef(state);
  const failed = useRef(onFailure);
  useLayoutEffect(() => {
    latest.current = state;
    failed.current = onFailure;
    scene.current?.update(state);
  }, [state, onFailure]);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let instance: CinemaScene | null = null;
    const fail = () => { if (!disposed) failed.current(); };
    void loadSceneModule().then(async ({ createCinemaScene }) => {
      if (disposed) return;
      instance = await createCinemaScene(element, latest.current, legend, fail,
        element.parentElement?.querySelector<HTMLElement>(".typing-panel") ?? null);
      if (disposed) { instance.dispose(); return; }
      scene.current = instance;
      instance.update(latest.current);
    }).catch(fail);
    return () => { disposed = true; instance?.dispose(); scene.current = null; };
  }, [legend]);
  return <div className="typing-theatre-canvas" ref={host} aria-hidden="true" data-code={state.code ?? ""} data-paused={state.paused} />;
}
