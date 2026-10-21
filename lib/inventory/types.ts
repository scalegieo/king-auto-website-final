export type VehicleStatus = "available" | "pending" | "sold";

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  image: string;
  images?: string[];
  status: VehicleStatus;
  trim?: string;
  vin?: string;
  stockNumber?: string;
  /** URL slug, e.g. 2021-dodge-charger-scat-pack-rwd */
  slug?: string;
  /** Short marketing line from the dealer listing */
  headline?: string;
  drivetrain?: string;
  transmission?: string;
  exteriorColor?: string;
  interiorColor?: string;
  engine?: string;
  mpgCity?: number;
  mpgHighway?: number;
}
