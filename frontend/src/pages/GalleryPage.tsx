import { useEffect, useRef, useState } from "react";
import {
  Center,
  Container,
  Flex,
  HStack,
  Input,
  InputGroup,
  SegmentGroup,
  SimpleGrid,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import type { FeedItem, FeedType, ProfileEntry } from "../supabase/types";
import { fetchFeedPage } from "../supabase/fetchFeed";
import { fetchProfiles } from "../supabase/fetchProfiles";
import { useSearchParams } from "react-router-dom";
import {
  Pagination,
  DrawingCard,
  StoryCard,
  MusicCard,
  FilterMenu,
} from "../components";

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
  const [authorFilter, setAuthorFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<FeedType | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [jumpValue, setJumpValue] = useState(currentPage);
  const [openEllipsisIndex, setOpenEllipsisIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    setCurrentPage(page);
  }, [searchParams]);

  useEffect(() => {
    fetchProfiles().then(setProfiles);
  }, []);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // jump back to page 1 whenever filters change
  const isFirstFilterRun = useRef(true);
  useEffect(() => {
    if (isFirstFilterRun.current) {
      isFirstFilterRun.current = false;
      return;
    }
    if (currentPage !== 1) setSearchParams({ page: "1" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorFilter, typeFilter, search]);

  useEffect(() => {
    let cancelled = false;
    async function loadPageData() {
      setLoading(true);
      const { items, count } = await fetchFeedPage(currentPage, sortNewest, {
        author: authorFilter,
        type: typeFilter,
        search,
      });
      if (cancelled) return;
      setFeedItems(items);
      setTotalItems(count);
      setLoading(false);
    }

    loadPageData();
    return () => {
      cancelled = true;
    };
  }, [currentPage, sortNewest, authorFilter, typeFilter, search]);

  useEffect(() => {
    setJumpValue(currentPage);
  }, [currentPage]);

  return (
    <Container maxW={"6xl"} paddingY={10}>
      <Flex
        justify={"space-between"}
        align={"center"}
        gap={3}
        mb={4}
        wrap={"wrap"}
      >
        <InputGroup
          startElement={<LuSearch />}
          maxW={{ base: "full", md: "xs" }}
        >
          <Input
            size="md"
            placeholder="Search titles, descriptions, stories..."
            value={searchInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchInput(e.target.value)
            }
          />
        </InputGroup>
        <HStack gap={3}>
          <SegmentGroup.Root
            value={sortNewest ? "Newest" : "Oldest"}
            onValueChange={(details) =>
              setSortNewest(details.value === "Newest")
            }
          >
            <SegmentGroup.Indicator />
            <SegmentGroup.Items items={["Newest", "Oldest"]} />
          </SegmentGroup.Root>
          <FilterMenu
            profiles={profiles}
            author={authorFilter}
            type={typeFilter}
            onAuthorChange={setAuthorFilter}
            onTypeChange={setTypeFilter}
          />
        </HStack>
      </Flex>
      {loading ? (
        <Center h="80vh" w={"full"}>
          <Spinner size="xl" />
        </Center>
      ) : feedItems.length === 0 ? (
        <Center h="40vh" w={"full"}>
          <Text color="gray.400">Nothing found.</Text>
        </Center>
      ) : (
        <>
          <SimpleGrid columns={[1, 2, 3]} gap={6}>
            {feedItems.map((entry) => {
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
            })}
          </SimpleGrid>
          <Flex mt={8} justify={"center"}>
            <Pagination
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              currentPage={currentPage}
              setSearchParams={setSearchParams}
              jumpValue={jumpValue}
              setJumpValue={setJumpValue}
              openEllipsisIndex={openEllipsisIndex}
              setOpenEllipsisIndex={setOpenEllipsisIndex}
            />
          </Flex>
        </>
      )}
    </Container>
  );
}
//TODO: edit and delete function for zertuhs.
//TODO: organize page lo

export default GalleryPage;
