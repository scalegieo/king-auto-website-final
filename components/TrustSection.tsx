"use client";

import { motion } from "framer-motion";
import { BadgeCheck, MapPin, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DEALERSHIP } from "@/lib/dealership";

const TRUST_CARDS = [
  {
    icon: MapPin,
    title: "Havana St Location",
    body: `Easy access at ${DEALERSHIP.addressLine1}, Aurora — right in the Denver metro corridor.`,
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

export function TrustSection() {
  return (
    <section id="about" className="section-pad py-16 sm:py-24 md:py-28 bg-brand-glow">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 sm:mb-14"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-king-gold mb-3">
            Why King Auto?
          </p>
          <h2 className="heading-display max-w-3xl">
            Denver trust. Dealership energy.
          </h2>
          <p className="mt-4 max-w-2xl text-neutral-400 text-base sm:text-lg">
            About Us — we&apos;re a Havana Street team built for drivers who want
            clarity, speed, and a showroom that feels premium. Keep scrolling for
            real Google reviews and directions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
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
      </div>
    </section>
  );
}
