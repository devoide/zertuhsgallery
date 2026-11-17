import { Avatar, Badge, Popover, Portal, Text, VStack } from "@chakra-ui/react";
import type { ProfileEntry } from "../supabase/types";

/**
 * Author name badge; shows a tiny round avatar only if they have one.
 * Clicking it opens a small popover with a bigger avatar + name.
 */
export const AuthorBadge = ({ author }: { author: ProfileEntry }) => (
  <Popover.Root positioning={{ placement: "top" }}>
    <Popover.Trigger asChild>
      <Badge
        as="button"
        variant={"surface"}
        size={"md"}
        colorPalette={author.color}
        gap={1.5}
        cursor={"pointer"}
        // the badge sits inside the card, which opens its own modal on click
        onClick={(e) => e.stopPropagation()}
      >
        {author.avatar_url && (
          // smallest Avatar size (2xs = 24px) is as tall as the badge itself,
          // so shrink it to 16px. Avatar (vs. a plain Image) also degrades to
          // a plain circle instead of a broken-image icon if the URL fails.
          <Avatar.Root size={"2xs"} w={"4"} h={"4"} ml={-0.5}>
            <Avatar.Image src={author.avatar_url} />
          </Avatar.Root>
        )}
        {author.username}
      </Badge>
    </Popover.Trigger>
    <Portal>
      <Popover.Positioner>
        <Popover.Content w={"auto"} minW={"36"}>
          <Popover.Arrow>
            <Popover.ArrowTip />
          </Popover.Arrow>
          <Popover.Body>
            <VStack gap={2}>
              <Avatar.Root size={"3xl"} colorPalette={author.color}>
                <Avatar.Fallback name={author.username} />
                {author.avatar_url && <Avatar.Image src={author.avatar_url} />}
              </Avatar.Root>
              <Text
                fontWeight={"semibold"}
                colorPalette={author.color}
                color={"colorPalette.fg"}
              >
                {author.username}
              </Text>
            </VStack>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Portal>
  </Popover.Root>
);
