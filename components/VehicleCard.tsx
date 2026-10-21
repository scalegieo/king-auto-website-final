"use client";

import Link from "next/link";
import { Gauge, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { DEALERSHIP } from "@/lib/dealership";
import { formatMileage, formatPrice } from "@/lib/inventory/format";
import { vehicleHref, vehicleName } from "@/lib/inventory/slug";
import type { Vehicle } from "@/lib/inventory/types";
import { Card } from "@/components/ui/Card";

const PLACE = `${DEALERSHIP.city}, ${DEALERSHIP.region} ${DEALERSHIP.postalCode}`;

interface VehicleCardProps {
  vehicle: Vehicle;
  index?: number;
}

export function VehicleCard({ vehicle, index = 0 }: VehicleCardProps) {
  const title = vehicleName(vehicle);
  const href = vehicleHref(vehicle);
  const price = vehicle.price > 0 ? formatPrice(vehicle.price) : "Call";

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.24) }}
    >
      <Card className="group flex h-full flex-col overflow-hidden rounded-xl transition-colors hover:border-king-gold/40">
        <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-charcoal-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={vehicle.image}
            alt={`${title} for sale in ${PLACE}`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent" />
          {vehicle.status !== "available" && (
            <span className="absolute left-3 top-3 rounded-md border border-white/15 bg-charcoal-950/80 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white">
              {vehicle.status}
            </span>
          )}
          <span className="absolute bottom-3 left-3 text-2xl font-bold tracking-tight text-white">
            {price}
          </span>
        </Link>

        <div className="flex flex-1 flex-col gap-4 p-5">
          <div>
            <h3 className="text-lg font-semibold leading-snug text-white">
              <Link href={href} className="hover:text-king-gold">
                {title}
              </Link>
            </h3>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-neutral-400">
              <MapPin className="h-3.5 w-3.5 text-king-gold" aria-hidden />
              {PLACE}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-neutral-300">
            {vehicle.mileage > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-king-gold" aria-hidden />
                {formatMileage(vehicle.mileage)}
              </span>
            )}
            {vehicle.stockNumber && (
              <span className="text-neutral-400">Stock {vehicle.stockNumber}</span>
            )}
          </div>

          <div className="mt-auto pt-1">
            <Link
              href={href}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-king-red bg-king-red px-4 py-2.5 text-sm font-semibold text-white hover:bg-king-red-bright"
            >
              View {vehicle.year} {vehicle.make}
            </Link>
          </div>
        </div>
      </Card>
    </motion.article>
  );
}
