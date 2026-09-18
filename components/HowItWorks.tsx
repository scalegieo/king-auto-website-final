"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Car, CreditCard, KeyRound } from "lucide-react";
import { DEALERSHIP } from "@/lib/dealership";

const STEPS = [
  {
    n: "01",
    title: "Browse & select",
    body: "Explore live Havana St inventory — trucks, SUVs, and daily drivers with clear pricing.",
    href: "#inventory",
    icon: Car,
  },
  {
    n: "02",
    title: "Get pre-approved",
    body: "Check what you can afford with the budget slider, then submit a fast pre-approval.",
    href: "#financing",
    icon: CreditCard,
  },
  {
    n: "03",
    title: "Drive it home",
    body: `Visit ${DEALERSHIP.addressLine1}, finalize paperwork, and leave with keys — not pressure.`,
    href: "#visit",
    icon: KeyRound,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="section-pad py-14 sm:py-20 md:py-24 bg-charcoal-900 border-t border-white/10"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 sm:mb-14 max-w-2xl"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-king-gold mb-3">
            Simple process
          </p>
          <h2 className="heading-display">Your next car in 3 steps</h2>
          <p className="mt-4 text-neutral-400 text-base sm:text-lg">
            Built to keep you moving — from the lot list to financing to the
            driveway.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={step.href}
                className="group block h-full rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-7 transition-colors hover:border-king-gold/40 focus-ring min-h-[11rem]"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="font-display text-3xl text-king-red/90 tracking-wide">
                    {step.n}
                  </span>
                  <step.icon className="h-6 w-6 text-king-gold opacity-80 group-hover:opacity-100" />
                </div>
                <h3 className="text-xl font-semibold text-white group-hover:text-king-gold transition-colors">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  {step.body}
                </p>
                <span className="mt-5 inline-block text-xs font-semibold uppercase tracking-wider text-king-gold">
                  Continue →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
