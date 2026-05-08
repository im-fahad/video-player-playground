<script setup lang="ts">
import { ref } from "vue";
import { VueVideoPlayer } from "@glitchlab/vue-video-player";
import "@glitchlab/vue-video-player/style.css";

const visible = ref(true);
</script>

<template>
  <div style="padding: 24px">
    <h2>vue-video-player playground</h2>

    <div class="min-h-screen bg-neutral-950 p-8">
      <VueVideoPlayer
        v-if="visible"
        src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        poster="https://ik.imagekit.io/ikmedia/blog/ghost/content/images/2024/03/Nextjs-Video-Player.png"
        :closable="true"
        :controls="true"
        default-device="desktop"
        tooltip-text="Watch the demo"
        @close="visible = false"
      />
    </div>
  </div>
</template>
