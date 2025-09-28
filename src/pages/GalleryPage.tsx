import {
  ButtonGroup,
  Center,
  Container,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Pagination,
  Popover,
  Portal,
  SimpleGrid,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { DrawingCard } from "../components/DrawingCard";
import { useEffect, useState } from "react";
import { StoryCard } from "../components/StoryCard";
import { MusicCard } from "../components/MusicCard";
import type { FeedItem } from "../supabase/types";
import { supabase } from "../supabase/client";
import { fetchFeedPage } from "../supabase/fetchFeed";
import { useSearchParams } from "react-router-dom";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

const PAGE_SIZE = 15;

export function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [totalItems, setTotalItems] = useState(1);
  const [loading, setLoading] = useState(true);

  const paginate = (value: number | string) => {
    setSearchParams({ page: value.toString() });
  };

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    setCurrentPage(page);
  }, [searchParams]);

  useEffect(() => {
    async function fetchPageCount() {
      const { count } = await supabase
        .from("feed")
        .select("*", { count: "exact", head: true });

      setTotalItems(count ?? 0);
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
      <Heading mb={6} size={"4xl"} fontWeight={"bold"}>
        Zertuh's Gallery
      </Heading>
      <SimpleGrid columns={[1, 2, 3]} gap={6}>
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
      <Flex mt={8} justify={"center"}>
        <Pagination.Root
          count={totalItems}
          pageSize={PAGE_SIZE}
          page={currentPage}
          onPageChange={(e) => paginate(e.page)}
        >
          <ButtonGroup variant="outline" attached size="md">
            <Pagination.PrevTrigger asChild>
              <IconButton>
                <LuChevronLeft />
              </IconButton>
            </Pagination.PrevTrigger>

            <Pagination.Context>
              {({ pages }) =>
                pages.map((page, index) => {
                  if (page.type === "page") {
                    return (
                      <Pagination.Item key={index} {...page} asChild>
                        <IconButton
                          variant={{ base: "outline", _selected: "solid" }}
                          borderRadius={0}
                        >
                          {page.value}
                        </IconButton>
                      </Pagination.Item>
                    );
                  }

                  if (page.type === "ellipsis") {
                    return (
                      <Popover.Root positioning={{ placement: "top" }}>
                        <Popover.Trigger asChild>
                          <Pagination.Ellipsis
                            key={index}
                            index={index}
                            asChild
                          >
                            <IconButton variant="outline" borderRadius={0}>
                              …
                            </IconButton>
                          </Pagination.Ellipsis>
                        </Popover.Trigger>
                        <Portal>
                          <Popover.Positioner>
                            <Popover.Content
                              bg={"gray.800"}
                              width={"auto"}
                            >
                              <Popover.Body width={"auto"}>
                                <HStack width={"min-content"}>
                                  <Input
                                    maxW={"1/3"}
                                    defaultValue={currentPage}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        const value = parseInt(
                                          e.currentTarget.value,
                                          10
                                        );
                                        if (
                                          !isNaN(value) &&
                                          value <= pages.length
                                        ) {
                                          paginate(value);
                                        }
                                      }
                                    }}
                                    onBlur={(e) => {
                                      const value = parseInt(
                                        e.currentTarget.value,
                                        10
                                      );
                                      if (
                                        !isNaN(value) &&
                                        value <= pages.length
                                      ) {
                                        paginate(value);
                                      }
                                    }}
                                  />
                                  <Text width={"max-content"}>{`of ${pages.length}`}</Text>
                                </HStack>
                              </Popover.Body>
                            </Popover.Content>
                          </Popover.Positioner>
                        </Portal>
                      </Popover.Root>
                    );
                  }

                  return null;
                })
              }
            </Pagination.Context>

            <Pagination.NextTrigger asChild>
              <IconButton>
                <LuChevronRight />
              </IconButton>
            </Pagination.NextTrigger>
          </ButtonGroup>
        </Pagination.Root>
      </Flex>
    </Container>
  );
}
//TODO: edit and delete function for zertuhs. sort by old (add button for sort) add filter function
//TODO: add mosaic gallery style. 

export default GalleryPage;
