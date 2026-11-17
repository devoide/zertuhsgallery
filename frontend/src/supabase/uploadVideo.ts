import { supabase } from "./client";
import type { VideoSource } from "./types";

type UploadVideoProps = {
  title: string;
  description: string;
  source: VideoSource;
  /** youtube: video id · upload: public file URL */
  videoRef: string;
  author: string;
};

export async function uploadVideo({
  title,
  description,
  source,
  videoRef,
  author,
}: UploadVideoProps) {
  const { error } = await supabase.from("videos").insert([
    {
      title,
      description,
      source,
      video_ref: videoRef,
      author,
    },
  ]);

  if (error) {
    console.error("Upload failed:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
