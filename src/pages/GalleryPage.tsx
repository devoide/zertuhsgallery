import { Container, Heading, SimpleGrid } from "@chakra-ui/react";
import { GalleryCard } from "../components/GalleryCard";

const testImages = [
  {"src": "public/zertuh1.png", "title": "test"},
  {"src": "public/zertuh1.png", "title": "test"},
  {"src": "public/zertuh1.png", "title": "test"},
];

export function GalleryPage() {
  return (
    <Container maxW={"6xl"} paddingY={10}>
      <Heading mb={6}>Zertuh's Gallery</Heading>
      <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        {testImages.map((drawing, index) => (
            <GalleryCard key={index} src={drawing.src} title={drawing.title}></GalleryCard>
        ))}
      </SimpleGrid>
    </Container>
  );
}

export default GalleryPage;
