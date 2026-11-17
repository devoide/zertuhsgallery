import { HStack, type StackProps } from "@chakra-ui/react";
import type { Track } from "./context";
import { PlayButton } from "./PlayButton";
import { WaveformSeek } from "./WaveformSeek";

interface MiniPlayerProps extends StackProps {
  track: Track;
  /** waveform bar count; more for wider spots like the modal */
  bars?: number;
  /** only decode the waveform once scrolled into view */
  lazy?: boolean;
}

/**
 * Compact Firefox-style player strip (play + time + waveform + length).
 * Fixed 44px tall. Clicks inside don't bubble, so it can sit inside a
 * clickable card without opening its dialog.
 */
export const MiniPlayer = ({
  track,
  bars = 60,
  lazy = false,
  ...props
}: MiniPlayerProps) => (
  <HStack
    h="11"
    gap={2}
    px={2}
    bg="gray.950"
    cursor="default"
    onClick={(e) => e.stopPropagation()}
    {...props}
  >
    <PlayButton
      track={track}
      size="xs"
      variant="ghost"
      bg="transparent"
      flexShrink={0}
    />
    <WaveformSeek track={track} height={24} bars={bars} lazy={lazy} compact />
  </HStack>
);
