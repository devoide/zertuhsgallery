import imageCompression from "browser-image-compression";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "./client";
import type { ProfileEntry } from "./types";

const AVATAR_BUCKET = "avatars";
const AVATAR_PREFIX = `/storage/v1/object/public/${AVATAR_BUCKET}/`;

/** Chakra color palettes a user can pick for their name/badge */
export const PROFILE_COLORS = [
  "gray",
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "blue",
  "cyan",
  "purple",
  "pink",
] as const;

export async function fetchProfile(id: string): Promise<ProfileEntry | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, color, avatar_url")
    .eq("id", id)
    .maybeSingle();

  if (error) console.error("Error fetching profile:", error.message);
  return data;
}

export type ProfileUpdate = {
  username: string;
  color: string;
  avatar_url: string | null;
};

/** returns an error message, or null on success */
export async function updateProfile(
  id: string,
  fields: ProfileUpdate,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id");

  if (error) {
    if (error.code === "23505") return "That name is already taken.";
    if (error.code === "23514") return "Name must be at least 3 characters.";
    return error.message;
  }
  if (!data?.length) return "Couldn't save your profile.";
  return null;
}

/**
 * Compresses + uploads an avatar to avatars/<userId>/<uuid>.<ext>
 * (the folder name is what the storage policy checks). Returns its URL.
 */
export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  try {
    const small = await imageCompression(file, {
      maxWidthOrHeight: 256,
      maxSizeMB: 0.3,
    });
    const ext = file.name.slice(file.name.lastIndexOf(".") + 1) || "jpg";
    const path = `${userId}/${uuidv4()}.${ext}`;

    const { error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, small, { contentType: small.type });
    if (error) return { url: null, error: error.message };

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  } catch (err) {
    console.error(err);
    return { url: null, error: "Couldn't process that image." };
  }
}

/** best-effort cleanup of a replaced/removed avatar file */
export async function deleteAvatar(url: string | null | undefined) {
  if (!url) return;
  const i = url.indexOf(AVATAR_PREFIX);
  if (i === -1) return;
  const path = decodeURIComponent(url.slice(i + AVATAR_PREFIX.length));
  const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([path]);
  if (error) console.error("Removing old avatar failed:", error.message);
}
