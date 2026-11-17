import { memo } from "react";
import { BaseCard } from "./BaseCard";
import type { PostManage } from "./PostActions";
import { ProfileEntry } from "../supabase/types";

interface StoryCardProps {
  title: string;
  description: string;
  created_at: string;
  author: ProfileEntry | undefined;
  manage?: PostManage;
}

export const StoryCard = memo(
  ({ title, description, created_at, author, manage }: StoryCardProps) => {
    return (
      <BaseCard
        title={title}
        description={description}
        created_at={created_at}
        author={author}
        truncateLines={20}
        manage={manage}
        editTextLabel="Story"
      />
    );
  }
);
