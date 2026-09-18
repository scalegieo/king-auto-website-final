"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

/** `leadCredit` must match LeadForm CREDIT_OPTIONS exactly for modal prefill. */
const CREDIT_TIERS = [
  {
    id: "excellent",
    label: "Excellent",
    apr: 0.0699,
    hint: "720+",
    leadCredit: "Excellent (720+)",
  },
  {
    id: "good",
    label: "Good",
    apr: 0.0999,
    hint: "680–719",
    leadCredit: "Good (680-719)",
  },
  {
    id: "fair",
    label: "Fair",
    apr: 0.1499,
    hint: "620–679",
    leadCredit: "Fair (620-679)",
  },
  {
    id: "rebuilding",
    label: "Rebuilding",
    apr: 0.1999,
    hint: "<620",
    leadCredit: "Building credit",
  },
] as const;

const TERM_MONTHS = 72;
const MIN_BUDGET = 200;
const MAX_BUDGET = 1200;
const BUDGET_STEP = 25;

function estimateVehiclePrice(monthly: number, apr: number, months: number) {
  if (monthly <= 0) return 0;
  const r = apr / 12;
  if (r <= 0) return monthly * months;
  const factor = (1 - Math.pow(1 + r, -months)) / r;
  return Math.round(monthly * factor);
}

function formatUsd(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export type PreQualifyPrefs = {
  vehicleInterest?: string;
  budget?: string;
  creditScore?: string;
};

interface PreQualifySectionProps {
  onPreApprove: (prefs?: PreQualifyPrefs | string) => void;
}

export function PreQualifySection({ onPreApprove }: PreQualifySectionProps) {
  const [budget, setBudget] = useState(400);
  const [tierId, setTierId] =
    useState<(typeof CREDIT_TIERS)[number]["id"]>("good");

  const tier = CREDIT_TIERS.find((t) => t.id === tierId) ?? CREDIT_TIERS[1];
  const estimate = useMemo(
    () => estimateVehiclePrice(budget, tier.apr, TERM_MONTHS),
    [budget, tier.apr]
  );

  const pct = ((budget - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100;

  return (
    <section
      id="financing"
      className="relative section-pad py-16 sm:py-20 md:py-28 border-t border-white/10 bg-charcoal-950"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-brand-glow opacity-70"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 sm:mb-12 text-center sm:text-left"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-king-gold mb-3">
            Get pre-qualified
          </p>
          <h2 className="heading-display">What can you afford?</h2>
          <p className="mt-4 max-w-2xl text-neutral-400 text-base sm:text-lg mx-auto sm:mx-0">
            Slide your monthly budget, pick a credit range, and see an estimated
            vehicle price — then get pre-approved in minutes. Soft pull when you
            apply with our team.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/10 bg-black/50 p-4 sm:p-8 md:p-10 backdrop-blur-sm"
        >
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-8">
              <div>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <label
                    htmlFor="monthly-budget"
                    className="text-sm font-semibold text-white"
                  >
                    Monthly budget
                  </label>
                  <p className="font-display text-2xl sm:text-3xl text-king-gold tracking-wide">
                    {formatUsd(budget)}
                    <span className="text-sm text-neutral-500 font-sans font-normal">
                      /mo
                    </span>
                  </p>
                </div>
                <input
                  id="monthly-budget"
                  type="range"
                  min={MIN_BUDGET}
                  max={MAX_BUDGET}
                  step={BUDGET_STEP}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="king-range w-full"
                  style={{
                    background: `linear-gradient(90deg, #CE1126 0%, #D4AF37 ${pct}%, #262626 ${pct}%)`,
                  }}
                  aria-valuemin={MIN_BUDGET}
                  aria-valuemax={MAX_BUDGET}
                  aria-valuenow={budget}
                  aria-label="Monthly payment budget"
                />
                <div className="mt-2 flex justify-between text-[11px] uppercase tracking-wider text-neutral-500">
                  <span>{formatUsd(MIN_BUDGET)}</span>
                  <span>{formatUsd(MAX_BUDGET)}</span>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-white">
                  Credit score
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CREDIT_TIERS.map((t) => {
                    const active = t.id === tierId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTierId(t.id)}
                        className={`min-h-12 rounded-xl border px-3 py-2.5 text-left transition-colors focus-ring ${
                          active
                            ? "border-king-gold bg-king-gold/15 text-king-gold"
                            : "border-white/15 bg-white/[0.03] text-neutral-300 hover:border-white/30"
                        }`}
                      >
                        <span className="block text-sm font-semibold">
                          {t.label}
                        </span>
                        <span className="block text-[10px] uppercase tracking-wider opacity-70">
                          {t.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-charcoal-900/80 p-6 sm:p-7 text-center lg:text-left">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2">
                Est. vehicle price
              </p>
              <p className="font-display text-[clamp(2.4rem,8vw,3.5rem)] font-bold text-white leading-none tracking-wide">
                {formatUsd(estimate)}
              </p>
              <p className="mt-3 text-sm text-neutral-400">
                APRs as low as{" "}
                <span className="text-king-gold font-semibold">
                  {(tier.apr * 100).toFixed(2)}%
                </span>{" "}
                · {TERM_MONTHS} months
              </p>
              <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
                Estimate only — final rate depends on lender approval, down
                payment, and term.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  className="w-full sm:flex-1 [&_button]:w-full"
                  onClick={() =>
                    onPreApprove({
                      budget: `~${formatUsd(budget)}/mo`,
                      creditScore: tier.leadCredit,
                      vehicleInterest: "Not sure yet",
                    })
                  }
                >
                  Get pre-approved
                </Button>
                <a
                  href="#inventory"
                  className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/20 px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:border-king-gold hover:text-king-gold focus-ring"
                >
                  Shop in budget
                </a>
              </div>
            </div>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-3 text-sm text-neutral-400 border-t border-white/10 pt-6">
            <li className="flex gap-2">
              <span className="text-king-red font-bold">01</span>
              Soft credit check when you apply with our team
            </li>
            <li className="flex gap-2">
              <span className="text-king-red font-bold">02</span>
              Multiple lenders — more paths to yes
            </li>
            <li className="flex gap-2">
              <span className="text-king-red font-bold">03</span>
              Same-day decisions on Havana St
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
