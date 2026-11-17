import { memo } from "react";
import { BaseCard } from "./BaseCard";
import { ProfileEntry } from "../supabase/types";

interface DrawingCardProps {
  src: string;
  title: string;
  description?: string;
  created_at: string;
  author: ProfileEntry | undefined;
}

export const DrawingCard = memo(
  ({ src, title, description, created_at, author }: DrawingCardProps) => {
    return (
      <BaseCard
        src={src}
        title={title}
        description={description}
        created_at={created_at}
        author={author}
        downloadLabel="Download Drawing"
        downloadLink={src}
        truncateLines={2}
      />
    );
  }
);
