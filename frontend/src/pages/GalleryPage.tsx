import { useEffect, useMemo, useRef, useState } from "react";
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
import { deletePost, updatePost } from "../supabase/managePosts";
import { useCurrentUserId } from "../supabase/useCurrentUserId";
import type { PostManage } from "../components/PostActions";
import { useSearchParams } from "react-router-dom";
import {
  Pagination,
  DrawingCard,
  StoryCard,
  MusicCard,
  FilterMenu,
} from "../components";
import {
  TrackListContext,
  useAudioPlayer,
  type Track,
  type TrackList,
} from "../audio";

const PAGE_SIZE = 15;

/** the music tracks among feed items, in display order */
function toTracks(items: FeedItem[], profiles: ProfileEntry[]): Track[] {
  return items.flatMap((entry) =>
    entry.type === "music"
      ? [
          {
            src: entry.data.audio_url,
            title: entry.data.title,
            cover: entry.data.cover_url,
            author: profiles.find((p) => p.id === entry.data.author),
          },
        ]
      : [],
  );
}

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

  const { close: closePlayer, track: currentTrack } = useAudioPlayer();
  const userId = useCurrentUserId();
  // bumped after a delete to refetch the page (counts/pagination change)
  const [reloadKey, setReloadKey] = useState(0);

  // on filter/sort/search change: stop the player (its queue belongs to the
  // old list) and jump back to page 1. Plain pagination keeps playing.
  const isFirstFilterRun = useRef(true);
  useEffect(() => {
    if (isFirstFilterRun.current) {
      isFirstFilterRun.current = false;
      return;
    }
    closePlayer();
    if (currentPage !== 1) setSearchParams({ page: "1" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorFilter, typeFilter, search, sortNewest]);

  // music on this page = the queue for next/previous. At its end the player
  // calls loadMore, which fetches the following pages (same sort + filters)
  // until one has music, so playback carries on past this page.
  const pageTracks = useMemo<TrackList>(() => {
    const filters = { author: authorFilter, type: typeFilter, search };
    const lastPage = Math.ceil(totalItems / PAGE_SIZE);
    const build = (page: number, tracks: Track[]): TrackList => ({
      tracks,
      loadMore: async () => {
        for (let p = page + 1; p <= lastPage; p++) {
          const { items } = await fetchFeedPage(p, sortNewest, filters);
          const next = toTracks(items, profiles);
          if (next.length) return build(p, next);
        }
        return null;
      },
    });
    return build(currentPage, toTracks(feedItems, profiles));
  }, [
    feedItems,
    profiles,
    currentPage,
    totalItems,
    sortNewest,
    authorFilter,
    typeFilter,
    search,
  ]);

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
      // e.g. deleted the last post on the last page: go to the new last page
      if (items.length === 0 && count > 0 && currentPage > 1) {
        setSearchParams({ page: String(Math.ceil(count / PAGE_SIZE)) });
        return;
      }
      setFeedItems(items);
      setTotalItems(count);
      setLoading(false);
    }

    loadPageData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortNewest, authorFilter, typeFilter, search, reloadKey]);

  /** edit/delete handlers, only for posts the logged-in user owns */
  const manageFor = (entry: FeedItem): PostManage | undefined => {
    if (!userId || entry.data.author !== userId) return undefined;
    return {
      onSave: async (edit) => {
        const err = await updatePost(entry.type, entry.data.id, edit);
        if (!err) {
          // update in place so the open modal stays open
          setFeedItems((items) =>
            items.map((it) =>
              it.type === entry.type && it.data.id === entry.data.id
                ? ({
                    ...it,
                    data: {
                      ...it.data,
                      title: edit.title,
                      ...(it.type === "story"
                        ? { content: edit.text }
                        : { description: edit.text }),
                    },
                  } as FeedItem)
                : it,
            ),
          );
        }
        return err;
      },
      onDelete: async () => {
        const err = await deletePost(entry);
        if (!err) {
          if (
            entry.type === "music" &&
            currentTrack?.src === entry.data.audio_url
          ) {
            closePlayer();
          }
          setReloadKey((k) => k + 1);
        }
        return err;
      },
    };
  };

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
          <TrackListContext.Provider value={pageTracks}>
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
                        manage={manageFor(entry)}
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
                        manage={manageFor(entry)}
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
                        manage={manageFor(entry)}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </SimpleGrid>
          </TrackListContext.Provider>
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
