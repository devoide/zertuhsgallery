import { Box, Image, Text } from "@chakra-ui/react";

interface GalleryCardProps {
  src: string;
  title: string;
  description?: string;
}

export const GalleryCard = ({ src, title, description }: GalleryCardProps) => {
  return (
    <Box bg={"gray.800"} paddingTop={4}>
      <Image src={src} alt={title} objectFit="cover" />
      <Box p={2}>
        <Text fontWeight="bold">{title}</Text>
        {description ?? <Text>{description}</Text>}
      </Box>
    </Box>
  );
};
