import {
  Center,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import { DrawingCard } from "../components/DrawingCard";
import { useEffect, useMemo, useState, type JSX } from "react";
import { fetchImages } from "../supabase/fetchImages";
import type { ImageEntry } from "../supabase/fetchImages";
import { fetchStories } from "../supabase/fetchStory";
import { StoryCard } from "../components/StoryCard";
import { fetchAudio } from "../supabase/fetchAudio";
import type { AudioEntry } from "../supabase/fetchAudio";
import { MusicCard } from "../components/MusicCard";

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
  const [audios, setAudio] = useState<AudioEntry[] | null>(null);
  const [stories, setStories] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  const sortedCards = useMemo(() => {
    const items: {
      created_at: string;
      element: JSX.Element;
    }[] = [];

    images?.forEach((drawing) => {
      items.push({
        created_at: drawing.created_at,
        element: (
          <DrawingCard
            key={`image-${drawing.id}`}
            src={drawing.image_url}
            title={drawing.title}
            description={drawing.description}
            created_at={drawing.created_at}
          />
        ),
      });
    });

    stories?.forEach((story) => {
      items.push({
        created_at: story.created_at,
        element: (
          <StoryCard
            key={`story-${story.id}`}
            title={story.title}
            description={story.content}
            created_at={story.created_at}
          />
        ),
      });
    });

    audios?.forEach((audio) => {
      items.push({
        created_at: audio.created_at,
        element: (
          <MusicCard
            key={`audio-${audio.id}`}
            src={audio.audio_url}
            title={audio.title}
            description={audio.description}
            created_at={audio.created_at}
          />
        ),
      });
    });

    return items.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [images, stories, audios]);

  useEffect(() => {
    async function loadContent() {
      const { data: imageData, error: imageError } = await fetchImages();
      if (imageData) setImages(imageData);
      else console.error(imageError);

      const storyData = await fetchStories();
      setStories(storyData);

      const { data: audioData, error: audioError } = await fetchAudio();
      if (audioData) setAudio(audioData);
      else console.error(audioError);

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
        {sortedCards.map((item) => (
          <>{item.element}</>
        ))}
      </SimpleGrid>
    </Container>
  );
}
//TODO: edit and delete function for zertuhs. sort by old (add button for sort) add filter function

export default GalleryPage;
