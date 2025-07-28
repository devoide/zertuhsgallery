import {
  Center,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import { DrawingCard } from "../components/DrawingCard";
import { useEffect, useMemo, useState } from "react";
import { fetchImages } from "../supabase/fetchImages";
import type { ImageEntry } from "../supabase/fetchImages";
import { fetchStories } from "../supabase/fetchStory";
import { StoryCard } from "../components/StoryCard";

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
  const [stories, setStories] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  const imageCards = useMemo(() => {
    return images?.map((drawing) => (
      <DrawingCard
        key={`image-${drawing.id}`}
        src={drawing.image_url}
        title={drawing.title}
        description={drawing.description}
        created_at={drawing.created_at}
      />
    ));
  }, [images]);

  useEffect(() => {
    async function loadContent() {
      const { data: imageData, error: imageError } = await fetchImages();
      if (imageData) setImages(imageData);
      else console.error(imageError);

      const storyData = await fetchStories();
      setStories(storyData);

      setLoading(false);
    }

    loadContent();
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
        {imageCards}

        {stories?.map((story) => (
          <StoryCard
            key={`story-${story.id}`}
            title={story.title}
            description={story.content}
            created_at={story.created_at}
          />
        ))}
      </SimpleGrid>
    </Container>
  );
}

export default GalleryPage;
