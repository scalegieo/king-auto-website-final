import { DEALERSHIP, SITE_URL } from "@/lib/dealership";
import { formatMileage, formatPrice } from "@/lib/inventory/format";
import { vehicleHref, vehicleName } from "@/lib/inventory/slug";
import type { Vehicle } from "@/lib/inventory/types";

const PLACE = `${DEALERSHIP.city}, ${DEALERSHIP.region} ${DEALERSHIP.postalCode}`;

export function vehicleSeoTitle(vehicle: Vehicle): string {
  const place = `for Sale in ${PLACE}`;
  const withTrim = `${vehicleName(vehicle)} ${place}`;
  if (withTrim.length <= 68) return withTrim;
  return `${vehicle.year} ${vehicle.make} ${vehicle.model} ${place}`;
}

export function vehicleSeoDescription(vehicle: Vehicle): string {
  const name = vehicleName(vehicle);
  const price =
    vehicle.price > 0 ? formatPrice(vehicle.price) : "call for price";
  const miles =
    vehicle.mileage > 0 ? formatMileage(vehicle.mileage) : "mileage on request";
  const stock = vehicle.stockNumber ? ` Stock ${vehicle.stockNumber}.` : "";
  const vin = vehicle.vin ? ` VIN ${vehicle.vin}.` : "";

  return (
    `Used ${name} for sale in ${PLACE} at King Auto Inc. ` +
    `${miles}, ${price}.${stock}${vin} ` +
    `${DEALERSHIP.addressLine1}, ${DEALERSHIP.addressLine2}. ` +
    `Denver metro. Call ${DEALERSHIP.phoneDisplay}.`
  );
}

export function vehicleKeywords(vehicle: Vehicle): string[] {
  const name = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const zip = DEALERSHIP.postalCode;
  return [
    name,
    vehicleName(vehicle),
    `${vehicle.make} ${vehicle.model} for sale`,
    `${vehicle.make} ${vehicle.model} ${PLACE}`,
    `${name} ${zip}`,
    `used ${vehicle.make} ${vehicle.model} Denver`,
    `used ${vehicle.make} ${vehicle.model} Aurora CO`,
    `${vehicle.make} ${zip}`,
    vehicle.stockNumber ? `stock ${vehicle.stockNumber}` : "",
    vehicle.vin || "",
    "King Auto Inc",
    "used cars Aurora CO",
    "Havana St",
    zip,
  ].filter(Boolean);
}

export function vehicleCanonical(vehicle: Vehicle): string {
  return `${SITE_URL}${vehicleHref(vehicle)}`;
}

export function vehicleJsonLd(vehicle: Vehicle) {
  const url = vehicleCanonical(vehicle);
  const images = (vehicle.images?.length ? vehicle.images : [vehicle.image]).filter(
    Boolean
  );
  const offer: Record<string, unknown> = {
    "@type": "Offer",
    url,
    priceCurrency: "USD",
    availability:
      vehicle.status === "pending"
        ? "https://schema.org/LimitedAvailability"
        : "https://schema.org/InStock",
    itemCondition: "https://schema.org/UsedCondition",
    seller: { "@id": `${SITE_URL}/#dealership` },
    areaServed: {
      "@type": "City",
      name: DEALERSHIP.city,
      containedInPlace: {
        "@type": "State",
        name: DEALERSHIP.regionName,
      },
    },
    availableAtOrFrom: {
      "@type": "AutoDealer",
      name: DEALERSHIP.name,
      telephone: DEALERSHIP.phoneSchema,
      address: {
        "@type": "PostalAddress",
        streetAddress: DEALERSHIP.addressLine1,
        addressLocality: DEALERSHIP.city,
        addressRegion: DEALERSHIP.region,
        postalCode: DEALERSHIP.postalCode,
        addressCountry: DEALERSHIP.country,
      },
    },
  };
  if (vehicle.price > 0) offer.price = vehicle.price;

  const car: Record<string, unknown> = {
    "@type": "Car",
    "@id": `${url}#vehicle`,
    name: vehicleName(vehicle),
    url,
    brand: { "@type": "Brand", name: vehicle.make },
    manufacturer: { "@type": "Organization", name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    itemCondition: "https://schema.org/UsedCondition",
    image: images,
    description: vehicleSeoDescription(vehicle),
    offers: offer,
  };

  if (vehicle.trim) car.vehicleConfiguration = vehicle.trim;
  if (vehicle.vin) car.vehicleIdentificationNumber = vehicle.vin;
  if (vehicle.exteriorColor) car.color = vehicle.exteriorColor;
  if (vehicle.interiorColor) car.vehicleInteriorColor = vehicle.interiorColor;
  if (vehicle.drivetrain) car.driveWheelConfiguration = vehicle.drivetrain;
  if (vehicle.engine) {
    car.vehicleEngine = { "@type": "EngineSpecification", name: vehicle.engine };
  }
  if (vehicle.transmission) car.vehicleTransmission = vehicle.transmission;
  if (vehicle.mileage > 0) {
    car.mileageFromOdometer = {
      "@type": "QuantitativeValue",
      value: vehicle.mileage,
      unitCode: "SMI",
    };
  }

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "King Auto Inc.",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `Used Cars ${PLACE}`,
        item: `${SITE_URL}/inventory`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: vehicleName(vehicle),
        item: url,
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [car, breadcrumb],
  };
}

export function inventoryJsonLd(vehicles: Vehicle[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Used cars for sale in ${PLACE}`,
    numberOfItems: vehicles.length,
    itemListElement: vehicles.map((vehicle, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: vehicleCanonical(vehicle),
      name: vehicleName(vehicle),
    })),
  };
}
