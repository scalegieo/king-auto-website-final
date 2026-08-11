"use client";

import { RefObject, useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  HERO_VIDEO_END_PADDING_SEC,
  scrollProgressToVideoProgress,
} from "@/lib/hero-video";

gsap.registerPlugin(ScrollTrigger);

const OVERLAY_SMOOTH_SPEED = 12;
/** GSAP scrub lag (scroll → timeline); single authority for video seeks. */
const VIDEO_SCRUB_SMOOTH = 0.85;

export type ScrollHeroOverlayRefs = {
  intro: RefObject<HTMLDivElement | null>;
  hint: RefObject<HTMLDivElement | null>;
  outro: RefObject<HTMLDivElement | null>;
  handoff: RefObject<HTMLDivElement | null>;
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function applyOverlayProgress(refs: ScrollHeroOverlayRefs, progress: number) {
  const introOpacity = 1 - clamp01(progress / 0.22);
  const hintOpacity =
    progress < 0.02 ? 1 : Math.max(0, 1 - (progress - 0.02) / 0.1);
  const outroOpacity = clamp01((progress - 0.82) / 0.12);
  const handoffOpacity = clamp01((progress - 0.88) / 0.12);

  if (refs.intro.current) {
    refs.intro.current.style.opacity = String(introOpacity);
    refs.intro.current.style.transform = `translate3d(0, ${(1 - introOpacity) * 12}px, 0)`;
  }
  if (refs.hint.current) {
    refs.hint.current.style.opacity = String(hintOpacity);
  }
  if (refs.outro.current) {
    refs.outro.current.style.opacity = String(outroOpacity);
    refs.outro.current.style.transform = `translate3d(0, ${(1 - outroOpacity) * 16}px, 0)`;
  }
  if (refs.handoff.current) {
    refs.handoff.current.style.opacity = String(handoffOpacity * 0.35);
  }
}

/** Sticky-safe scroll progress from hero section geometry. */
function progressFromHeroRect(container: HTMLElement) {
  const scrollable = container.offsetHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  const top = container.getBoundingClientRect().top;
  return clamp01(-top / scrollable);
}

export function useScrollDrivenVideo(
  containerRef: RefObject<HTMLElement | null>,
  videoRef: RefObject<HTMLVideoElement | null>,
  overlayRefs: ScrollHeroOverlayRefs
) {
  const overlayProgressRef = useRef(0);
  const overlayRefsRef = useRef(overlayRefs);
  overlayRefsRef.current = overlayRefs;

  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    let rafId = 0;
    let lastFrame = performance.now();
    let scrollTrigger: ScrollTrigger | undefined;
    let cancelled = false;
    let lastSeekTarget = -1;
    let scrubProgress = 0;

    const seekVideoToProgress = (rawProgress: number) => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      const playable = Math.max(0, duration - HERO_VIDEO_END_PADDING_SEC);
      const t = scrollProgressToVideoProgress(rawProgress) * playable;

      if (Math.abs(t - lastSeekTarget) < 0.002) return;
      lastSeekTarget = t;

      video.pause();
      try {
        video.currentTime = t;
      } catch {
        /* frame not decoded yet */
      }
    };

    const primeVideo = () => {
      if (cancelled) return;
      lastSeekTarget = -1;
      video.pause();
      ScrollTrigger.refresh();
      if (scrollTrigger) {
        scrubProgress = scrollTrigger.progress;
        seekVideoToProgress(scrubProgress);
      } else {
        seekVideoToProgress(progressFromHeroRect(container));
      }
    };

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.preload = "auto";
    video.pause();

    const onMeta = () => primeVideo();
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("loadeddata", onMeta);
    video.addEventListener("durationchange", onMeta);
    if (video.readyState >= 1) primeVideo();

    scrubProgress = progressFromHeroRect(container);

    const tick = (now: number) => {
      const dt = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;

      const overlayFactor = 1 - Math.exp(-OVERLAY_SMOOTH_SPEED * dt);
      const overlayTarget = scrollProgressToVideoProgress(scrubProgress);
      overlayProgressRef.current +=
        (overlayTarget - overlayProgressRef.current) * overlayFactor;
      applyOverlayProgress(overlayRefsRef.current, overlayProgressRef.current);

      rafId = requestAnimationFrame(tick);
    };

    const ctx = gsap.context(() => {
      scrollTrigger = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        scrub: VIDEO_SCRUB_SMOOTH,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          scrubProgress = self.progress;
          seekVideoToProgress(scrubProgress);
        },
      });
      scrubProgress = scrollTrigger.progress;
      seekVideoToProgress(scrubProgress);
    }, container);

    applyOverlayProgress(overlayRefsRef.current, 0);
    rafId = requestAnimationFrame(tick);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => ScrollTrigger.refresh())
        : null;
    ro?.observe(container);

    const t1 = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    const t2 = window.setTimeout(() => primeVideo(), 1000);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
      scrollTrigger?.kill();
      ctx.revert();
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("loadeddata", onMeta);
      video.removeEventListener("durationchange", onMeta);
      video.pause();
    };
  }, [containerRef, videoRef]);
}
