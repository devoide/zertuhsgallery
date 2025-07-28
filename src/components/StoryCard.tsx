import { memo } from "react";
import { BaseCard } from "./BaseCard";

interface StoryCardProps {
  title: string;
  description: string;
  created_at: string;
}

export const StoryCard = memo(({
  title,
  description,
  created_at,
}: StoryCardProps) => {
  return (
    <BaseCard
      title={title}
      description={description}
      created_at={created_at}
      truncateLines={20}
    />
  );
});
