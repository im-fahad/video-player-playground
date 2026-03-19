<script setup lang="ts">
import Hls from "hls.js";
import { ref, watch, onUnmounted } from "vue";
import type { HlsConfig } from "hls.js";

const props = withDefaults(
  defineProps<{
    src: string;
    hlsConfig?: HlsConfig;
    isHls?: boolean;
    muted?: boolean;
    loop?: boolean;
    controls?: boolean;
    playsInline?: boolean;
    preload?: string;
    poster?: string;
    class?: string;
  }>(),
  {
    muted: true,
    loop: false,
    controls: false,
    playsInline: true,
    preload: "metadata",
  }
);

const emit = defineEmits<{
  play: [];
  pause: [];
}>();

const videoEl = ref<HTMLVideoElement | null>(null);
const hlsInstance = ref<Hls | null>(null);

const canUseHlsJs = typeof window !== "undefined" && Hls.isSupported();
const shouldUseHls = (src: string) =>
  Boolean(props.isHls) || (canUseHlsJs && src.endsWith(".m3u8"));

function cleanup() {
  if (hlsInstance.value) {
    hlsInstance.value.destroy();
    hlsInstance.value = null;
  }
  const el = videoEl.value;
  if (!el) return;
  el.pause();
  el.removeAttribute("src");
  while (el.firstChild) el.removeChild(el.firstChild);
  el.load();
}

function initPlayer(src: string) {
  const el = videoEl.value;
  if (!el || !src) return;

  cleanup();

  if (shouldUseHls(src)) {
    const hls = new Hls(props.hlsConfig);
    hlsInstance.value = hls;
    hls.attachMedia(el);
    hls.loadSource(src);
    hls.on(Hls.Events.ERROR, (_evt, data) => {
      if (data.fatal) {
        hls.destroy();
        hlsInstance.value = null;
      }
    });
  } else {
    el.src = src;
    el.load();
  }
}

watch(
  () => props.src,
  (src) => {
    if (src) initPlayer(src);
  },
  { immediate: true }
);

onUnmounted(cleanup);

// Expose video element for parent
defineExpose({ videoEl });
</script>

<template>
  <video
    ref="videoEl"
    :muted="muted"
    :loop="loop"
    :controls="controls"
    :playsinline="playsInline"
    :preload="preload"
    :poster="poster"
    :class="props.class"
    @play="emit('play')"
    @pause="emit('pause')"
  />
</template>
