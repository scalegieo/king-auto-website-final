"use client";

import Link from "next/link";
import { Car, CreditCard, MapPinned } from "lucide-react";
import { Card } from "@/components/ui/Card";

const ACTIONS = [
  {
    href: "#inventory",
    label: "Inventory",
    desc: "See what’s on the lot today",
    icon: Car,
  },
  {
    href: "#financing",
    label: "Get Financed",
    desc: "Start your application online",
    icon: CreditCard,
  },
  {
    href: "#visit",
    label: "Visit Us",
    desc: "Hours, map & directions",
    icon: MapPinned,
  },
];

export function QuickActions() {
  return (
    <section className="section-pad py-10 sm:py-14 md:py-16 bg-charcoal-900 border-b border-white/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {ACTIONS.map((action) => (
          <Link key={action.href} href={action.href} className="group focus-ring rounded-xl">
            <Card className="h-full p-6 transition-colors duration-300 hover:border-king-gold/35">
              <action.icon className="w-6 h-6 text-king-red mb-4" />
              <h3 className="text-lg font-semibold text-white group-hover:text-king-gold transition-colors">
                {action.label}
              </h3>
              <p className="mt-2 text-sm text-neutral-400">{action.desc}</p>
              <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-king-gold">
                Learn more →
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
