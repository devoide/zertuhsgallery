export type FeedType = "drawing" | "story" | "music";

export type FeedEntryRaw = {
  id: string;
  type: FeedType;
  ref_id: string;
  created_at: string;
};

export type FeedItem =
  | { type: "drawing"; data: ImageEntry; created_at: string }
  | { type: "story"; data: StoryEntry; created_at: string }
  | { type: "music"; data: CompositionEntry; created_at: string };

export type ImageEntry = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
};

export type StoryEntry = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export type CompositionEntry = {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  created_at: string;
};
