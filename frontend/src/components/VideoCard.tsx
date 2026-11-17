import { memo } from "react";
import { Box, Text, VStack } from "@chakra-ui/react";
import { BaseCard } from "./BaseCard";
import type { PostManage } from "./PostActions";
import type { ProfileEntry, VideoSource } from "../supabase/types";
import { youTubeEmbedUrl } from "../supabase/youtube";

interface VideoCardProps {
  source: VideoSource;
  /** youtube: video id · upload: public file URL */
  videoRef: string;
  title: string;
  description?: string;
  created_at: string;
  author: ProfileEntry | undefined;
  manage?: PostManage;
}

/** 16:9 player for either source; clicks don't open the card's dialog */
const VideoPlayer = ({
  source,
  videoRef,
  title,
}: {
  source: VideoSource;
  videoRef: string;
  title: string;
}) => (
  <Box
    w={"full"}
    aspectRatio={16 / 9}
    bg={"black"}
    onClick={(e) => e.stopPropagation()}
  >
    {source === "youtube" ? (
      <iframe
        src={youTubeEmbedUrl(videoRef)}
        title={title}
        width="100%"
        height="100%"
        style={{ border: 0, display: "block" }}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    ) : (
      <video
        src={videoRef}
        controls
        preload="metadata"
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    )}
  </Box>
);

export const VideoCard = memo(
  ({
    source,
    videoRef,
    title,
    description,
    created_at,
    author,
    manage,
  }: VideoCardProps) => (
    <BaseCard
      title={title}
      description={description}
      created_at={created_at}
      author={author}
      truncateLines={2}
      manage={manage}
      previewContent={
        <VideoPlayer source={source} videoRef={videoRef} title={title} />
      }
      modalContent={
        <VStack align={"center"} gap={3} width={"full"}>
          <Box w={"full"} rounded={"md"} overflow={"hidden"}>
            <VideoPlayer source={source} videoRef={videoRef} title={title} />
          </Box>
          {description && (
            <Box width={"full"}>
              <Text fontSize="sm" color="gray.200" whiteSpace={"pre-wrap"}>
                {description}
              </Text>
            </Box>
          )}
        </VStack>
      }
    />
  ),
);
