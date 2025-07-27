import { supabase } from "./client";

export async function fetchStories() {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch failed:", error.message);
    return [];
  }

  return data || [];
}
