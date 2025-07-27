import { Center, Container, Heading, SimpleGrid, Spinner } from "@chakra-ui/react";
import { GalleryCard } from "../components/GalleryCard";
import { useEffect, useState } from "react";
import { fetchImages } from "../supabase/storage/fetchImages";
import type { ImageEntry } from "../supabase/storage/fetchImages";

// const testImages = [
//   {
//     src: "public/zertuh1.png",
//     title: "test",
//     description: "goon with em goon with em hfsdldhfkjsdj",
//   },
//   {
//     src: "public/zertuh1.png",
//     title: "test",
//   },
//   {
//     src: "public/zertuh1.png",
//     title: "test",
//     description: "goon with em goon with em hfsdldhfkjsdj",
//   },
//   {
//     src: "public/zertuh1.png",
//     title: "test",
//     description: "goon with em goon with em hfsdldhfkjsdj",
//   },
//   {
//     src: "public/zertuh1.png",
//     title: "test",
//     description: "goon with em goon with em hfsdldhfkjsdj",
//   },
//   {
//     src: "public/zertuh1.png",
//     title: "test",
//     description: "goon with em goon with em hfsdldhfkjsdj",
//   },
//   {
//     src: "public/zertuh1.png",
//     title: "test",
//     description: "goon with em goon with em hfsdldhfkjsdj",
//   },
// ];

export function GalleryPage() {
  const [images, setImages] = useState<ImageEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImages() {
      const { data, error } = await fetchImages();
      console.log(data)
      if (data) setImages(data);
      else console.error(error);
      setLoading(false);
    }

    loadImages();
  }, []);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }
  return (
    <Container maxW={"6xl"} paddingY={10}>
      <Heading mb={6}>Zertuh's Gallery</Heading>
      <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        {images?.map((drawing) => (
          <GalleryCard
            key={drawing.id}
            src={drawing.image_url}
            title={drawing.title}
            description={drawing.description}
            created_at={drawing.created_at}
          />
        ))}
      </SimpleGrid>
    </Container>
  );
}

export default GalleryPage;
