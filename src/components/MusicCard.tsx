import { memo } from "react";
import { BaseCard } from "./BaseCard";
import { Text, Image, Flex, VStack, Container, Box } from "@chakra-ui/react";
import { ProfileEntry } from "../supabase/types";

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
          <>
            {coverSrc && (
              <Flex
                height={"260px"}
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
            <audio
              controls
              style={{
                width: "100%",
              }}
            >
              <source src={src} />
              ur browser old asf
            </audio>
          </>
        }
        modalContent={
          <VStack align={"center"} gap={0} width={"full"}>
            {coverSrc && (
              <Flex
                align={"center"}
                justify={"center"}
                overflow={"hidden"}
                bg={"white"}
                borderTopRadius={"md"}
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
            <audio controls style={{ width: "100%" }}>
              <source src={src} />
              ur browser old asf
            </audio>
            {description && (
              <Box width={"full"}>
                <Text fontSize="sm" color="gray.200">
                  {description}
                </Text>
              </Box>
            )}
          </VStack>
        }
      />
    );
  }
);
