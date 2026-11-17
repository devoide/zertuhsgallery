import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  HStack,
  Image,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState, type ReactNode } from "react";
import { ProfileEntry } from "../supabase/types";
import { PostEditForm, PostOwnerActions, type PostManage } from "./PostActions";
import { AuthorBadge } from "./AuthorBadge";

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
  /** only set when the logged-in user owns this post */
  manage?: PostManage;
  /** label of the long-text field in the edit form */
  editTextLabel?: string;
}

export const BaseCard = ({
  src,
  title,
  description,
  created_at,
  author,
  modalContent,
  truncateLines,
  previewContent,
  manage,
  editTextLabel = "Description",
}: BaseCardProps) => {
  const [editing, setEditing] = useState(false);

  const content = (
    <Box bg="gray.800" rounded="md" overflow="hidden" cursor="pointer" width={"full"}>
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
          {author && <AuthorBadge author={author} />}
        </HStack>
      </VStack>
    </Box>
  );

  return (
    <Dialog.Root
      size={"lg"}
      // leave edit mode when the modal closes
      onOpenChange={(e) => !e.open && setEditing(false)}
    >
      <Dialog.Trigger asChild>{content}</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
            <Dialog.Header>
              <Text fontWeight="bold" fontSize="xl">
                {title}
              </Text>
            </Dialog.Header>
            <Dialog.Body justifyContent={"center"} display={"flex"}>
              {editing && manage ? (
                <PostEditForm
                  initialTitle={title}
                  initialText={description ?? ""}
                  textLabel={editTextLabel}
                  rows={editTextLabel === "Story" ? 14 : 4}
                  onSave={manage.onSave}
                  onDone={() => setEditing(false)}
                />
              ) : (
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
                    {author && <AuthorBadge author={author} />}
                  </VStack>
                  {manage && (
                    <PostOwnerActions
                      onEdit={() => setEditing(true)}
                      onDelete={manage.onDelete}
                    />
                  )}
                </VStack>
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
