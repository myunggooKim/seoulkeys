"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { HandGuideScene, HandGuideState } from "./hand-guide-scene";

export type GuideFinger = `${"left" | "right"}-${"pinky" | "ring" | "middle" | "index" | "thumb"}`;
type Props = HandGuideState;

/** Presentation only: the existing keyboard decides the finger, never this renderer. */
export function HandGuide({ finger, pressing = false, paused = false, reach = "home" }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<HandGuideScene | null>(null);
  const latest = useRef<HandGuideState>({ finger, pressing, paused, reach });
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    latest.current = { finger, pressing, paused, reach };
    scene.current?.update(latest.current);
  }, [finger, pressing, paused, reach]);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let loading = false;
    let instance: HandGuideScene | null = null;
    const fail = () => { if (!disposed) setReady(false); };
    const load = () => {
      if (disposed || loading) return;
      loading = true;
      void import("./hand-guide-scene").then(async ({ createHandGuideScene }) => {
        if (disposed) return;
        instance = await createHandGuideScene(element, latest.current, fail);
        if (disposed) { instance.dispose(); return; }
        scene.current = instance;
        instance.update(latest.current);
        setReady(true);
      }).catch(fail);
    };
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { observer.disconnect(); load(); }
    }, { rootMargin: "80px" });
    observer.observe(element);
    return () => { disposed = true; observer.disconnect(); instance?.dispose(); scene.current = null; };
  }, []);
  return (
    <div className={`hand-guide-art${ready ? " is-ready" : ""}`} data-active-finger={finger ?? ""} data-paused={paused} aria-hidden="true">
      {/* Original lossless artwork remains the safe fallback, not a new polygon overlay. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hand-guide-fallback" src="/images/typing-hands-v2-lossless.webp" alt="" decoding="async" loading="lazy" />
      <div className="hand-guide-canvas" ref={host} />
    </div>
  );
}
