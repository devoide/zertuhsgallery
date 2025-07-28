import { supabase } from "./client";

export type AudioEntry = {
  id: number;
  title: string;
  description: string;
  audio_url: string;
  created_at: string;
};

export async function fetchAudio(): Promise<{
  data: AudioEntry[] | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("compositions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching audio:", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
