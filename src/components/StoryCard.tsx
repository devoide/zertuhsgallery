import { memo } from "react";
import { BaseCard } from "./BaseCard";
import { ProfileEntry } from "../supabase/types";

interface StoryCardProps {
  title: string;
  description: string;
  created_at: string;
  author: ProfileEntry | undefined;
}

export const StoryCard = memo(
  ({ title, description, created_at, author }: StoryCardProps) => {
    return (
      <BaseCard
        title={title}
        description={description}
        created_at={created_at}
        author={author}
        truncateLines={20}
      />
    );
  }
);
