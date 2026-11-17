import { supabase } from "./client";
import type {
  FeedItem,
  FeedType,
  ImageEntry,
  StoryEntry,
  CompositionEntry,
  VideoEntry,
} from "./types";

const PAGE_SIZE = 15;

const typeToTable = {
  drawing: "images",
  music: "compositions",
  story: "stories",
  video: "videos",
} as const;

// text columns searched per table
const searchColumns: Record<FeedType, string[]> = {
  drawing: ["title", "description"],
  music: ["title", "description"],
  story: ["title", "content"],
  video: ["title", "description"],
};

const ALL_TYPES: FeedType[] = ["drawing", "music", "story", "video"];

type TableName = (typeof typeToTable)[FeedType];

export type FeedFilters = {
  author?: string | null;
  type?: FeedType | null;
  search?: string;
};

export type FeedPage = {
  items: FeedItem[];
  count: number;
};

// quote a value for use inside a PostgREST or() filter
function quoteFilterValue(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

async function searchRefIds(
  query: string,
  types: FeedType[],
  author?: string | null,
): Promise<Record<FeedType, string[]>> {
  const pattern = quoteFilterValue(`%${query}%`);

  const results = await Promise.all(
    types.map(async (type) => {
      let req = supabase
        .from(typeToTable[type])
        .select("id")
        .or(searchColumns[type].map((c) => `${c}.ilike.${pattern}`).join(","));
      if (author) req = req.eq("author", author);

      const { data, error } = await req;
      if (error) {
        console.error(`Error searching ${typeToTable[type]}:`, error.message);
        return [type, [] as string[]] as const;
      }
      return [type, (data ?? []).map((r) => String(r.id))] as const;
    }),
  );

  const ids: Record<FeedType, string[]> = {
    drawing: [],
    music: [],
    story: [],
    video: [],
  };
  results.forEach(([type, list]) => (ids[type] = list));
  return ids;
}

export async function fetchFeedPage(
  page: number,
  sort: boolean,
  filters: FeedFilters = {},
): Promise<FeedPage> {
  const offset = (page - 1) * PAGE_SIZE;
  const search = filters.search?.trim();

  let query = supabase
    .from("feed")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: !sort })
    .range(offset, offset + PAGE_SIZE - 1);

  if (filters.author) query = query.eq("author", filters.author);
  if (filters.type) query = query.eq("type", filters.type);

  if (search) {
    const types = filters.type ? [filters.type] : ALL_TYPES;
    const matches = await searchRefIds(search, types, filters.author);

    // ref_ids are only unique per table, so pair them with their type
    const clauses = types
      .filter((t) => matches[t].length > 0)
      .map((t) => `and(type.eq.${t},ref_id.in.(${matches[t].join(",")}))`);

    if (clauses.length === 0) return { items: [], count: 0 };
    query = query.or(clauses.join(","));
  }

  const { data: feed, error, count } = await query;

  if (!feed || error) {
    console.error("Error fetching feed:", error?.message);
    return { items: [], count: 0 };
  }

  const idsByType: Record<FeedType, string[]> = {
    drawing: [],
    music: [],
    story: [],
    video: [],
  };

  feed.forEach((entry) => {
    const type = entry.type as FeedType;
    if (idsByType[type]) {
      idsByType[type].push(entry.ref_id);
    }
  });

  const [images, compositions, stories, videos] = await Promise.all([
    fetchEntriesByIds("images", idsByType.drawing),
    fetchEntriesByIds("compositions", idsByType.music),
    fetchEntriesByIds("stories", idsByType.story),
    fetchEntriesByIds("videos", idsByType.video),
  ]);

  const imageMap = new Map(images.map((i) => [i.id, i]));
  const compositionMap = new Map(compositions.map((c) => [c.id, c]));
  const storyMap = new Map(stories.map((s) => [s.id, s]));
  const videoMap = new Map(videos.map((v) => [v.id, v]));

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

      if (type === "video") {
        const data = videoMap.get(ref_id) as VideoEntry | undefined;
        if (!data) return null;
        return { type, data, created_at };
      }

      return null;
    })
    .filter(Boolean) as FeedItem[];

  return { items: hydrated, count: count ?? 0 };
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
