import {
  Center,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import { DrawingCard } from "../components/DrawingCard";
import { useEffect, useState } from "react";
import { StoryCard } from "../components/StoryCard";
import { MusicCard } from "../components/MusicCard";
import { Pagination } from "../components/Pagination";
import type { FeedItem } from "../supabase/types";
import { supabase } from "../supabase/client";
import { fetchFeedPage } from "../supabase/fetchFeed";
import { useSearchParams } from "react-router-dom";

const PAGE_SIZE = 15;

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
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    setCurrentPage(page);
  }, [searchParams]);

  useEffect(() => {
    async function fetchPageCount() {
      const { count } = await supabase
        .from("feed")
        .select("*", { count: "exact", head: true });

      const total = Math.ceil((count ?? 0) / PAGE_SIZE);
      setTotalPages(total);
    }

    fetchPageCount();
  }, []);

  useEffect(() => {
    async function loadPageData() {
      setLoading(true);
      const data = await fetchFeedPage(currentPage);
      setFeedItems(data);
      setLoading(false);
    }

    loadPageData();
  }, [currentPage]);

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
        {feedItems.map((entry) => {
          switch (entry.type) {
            case "drawing":
              return (
                <DrawingCard
                  key={`drawing-${entry.data.id}`}
                  src={entry.data.image_url}
                  title={entry.data.title}
                  description={entry.data.description}
                  created_at={entry.created_at}
                />
              );
            case "story":
              return (
                <StoryCard
                  key={`story-${entry.data.id}`}
                  title={entry.data.title}
                  description={entry.data.content}
                  created_at={entry.created_at}
                />
              );
            case "music":
              return (
                <MusicCard
                  key={`music-${entry.data.id}`}
                  src={entry.data.audio_url}
                  title={entry.data.title}
                  description={entry.data.description}
                  created_at={entry.created_at}
                />
              );
            default:
              return null;
          }
        })}
      </SimpleGrid>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setSearchParams({ page: page.toString() });
          }}
        />
      )}
    </Container>
  );
}
//TODO: edit and delete function for zertuhs. sort by old (add button for sort) add filter function

export default GalleryPage;
