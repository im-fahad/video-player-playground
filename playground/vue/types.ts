import type { HlsConfig } from "hls.js";

export type DeviceMode = "desktop" | "mobile";

export type AspectRatio = `${number}/${number}`;

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  showDeviceToggle?: boolean;
  defaultDevice?: DeviceMode;
  hoverPlay?: boolean;
  tooltipText?: string;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  frameMaxWidth?: {
    desktop?: string;
    mobile?: string;
  };
  aspectRatio?: {
    desktop?: AspectRatio;
    mobile?: AspectRatio;
  };
}

export interface HLSPlayerProps {
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
}
