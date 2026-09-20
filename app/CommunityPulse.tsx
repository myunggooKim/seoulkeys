"use client";

import { useEffect, useState } from "react";
import type { Locale } from "./locale-detection";
import { tr } from "./ui-i18n";

type Pulse = {
  learners: number;
  countries: number;
  liveNow: number;
};

const POLL_MS = 60_000;
const HEARTBEAT_MS = 45_000;
const VISITOR_KEY = "seoulkeys-visitor";

/** A random id the tab keeps for itself. Never tied to an account, never sent
 *  anywhere but the heartbeat, so presence is counted without tracking anyone. */
function visitorId(): string {
  try {
    const existing = window.sessionStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
    window.sessionStorage.setItem(VISITOR_KEY, fresh);
    return fresh;
  } catch {
    return "";
  }
}

/**
 * Reach, on a lit readout, sharing the notice row.
 *
 * Two running totals: how many countries the site has been used from, and how
 * many people have used it at least once. Both only ever climb, which is what
 * makes them safe to leave on a board — and both are counted rows in the
 * database, so nothing here has to be walked back later.
 *
 * The heartbeat still runs: it is what keeps `presence` current for the owner's
 * dashboard, and a visitor from a new country is reflected here the moment they
 * sign up.
 */
export function CommunityPulse({ locale }: { locale: Locale }) {
  const [pulse, setPulse] = useState<Pulse | null>(null);

  useEffect(() => {
    let active = true;
    const id = visitorId();

    const beat = () => {
      if (document.visibilityState !== "visible" || !id) return;
      void fetch("/api/pulse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ visitorId: id }),
        keepalive: true,
      }).catch(() => {});
    };
    const read = () => {
      if (document.visibilityState !== "visible") return;
      void fetch("/api/pulse", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((data: Pulse | null) => { if (active && data) setPulse(data); })
        .catch(() => {});
    };

    beat();
    read();
    const poll = window.setInterval(read, POLL_MS);
    const heart = window.setInterval(beat, HEARTBEAT_MS);
    const onVisible = () => { if (document.visibilityState === "visible") { beat(); read(); } };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      window.clearInterval(poll);
      window.clearInterval(heart);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Reserve the space from the first paint so the notice row does not jump when
  // the figures land.
  /* Reach, counted rather than claimed: countries the site has been served to,
     and visits. Both carry a floor taken from Cloudflare's own record of the
     period before this table existed — 42 countries means at least 42 distinct
     clients, since a country cannot appear without one. Shown exactly as
     counted; an earlier version floored these at 1, which would have displayed a
     visitor the database did not have. */
  const countries = pulse ? pulse.countries : null;
  const learners = pulse ? pulse.learners : null;

  const plate = (value: number | null, width: number) =>
    (value === null ? "—".repeat(width) : String(value).padStart(width, "0"))
      .split("")
      .map((character, index) => <b key={index}>{character}</b>);

  if (pulse && countries !== null && learners !== null && countries + learners === 0) return null;

  /* The viewer is on the site, so this is never below one and never reads as an
     empty room. It is the only figure here that falls as well as rises. */
  const online = pulse ? Math.max(1, pulse.liveNow) : null;

  return (
    <aside className={`live-board${(pulse?.liveNow ?? 0) > 1 ? " is-busy" : ""}`} role="status" aria-live="polite">
      <span className="live-board-cell is-now">
        <span className="live-board-lamp" aria-hidden="true" />
        <span className="live-board-digits" aria-hidden="true">{plate(online, 2)}</span>
        <span className="live-board-label">{tr(locale, "online", "명 접속")}</span>
      </span>

      <span className="live-board-cell">
        <span className="live-board-digits" aria-hidden="true">{plate(countries, 2)}</span>
        <span className="live-board-label">{tr(locale, "countries", "개국")}</span>
      </span>

      <span className="live-board-cell">
        <span className="live-board-digits" aria-hidden="true">{plate(learners, 3)}</span>
        <span className="live-board-label">{tr(locale, "visits", "명 방문")}</span>
      </span>

      <span className="sr-only">
        {tr(
          locale,
          "{o} online now. Visited from {c} countries, {n} visits.",
          "현재 {o}명 접속 중. {c}개국에서 {n}명이 방문했습니다.",
        )
          .replace("{o}", String(online ?? 0))
          .replace("{c}", String(countries ?? 0))
          .replace("{n}", String(learners ?? 0))}
      </span>
    </aside>
  );
}
