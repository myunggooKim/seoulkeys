import type { GameActivityPacket, GameId } from "./game-activity-model";

type Sender = (packet: GameActivityPacket, keepalive: boolean) => Promise<"ok" | "retry" | "stop">;

/** In-memory only; no keys, answers, account emails, or anonymous identifiers. */
export class GameActivityTracker {
  private previous: number;
  private interaction: number | null = null;
  private lastPlayedAt = 0;
  private running = false;
  private foreground = false;
  private milliseconds = 0;
  private pending: GameActivityPacket[] = [];
  private sending = false;
  private stopped = false;

  constructor(private game: GameId, private now: () => number, private wallTime: () => number,
    private id: () => string, private send: Sender) { this.previous = now(); }

  advance() {
    const now = this.now();
    const interval = now - this.previous;
    // Suspended computers/throttled timers must not become hours of play time.
    if (this.running && this.foreground && this.interaction !== null && interval >= 0 && interval <= 5000) {
      const elapsed = Math.max(0, Math.min(now, this.interaction + 60_000) - this.previous);
      this.milliseconds = Math.min(600_000, this.milliseconds + elapsed);
      if (elapsed > 0) this.lastPlayedAt = this.wallTime() - Math.max(0, now - this.interaction - 60_000);
    }
    this.previous = now;
  }
  setRunning(running: boolean) { this.advance(); this.running = running; }
  setForeground(foreground: boolean) {
    this.advance(); this.foreground = foreground;
    if (!foreground) this.interaction = null;
  }
  interact() { this.advance(); if (this.foreground) this.interaction = this.now(); }

  flush(keepalive = false) {
    this.advance();
    if (this.stopped) return;
    while (this.milliseconds >= 1000 && this.pending.length < 10) {
      const seconds = Math.min(60, Math.floor(this.milliseconds / 1000));
      this.pending.push({ id: this.id(), game: this.game, seconds, playedAt: this.lastPlayedAt });
      this.milliseconds -= seconds * 1000;
    }
    if (!this.pending.length) return;
    // An unload may race an in-flight save; the same batch ID cannot double count.
    if (this.sending) {
      if (keepalive) for (const packet of this.pending) void this.send(packet, true).catch(() => {});
      return;
    }
    this.sending = true;
    void this.drain(keepalive).finally(() => { this.sending = false; });
  }
  private async drain(keepalive: boolean) {
    // Start all outstanding bounded packets before the page's unload completes.
    const packets = [...this.pending];
    const statuses = await Promise.all(packets.map(packet => this.send(packet, keepalive).catch(() => "retry" as const)));
    if (statuses.includes("stop")) { this.stopped = true; this.pending = []; this.milliseconds = 0; return; }
    const saved = new Set(packets.filter((_, i) => statuses[i] === "ok").map(packet => packet.id));
    this.pending = this.pending.filter(packet => !saved.has(packet.id));
  }
}
