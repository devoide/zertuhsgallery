import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  AudioPlayerContext,
  AudioProgressContext,
  type AudioPlayerState,
  type PlayOptions,
  type Track,
} from "./context";

const VOLUME_KEY = "player-volume";

function readStoredVolume() {
  try {
    const v = parseFloat(localStorage.getItem(VOLUME_KEY) ?? "");
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 1;
  } catch {
    return 1;
  }
}

/**
 * Owns the one and only <audio> element. Mounted above the router, so it
 * survives page changes and modals opening/closing — those only send it
 * tracks via useAudioPlayer().
 */
export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [audio] = useState(() => new Audio());
  const trackRef = useRef<Track | null>(null);
  const queueRef = useRef<Track[]>([]);

  const [track, setTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(readStoredVolume);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const load = useCallback(
    (next: Track) => {
      trackRef.current = next;
      setTrack(next);
      setCurrentTime(0);
      setDuration(0);
      audio.src = next.src;
    },
    [audio],
  );

  const play = useCallback(
    (next?: Track, { startAt, queue: newQueue }: PlayOptions = {}) => {
      if (newQueue) {
        queueRef.current = newQueue;
        setQueue(newQueue);
      }
      const isNew = !!next && next.src !== trackRef.current?.src;
      if (isNew) load(next);
      if (!trackRef.current) return;
      if (startAt != null) {
        if (isNew) {
          // can't seek before metadata is loaded; apply it once it is
          audio.addEventListener(
            "loadedmetadata",
            () => (audio.currentTime = startAt),
            { once: true },
          );
        } else {
          audio.currentTime = startAt;
        }
        setCurrentTime(startAt);
      }
      audio.play().catch((err) => {
        // AbortError = interrupted by a newer play/pause call, harmless
        if (err.name !== "AbortError") console.error("Audio play failed:", err);
      });
    },
    [audio, load],
  );

  const pause = useCallback(() => audio.pause(), [audio]);

  const toggle = useCallback(
    (next?: Track, options?: PlayOptions) => {
      if (next && next.src !== trackRef.current?.src) {
        return play(next, options);
      }
      if (audio.paused) play(undefined, options);
      else audio.pause();
    },
    [audio, play],
  );

  const indexInQueue = useCallback(
    () => queueRef.current.findIndex((t) => t.src === trackRef.current?.src),
    [],
  );

  const next = useCallback(() => {
    const i = indexInQueue();
    const target = i >= 0 ? queueRef.current[i + 1] : undefined;
    if (target) play(target);
  }, [indexInQueue, play]);

  const prev = useCallback(() => {
    const i = indexInQueue();
    const target = i > 0 ? queueRef.current[i - 1] : undefined;
    if (target) play(target);
  }, [indexInQueue, play]);

  const seek = useCallback(
    (time: number) => {
      audio.currentTime = time;
      setCurrentTime(time);
    },
    [audio],
  );

  const setVolume = useCallback(
    (v: number) => {
      audio.volume = v;
      setVolumeState(v);
      try {
        localStorage.setItem(VOLUME_KEY, String(v));
      } catch {
        // storage unavailable (private mode etc.) — volume just won't persist
      }
    },
    [audio],
  );

  const close = useCallback(() => {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    trackRef.current = null;
    queueRef.current = [];
    setTrack(null);
    setQueue([]);
    setCurrentTime(0);
    setDuration(0);
  }, [audio]);

  // the listeners below are attached once; reach the latest `next` via a ref
  const nextRef = useRef(next);
  nextRef.current = next;

  useEffect(() => {
    audio.preload = "metadata";
    audio.volume = volume;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      nextRef.current(); // auto-advance; no-op on the last track
    };
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDuration = () =>
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onError = () => {
      setIsPlaying(false);
      console.error("Audio playback error:", audio.error?.message);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("durationchange", onDuration);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("durationchange", onDuration);
      audio.removeEventListener("error", onError);
    };
    // volume is only applied once here; setVolume handles later changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio]);

  const index = track ? queue.findIndex((t) => t.src === track.src) : -1;
  const hasNext = index >= 0 && index < queue.length - 1;
  const hasPrev = index > 0;

  // OS media controls (lock screen, keyboard media keys, notification)
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    if (!track) {
      ms.metadata = null;
      return;
    }
    ms.metadata = new MediaMetadata({
      title: track.title,
      artist: track.author?.username ?? "",
      artwork: track.cover ? [{ src: track.cover }] : [],
    });
    ms.setActionHandler("play", () => play());
    ms.setActionHandler("pause", pause);
    ms.setActionHandler("seekto", (d) => {
      if (d.seekTime != null) seek(d.seekTime);
    });
    ms.setActionHandler("nexttrack", hasNext ? next : null);
    ms.setActionHandler("previoustrack", hasPrev ? prev : null);
  }, [track, play, pause, seek, next, prev, hasNext, hasPrev]);

  const state = useMemo<AudioPlayerState>(
    () => ({
      track,
      isPlaying,
      volume,
      hasNext,
      hasPrev,
      play,
      pause,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      close,
    }),
    [
      track,
      isPlaying,
      volume,
      hasNext,
      hasPrev,
      play,
      pause,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      close,
    ],
  );

  const progress = useMemo(
    () => ({ currentTime, duration }),
    [currentTime, duration],
  );

  return (
    <AudioPlayerContext.Provider value={state}>
      <AudioProgressContext.Provider value={progress}>
        {children}
      </AudioProgressContext.Provider>
    </AudioPlayerContext.Provider>
  );
}
