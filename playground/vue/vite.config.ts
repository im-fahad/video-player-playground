import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

const pkgRoot = fileURLToPath(
  new URL("../../packages/vue-video-player", import.meta.url)
);

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: "@glitchlab/vue-video-player/style.css",
        replacement: `${pkgRoot}/src/styles.css`
      },
      {
        find: "@glitchlab/vue-video-player",
        replacement: `${pkgRoot}/src/index.ts`
      }
    ]
  },
  server: {
    port: 5174,
    strictPort: true
  }
});
