import {
  Box,
  CloseButton,
  Container,
  Flex,
  HStack,
  IconButton,
  Image,
  Slider,
  Text,
} from "@chakra-ui/react";
import { useRef } from "react";
import {
  LuMusic,
  LuSkipBack,
  LuSkipForward,
  LuVolume1,
  LuVolume2,
  LuVolumeX,
} from "react-icons/lu";
import { PLAYER_BAR_HEIGHT, useAudioPlayer } from "./context";
import { PlayButton } from "./PlayButton";
import { WaveformSeek } from "./WaveformSeek";

const VolumeControl = () => {
  const { volume, setVolume } = useAudioPlayer();
  const lastVolume = useRef(volume || 1);
  const Icon = volume === 0 ? LuVolumeX : volume < 0.5 ? LuVolume1 : LuVolume2;

  return (
    <HStack gap={2} w="32" flexShrink={0} display={{ base: "none", lg: "flex" }}>
      <IconButton
        aria-label={volume === 0 ? "Unmute" : "Mute"}
        variant="ghost"
        size="sm"
        onClick={() => {
          if (volume === 0) setVolume(lastVolume.current);
          else {
            lastVolume.current = volume;
            setVolume(0);
          }
        }}
      >
        <Icon />
      </IconButton>
      <Slider.Root
        flex="1"
        size="sm"
        min={0}
        max={1}
        step={0.01}
        value={[volume]}
        onValueChange={(e) => setVolume(e.value[0])}
        aria-label={["Volume"]}
      >
        <Slider.Control>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumbs />
        </Slider.Control>
      </Slider.Root>
    </HStack>
  );
};

/** SoundCloud-style player fixed to the bottom; hidden until something plays */
export const PlayerBar = () => {
  const { track, close, next, prev, hasNext, hasPrev } = useAudioPlayer();
  if (!track) return null;

  const info = (
    <HStack gap={3} minW={0} flex={{ base: "1 1 0", md: "0 1 14rem" }}>
      {track.cover ? (
        <Image
          src={track.cover}
          alt=""
          boxSize="12"
          objectFit="cover"
          rounded="sm"
          flexShrink={0}
        />
      ) : (
        <Flex
          boxSize="12"
          rounded="sm"
          bg="gray.700"
          align="center"
          justify="center"
          flexShrink={0}
        >
          <LuMusic />
        </Flex>
      )}
      <Box minW={0}>
        <Text fontSize="sm" fontWeight="semibold" truncate>
          {track.title}
        </Text>
        {track.author && (
          <Text
            fontSize="xs"
            truncate
            colorPalette={track.author.color}
            color="colorPalette.fg"
          >
            {track.author.username}
          </Text>
        )}
      </Box>
    </HStack>
  );

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex="sticky"
      bg="bg"
      borderTopWidth="1px"
      borderColor="border"
      h={PLAYER_BAR_HEIGHT}
    >
      <Container maxW="6xl" h="full" py={2}>
        <Flex direction="column" justify="center" h="full" gap={3}>
          {/* mobile: waveform gets its own row, above the controls */}
          <Box display={{ base: "block", md: "none" }}>
            <WaveformSeek track={track} height={32} bars={70} />
          </Box>
          <HStack gap={{ base: 2, md: 4 }}>
            {/* controls never shrink, so they can't get squashed/overlap */}
            <HStack gap={1} flexShrink={0} minW="11">
              <IconButton
                aria-label="Previous track"
                variant="ghost"
                size="sm"
                disabled={!hasPrev}
                onClick={prev}
              >
                <LuSkipBack />
              </IconButton>
              <PlayButton track={track} size="md" />
              <IconButton
                aria-label="Next track"
                variant="ghost"
                size="sm"
                disabled={!hasNext}
                onClick={next}
              >
                <LuSkipForward />
              </IconButton>
            </HStack>
            <Box flex="1" minW={0} display={{ base: "none", md: "block" }}>
              <WaveformSeek track={track} height={36} bars={150} />
            </Box>
            <VolumeControl />
            {info}
            <CloseButton
              size="sm"
              flexShrink={0}
              onClick={close}
              aria-label="Close player"
            />
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};
