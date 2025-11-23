import { supabase } from "./client";
import type {
  ProfileEntry,
} from "./types";

export async function fetchProfiles(): Promise<ProfileEntry[]> {

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")

  if (!profiles || error) {
    console.error("Error fetching profiles:", error?.message);
    return [];
  }

  return profiles;
}

async function fetchProfilesByIds(
  ids: string[]
): Promise<any[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase.from("profiles").select("*").in("id", ids);

  if (error) {
    console.error(`Error fetching from profiles:`, error.message);
    return [];
  }

  return data ?? [];
}
