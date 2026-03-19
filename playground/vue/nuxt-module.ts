import { defineNuxtModule, addPlugin, createResolver } from "@nuxt/kit";

export default defineNuxtModule({
  meta: {
    name: "@glitchlab/vue-video-player",
    configKey: "vueVideoPlayer",
  },
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url);
    addPlugin(resolver.resolve("./nuxt-plugin"));
  },
});
