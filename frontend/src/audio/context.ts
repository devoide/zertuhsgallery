import { createContext, useContext } from "react";
import type { ProfileEntry } from "../supabase/types";

/** height of the fixed player bar, so the layout can leave room for it */
export const PLAYER_BAR_HEIGHT = { base: "120px", md: "76px" };

export type Track = {
  src: string;
  title: string;
  cover?: string;
  author?: ProfileEntry;
};

/** an ordered list of tracks, optionally able to fetch what comes after it */
export type TrackList = {
  tracks: Track[];
  /** e.g. the next gallery page's music; resolves null when there's no more */
  loadMore?: () => Promise<TrackList | null>;
};

export type PlayOptions = {
  /** seconds to jump to */
  startAt?: number;
  /** tracks for next/previous; replaces the current queue when given */
  queue?: TrackList;
};

export type AudioPlayerState = {
  track: Track | null;
  isPlaying: boolean;
  volume: number;
  hasNext: boolean;
  hasPrev: boolean;
  /** load + play a track; resumes if it's already the current one */
  play: (track?: Track, options?: PlayOptions) => void;
  pause: () => void;
  /** play/pause; switches to `track` first if it isn't the current one */
  toggle: (track?: Track, options?: PlayOptions) => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  /** stop playback, clear the track + queue, hide the player */
  close: () => void;
};

// kept separate: updates several times a second while playing, so only
// components that show progress re-render on it
export type AudioProgress = {
  currentTime: number;
  duration: number;
};

export const AudioPlayerContext = createContext<AudioPlayerState | null>(null);
export const AudioProgressContext = createContext<AudioProgress>({
  currentTime: 0,
  duration: 0,
});

/**
 * The list of tracks currently on screen (e.g. the music on a gallery page).
 * Play buttons inside it hand this list to the player as the queue.
 */
export const TrackListContext = createContext<TrackList | undefined>(
  undefined,
);

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error("useAudioPlayer must be used inside <AudioPlayerProvider>");
  }
  return ctx;
}

export function useAudioProgress() {
  return useContext(AudioProgressContext);
}

export function useTrackList() {
  return useContext(TrackListContext);
}

/** true if `src` is the track currently loaded in the global player */
export function useIsCurrentTrack(src: string) {
  return useAudioPlayer().track?.src === src;
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
