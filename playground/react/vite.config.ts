import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const pkgRoot = fileURLToPath(
  new URL("../../packages/react-video-player", import.meta.url)
);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@glitchlab/react-video-player/style.css",
        replacement: `${pkgRoot}/src/styles.css`
      },
      {
        find: "@glitchlab/react-video-player",
        replacement: `${pkgRoot}/src/index.ts`
      }
    ]
  },
  server: {
    port: 5173,
    strictPort: true
  }
});
