import {
  ButtonGroup,
  Center,
  Container,
  Flex,
  HStack,
  IconButton,
  Input,
  Pagination,
  Popover,
  Portal,
  SegmentGroup,
  SimpleGrid,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { DrawingCard } from "../components/DrawingCard";
import { useEffect, useRef, useState } from "react";
import { StoryCard } from "../components/StoryCard";
import { MusicCard } from "../components/MusicCard";
import { ProfileEntry, type FeedItem } from "../supabase/types";
import { supabase } from "../supabase/client";
import { fetchFeedPage } from "../supabase/fetchFeed";
import { fetchProfiles } from "../supabase/fetchProfiles";
import { useSearchParams } from "react-router-dom";
import { LuChevronLeft, LuChevronRight, LuFilter } from "react-icons/lu";

const PAGE_SIZE = 15;

export function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [totalItems, setTotalItems] = useState(1);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileEntry[]>([]);
  const [sortNewest, setSortNewest] = useState(true);
  const [jumpValue, setJumpValue] = useState(currentPage);
  const [openEllipsisIndex, setOpenEllipsisIndex] = useState<number | null>(
    null
  );

  const paginate = (value: number | string) => {
    setSearchParams({ page: value.toString() });
  };

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    setCurrentPage(page);
  }, [searchParams]);

  useEffect(() => {
    async function fetchPageCountNProfiles() {
      const { count } = await supabase
        .from("feed")
        .select("*", { count: "exact", head: true });

      setTotalItems(count ?? 0);

      const profiles = await fetchProfiles();
      setProfiles(profiles);
    }
    fetchPageCountNProfiles();
  }, []);

  useEffect(() => {
    async function loadPageData() {
      setLoading(true);
      const data = await fetchFeedPage(currentPage, sortNewest);
      setFeedItems(data);
      setLoading(false);
    }

    loadPageData();
  }, [currentPage, sortNewest]);

  useEffect(() => {
    setJumpValue(currentPage);
  }, [currentPage]);

  return (
    <Container maxW={"6xl"} paddingY={10}>
      <HStack justify={"end"} mb={4}>
        <SegmentGroup.Root
          value={sortNewest ? "Newest" : "Oldest"}
          onValueChange={(details) => setSortNewest(details.value === "Newest")}
        >
          <SegmentGroup.Indicator />
          <SegmentGroup.Items items={["Newest", "Oldest"]} />
        </SegmentGroup.Root>
      </HStack>

      <SimpleGrid columns={[1, 2, 3]} gap={6}>
        {loading ? (
          <Center h="100vh">
            <Spinner size="xl" />
          </Center>
        ) : (
          feedItems.map((entry) => {
            const profile = profiles.find((p) => p.id === entry.data.author);
            switch (entry.type) {
              case "drawing":
                return (
                  <DrawingCard
                    key={`drawing-${entry.data.id}`}
                    src={entry.data.image_url}
                    title={entry.data.title}
                    description={entry.data.description}
                    created_at={entry.created_at}
                    author={profile}
                  />
                );
              case "story":
                return (
                  <StoryCard
                    key={`story-${entry.data.id}`}
                    title={entry.data.title}
                    description={entry.data.content}
                    created_at={entry.created_at}
                    author={profile}
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
                    coverSrc={entry.data.cover_url}
                    author={profile}
                  />
                );
              default:
                return null;
            }
          })
        )}
      </SimpleGrid>
      {/* PAGINATION ----------------------------------------------*/}
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
              {({ pages }) => {
                const lastPage =
                  pages.filter((i) => i.type === "page").at(-1)?.value ?? 0;

                return pages.map((page, index) => {
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
                      <Popover.Root
                        positioning={{ placement: "top" }}
                        onOpenChange={(open) => {
                          setOpenEllipsisIndex(open ? index : null);
                        }}
                      >
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
                            <Popover.Content bg={"gray.800"} width={"auto"}>
                              <Popover.Body width={"auto"}>
                                <HStack width={"min-content"}>
                                  <Input
                                    value={jumpValue}
                                    onFocus={(e) => e.currentTarget.select()}
                                    onChange={(e) =>
                                      setJumpValue(
                                        Number(e.currentTarget.value)
                                      )
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        if (
                                          jumpValue > 0 &&
                                          jumpValue <= lastPage
                                        ) {
                                          setOpenEllipsisIndex(null);
                                          paginate(jumpValue);
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
                                        value > 0 &&
                                        value <= lastPage
                                      ) {
                                        paginate(value);
                                      }
                                      setOpenEllipsisIndex(null);
                                    }}
                                    w="60px"
                                  />
                                  <Text
                                    width={"max-content"}
                                  >{`of ${lastPage}`}</Text>
                                </HStack>
                              </Popover.Body>
                            </Popover.Content>
                          </Popover.Positioner>
                        </Portal>
                      </Popover.Root>
                    );
                  }

                  return null;
                });
              }}
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
//TODO: organize page lo

export default GalleryPage;
