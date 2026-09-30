// Local CC0 recordings: no third-party runtime calls or synthesized beeps.
const files = ["key-a", "key-b", "key-wide"] as const;
const buffers = new WeakMap<AudioContext, Promise<(AudioBuffer | null)[]>>();
const voices = new WeakMap<AudioContext, Set<AudioBufferSourceNode>>();

export function playRecordedTypingKey(context: AudioContext, code: string, volume: number) {
  if (volume <= 0 || context.state === "closed") return;
  let loaded = buffers.get(context);
  if (!loaded) {
    loaded = Promise.all(files.map(async file => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      try {
        const response = await fetch(`/audio/typing/${file}.wav`, { signal: controller.signal });
        if (!response.ok) return null;
        return await context.decodeAudioData(await response.arrayBuffer());
      } catch { return null; }
      finally { clearTimeout(timeout); }
    }));
    buffers.set(context, loaded);
  }
  void loaded.then(samples => {
    if (context.state === "closed" || (typeof document !== "undefined" && document.visibilityState === "hidden")) return;
    const index = code === "Space" || code === "Backspace" ? 2 : Array.from(code).reduce((n, c) => n + c.charCodeAt(0), 0) % 2;
    const sample = samples[index] ?? samples.find(Boolean);
    if (!sample) return;
    const active = voices.get(context) ?? new Set<AudioBufferSourceNode>();
    voices.set(context, active);
    // Bound simultaneous strikes at very fast typing speeds; no queued loop.
    if (active.size >= 12) active.values().next().value?.stop();
    const source = context.createBufferSource(), gain = context.createGain();
    source.buffer = sample; source.playbackRate.value = .97 + Math.random() * .06;
    gain.gain.value = Math.max(0, Math.min(1, volume)) * .8;
    source.connect(gain).connect(context.destination); active.add(source);
    source.onended = () => { active.delete(source); source.disconnect(); gain.disconnect(); };
    source.start(context.currentTime);
  }).catch(() => {});
}
