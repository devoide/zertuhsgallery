import { memo } from "react";
import { BaseCard } from "./BaseCard";
import { Text } from "@chakra-ui/react";
import { ProfileEntry } from "../supabase/types";

interface MusicCardProps {
  src: string;
  title: string;
  description?: string;
  created_at: string;
  author: ProfileEntry | undefined;
}

export const MusicCard = memo(
  ({ src, title, description, created_at, author }: MusicCardProps) => {
    return (
      <BaseCard
        title={title}
        description={description}
        created_at={created_at}
        author={author}
        downloadLabel="Download Audio"
        downloadLink={src}
        truncateLines={2}
        previewContent={
          <audio
            controls
            style={{
              width: "100%",
            }}
          >
            <source src={src} />
            ur browser old asf
          </audio>
        }
        modalContent={
          <>
            <audio controls style={{ width: "100%", marginBottom: "1rem" }}>
              <source src={src} />
              ur browser old asf
            </audio>
            {description && (
              <Text fontSize="sm" color="gray.200">
                {description}
              </Text>
            )}
          </>
        }
      />
    );
  }
);
