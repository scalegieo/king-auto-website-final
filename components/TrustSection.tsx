"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  MapPin,
  Star,
  Wallet,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

const TRUST_CARDS = [
  {
    icon: MapPin,
    title: "Havana St Location",
    body: "Easy access at 2180 S Havana St, Aurora — right in the Denver metro corridor.",
  },
  {
    icon: BadgeCheck,
    title: "Transparent Pricing",
    body: "What you see is what you drive. No mystery fees — just clear numbers on every car.",
  },
  {
    icon: Zap,
    title: "Fast Financing",
    body: "Pre-approval in minutes. Multiple lenders so more shoppers get to yes.",
  },
];

const REVIEWS = [
  {
    name: "Marcus T.",
    text: "Walked in for a Tacoma, walked out financed same day. Straight shooters on Havana.",
    stars: 5,
  },
  {
    name: "Elena R.",
    text: "No pressure, fair price on my Model 3. The lounge alone feels nothing like a typical lot.",
    stars: 5,
  },
  {
    name: "James K.",
    text: "Solid inventory and they actually called me back. 4.6 on Google for a reason.",
    stars: 4,
  },
];

export function TrustSection() {
  return (
    <section id="about" className="section-pad py-20 sm:py-28 bg-brand-glow">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 sm:mb-16"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-king-gold mb-3">
            Why King Auto?
          </p>
          <h2 className="heading-display text-4xl sm:text-5xl lg:text-6xl max-w-3xl">
            Denver trust. Dealership energy.
          </h2>
          <p className="mt-4 max-w-2xl text-neutral-400 text-lg">
            About Us — we&apos;re a Havana Street team built for drivers who want
            clarity, speed, and a showroom that feels premium.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {TRUST_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full p-6 sm:p-7 hover:border-king-gold/40 transition-colors duration-300">
                <card.icon className="w-7 h-7 text-king-red mb-5" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-neutral-400 leading-relaxed">{card.body}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-8 items-start">
          <Card strong className="p-6 sm:p-7 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-king-gold/15 text-king-gold mb-4">
              <Star className="w-6 h-6 fill-king-gold" />
            </div>
            <p className="text-4xl font-bold text-white tracking-tight">4.6</p>
            <div className="flex justify-center lg:justify-start gap-0.5 my-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < 4
                      ? "fill-king-gold text-king-gold"
                      : "fill-king-gold/40 text-king-gold/40"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-neutral-300 font-medium">
              Stars on Google
            </p>
            <p className="mt-2 text-xs text-neutral-500 flex items-center justify-center lg:justify-start gap-1">
              <Wallet className="w-3.5 h-3.5" />
              Verified local reviews
            </p>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {REVIEWS.map((review, i) => (
              <motion.blockquote
                key={review.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.07 }}
              >
                <Card className="h-full p-5 flex flex-col">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: review.stars }).map((_, s) => (
                      <Star
                        key={s}
                        className="w-3.5 h-3.5 fill-king-gold text-king-gold"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed flex-1">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <footer className="mt-4 text-xs font-semibold uppercase tracking-wider text-white">
                    {review.name}
                  </footer>
                </Card>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
