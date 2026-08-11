"use client";

import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export const CinematicHeroIntro = forwardRef<HTMLDivElement>(
  function CinematicHeroIntro(_, ref) {
    return (
      <div
        ref={ref}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center px-5 sm:px-6 text-center pointer-events-none will-change-transform"
        style={{ opacity: 1 }}
      >
        <p className="font-display text-[clamp(0.7rem,2.4vw,0.95rem)] uppercase tracking-[0.38em] sm:tracking-[0.48em] text-king-gold font-bold italic mb-4 sm:mb-6">
          Premium Vehicles
        </p>
        <p className="font-display text-[clamp(1.65rem,6.5vw,3.35rem)] font-bold italic uppercase tracking-[0.06em] sm:tracking-[0.1em] text-white leading-[1.05] max-w-3xl drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)]">
          Luxury.{" "}
          <span className="text-king-red">Performance.</span>{" "}
          <span className="text-king-gold">Trust.</span>
        </p>
      </div>
    );
  }
);

export const CinematicHeroHint = forwardRef<HTMLDivElement>(
  function CinematicHeroHint(_, ref) {
    return (
      <div
        ref={ref}
        className="absolute bottom-8 sm:bottom-14 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none will-change-opacity"
        style={{ opacity: 1 }}
      >
        <ChevronDown className="w-5 h-5 text-king-gold animate-bounce" />
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.32em] text-neutral-400">
          Scroll to Explore
        </span>
      </div>
    );
  }
);

export const CinematicHeroOutro = forwardRef<HTMLDivElement>(
  function CinematicHeroOutro(_, ref) {
    return (
      <div
        ref={ref}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center px-5 sm:px-6 text-center pointer-events-none will-change-transform"
        style={{ opacity: 0 }}
      >
        <p className="font-welcome text-[clamp(2rem,8vw,4.25rem)] font-semibold tracking-[0.04em] text-king-gold mb-5 sm:mb-8 drop-shadow-[0_2px_20px_rgba(212,175,55,0.35)]">
          Welcome to
        </p>
        <BrandLogo
          size="hero"
          priority
          className="max-w-[min(88vw,480px)] w-full mx-auto !h-auto object-contain"
        />
        <p className="mt-6 sm:mt-9 text-base sm:text-xl md:text-2xl text-white font-bold tracking-wide">
          Your next vehicle starts here.
        </p>
      </div>
    );
  }
);
