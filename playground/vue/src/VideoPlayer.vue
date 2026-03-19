<script lang="ts" setup>
import {computed, ref} from "vue";
import HLSPlayer from "./HLSPlayer.vue";
import IconDesktop from "./utils/IconDesktop.vue";
import IconMobile from "./utils/IconMobile.vue";
import IconPlay from "./utils/IconPlay.vue";
import IconX from "./utils/IconX.vue";
import type {DeviceMode, VideoPlayerProps} from "../types";

const props = withDefaults(defineProps<VideoPlayerProps & { onClose?: () => void; class?: string }>(), {
  showDeviceToggle: true,
  defaultDevice: "desktop",
  hoverPlay: false,
  muted: true,
  loop: false,
  controls: false,
  class: "",
});

const emit = defineEmits<{
  close: [];
}>();

const hlsPlayerRef = ref<InstanceType<typeof HLSPlayer> | null>(null);
const device = ref<DeviceMode>(props.defaultDevice);
const isPlaying = ref(false);
const showTooltip = ref(false);

const aspectRatio = computed(() =>
    device.value === "mobile"
        ? (props.aspectRatio?.mobile ?? "9/16")
        : (props.aspectRatio?.desktop ?? "16/9")
);

const frameMaxWidth = computed(() =>
    device.value === "mobile"
        ? (props.frameMaxWidth?.mobile ?? "420px")
        : (props.frameMaxWidth?.desktop ?? "960px")
);

const videoEl = computed(() => hlsPlayerRef.value?.videoEl ?? null);

async function hoverStart() {
  if (!props.hoverPlay) return;
  const el = videoEl.value;
  if (!el) return;
  try {
    if (el.readyState < 2) el.load();
    await el.play();
    isPlaying.value = true;
  } catch {
    isPlaying.value = false;
  }
}

function hoverStop() {
  if (!props.hoverPlay) return;
  const el = videoEl.value;
  if (!el) return;
  el.pause();
  isPlaying.value = false;
}

async function togglePlay() {
  const el = videoEl.value;
  if (!el) return;
  try {
    if (el.paused) {
      await el.play();
      isPlaying.value = true;
    } else {
      el.pause();
      isPlaying.value = false;
    }
  } catch {
    isPlaying.value = false;
  }
}

function onMouseEnter() {
  showTooltip.value = true;
  void hoverStart();
}

function onMouseLeave() {
  showTooltip.value = false;
  hoverStop();
}
</script>

<template>
  <div
      :class="[
      'relative overflow-hidden rounded-3xl',
      'bg-neutral-900/30 shadow-2xl',
      'ring-1 ring-white/10',
      'mx-auto w-full',
      props.class,
    ]"
      :style="{ width: frameMaxWidth, aspectRatio: aspectRatio }"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
  >
    <!-- HLSPlayer -->
    <HLSPlayer
        ref="hlsPlayerRef"
        :controls="controls"
        :loop="loop"
        :muted="muted"
        :plays-inline="true"
        :poster="poster"
        :src="src"
        class="h-full w-full object-cover"
        preload="metadata"
        @pause="isPlaying = false"
        @play="isPlaying = true"
    />

    <!-- Vignette overlay -->
    <div class="pointer-events-none absolute inset-0 bg-linear-to-tr from-black/35 via-black/0 to-black/35"/>

    <!-- Top-left device toggle -->
    <div v-if="showDeviceToggle" class="absolute left-4 top-4">
      <div class="flex items-center overflow-hidden rounded-2xl bg-white/95 shadow-lg ring-1 ring-black/5">
        <button
            :class="device === 'desktop' ? 'text-violet-700' : 'text-neutral-500 hover:text-neutral-700'"
            class="flex items-center gap-2 px-4 py-2 text-sm font-semibold z-10 cursor-pointer"
            type="button"
            @click="device = 'desktop'"
        >
          <IconDesktop class="h-5 w-5"/>
        </button>

        <div class="h-7 w-px bg-neutral-200"/>

        <button
            :class="device === 'mobile' ? 'text-violet-700' : 'text-neutral-500 hover:text-neutral-700'"
            class="flex items-center gap-2 px-4 py-2 text-sm font-semibold z-10 cursor-pointer"
            type="button"
            @click="device = 'mobile'"
        >
          <IconMobile class="h-5 w-5"/>
        </button>
      </div>
    </div>

    <!-- Top-right close button -->
    <button
        v-if="onClose"
        aria-label="Close"
        class="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md ring-1 ring-white/15 hover:bg-black/50 cursor-pointer z-10"
        type="button"
        @click="emit('close')"
    >
      <IconX class="h-5 w-5"/>
    </button>

    <!-- Center play button -->
    <div v-if="!isPlaying" class="absolute inset-0 grid place-items-center">
      <button
          aria-label="Play"
          class="relative grid h-14 w-14 place-items-center rounded-full cursor-pointer ring-1 ring-white/15 bg-violet-700/50 hover:bg-violet-700/90 bg-neutral-200/5 bg-blend-overlay shadow-xl transition-opacity duration-200"
          type="button"
          @click="togglePlay"
          @mouseenter="showTooltip = true"
          @mouseleave="showTooltip = false"
      >
        <IconPlay class="h-7 w-7 translate-x-px"/>

        <div
            v-if="tooltipText && showTooltip && !isPlaying"
            class="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-black/70 px-3 py-1.5 text-xs text-white shadow-lg ring-1 ring-white/10 backdrop-blur"
        >
          {{ tooltipText }}
        </div>
      </button>
    </div>

    <!-- Bottom fade -->
    <div class="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-black/35 to-transparent"/>
  </div>
</template>
