"use client";

import { useRef } from "react";
import {
  HERO_SCROLL_HEIGHT_VH,
  HERO_VIDEO_SRC,
} from "@/lib/hero-video";

const HERO_VIDEO_FALLBACK = "/hero/kling-fpv-scroll.mov";
import { useScrollDrivenVideo } from "@/hooks/useScrollDrivenVideo";
import {
  CinematicHeroHint,
  CinematicHeroIntro,
  CinematicHeroOutro,
} from "@/components/hero/CinematicHeroOverlay";

export function VideoScrollHero() {
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const handoffRef = useRef<HTMLDivElement>(null);

  useScrollDrivenVideo(containerRef, videoRef, {
    intro: introRef,
    hint: hintRef,
    outro: outroRef,
    handoff: handoffRef,
  });

  return (
    <section
      id="hero"
      ref={containerRef}
      data-hero="fpv-scroll-mp4"
      className="relative w-full"
      style={{ height: `${HERO_SCROLL_HEIGHT_VH}vh` }}
      aria-label="King Auto cinematic introduction"
    >
      <div className="sticky top-0 left-0 z-20 h-screen w-full overflow-hidden bg-black isolate">
        <div
          className="absolute inset-0 will-change-transform transform-gpu"
          style={{ transform: "translate3d(0,0,0)" }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover scale-[1.02] grayscale-[0.25] contrast-[1.05] brightness-[0.92]"
            src={HERO_VIDEO_SRC}
            muted
            playsInline
            preload="auto"
            aria-hidden
            onError={(e) => {
              const el = e.currentTarget;
              if (el.dataset.fallbackApplied) return;
              el.dataset.fallbackApplied = "1";
              el.src = HERO_VIDEO_FALLBACK;
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-neutral-950/30 mix-blend-multiply"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/55"
            aria-hidden
          />
        </div>

        <div
          ref={handoffRef}
          className="pointer-events-none absolute inset-0 z-10 bg-charcoal-900 will-change-opacity"
          style={{ opacity: 0 }}
        />

        <CinematicHeroIntro ref={introRef} />
        <CinematicHeroOutro ref={outroRef} />
        <CinematicHeroHint ref={hintRef} />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-24 bg-gradient-to-t from-charcoal-900/80 to-transparent"
          aria-hidden
        />
      </div>
    </section>
  );
}
