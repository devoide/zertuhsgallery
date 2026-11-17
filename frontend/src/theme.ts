import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { avatarAnatomy, menuAnatomy } from "@chakra-ui/react/anatomy";

const config = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        // override keys inside the groups — setting `value` directly on
        // `bg`/`border` wipes out bg.panel, bg.muted, border.muted, etc.
        bg: {
          DEFAULT: { value: "{colors.gray.900}" },
          // popups: menu, popover, dialog, select...
          panel: { value: "{colors.gray.800}" },
        },
        border: {
          DEFAULT: { value: "{colors.gray.800}" },
        },
      },
    },
    // menu separator + hover default to colors that blend into a gray.800
    // panel, so lighten them for menus only
    slotRecipes: {
      menu: {
        slots: menuAnatomy.keys(),
        base: {
          separator: { bg: "gray.700" },
        },
        variants: {
          variant: {
            subtle: {
              item: { _highlighted: { bg: "gray.700" } },
            },
          },
        },
      },
      // extra avatar size above Chakra's largest (2xl = 64px)
      avatar: {
        slots: avatarAnatomy.keys(),
        variants: {
          size: {
            "3xl": {
              root: {
                "--avatar-font-size": "fontSizes.2xl",
                "--avatar-size": "sizes.20", // 80px
              },
            },
          },
        },
      },
    },
  },
  globalCss: {
    "html, body": {
      bg: "bg",
    },
  },
});

export const system = createSystem(defaultConfig, config);
