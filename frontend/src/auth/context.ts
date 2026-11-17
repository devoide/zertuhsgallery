import { createContext, useContext } from "react";
import type { ProfileEntry } from "../supabase/types";

export type CurrentUser = {
  /** null when logged out */
  userId: string | null;
  /** the logged-in user's profile, null while loading or logged out */
  profile: ProfileEntry | null;
  /** true until the initial session check is done */
  loading: boolean;
  /** re-read the profile, e.g. after editing it */
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const CurrentUserContext = createContext<CurrentUser | null>(null);

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used inside <CurrentUserProvider>");
  }
  return ctx;
}

export function useCurrentUserId() {
  return useCurrentUser().userId;
}
