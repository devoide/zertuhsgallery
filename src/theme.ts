import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        bg: { value: "gray.900" },
        border: { value: "gray.800" },
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
