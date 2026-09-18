"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Maximize2 } from "lucide-react";

const DEALR_INVENTORY_SRC = "https://staging.dealr.website/39483";

export function InventoryGrid() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);

  const backToLot = useCallback(() => {
    const frame = iframeRef.current;
    if (frame) {
      try {
        frame.src = DEALR_INVENTORY_SRC;
      } catch {
        setIframeKey((k) => k + 1);
      }
    } else {
      setIframeKey((k) => k + 1);
    }
  }, []);

  return (
    <section
      id="inventory"
      className="relative border-y border-white/[0.06] bg-black"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-brand-glow opacity-80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[min(100%,40rem)] -translate-x-1/2 rounded-full bg-king-red/15 blur-[90px]"
        aria-hidden
      />

      {/* Header stays padded; iframe goes full-bleed on mobile */}
      <div className="relative section-pad pt-12 pb-6 sm:pt-16 sm:pb-8 md:pt-24">
        <div className="mx-auto max-w-[1400px]">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-king-gold/35 bg-king-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-king-gold">
                <span className="relative flex h-1.5 w-1.5" aria-hidden>
                  <span className="absolute inset-0 animate-ping rounded-full bg-king-red opacity-70" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-king-red" />
                </span>
                Live on lot
              </span>
              <p className="font-display text-[0.65rem] uppercase tracking-[0.35em] text-neutral-400 sm:text-xs">
                Havana St inventory
              </p>
            </div>

            <h2 className="font-display text-[clamp(2rem,8vw,4.25rem)] font-bold italic uppercase leading-[0.95] tracking-[0.02em] text-white">
              The lot.{" "}
              <span className="text-king-red">Updated</span>{" "}
              <span className="text-king-gold">live.</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-400 sm:mt-4 sm:text-base">
              Browse, open a vehicle, then use{" "}
              <span className="text-neutral-200">Back to lot</span> anytime —
              especially on phones.
            </p>
          </motion.header>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto w-full max-w-[1400px] sm:px-8 lg:px-12 xl:px-16 sm:pb-16 md:pb-24"
      >
        {/* Controls — always outside iframe so never covered */}
        <div className="flex items-center gap-2 border-y border-white/10 bg-charcoal-950 px-3 py-2.5 sm:rounded-t-2xl sm:border sm:border-b-0 sm:border-white/10 sm:px-4">
          <button
            type="button"
            onClick={backToLot}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:border-king-gold/50 hover:text-king-gold focus-ring sm:flex-none sm:px-4"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            Back to lot
          </button>
          <a
            href={DEALR_INVENTORY_SRC}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-king-gold/30 bg-king-gold/10 px-3 py-2.5 text-sm font-semibold text-king-gold transition-colors hover:bg-king-gold/20 focus-ring sm:px-4"
          >
            <Maximize2 className="h-4 w-4 shrink-0 sm:hidden" aria-hidden />
            <ExternalLink className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden />
            <span className="sm:hidden">Full screen</span>
            <span className="hidden sm:inline">Open full inventory</span>
          </a>
        </div>

        {/* Full-bleed on mobile = less “zoomed”, Dealr UI fits */}
        <div className="relative bg-charcoal-900 sm:overflow-hidden sm:rounded-b-2xl sm:border sm:border-t-0 sm:border-white/10">
          <div className="h-0.5 w-full bg-gradient-to-r from-king-red via-king-gold to-king-red sm:hidden" />
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={DEALR_INVENTORY_SRC}
            title="Vehicle Inventory"
            className="block w-full border-0 bg-charcoal-900 h-[100dvh] sm:h-[min(110dvh,1000px)] md:h-[min(120dvh,1100px)]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allow="fullscreen"
          />
          <div
            className="hidden h-1 w-full bg-gradient-to-r from-king-red via-king-gold to-king-red sm:block"
            aria-hidden
          />
        </div>
      </motion.div>
    </section>
  );
}
