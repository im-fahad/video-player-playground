# @glitchlab/vue-video-player

A Vue 3 / Nuxt 3 video player with HLS streaming, device mode toggling, hover-to-play, and a polished overlay UI — built with Tailwind CSS.

---

## Features

- 🎬 **HLS streaming** via `hls.js` with automatic fallback to native playback
- 📱 **Device mode toggle** — switch between desktop (16:9) and mobile (9:16) aspect ratios
- 🖱️ **Hover-to-play** — optionally start playback on mouse enter
- 🎯 **Custom play button** with optional tooltip
- ✕ **Close button** via `@close` event
- 🎨 Vignette overlays and Tailwind-based styling
- ⚡ **Nuxt 3 module** included for zero-config integration
- Fully typed with TypeScript

---

## Installation

```bash
npm install @glitchlab/vue-video-player
# or
pnpm add @glitchlab/vue-video-player
```

> **Peer dependencies:** `vue >= 3`, `hls.js >= 1`, `tailwindcss >= 4`

Import the styles in your entry file:

```ts
import "@glitchlab/vue-video-player/style.css";
```

---

## Usage

### Vue 3

```vue
<script setup lang="ts">
import { VueVideoPlayer } from "@glitchlab/vue-video-player";
import "@glitchlab/vue-video-player/style.css";
</script>

<template>
  <VueVideoPlayer
    src="https://example.com/video/playlist.m3u8"
    poster="https://example.com/poster.jpg"
  />
</template>
```

### Nuxt 3

Add the module to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ["@glitchlab/vue-video-player/nuxt"],
});
```

Then use the component anywhere without importing:

```vue
<template>
  <VueVideoPlayer
    src="https://example.com/video/playlist.m3u8"
    poster="https://example.com/poster.jpg"
  />
</template>
```

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `src` | `string` | — | **Required.** Video URL. `.m3u8` files are played via HLS automatically. |
| `poster` | `string` | — | Poster image shown before playback. |
| `showDeviceToggle` | `boolean` | `true` | Show the desktop/mobile toggle pill in the top-left corner. |
| `defaultDevice` | `"desktop" \| "mobile"` | `"desktop"` | Initial device mode. |
| `hoverPlay` | `boolean` | `false` | Start playing on mouse enter; pause on mouse leave. |
| `tooltipText` | `string` | — | Text shown in a tooltip above the play button on hover. |
| `muted` | `boolean` | `true` | Mute the video. |
| `loop` | `boolean` | `false` | Loop the video. |
| `controls` | `boolean` | `false` | Show native browser video controls. |
| `frameMaxWidth` | `{ desktop?: string; mobile?: string }` | `{ desktop: "960px", mobile: "420px" }` | Max width of the player in each device mode. |
| `aspectRatio` | `{ desktop?: AspectRatio; mobile?: AspectRatio }` | `{ desktop: "16/9", mobile: "9/16" }` | Aspect ratio per device mode. |

## Events

| Event | Payload | Description |
|---|---|---|
| `close` | — | Emitted when the close button is clicked. Renders the button only when a listener is attached. |

---

## Examples

### Looping background video

```vue
<VueVideoPlayer
  src="/videos/hero.m3u8"
  :muted="true"
  :loop="true"
  :show-device-toggle="false"
/>
```

### Hover-to-play with tooltip

```vue
<VueVideoPlayer
  src="/videos/demo.mp4"
  poster="/images/thumb.jpg"
  :hover-play="true"
  tooltip-text="Watch the demo"
/>
```

### Dismissible player in a modal

```vue
<VueVideoPlayer
  src="/videos/walkthrough.m3u8"
  :show-device-toggle="false"
  @close="isOpen = false"
/>
```

### Custom aspect ratio and max width

```vue
<VueVideoPlayer
  src="/videos/portrait.mp4"
  default-device="mobile"
  :aspect-ratio="{ desktop: '4/3', mobile: '9/16' }"
  :frame-max-width="{ desktop: '720px', mobile: '360px' }"
/>
```

---

## Architecture

```
src/
├── index.ts              # Package entry
├── types.ts              # TypeScript types
├── VideoPlayer.vue       # Main component
├── HLSPlayer.vue         # HLS.js video element wrapper
├── nuxt-module.ts        # Nuxt 3 module
├── nuxt-plugin.ts        # Nuxt 3 plugin (auto-registers component)
├── utils/
│   ├── IconDesktop.vue
│   ├── IconMobile.vue
│   ├── IconPlay.vue
│   └── IconX.vue
└── styles.css            # Tailwind CSS entry
```

---

## License

MIT
