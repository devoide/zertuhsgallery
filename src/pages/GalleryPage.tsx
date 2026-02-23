import { useEffect, useState } from "react";
import {
  Center,
  Container,
  Flex,
  HStack,
  SegmentGroup,
  Spinner,
} from "@chakra-ui/react";
import { ProfileEntry, type FeedItem } from "../supabase/types";
import { supabase } from "../supabase/client";
import { fetchFeedPage } from "../supabase/fetchFeed";
import { fetchProfiles } from "../supabase/fetchProfiles";
import { useSearchParams } from "react-router-dom";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Pagination, DrawingCard, StoryCard, MusicCard } from "../components";

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
      {loading ? (
        <Center h="80vh" w={"full"}>
          <Spinner size="xl" />
        </Center>
      ) : (
        <>
          <ResponsiveMasonry
            columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
            gutterBreakPoints={{ 350: "24px", 750: "24px", 900: "24px" }}
          >
            <Masonry>
              {feedItems.map((entry) => {
                const profile = profiles.find(
                  (p) => p.id === entry.data.author
                );
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
            </Masonry>
          </ResponsiveMasonry>
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
//TODO: edit and delete function for zertuhs. sort by old (add button for sort) add filter function
//TODO: add mosaic gallery style.
//TODO: organize page lo

export default GalleryPage;
