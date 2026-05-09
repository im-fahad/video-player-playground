<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { VueVideoPlayer } from "@glitchlab/vue-video-player";
import "@glitchlab/vue-video-player/style.css";
import "./playground.css";

const DEFAULT_VIDEO = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

function isLikelyValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const videoSrc = ref(DEFAULT_VIDEO);
const inputUrl = ref(DEFAULT_VIDEO);
const fileName = ref<string | null>(null);
const errorMsg = ref<string | null>(null);
const isDragging = ref(false);

let previousBlob: string | null = null;

watch(videoSrc, (next, prev) => {
  if (prev && prev.startsWith("blob:") && prev !== next) {
    URL.revokeObjectURL(prev);
  }
  previousBlob = next.startsWith("blob:") ? next : null;
});

onBeforeUnmount(() => {
  if (previousBlob) URL.revokeObjectURL(previousBlob);
});

function acceptFile(file: File) {
  errorMsg.value = null;
  if (!file.type.startsWith("video/")) {
    errorMsg.value = "Please select a video file.";
    return;
  }
  const url = URL.createObjectURL(file);
  fileName.value = file.name;
  videoSrc.value = url;
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) acceptFile(file);
  target.value = "";
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) acceptFile(file);
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
  isDragging.value = true;
}

function handleLoadUrl() {
  const trimmed = inputUrl.value.trim();
  if (!trimmed) {
    errorMsg.value = "Please enter a URL.";
    return;
  }
  if (!isLikelyValidUrl(trimmed)) {
    errorMsg.value = "Enter a valid http(s) URL.";
    return;
  }
  errorMsg.value = null;
  fileName.value = null;
  videoSrc.value = trimmed;
}

const loadDisabled = computed(() => {
  const trimmed = inputUrl.value.trim();
  return (
    !trimmed || trimmed === videoSrc.value || !isLikelyValidUrl(trimmed)
  );
});

function onUrlKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" && !loadDisabled.value) {
    handleLoadUrl();
  }
}
</script>

<template>
  <div class="pg-page">
    <div class="pg-card">
      <header class="pg-header">
        <h1>
          <span aria-hidden="true">🎬</span> Vue Video Player Playground
        </h1>
        <p>Upload a video or paste a URL to preview instantly.</p>
      </header>

      <div class="pg-grid">
        <label
          :class="['pg-drop', { 'is-dragging': isDragging }]"
          @dragover="onDragOver"
          @dragleave="isDragging = false"
          @drop="onDrop"
        >
          <span class="pg-drop-label">
            {{ fileName ? "Selected file" : "Click or drop a video here" }}
          </span>
          <span class="pg-drop-hint">
            {{
              fileName ||
              "MP4, WebM, MOV, or any format your browser supports"
            }}
          </span>
          <input
            type="file"
            accept="video/*"
            class="pg-sr-only"
            aria-label="Upload video file"
            @change="onFileChange"
          />
        </label>

        <div class="pg-url">
          <div>
            <label for="video-url">Paste video URL</label>
            <input
              id="video-url"
              v-model="inputUrl"
              type="url"
              inputmode="url"
              placeholder="https://example.com/video.mp4"
              @keydown="onUrlKeydown"
            />
            <p class="pg-url-help">
              Direct video files or HLS streams (.m3u8) are supported.
            </p>
          </div>

          <button
            type="button"
            class="pg-button"
            :disabled="loadDisabled"
            @click="handleLoadUrl"
          >
            Load Video
          </button>
        </div>
      </div>

      <div v-if="errorMsg" role="alert" class="pg-error">
        {{ errorMsg }}
      </div>

      <div class="pg-player">
        <VueVideoPlayer
          :key="videoSrc"
          :src="videoSrc"
          :controls="true"
          :show-device-toggle="true"
          :frame-max-width="{ desktop: '100%' }"
          :hover-play="false"
          :muted="false"
        />
      </div>

      <footer class="pg-footer">
        <p>
          Some external video URLs may not load due to browser CORS
          restrictions.
        </p>
        <p>
          Powered by
          <a
            href="https://www.npmjs.com/package/@glitchlab/vue-video-player"
            target="_blank"
            rel="noopener noreferrer"
          >@glitchlab/vue-video-player</a>
          — a Vue 3 / Nuxt 3 video player with HLS support, device-mode
          toggle, and hover-to-play.
        </p>
        <p>
          Using React or Next.js? Try
          <a
            href="https://www.npmjs.com/package/@glitchlab/react-video-player"
            target="_blank"
            rel="noopener noreferrer"
          >@glitchlab/react-video-player</a>
          — the React counterpart with the same scoped CSS and feature set.
        </p>
      </footer>
    </div>
  </div>
</template>
