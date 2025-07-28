import {
  Box,
  Button,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import type { ReactNode } from "react";

interface BaseCardProps {
  src?: string;
  title: string;
  description?: string;
  created_at: string;
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
  modalContent,
  downloadLink,
  downloadLabel = "Download",
  truncateLines,
  previewContent,
}: BaseCardProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box
        bg="gray.800"
        rounded="md"
        overflow="hidden"
        cursor="pointer"
        onClick={onOpen}
      >
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
              noOfLines={truncateLines ?? 2}
              color="gray.300"
              maxW="100%"
              wordBreak="break-word"
            >
              {description}
            </Text>
          )}

          <Text fontSize="xs" color="gray.400">
            {new Date(created_at).toLocaleDateString()}
          </Text>
        </VStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalOverlay />
        <ModalContent bg={"gray.800"}>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {modalContent ?? (
              <>
                {src && (
                  <Image
                    src={src}
                    alt={title}
                    objectFit={"cover"}
                    maxH={"60vh"}
                    h={"100%"}
                    w={"100%"}
                    mb={4}
                  />
                )}
                {description && (
                  <Text fontSize="sm" color="gray.200">
                    {description}
                  </Text>
                )}
              </>
            )}
          </ModalBody>
          <ModalFooter justifyContent={"flex-start"} mb={3}>
            {downloadLink && (
              <Button
                colorScheme={"purple"}
                as={"a"}
                target={"_blank"}
                href={downloadLink}
                download
              >
                {downloadLabel}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
