import { supabase } from "./client";

export type ImageEntry = {
  id: number;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
};

export async function fetchImages(): Promise<{
  data: ImageEntry[] | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching images:", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
