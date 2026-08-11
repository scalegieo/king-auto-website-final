/** Scroll runway — 300–400vh cinematic band (Apple-style). */
export const HERO_SCROLL_HEIGHT_VH = 380;

/**
 * H.264 scrub encode: frequent keyframes + faststart for smooth scroll seeking.
 * Run `npm run hero:encode` after replacing the source MOV.
 */
export const HERO_VIDEO_SRC = "/hero/kling-fpv-scroll-scrub.mp4?v=6";

/** Avoid seeking past the end — prevents freeze on last frames. */
export const HERO_VIDEO_END_PADDING_SEC = 0.08;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/** Smoothstep — premium ease on scroll → timeline mapping. */
export function scrollProgressToVideoProgress(scrollProgress: number): number {
  const p = clamp01(scrollProgress);
  return p * p * (3 - 2 * p);
}
