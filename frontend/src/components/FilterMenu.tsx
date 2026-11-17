import { Badge, Button, Menu, Portal } from "@chakra-ui/react";
import { LuFilter } from "react-icons/lu";
import type { FeedType, ProfileEntry } from "../supabase/types";

// menu item values must be unique across the whole menu,
// otherwise items sharing a value highlight together
const ALL_TYPES = "all-types";
const ALL_AUTHORS = "all-authors";

const typeOptions: { value: FeedType; label: string }[] = [
  { value: "drawing", label: "Drawings" },
  { value: "story", label: "Stories" },
  { value: "music", label: "Music" },
];

interface FilterMenuProps {
  profiles: ProfileEntry[];
  author: string | null;
  type: FeedType | null;
  onAuthorChange: (author: string | null) => void;
  onTypeChange: (type: FeedType | null) => void;
}

export const FilterMenu = ({
  profiles,
  author,
  type,
  onAuthorChange,
  onTypeChange,
}: FilterMenuProps) => {
  const authors = profiles
    .filter((p) => p.username)
    .sort((a, b) => a.username.localeCompare(b.username));

  const activeCount = (author ? 1 : 0) + (type ? 1 : 0);

  return (
    <Menu.Root closeOnSelect={false} positioning={{ placement: "bottom-end" }}>
      <Menu.Trigger asChild>
        <Button variant="outline" size="md">
          <LuFilter /> Filter
          {activeCount > 0 && (
            <Badge size="sm" variant="outline" borderRadius="full">
              {activeCount}
            </Badge>
          )}
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="12rem" maxH="70vh" overflowY="auto">
            <Menu.RadioItemGroup
              value={type ?? ALL_TYPES}
              onValueChange={(e) =>
                onTypeChange(
                  e.value === ALL_TYPES ? null : (e.value as FeedType),
                )
              }
            >
              <Menu.ItemGroupLabel>Type</Menu.ItemGroupLabel>
              <Menu.RadioItem value={ALL_TYPES}>
                All types
                <Menu.ItemIndicator />
              </Menu.RadioItem>
              {typeOptions.map((t) => (
                <Menu.RadioItem key={t.value} value={t.value}>
                  {t.label}
                  <Menu.ItemIndicator />
                </Menu.RadioItem>
              ))}
            </Menu.RadioItemGroup>

            <Menu.Separator w="full" />

            <Menu.RadioItemGroup
              value={author ?? ALL_AUTHORS}
              onValueChange={(e) =>
                onAuthorChange(e.value === ALL_AUTHORS ? null : e.value)
              }
            >
              <Menu.ItemGroupLabel>Author</Menu.ItemGroupLabel>
              <Menu.RadioItem value={ALL_AUTHORS}>
                All authors
                <Menu.ItemIndicator />
              </Menu.RadioItem>
              {authors.map((p) => (
                <Menu.RadioItem
                  key={p.id}
                  value={p.id}
                  colorPalette={p.color}
                  color="colorPalette.fg"
                >
                  {p.username}
                  <Menu.ItemIndicator />
                </Menu.RadioItem>
              ))}
            </Menu.RadioItemGroup>

            {activeCount > 0 && (
              <>
                <Menu.Separator w="full" bg="bg.muted" />
                <Menu.Item
                  value="clear"
                  onClick={() => {
                    onAuthorChange(null);
                    onTypeChange(null);
                  }}
                >
                  Clear filters
                </Menu.Item>
              </>
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};
