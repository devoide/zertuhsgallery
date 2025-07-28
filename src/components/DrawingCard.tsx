import { memo } from "react";
import { BaseCard } from "./BaseCard";

interface DrawingCardProps {
  src: string;
  title: string;
  description?: string;
  created_at: string;
}

export const DrawingCard = memo(({
  src,
  title,
  description,
  created_at,
}: DrawingCardProps) => {
  return (
    <BaseCard
      src={src}
      title={title}
      description={description}
      created_at={created_at}
      downloadLabel="Download Drawing"
      downloadLink={src}
      truncateLines={2}
    />
  );
});
