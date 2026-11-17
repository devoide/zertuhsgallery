import { useEffect, useState } from "react";

/** number of bars computed per track; components downsample from this */
export const PEAK_COUNT = 200;

export type Waveform = {
  /** PEAK_COUNT values, normalized 0..1 */
  peaks: number[];
  /** seconds, known before the track is ever played */
  duration: number;
};

// one decode per src for the whole session, shared by cards, modal + bar
const cache = new Map<string, Promise<Waveform>>();

// decoding means downloading the whole file + a CPU-heavy decode, so only a
// couple run at once (a gallery page can have many music cards)
const MAX_CONCURRENT = 2;
let running = 0;
const waiting: (() => void)[] = [];

async function limited<T>(job: () => Promise<T>): Promise<T> {
  if (running >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => waiting.push(resolve));
  }
  running++;
  try {
    return await job();
  } finally {
    running--;
    waiting.shift()?.();
  }
}

async function decode(src: string): Promise<Waveform> {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Failed to fetch audio (${res.status})`);
  const buffer = await res.arrayBuffer();

  // OfflineAudioContext can decode without user interaction / autoplay rules
  const ctx = new OfflineAudioContext(1, 1, 44100);
  const audio = await ctx.decodeAudioData(buffer);

  const data = audio.getChannelData(0);
  const blockSize = Math.max(1, Math.floor(data.length / PEAK_COUNT));
  // sampling every Nth value inside a block is plenty for a visual
  const stride = Math.max(1, Math.floor(blockSize / 500));

  const peaks: number[] = [];
  let max = 0;
  for (let i = 0; i < PEAK_COUNT; i++) {
    let peak = 0;
    const start = i * blockSize;
    const end = Math.min(start + blockSize, data.length);
    for (let j = start; j < end; j += stride) {
      const v = Math.abs(data[j]);
      if (v > peak) peak = v;
    }
    peaks.push(peak);
    if (peak > max) max = peak;
  }

  return {
    peaks: peaks.map((p) => (max > 0 ? p / max : 0)),
    duration: audio.duration,
  };
}

export function loadWaveform(src: string) {
  let entry = cache.get(src);
  if (!entry) {
    entry = limited(() => decode(src));
    // don't cache failures, allow a retry next time
    entry.catch(() => cache.delete(src));
    cache.set(src, entry);
  }
  return entry;
}

/** `enabled: false` defers loading (e.g. until the element is on screen) */
export function useWaveform(src: string, enabled = true) {
  const [result, setResult] = useState<{
    src: string;
    waveform: Waveform | null;
    failed: boolean;
  }>({ src, waveform: null, failed: false });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    loadWaveform(src).then(
      (waveform) => !cancelled && setResult({ src, waveform, failed: false }),
      (err) => {
        console.error("Waveform decode failed:", err);
        if (!cancelled) setResult({ src, waveform: null, failed: true });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [src, enabled]);

  // ignore a stale result from the previous src while the new one loads
  return result.src === src ? result : { waveform: null, failed: false };
}

/** shrink PEAK_COUNT peaks down to `bars` by taking the max of each group */
export function downsample(peaks: number[], bars: number) {
  if (bars >= peaks.length) return peaks;
  const out: number[] = [];
  const group = peaks.length / bars;
  for (let i = 0; i < bars; i++) {
    let m = 0;
    const end = Math.floor((i + 1) * group);
    for (let j = Math.floor(i * group); j < end; j++) m = Math.max(m, peaks[j]);
    out.push(m);
  }
  return out;
}
