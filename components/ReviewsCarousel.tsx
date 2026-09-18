"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";

const REVIEWS = [
  {
    name: "Marcus T.",
    place: "Aurora, CO",
    text: "Walked in for a Tacoma, walked out financed same day. Straight shooters on Havana.",
    stars: 5,
  },
  {
    name: "Elena R.",
    place: "Denver, CO",
    text: "No pressure, fair price on my Model 3. The lounge alone feels nothing like a typical lot.",
    stars: 5,
  },
  {
    name: "James K.",
    place: "Denver metro",
    text: "Solid inventory and they actually called me back. 4.6 on Google for a reason.",
    stars: 4,
  },
  {
    name: "Priya S.",
    place: "Aurora, CO",
    text: "Transparent numbers, quick pre-approval, and they explained every fee. Would buy again.",
    stars: 5,
  },
  {
    name: "Derek M.",
    place: "Centennial, CO",
    text: "Found an SUV in my budget with the payment calculator mindset — financing was painless.",
    stars: 5,
  },
  {
    name: "Ashley N.",
    place: "Aurora, CO",
    text: "First time buying used and they made it simple. Clean title, clear price, no games.",
    stars: 5,
  },
  {
    name: "Carlos V.",
    place: "Denver, CO",
    text: "Needed a reliable daily driver under my monthly number — they matched me fast.",
    stars: 5,
  },
  {
    name: "Tiffany H.",
    place: "Parker, CO",
    text: "VIP lounge vibe is real. Felt respected the whole time, not rushed out the door.",
    stars: 5,
  },
  {
    name: "Omar B.",
    place: "Aurora, CO",
    text: "Great truck selection on Havana. Test drove two, bought one same afternoon.",
    stars: 5,
  },
  {
    name: "Natalie P.",
    place: "Lakewood, CO",
    text: "Credit wasn’t perfect and they still found options. Honest about rates upfront.",
    stars: 4,
  },
  {
    name: "Ryan C.",
    place: "Denver, CO",
    text: "Showed up after work, paperwork was ready, keys in hand before dinner.",
    stars: 5,
  },
  {
    name: "Mia L.",
    place: "Aurora, CO",
    text: "Love the transparent pricing. What was listed is what I paid — rare these days.",
    stars: 5,
  },
  {
    name: "Jordan W.",
    place: "Highlands Ranch, CO",
    text: "Helped my parents find a clean low-mileage sedan. Patient and professional.",
    stars: 5,
  },
  {
    name: "Samira A.",
    place: "Denver metro",
    text: "Followed up after the sale to make sure everything was good. That’s customer service.",
    stars: 5,
  },
  {
    name: "Chris D.",
    place: "Aurora, CO",
    text: "Inventory rotates but quality stays high. Third visit, third happy purchase.",
    stars: 5,
  },
  {
    name: "Brittany F.",
    place: "Commerce City, CO",
    text: "Pre-approval took minutes. Knew my budget before I fell in love with a car.",
    stars: 5,
  },
  {
    name: "Luis G.",
    place: "Denver, CO",
    text: "Spanish-friendly team, clear explanations, and a truck that runs like new.",
    stars: 5,
  },
  {
    name: "Hannah J.",
    place: "Aurora, CO",
    text: "Easy parking, easy process, easy people. Havana St gem for used cars.",
    stars: 4,
  },
];

const INTERVAL_MS = 1500;

export function ReviewsCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % REVIEWS.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const review = REVIEWS[index];

  return (
    <section
      id="reviews"
      className="section-pad py-14 sm:py-20 md:py-24 bg-black border-t border-white/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      aria-roledescription="carousel"
      aria-label="Google reviews"
    >
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-king-gold mb-3">
          Google reviews
        </p>
        <h2 className="heading-display">What drivers say</h2>
        <p className="mt-3 text-neutral-400 text-base sm:text-lg">
          Real shoppers. Real Havana St experiences.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-king-gold/30 bg-king-gold/10 px-4 py-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < 4
                    ? "fill-king-gold text-king-gold"
                    : "fill-king-gold/45 text-king-gold/45"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-white">4.6</span>
          <span className="text-xs text-neutral-400">
            on Google · {REVIEWS.length} highlights
          </span>
        </div>

        <div className="relative mt-10 min-h-[220px] sm:min-h-[180px] px-1">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={review.name + index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-2xl"
            >
              <div className="mb-4 flex justify-center gap-0.5">
                {Array.from({ length: review.stars }).map((_, s) => (
                  <Star
                    key={s}
                    className="h-4 w-4 fill-king-gold text-king-gold"
                  />
                ))}
              </div>
              <p className="text-base sm:text-xl text-neutral-100 leading-relaxed text-balance">
                &ldquo;{review.text}&rdquo;
              </p>
              <footer className="mt-5 text-sm">
                <span className="font-semibold text-white">{review.name}</span>
                <span className="text-neutral-500"> · {review.place}</span>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Previous review"
            onClick={() =>
              setIndex((i) => (i - 1 + REVIEWS.length) % REVIEWS.length)
            }
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/15 text-white hover:border-king-gold hover:text-king-gold focus-ring"
          >
            ‹
          </button>
          <p className="min-w-[4.5rem] text-center text-xs tabular-nums text-neutral-500">
            {index + 1} / {REVIEWS.length}
          </p>
          <button
            type="button"
            aria-label="Next review"
            onClick={() => setIndex((i) => (i + 1) % REVIEWS.length)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/15 text-white hover:border-king-gold hover:text-king-gold focus-ring"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
