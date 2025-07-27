import { supabase } from "./client";

type UploadStoryProps = {
  title: string;
  story: string;
};

export async function uploadStory({ title, story }: UploadStoryProps) {
  const { error } = await supabase.from("stories").insert([
    {
      title,
      content: story,
    },
  ]);

  if (error) {
    console.error("Upload failed:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
