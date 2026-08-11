"use client";

import Image from "next/image";
import { Gauge, Tag } from "lucide-react";
import { motion } from "framer-motion";
import type { Vehicle } from "@/lib/api";
import { formatMileage, formatPrice } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface VehicleCardProps {
  vehicle: Vehicle;
  onApply?: (vehicle: Vehicle) => void;
  index?: number;
}

export function VehicleCard({ vehicle, onApply, index = 0 }: VehicleCardProps) {
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3) }}
    >
      <Card className="group overflow-hidden rounded-xl h-full flex flex-col transition-colors hover:border-king-gold/40">
        <div className="relative aspect-[16/10] overflow-hidden bg-charcoal-800">
          <Image
            src={vehicle.image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent" />
          {vehicle.status !== "available" && (
            <span className="absolute top-3 left-3 rounded-md bg-charcoal-950/80 border border-white/15 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white">
              {vehicle.status}
            </span>
          )}
          <span className="absolute bottom-3 left-3 text-2xl font-bold text-white tracking-tight">
            {formatPrice(vehicle.price)}
          </span>
        </div>

        <div className="flex flex-col flex-1 p-5 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white leading-snug">
              {title}
            </h3>
            {vehicle.trim && (
              <p className="mt-1 text-sm text-neutral-400">{vehicle.trim}</p>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-neutral-300">
            <span className="inline-flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-king-gold" aria-hidden />
              {formatMileage(vehicle.mileage)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-king-gold" aria-hidden />
              {vehicle.make}
            </span>
          </div>

          <div className="mt-auto pt-1">
            <Button
              variant="primary"
              className="w-full sm:w-auto [&_button]:flex-1 sm:[&_button]:flex-none"
              onClick={() => onApply?.(vehicle)}
            >
              Shop Now
            </Button>
          </div>
        </div>
      </Card>
    </motion.article>
  );
}
