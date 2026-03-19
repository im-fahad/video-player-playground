import { defineConfig } from "vite";
import * as vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    vue(),
    dts({ insertTypesEntry: true, rollupTypes: true })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.mjs" : "index.cjs")
    },
    rollupOptions: {
      external: ["vue", "hls.js"],
      output: {
        globals: {
          vue: "Vue",
          "hls.js": "Hls"
        }
      }
    }
  }
});