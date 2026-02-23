import {
  Badge,
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Heading,
  HStack,
  Image,
  Portal,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { ProfileEntry } from "../supabase/types";

interface BaseCardProps {
  src?: string;
  title: string;
  description?: string;
  created_at: string;
  author: ProfileEntry | undefined;
  modalContent?: ReactNode;
  downloadLink?: string;
  downloadLabel?: string;
  truncateLines?: number;
  previewContent?: ReactNode;
}

export const BaseCard = ({
  src,
  title,
  description,
  created_at,
  author,
  modalContent,
  downloadLink,
  downloadLabel = "Download",
  truncateLines,
  previewContent,
}: BaseCardProps) => {
  const content = (
    <Box bg="gray.800" rounded="md" overflow="hidden" cursor="pointer">
      {previewContent ??
        (src && (
          <Flex
            height={"300px"}
            align={"center"}
            justify={"center"}
            overflow={"hidden"}
            bg={"white"}
          >
            <Image
              src={src}
              alt={title}
              objectFit={"cover"}
              h={"100%"}
              w={"100%"}
            />
          </Flex>
        ))}

      <VStack p={3} align={"flex-start"}>
        <Text fontWeight="bold" fontSize="lg">
          {title}
        </Text>

        {description && (
          <Text
            fontSize="sm"
            lineClamp={truncateLines ?? 2}
            color="gray.300"
            maxW="100%"
            wordBreak="break-word"
            whiteSpace={"pre-wrap"}
          >
            {description}
          </Text>
        )}

        <HStack justify={"space-between"} w={"full"}>
          <Text fontSize="xs" color="gray.400">
            {new Date(created_at).toLocaleDateString("de-DE")}
          </Text>
          {author && (
            <Badge variant={"surface"} size={"md"} colorPalette={author.color}>
              {author.username}
            </Badge>
          )}
        </HStack>
      </VStack>
    </Box>
  );

  return (
    <Dialog.Root size={"lg"}>
      <Dialog.Trigger asChild>{content}</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg={"gray.800"}>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
            <Dialog.Header>
              <Text fontWeight="bold" fontSize="xl">
                {title}
              </Text>
            </Dialog.Header>
            <Dialog.Body
              mb={truncateLines == 20 ? 5 : 0}
              justifyContent={"center"}
              display={"flex"}
            >
              <VStack width={"full"} align={"flex-start"} gap={2}>
                {modalContent ?? (
                  <>
                    {src && (
                      <Image
                        src={src}
                        alt={title}
                        h={"100%"}
                        w={"100%"}
                      />
                    )}
                    {description && (
                      <Text
                        fontSize="sm"
                        color="gray.200"
                        whiteSpace={"pre-wrap"}
                      >
                        {description}
                      </Text>
                    )}
                  </>
                )}
                <VStack align={"flex-start"} w={"full"}>
                  <Text fontSize="xs" color="gray.400">
                    {new Date(created_at).toLocaleString("de-DE", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  {author && (
                    <Badge
                      variant={"surface"}
                      size={"md"}
                      colorPalette={author.color}
                    >
                      {author.username}
                    </Badge>
                  )}
                </VStack>
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
