import { IconButton, type IconButtonProps } from "@chakra-ui/react";
import { LuPause, LuPlay } from "react-icons/lu";
import { useAudioPlayer, useTrackList, type Track } from "./context";

interface PlayButtonProps extends Omit<
  IconButtonProps,
  "onClick" | "children"
> {
  track: Track;
}

/** play/pause for one specific track via the global player */
export const PlayButton = ({ track, ...props }: PlayButtonProps) => {
  const { track: current, isPlaying, toggle } = useAudioPlayer();
  const queue = useTrackList();
  const playing = isPlaying && current?.src === track.src;

  return (
    <IconButton
      aria-label={playing ? "Pause" : "Play"}
      rounded="full"
      variant="outline"
      bg="blackAlpha.600"
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        toggle(track, { queue });
      }}
    >
      {playing ? <LuPause /> : <LuPlay />}
    </IconButton>
  );
};
