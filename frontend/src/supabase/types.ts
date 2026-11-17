export type FeedType = "drawing" | "story" | "music" | "video";

export type FeedEntryRaw = {
  id: string;
  type: FeedType;
  ref_id: string;
  created_at: string;
  author: string;
};

export type FeedItem =
  | { type: "drawing"; data: ImageEntry; created_at: string; author: string }
  | { type: "story"; data: StoryEntry; created_at: string; author: string }
  | {
      type: "music";
      data: CompositionEntry;
      created_at: string;
      author: string;
    }
  | { type: "video"; data: VideoEntry; created_at: string; author: string };

export type ImageEntry = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
  author: string;
};

export type StoryEntry = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author: string;
};

export type CompositionEntry = {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  cover_url: string;
  created_at: string;
  author: string;
};

/** where a video lives; decides how it's played */
export type VideoSource = "youtube" | "upload";

export type VideoEntry = {
  id: string;
  title: string;
  description: string;
  source: VideoSource;
  /** youtube: 11-char video id · upload: public URL of the file */
  video_ref: string;
  created_at: string;
  author: string;
};

export type ProfileEntry = {
  id: string;
  username: string;
  color: string;
  avatar_url?: string | null;
};
