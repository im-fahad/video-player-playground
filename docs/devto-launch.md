---
title: I shipped a video player to npm — twice. What I learned about scoped CSS, "use client", and Nuxt modules.
published: false
description: A small, HLS-capable video player for React and Vue, with zero global CSS side-effects. The build-in-public story behind @glitchlab/react-video-player and @glitchlab/vue-video-player, plus a live Vercel demo.
tags: react, vue, opensource, webdev
canonical_url: https://medium.com/@REPLACE-WITH-YOUR-MEDIUM-HANDLE/REPLACE-WITH-MEDIUM-SLUG
cover_image: https://video-player-playgraound.vercel.app/og-cover.png
---

> A small, HLS-capable video player for React **and** Vue, with zero global CSS side-effects. Built in the open. Try it: <https://video-player-playgraound.vercel.app/>

---

## The annoying gap

I needed an embeddable video player for a side project. Requirements were boring:

- HLS streaming (`.m3u8`)
- A clean play button overlay, optional close button, optional desktop/mobile aspect-ratio toggle
- Fits the design system without fighting it
- Works in **Next.js App Router** without a *"ReactServerComponentsError"* headache
- Works in **Nuxt 3** without manually wiring a plugin

I tried the popular options. Each was *almost* right.

- `react-player` is mature but the API is geared toward "give me a URL and a giant control bar."
- `video.js` is overkill for an embed and ships a chunk of theme CSS that fights Tailwind.
- `plyr`, `vidstack` — beautiful, but either too heavy or too opinionated about styling.

The thing that kept biting me was **CSS bleed**. Every "drop-in" player I tried shipped global resets, theme tokens, or `*` selectors that quietly nudged my buttons by 1px or rewrote my form input borders. In a design system you've spent weeks tuning, that's a paper cut you don't want.

So I built one. Then, because half the consumers I had in mind were on Vue, I built it twice.

- **`@glitchlab/react-video-player`** — <https://www.npmjs.com/package/@glitchlab/react-video-player>
- **`@glitchlab/vue-video-player`** — <https://www.npmjs.com/package/@glitchlab/vue-video-player>

Both are at v1.0.2 today. Both are MIT. Both have the same prop surface, same UI, and ship under 4 KB gzipped of CSS + JS.

There's a live playground on Vercel where you can drop in a file or paste an HLS URL and try it end-to-end:

**→ <https://video-player-playgraound.vercel.app/>**

This post is the build-in-public version of how I got there. Three decisions ended up doing most of the work — the rest was just plumbing.

---

## Decision 1: kill the global CSS

The first version of this player used Tailwind v4. I wrote the components, ran `vite build --lib`, and the resulting `dist/style.css` was **17 KB** of:

```css
:root, :host {
  --color-violet-700: ...;
  --font-sans: ui-sans-serif, system-ui, ...;
  /* ... */
}
*, ::before, ::after, ::backdrop {
  --tw-translate-x: 0;
  /* ... */
}
```

That's the entire Tailwind preflight, baked in. Anyone who imported `@glitchlab/react-video-player/style.css` would get my theme tokens injected into `:root` and global resets on every element on their page.

For an internal app this is whatever. For a published library it's malpractice. So I rewrote the CSS by hand.

The full stylesheet now scopes everything under a single class:

```css
.gvp-root {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  background-color: rgb(23 23 23 / 0.3);
  /* ... */
}

.gvp-root *,
.gvp-root *::before,
.gvp-root *::after {
  box-sizing: border-box;
}

.gvp-play {
  background-color: rgb(91 33 182 / 0.5);
  /* ... */
}
```

No `:root`, no `*` selectors at the document level. The component owns its subtree and nothing else. The CSS file dropped from **17 KB to 2.8 KB**.

The bonus: consumers can now override with predictable specificity:

```css
.gvp-root { border-radius: 8px; }
.gvp-play { background-color: rebeccapurple; }
.gvp-toggle-btn.is-active { color: deeppink; }
```

That's the whole "design system" story. No `@apply`, no `:where()` tricks, no Tailwind dependency in the lib. Tailwind users still get to use Tailwind in their own app — the player just stops yelling at theirs.

**Lesson:** if you ship CSS in an npm package, treat it like API. Every selector you publish is a contract. `:root { --color-foo: ...; }` is a worse breaking change than removing a prop, because it breaks silently.

---

## Decision 2: preserve "use client" through the build

The React package targets Next.js App Router. That means every file that uses hooks needs `"use client";` at the top, otherwise Next refuses to render it from a server component.

The component source had it:

```tsx
"use client";
import React, { useRef, useState } from "react";
// ...
```

But here's the gotcha: **rollup strips top-of-file directives during bundling unless you tell it not to.** I ran `vite build --lib`, looked at `dist/index.mjs`, and the directive was gone. Importing the package from a Next App Router server component blew up with the classic *"You're importing a component that needs `useState`"* error.

The fix is a tiny rollup output plugin that re-prepends the directive after bundling:

```ts
// vite.config.ts (excerpt)
function preserveUseClient() {
  return {
    name: "preserve-use-client",
    renderChunk(code: string) {
      if (code.includes('"use client"') || code.includes("'use client'")) return null;
      return { code: `"use client";\n${code}`, map: null };
    },
  };
}

export default defineConfig({
  // ...
  build: {
    rollupOptions: {
      output: {
        plugins: [preserveUseClient()],
      },
    },
  },
});
```

After this, both `dist/index.mjs` and `dist/index.cjs` start with `"use client";`. Consumers can import the package directly from a server component:

```tsx
// app/page.tsx — server component
import { ReactVideoPlayer } from "@glitchlab/react-video-player";
import "@glitchlab/react-video-player/style.css";

export default function Page() {
  return <ReactVideoPlayer src="/videos/hero.m3u8" />;
}
```

No client-component wrapper required. Just import and render.

**Lesson:** if your README claims "Next.js App Router compatible," verify the directive survives the bundler. Open `dist/index.mjs` after a build. If line 1 isn't `"use client";`, you're shipping a footgun.

---

## Decision 3: ship a real Nuxt module

The Vue package was supposed to mirror the React one's "drop in and go" feel. For Nuxt, that meant a real module — not a "import this component manually in every page."

Nuxt's module system is a small library of helpers (`@nuxt/kit`) that lets you add plugins, components, and composables to a Nuxt app. The trick is that `@nuxt/kit` imports Node-only modules (`giget`, `node:fs`, etc.) — so if you naively re-export your Nuxt module from your main entry, the lib's vanilla Vue users get a bundle that tries to require `node:fs` in the browser.

The fix is to give Nuxt its own subpath export and never let it touch the main entry.

```jsonc
// package.json (excerpt)
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./style.css": "./dist/style.css",
    "./nuxt": {
      "types": "./dist/nuxt-module.d.ts",
      "import": "./dist/nuxt-module.mjs",
      "require": "./dist/nuxt-module.cjs"
    }
  }
}
```

The vite config emits two entries:

```ts
build: {
  lib: {
    entry: {
      index: resolve(__dirname, "src/index.ts"),
      "nuxt-module": resolve(__dirname, "src/utils/nuxt-module.ts"),
    },
    formats: ["es", "cjs"],
  },
  rollupOptions: {
    external: ["vue", "hls.js", "@nuxt/kit", "#app", /^node:.*/],
  },
}
```

The Nuxt module itself is mostly boilerplate:

```ts
// src/utils/nuxt-module.ts
import { addPlugin, createResolver, defineNuxtModule } from "@nuxt/kit";

export default defineNuxtModule({
  meta: {
    name: "@glitchlab/vue-video-player",
    configKey: "vueVideoPlayer",
    compatibility: { nuxt: ">=3.0.0" },
  },
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url);
    addPlugin(resolver.resolve("./nuxt-plugin"));
  },
});
```

And the plugin auto-registers the component globally:

```ts
// src/utils/nuxt-plugin.ts
import { defineNuxtPlugin } from "#app";
import VideoPlayer from "../VideoPlayer.vue";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("VueVideoPlayer", VideoPlayer);
});
```

Now Nuxt 3 users get one-line integration:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@glitchlab/vue-video-player/nuxt"],
  css: ["@glitchlab/vue-video-player/style.css"],
});
```

And the component is available globally — no import, just `<VueVideoPlayer src="..." />` anywhere.

**Lesson:** subpath exports aren't optional for libraries with framework-specific entry points. Putting a Nuxt module behind `./nuxt` means non-Nuxt consumers never load `@nuxt/kit` and its Node-only deps. Their browser bundle stays clean.

---

## A bug that took an hour to find: Vue HLS first-mount race

I want to call this one out because it's a category of bug that's easy to ship and almost impossible to catch with smoke tests.

The Vue HLS player initialized like this:

```vue
<script setup lang="ts">
const videoEl = ref<HTMLVideoElement | null>(null);

watch(
  () => props.src,
  (src) => {
    if (src) initPlayer(src);
  },
  { immediate: true }   // 👈 the bug
);
</script>
```

Looks fine. Tests passed. The deployed playground showed the player frame, the play button, the native controls bar — but **the video never loaded**. Click play, the play button vanished (so `play()` resolved), but no pixels.

The cause: `watch(..., { immediate: true })` fires the callback during `setup()`, **before the template renders**. At that point `videoEl.value` is still `null`. `initPlayer()` early-returns, the watcher's already fired, and `props.src` doesn't change again — so HLS never attaches.

The React side wasn't affected because React effects always run *after* commit. The ref is bound by the time the effect fires.

The fix is two lines:

```ts
onMounted(() => {
  if (props.src) initPlayer(props.src);
});

watch(() => props.src, (src) => {
  if (src) initPlayer(src);
});  // no `immediate`
```

Now the first init runs in `onMounted` (template ref is bound), and subsequent `src` changes are handled by the regular watcher.

**Lesson:** `immediate: true` and refs don't mix cleanly in Composition API. If your watcher needs a ref that's bound by the template, use `onMounted` for the first run and a non-immediate watch for updates.

---

## The playground

I wanted a proof point that wasn't "trust the README." So I built a minimal Next.js app with three things:

- A drag-and-drop file zone (uploads create blob URLs and feed them to the player)
- A URL input with validation (paste any HTTP/HTTPS link, including `.m3u8`)
- The player itself, configured to remount cleanly on source change via `key={videoSrc}`

It's deployed at <https://video-player-playgraound.vercel.app/>. You can:

- Paste the test HLS stream `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8` and watch it play
- Paste a CORS-permissive `.mp4` URL and watch it play
- Drop a local file and watch the blob URL feed the player

It runs on the actual published `@glitchlab/react-video-player` from npm. Every time I publish a new version, I bump the dep and redeploy — the playground exercises the real published bundle, not source.

The Vue package shares the same UX in the local playground at `playground/vue/` in the monorepo. The deployed demo is React because that's what Vercel templates make easy; the Vue version is one `pnpm dev:vue` away if you clone the repo.

---

## What's in v1.0.2

Both packages at v1.0.2 today:

- **Same prop surface across React and Vue.** `src`, `poster`, `showDeviceToggle`, `defaultDevice`, `hoverPlay`, `tooltipText`, `muted`, `loop`, `controls`, `frameMaxWidth`, `aspectRatio`, `hlsConfig`, `isHls`. React adds `onClose` + `children`; Vue uses `closable` + `@close` event + default slot.
- **HLS via `hls.js`** with automatic native fallback for Safari (no `hls.js` cost when MSE isn't needed).
- **Captions/subtitles passthrough.** Pass `<track>` elements as React children or Vue default slot.
- **Hover-play with race-safe play/pause.** Tracks the play promise so a quick mouse-leave can't trigger a `DOMException`.
- **`hlsConfig` is memoizable.** Pass a stable reference (`useMemo` / `shallowRef`) to avoid HLS rebuilds on render.
- **TypeScript types**, full source maps, MIT licensed.
- **Smoke tests** in vitest (8 React, 7 Vue).

Bundle size: ~3 KB JS gzipped + ~1 KB CSS gzipped, per package.

---

## What's not in v1.0.2 (yet)

- **Picture-in-Picture toggle** — the API is trivial, the UI affordance isn't. Holding off until I know how it should look in the toggle pill.
- **Playback speed control** — same. Will land when I find a non-busy way to expose it.
- **Audio language switcher** — for HLS streams with multiple audio renditions (dubs, descriptive audio, secondary languages). `hls.js` exposes `audioTracks` and `audioTrack` already, so the wiring is small; the open question is the UI affordance, same as PiP.
- **Caption track UI.** You can pass `<track>` elements but the component doesn't render a captions menu. Native browser controls (`controls={true}`) handle this for now.
- **An actual stable Nuxt module ecosystem release** — currently the module exists and works, but isn't on https://nuxt.com/modules. That's a separate process I'll do when the API has settled for a quarter or two.

---

## Try it

```bash
# React
npm install @glitchlab/react-video-player hls.js

# Vue
npm install @glitchlab/vue-video-player hls.js
```

```tsx
// React + Next.js App Router
import { ReactVideoPlayer } from "@glitchlab/react-video-player";
import "@glitchlab/react-video-player/style.css";

export default function Page() {
  return <ReactVideoPlayer src="/videos/hero.m3u8" controls />;
}
```

```ts
// Nuxt 3
export default defineNuxtConfig({
  modules: ["@glitchlab/vue-video-player/nuxt"],
  css: ["@glitchlab/vue-video-player/style.css"],
});
```

```vue
<!-- anywhere in your Nuxt app -->
<VueVideoPlayer src="/videos/hero.m3u8" :controls="true" />
```

Live demo: **<https://video-player-playgraound.vercel.app/>**
React package: **<https://www.npmjs.com/package/@glitchlab/react-video-player>**
Vue package: **<https://www.npmjs.com/package/@glitchlab/vue-video-player>**

Source: **<https://github.com/im-fahad/react-video-player>** and **<https://github.com/im-fahad/vue-video-player>**.

Issues, PRs, and feature requests welcome. If something's broken in your setup, the playground is the fastest way to reproduce it — drop your URL in, screenshot what you see, file an issue.

---

*If you got value from this, the cheapest way to support is hitting the GitHub star button or sharing the playground link with someone fighting the same CSS-bleed problem. Both packages are MIT and will stay that way.*
