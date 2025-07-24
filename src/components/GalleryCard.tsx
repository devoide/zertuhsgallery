import { Box, Image, Text } from "@chakra-ui/react";

interface GalleryCardProps {
  src: string;
  title: string;
}

export const GalleryCard = ({ src, title }: GalleryCardProps) => {
  return (
    <Box bg={"green.800"} paddingTop={4}>
      <Image src={src} alt={title} objectFit="cover"/>
      <Box p={2}>
        <Text fontWeight="bold">{title}</Text>
      </Box>
    </Box>
  );
};
