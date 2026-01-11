import { supabase } from "./client";
import type {
  FeedItem,
  FeedType,
  ImageEntry,
  StoryEntry,
  CompositionEntry,
} from "./types";

const PAGE_SIZE = 15;

const typeToTable = {
  drawing: "images",
  music: "compositions",
  story: "stories",
} as const;

type TableName = (typeof typeToTable)[FeedType];

export async function fetchFeedPage(page: number, sort: boolean): Promise<FeedItem[]> {
  const offset = (page - 1) * PAGE_SIZE;

  const { data: feed, error } = await supabase
    .from("feed")
    .select("*")
    .order("created_at", { ascending: !sort })
    .range(offset, offset + PAGE_SIZE - 1);

  if (!feed || error) {
    console.error("Error fetching feed:", error?.message);
    return [];
  }

  const idsByType: Record<FeedType, string[]> = {
    drawing: [],
    music: [],
    story: [],
  };

  feed.forEach((entry) => {
    const type = entry.type as FeedType;
    if (idsByType[type]) {
      idsByType[type].push(entry.ref_id);
    }
  });

  const [images, compositions, stories] = await Promise.all([
    fetchEntriesByIds("images", idsByType.drawing),
    fetchEntriesByIds("compositions", idsByType.music),
    fetchEntriesByIds("stories", idsByType.story),
  ]);

  const imageMap = new Map(images.map((i) => [i.id, i]));
  const compositionMap = new Map(compositions.map((c) => [c.id, c]));
  const storyMap = new Map(stories.map((s) => [s.id, s]));

  const hydrated: FeedItem[] = feed
    .map((entry) => {
      const { type, ref_id, created_at } = entry;

      if (type === "drawing") {
        const data = imageMap.get(ref_id) as ImageEntry | undefined;
        if (!data) return null;
        return { type, data, created_at };
      }

      if (type === "music") {
        const data = compositionMap.get(ref_id) as CompositionEntry | undefined;
        if (!data) return null;
        return { type, data, created_at };
      }

      if (type === "story") {
        const data = storyMap.get(ref_id) as StoryEntry | undefined;
        if (!data) return null;
        return { type, data, created_at };
      }

      return null;
    })
    .filter(Boolean) as FeedItem[];

  return hydrated;
}

async function fetchEntriesByIds(
  table: TableName,
  ids: string[]
): Promise<any[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase.from(table).select("*").in("id", ids);

  if (error) {
    console.error(`Error fetching from ${table}:`, error.message);
    return [];
  }

  return data ?? [];
}
