import { memo } from "react";
import { BaseCard } from "./BaseCard";
import type { PostManage } from "./PostActions";
import { ProfileEntry } from "../supabase/types";

interface DrawingCardProps {
  src: string;
  title: string;
  description?: string;
  created_at: string;
  author: ProfileEntry | undefined;
  manage?: PostManage;
}

export const DrawingCard = memo(
  ({ src, title, description, created_at, author, manage }: DrawingCardProps) => {
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
        manage={manage}
      />
    );
  }
);
