import { memo, useMemo } from "react";
import { BaseCard } from "./BaseCard";
import { Text, Image, Flex, VStack, Box } from "@chakra-ui/react";
import { ProfileEntry } from "../supabase/types";
import { MiniPlayer, type Track } from "../audio";

interface MusicCardProps {
  src: string;
  title: string;
  description?: string;
  created_at: string;
  coverSrc?: string;
  author: ProfileEntry | undefined;
}

export const MusicCard = memo(
  ({
    src,
    title,
    description,
    created_at,
    author,
    coverSrc,
  }: MusicCardProps) => {
    const track = useMemo<Track>(
      () => ({ src, title, cover: coverSrc, author }),
      [src, title, coverSrc, author],
    );

    return (
      <BaseCard
        title={title}
        description={description}
        created_at={created_at}
        author={author}
        downloadLabel="Download Audio"
        downloadLink={src}
        truncateLines={2}
        previewContent={
          <Box>
            {coverSrc && (
              <Flex
                height={"256px"}
                align={"center"}
                justify={"center"}
                overflow={"hidden"}
                bg={"white"}
              >
                <Image
                  src={coverSrc}
                  alt={title}
                  objectFit={"cover"}
                  h={"100%"}
                  w={"100%"}
                />
              </Flex>
            )}
            {/* 44px tall: 256px cover + 44px = 300px, same as drawing cards */}
            <MiniPlayer track={track} lazy />
          </Box>
        }
        modalContent={
          <VStack align={"center"} gap={3} width={"full"}>
            {/* cover + player as one block, same as on the card */}
            <Box width={"full"} rounded={"md"} overflow={"hidden"}>
              {coverSrc && (
                <Flex
                  align={"center"}
                  justify={"center"}
                  overflow={"hidden"}
                  bg={"white"}
                >
                  <Image
                    src={coverSrc}
                    alt={title}
                    objectFit={"cover"}
                    h={"100%"}
                    w={"100%"}
                  />
                </Flex>
              )}
              <MiniPlayer track={track} bars={100} />
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
    );
  },
);
