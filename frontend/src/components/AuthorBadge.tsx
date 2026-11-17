import { Avatar, Badge } from "@chakra-ui/react";
import type { ProfileEntry } from "../supabase/types";

/** author name badge; shows a tiny round avatar only if they have one */
export const AuthorBadge = ({ author }: { author: ProfileEntry }) => (
  <Badge variant={"surface"} size={"md"} colorPalette={author.color} gap={1.5}>
    {author.avatar_url && (
      <Avatar.Root size={"2xs"} w={"4"} h={"4"} ml={-0.5}>
        <Avatar.Image src={author.avatar_url} />
      </Avatar.Root>
    )}
    {author.username}
  </Badge>
);
