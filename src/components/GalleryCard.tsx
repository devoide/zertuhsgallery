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

interface GalleryCardProps {
  src: string;
  title: string;
  description?: string;
  created_at: string;
}

export const GalleryCard = ({
  src,
  title,
  description,
  created_at,
}: GalleryCardProps) => {
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

        <VStack p={3} align={"flex-start"}>
          <Text fontWeight="bold" fontSize="lg">
            {title}
          </Text>

          {description && (
            <Text
              fontSize="sm"
              noOfLines={2}
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
            <Image
              src={src}
              alt={title}
              objectFit={"cover"}
              maxH={"60vh"}
              h={"100%"}
              w={"100%"}
              mb={4}
            />
            {description && (
              <Text fontSize="sm" color="gray.200">
                {description}
              </Text>
            )}
          </ModalBody>
          <ModalFooter justifyContent={"flex-start"}>
            <Button
              colorScheme={"purple"}
              as={"a"}
              href={src}
              target={"_blank"}
              download
            >
              Download Drawing
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
