"use client";

import { useMemo, useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import type { Vehicle } from "@/lib/api";
import { VehicleCard } from "@/components/VehicleCard";

interface InventoryGridProps {
  vehicles: Vehicle[];
  onApply: (vehicle: Vehicle) => void;
}

export function InventoryGrid({ vehicles, onApply }: InventoryGridProps) {
  const makes = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.make))).sort(),
    [vehicles]
  );

  const [make, setMake] = useState("all");
  const [model, setModel] = useState("");
  const [priceMax, setPriceMax] = useState(50000);
  const [yearMin, setYearMin] = useState(2015);

  const models = useMemo(() => {
    const pool =
      make === "all" ? vehicles : vehicles.filter((v) => v.make === make);
    return Array.from(new Set(pool.map((v) => v.model))).sort();
  }, [vehicles, make]);

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (make !== "all" && v.make !== make) return false;
      if (model && v.model !== model) return false;
      if (v.price > priceMax) return false;
      if (v.year < yearMin) return false;
      return true;
    });
  }, [vehicles, make, model, priceMax, yearMin]);

  return (
    <section id="inventory" className="relative section-pad py-14 sm:py-20 md:py-28">
      <div className="absolute inset-0 bg-brand-glow pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 sm:mb-14"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-king-gold mb-3">
            Live inventory
          </p>
          <h2 className="heading-display">
            Ready when you are.
          </h2>
          <p className="mt-4 max-w-2xl text-neutral-400 text-base sm:text-lg">
            Active units from your Dealr inventory export — updated on a regular
            schedule. Filter by make, model, price, and year.
          </p>
        </motion.div>

        {/* Filter bar */}
        <div className="glass rounded-xl p-4 sm:p-5 mb-10">
          <div className="flex items-center gap-2 mb-4 text-sm text-neutral-300">
            <SlidersHorizontal className="w-4 h-4 text-king-gold" />
            <span className="font-medium">Filter inventory</span>
            <span className="ml-auto text-xs text-neutral-500">
              {filtered.length} vehicles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="block">
              <span className="sr-only">Make</span>
              <select
                value={make}
                onChange={(e) => {
                  setMake(e.target.value);
                  setModel("");
                }}
                className="w-full rounded-lg bg-charcoal-950/70 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-king-gold"
              >
                <option value="all">All makes</option>
                {makes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="sr-only">Model</span>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg bg-charcoal-950/70 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-king-gold"
              >
                <option value="">All models</option>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] uppercase tracking-wider text-neutral-500">
                Max price · ${priceMax.toLocaleString()}
              </span>
              <input
                type="range"
                min={8000}
                max={50000}
                step={1000}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-king-red"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] uppercase tracking-wider text-neutral-500">
                Min year · {yearMin}
              </span>
              <input
                type="range"
                min={2010}
                max={2026}
                step={1}
                value={yearMin}
                onChange={(e) => setYearMin(Number(e.target.value))}
                className="w-full accent-king-red"
              />
            </label>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Filter className="mx-auto w-8 h-8 text-neutral-500 mb-3" />
            <p className="text-neutral-300">
              No vehicles match those filters.
            </p>
            <a
              href="#car-request"
              className="mt-4 inline-block text-sm font-medium text-king-gold hover:text-white transition-colors"
            >
              Tell us what you&apos;re looking for →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {filtered.map((vehicle, i) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                index={i}
                onApply={onApply}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
