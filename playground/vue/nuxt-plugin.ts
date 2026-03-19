import {defineNuxtPlugin} from "#app";
import VideoPlayer from "./src/VideoPlayer.vue";

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component("VueVideoPlayer", VideoPlayer);
});
