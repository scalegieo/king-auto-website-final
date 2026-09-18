"use client";

import { motion } from "framer-motion";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DEALERSHIP } from "@/lib/dealership";

export function VisitSection() {
  return (
    <section id="visit" className="section-pad py-14 sm:py-20 md:py-28 bg-charcoal-950">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-king-gold mb-3">
            Visit Us
          </p>
          <h2 className="heading-display">Come see the lot.</h2>
          <p className="mt-4 text-neutral-400 text-base sm:text-lg max-w-md">
            Walk the inventory, sit in the VIP lounge, and leave with clarity —
            not pressure.
          </p>

          <div className="mt-8 space-y-4">
            <a
              href={DEALERSHIP.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 min-h-11 text-neutral-200 hover:text-king-gold transition-colors"
            >
              <MapPin className="w-5 h-5 text-king-red shrink-0 mt-0.5" />
              <span>
                {DEALERSHIP.addressLine1}
                <br />
                {DEALERSHIP.addressLine2}
              </span>
            </a>
            <a
              href={`tel:${DEALERSHIP.phoneTel}`}
              className="flex gap-3 min-h-11 items-center text-neutral-200 hover:text-king-gold transition-colors"
            >
              <Phone className="w-5 h-5 text-king-red shrink-0" />
              {DEALERSHIP.phoneDisplay}
            </a>
            <a
              href={`mailto:${DEALERSHIP.email}`}
              className="flex gap-3 min-h-11 items-center text-neutral-200 hover:text-king-gold transition-colors"
            >
              <Mail className="w-5 h-5 text-king-red shrink-0" />
              {DEALERSHIP.email}
            </a>
          </div>

          <div className="mt-8">
            <Button
              variant="primary"
              showPlus
              onClick={() =>
                window.open(DEALERSHIP.mapsUrl, "_blank", "noopener,noreferrer")
              }
            >
              Get Directions
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Card strong className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-king-gold" />
              <h3 className="text-lg font-semibold text-white">Hours</h3>
            </div>
            <ul className="space-y-3">
              {DEALERSHIP.hours.map((row) => (
                <li
                  key={row.day}
                  className="flex justify-between gap-4 border-b border-white/10 pb-2.5 last:border-0 last:pb-0"
                >
                  <span className="text-neutral-400">{row.day}</span>
                  <span
                    className={`font-medium text-right ${
                      row.time === "Closed" ? "text-neutral-500" : "text-white"
                    }`}
                  >
                    {row.time}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-start gap-2 text-sm text-neutral-400">
              <Navigation className="w-4 h-4 text-king-gold shrink-0 mt-0.5" />
              Easy access off Havana — parking on site.
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
