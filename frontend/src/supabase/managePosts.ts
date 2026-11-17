import { supabase } from "./client";
import type { FeedItem, FeedType } from "./types";

const typeToTable = {
  drawing: "images",
  music: "compositions",
  story: "stories",
} as const;

// the long-text column differs per table
const textColumn = {
  drawing: "description",
  music: "description",
  story: "content",
} as const;

const BUCKET = "images";
const PUBLIC_PREFIX = `/storage/v1/object/public/${BUCKET}/`;

export type PostEdit = { title: string; text: string };

/** storage path inside the bucket from a public URL, or null if not ours */
function storagePath(url: string | undefined | null) {
  if (!url) return null;
  const i = url.indexOf(PUBLIC_PREFIX);
  return i === -1 ? null : decodeURIComponent(url.slice(i + PUBLIC_PREFIX.length));
}

/** returns an error message, or null on success */
export async function updatePost(
  type: FeedType,
  id: string,
  { title, text }: PostEdit,
): Promise<string | null> {
  const { data, error } = await supabase
    .from(typeToTable[type])
    .update({ title, [textColumn[type]]: text })
    .eq("id", id)
    .select("id");

  if (error) return error.message;
  // RLS doesn't error on a forbidden update, it just matches 0 rows
  if (!data?.length) return "You can only edit your own posts.";
  return null;
}

/**
 * Deletes the post row (a DB trigger removes its feed entry) and then its
 * files in storage. Returns an error message, or null on success.
 */
export async function deletePost(item: FeedItem): Promise<string | null> {
  const { data, error } = await supabase
    .from(typeToTable[item.type])
    .delete()
    .eq("id", item.data.id)
    .select("id");

  if (error) return error.message;
  if (!data?.length) return "You can only delete your own posts.";

  const urls =
    item.type === "drawing"
      ? [item.data.image_url]
      : item.type === "music"
        ? [item.data.audio_url, item.data.cover_url]
        : [];
  const paths = urls.map(storagePath).filter((p): p is string => !!p);

  if (paths.length) {
    // the post is already gone, so a failure here only leaves orphan files
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove(paths);
    if (storageError) {
      console.error("Post deleted, but removing its files failed:", storageError);
    }
  }
  return null;
}

/** the editable text of a feed item, per type */
export function postText(item: FeedItem) {
  return item.type === "story" ? item.data.content : (item.data.description ?? "");
}
