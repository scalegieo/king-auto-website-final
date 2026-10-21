"use client";

import { useState } from "react";
import Link from "next/link";
import { Gauge, MapPin, Phone, Tag } from "lucide-react";
import { DEALERSHIP } from "@/lib/dealership";
import { formatMileage, formatPrice } from "@/lib/inventory/format";
import { vehicleName } from "@/lib/inventory/slug";
import type { Vehicle } from "@/lib/inventory/types";
import type { RelatedCard } from "@/lib/seo-system/related";
import { useOpenFinance } from "@/components/MarketingShell";

const PLACE = `${DEALERSHIP.city}, ${DEALERSHIP.region} ${DEALERSHIP.postalCode}`;

export function VehicleDetail({
  vehicle,
  related = [],
}: {
  vehicle: Vehicle;
  related?: RelatedCard[];
}) {
  const openFinance = useOpenFinance();
  const photos = vehicle.images?.length ? vehicle.images : [vehicle.image];
  const [active, setActive] = useState(0);
  const name = vehicleName(vehicle);
  const price = vehicle.price > 0 ? formatPrice(vehicle.price) : "Call for price";
  const photo = photos[Math.min(active, photos.length - 1)];

  const specs = [
    ["Year", String(vehicle.year)],
    ["Make", vehicle.make],
    ["Model", vehicle.model],
    ["Trim", vehicle.trim],
    ["Price", price],
    ["Mileage", vehicle.mileage > 0 ? formatMileage(vehicle.mileage) : undefined],
    ["Stock", vehicle.stockNumber],
    ["VIN", vehicle.vin],
    ["Drivetrain", vehicle.drivetrain],
    ["Transmission", vehicle.transmission],
    ["Engine", vehicle.engine],
    ["Exterior", vehicle.exteriorColor],
    ["Interior", vehicle.interiorColor],
    ["MPG", mpgLabel(vehicle)],
    ["ZIP code", DEALERSHIP.postalCode],
    ["City", `${DEALERSHIP.city}, ${DEALERSHIP.region}`],
    ["Location", `${DEALERSHIP.addressLine1}, ${DEALERSHIP.addressLine2}`],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <article className="bg-black pt-24 sm:pt-28">
      <div className="section-pad mx-auto max-w-[1400px] pb-16 sm:pb-24">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-neutral-400">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href="/" className="hover:text-king-gold">
                King Auto Inc.
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/inventory" className="hover:text-king-gold">
                Used cars in {PLACE}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-neutral-200">{name}</li>
          </ol>
        </nav>

        <p className="font-display text-[0.65rem] uppercase tracking-[0.35em] text-king-gold sm:text-xs">
          For sale in {PLACE}
        </p>
        <h1 className="mt-3 max-w-4xl font-display text-[clamp(1.8rem,5vw,3.4rem)] font-bold uppercase leading-[0.95] tracking-[0.02em] text-white">
          {name}
        </h1>
        <p className="mt-3 text-sm text-neutral-300 sm:text-base">
          Used
          {vehicle.mileage > 0 ? ` · ${formatMileage(vehicle.mileage)}` : ""}
          {vehicle.price > 0 ? ` · ${price}` : ""}
          {` · ${PLACE}`}
        </p>
        {vehicle.headline && (
          <p className="mt-4 max-w-3xl text-base text-neutral-300 sm:text-lg">
            {vehicle.headline}
          </p>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)] lg:items-start">
          <div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-charcoal-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt={`${name} for sale in ${PLACE} at King Auto Inc.`}
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
            {photos.length > 1 && (
              <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {photos.map((src, index) => (
                  <li key={src}>
                    <button
                      type="button"
                      onClick={() => setActive(index)}
                      className={`overflow-hidden rounded-lg border ${
                        index === active
                          ? "border-king-gold"
                          : "border-white/10 hover:border-white/30"
                      }`}
                      aria-label={`Photo ${index + 1} of ${name}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        className="aspect-[16/10] w-full object-cover"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="rounded-2xl border border-white/10 bg-charcoal-950 p-5 sm:p-6">
            <p className="text-3xl font-bold text-white">{price}</p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-neutral-300">
              <MapPin className="h-4 w-4 text-king-gold" aria-hidden />
              {DEALERSHIP.addressLine1}, {PLACE}
            </p>
            <dl className="mt-5 divide-y divide-white/10 border-y border-white/10">
              {specs.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5 text-sm">
                  <dt className="text-neutral-400">{label}</dt>
                  <dd className="text-right text-white">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex flex-col gap-3">
              <a
                href={`tel:${DEALERSHIP.phoneTel}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-king-red bg-king-red px-4 py-3 text-sm font-semibold text-white hover:bg-king-red-bright"
              >
                <Phone className="h-4 w-4" aria-hidden />
                Call {DEALERSHIP.phoneDisplay}
              </a>
              <button
                type="button"
                onClick={openFinance}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-king-gold bg-king-gold px-4 py-3 text-sm font-semibold text-charcoal-950 hover:bg-king-gold-bright"
              >
                Get financed on this {vehicle.year} {vehicle.make}
              </button>
              <Link
                href="/#financing"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:border-king-gold hover:text-king-gold"
              >
                Financing
              </Link>
              <a
                href={DEALERSHIP.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:border-king-gold hover:text-king-gold"
              >
                Visit the Havana St lot
              </a>
            </div>
          </aside>
        </div>

        <section className="mt-12 max-w-3xl">
          <h2 className="font-display text-2xl uppercase tracking-wide text-white sm:text-3xl">
            {vehicle.year} {vehicle.make} {vehicle.model} in {PLACE}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-300">
            This used {name} is for sale at {DEALERSHIP.name} in {PLACE}.
            {vehicle.mileage > 0
              ? ` It shows ${formatMileage(vehicle.mileage)}.`
              : ""}
            {vehicle.price > 0 ? ` Listed at ${formatPrice(vehicle.price)}.` : ""}
            {vehicle.stockNumber ? ` Stock number ${vehicle.stockNumber}.` : ""}
            {vehicle.vin ? ` VIN ${vehicle.vin}.` : ""}{" "}
            The dealership is at {DEALERSHIP.addressLine1}, {DEALERSHIP.addressLine2},
            serving Denver and Aurora. Call {DEALERSHIP.phoneDisplay} to confirm
            availability on this {vehicle.year} {vehicle.make} {vehicle.model}.
          </p>
          <ul className="mt-6 flex flex-wrap gap-3 text-sm text-neutral-200">
            <li className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5">
              <Tag className="h-4 w-4 text-king-gold" aria-hidden />
              {vehicle.year} {vehicle.make} {vehicle.model}
            </li>
            {vehicle.mileage > 0 && (
              <li className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5">
                <Gauge className="h-4 w-4 text-king-gold" aria-hidden />
                {formatMileage(vehicle.mileage)}
              </li>
            )}
            <li className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5">
              <MapPin className="h-4 w-4 text-king-gold" aria-hidden />
              {PLACE}
            </li>
          </ul>
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl uppercase tracking-wide text-white">
              More on the lot
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-xl border border-white/10 px-4 py-3 hover:border-king-gold/50"
                  >
                    <span className="block font-medium text-white">{item.name}</span>
                    <span className="mt-1 block text-sm text-neutral-400">
                      {item.mileage ? `${formatMileage(item.mileage)}` : "Mileage not listed"}
                      {item.price ? ` · ${formatPrice(item.price)}` : ""}
                      {` · ${PLACE}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}

function mpgLabel(vehicle: Vehicle): string | undefined {
  if (!vehicle.mpgCity && !vehicle.mpgHighway) return undefined;
  if (vehicle.mpgCity && vehicle.mpgHighway) {
    return `${vehicle.mpgCity} city / ${vehicle.mpgHighway} hwy`;
  }
  return String(vehicle.mpgCity || vehicle.mpgHighway);
}
