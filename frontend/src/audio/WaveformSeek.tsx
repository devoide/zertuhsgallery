import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import {
  formatTime,
  useAudioPlayer,
  useAudioProgress,
  useTrackList,
  type Track,
} from "./context";
import { PEAK_COUNT, downsample, useWaveform } from "./peaks";

interface WaveformSeekProps {
  track: Track;
  /** bar area height in px */
  height?: number;
  bars?: number;
  showTimes?: boolean;
  /** only decode once scrolled into view (for lists of cards) */
  lazy?: boolean;
  /** tighter spacing + smaller times, for the card mini player */
  compact?: boolean;
}

// flat placeholder while decoding / if decoding failed
const FLAT = Array.from({ length: PEAK_COUNT }, () => 0.12);

/**
 * SoundCloud-style waveform that doubles as the seek bar.
 * Works for any track: if it isn't the one playing, clicking starts it
 * at the clicked position.
 */
export const WaveformSeek = ({
  track,
  height = 64,
  bars = 120,
  showTimes = true,
  lazy = false,
  compact = false,
}: WaveformSeekProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!lazy);

  useEffect(() => {
    if (visible || !ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { rootMargin: "200px" }, // start a bit before it scrolls in
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [visible]);

  const { track: current, play } = useAudioPlayer();
  const { currentTime, duration: liveDuration } = useAudioProgress();
  const { waveform } = useWaveform(track.src, visible);
  const queue = useTrackList();

  const isCurrent = current?.src === track.src;
  const duration = (isCurrent && liveDuration) || waveform?.duration || 0;
  const time = isCurrent ? currentTime : 0;

  const barsData = useMemo(
    () => downsample(waveform?.peaks ?? FLAT, bars),
    [waveform, bars],
  );

  const [drag, setDrag] = useState<number | null>(null); // 0..1 while dragging
  const [hover, setHover] = useState<number | null>(null); // 0..1

  const fractionAt = (e: PointerEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
  };

  const canSeek = duration > 0;
  const progress =
    drag ?? (duration > 0 ? Math.min(1, time / duration) : 0);

  const onPointerDown = (e: PointerEvent) => {
    if (!canSeek) {
      // duration unknown yet: just start playing from the beginning
      play(track, { queue });
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(fractionAt(e));
  };

  const onPointerMove = (e: PointerEvent) => {
    const f = fractionAt(e);
    if (drag != null) setDrag(f);
    else setHover(f);
  };

  const onPointerUp = (e: PointerEvent) => {
    if (drag == null) return;
    const f = fractionAt(e);
    setDrag(null);
    play(track, { startAt: f * duration, queue });
  };

  return (
    <HStack w="full" gap={compact ? 2 : 3}>
      {showTimes && (
        <Text
          fontSize={compact ? "2xs" : "xs"}
          color="gray.400"
          minW={compact ? "7" : "9"}
          textAlign="right"
          fontVariantNumeric="tabular-nums"
        >
          {formatTime(drag != null ? drag * duration : time)}
        </Text>
      )}
      <Flex
        ref={ref}
        flex="1"
        h={`${height}px`}
        align="center"
        gap="1px"
        cursor="pointer"
        touchAction="none"
        userSelect="none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDrag(null)}
        onPointerLeave={() => setHover(null)}
        // keep clicks from reaching parents (e.g. a card's dialog trigger)
        onClick={(e) => e.stopPropagation()}
      >
        {barsData.map((peak, i) => {
          const pos = (i + 0.5) / barsData.length;
          const played = pos <= progress;
          const hovered = hover != null && drag == null && pos <= hover;
          return (
            <Box
              key={i}
              flex="1"
              minW="1px"
              h={`${Math.max(4, peak * 100)}%`}
              rounded="full"
              bg={played ? "gray.100" : hovered ? "gray.500" : "gray.600"}
              transition="background 0.1s"
            />
          );
        })}
      </Flex>
      {showTimes && (
        <Text
          fontSize={compact ? "2xs" : "xs"}
          color="gray.400"
          minW={compact ? "7" : "9"}
          fontVariantNumeric="tabular-nums"
        >
          {formatTime(duration)}
        </Text>
      )}
    </HStack>
  );
};
