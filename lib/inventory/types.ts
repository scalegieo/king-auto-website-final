export type VehicleStatus = "available" | "pending" | "sold";

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  image: string;
  status: VehicleStatus;
  trim?: string;
  vin?: string;
  stockNumber?: string;
}
