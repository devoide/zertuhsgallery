import { supabase } from "./client";

type UploadStoryProps = {
  title: string;
  story: string;
  author: string;
};

export async function uploadStory({ title, story, author }: UploadStoryProps) {
  const { error } = await supabase.from("stories").insert([
    {
      title,
      content: story,
      author,
    },
  ]);

  if (error) {
    console.error("Upload failed:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
