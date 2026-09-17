export type SpotType = 'EV' | 'COMPACT' | 'STANDARD';
export type VehicleType = 'EV' | 'COMPACT' | 'STANDARD';

export interface Spot {
  id: string;
  code: string;
  type: SpotType;
  isOccupied: boolean;
  currentPlate?: string;
  vehicleType?: VehicleType;
  entryTime?: string; // ISO string
  activeCharging?: boolean;
}

export interface TariffConfig {
  firstHourRate: number;      // e.g. 5.00
  subsequentHourRate: number; // e.g. 3.00
  dailyCap: number;           // e.g. 25.00
}

export interface GarageConfig {
  code: string;
  evSpots: number;
  compactSpots: number;
  standardSpots: number;
}

export interface FeeBreakdown {
  durationMinutes: number;
  billableHours: number;
  firstHourFee: number;
  subsequentHoursCount: number;
  subsequentHoursFee: number;
  uncappedFee: number;
  capAdjustment: number;
  totalFee: number;
}

export interface Ticket {
  id: string;
  plateNumber: string;
  vehicleType: VehicleType;
  spotId: string;
  spotCode: string;
  entryTime: string; // ISO string
  exitTime?: string; // ISO string
  feeBreakdown?: FeeBreakdown;
  totalFee?: number;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface AIParseResult {
  intent: 'CHECK_IN' | 'CHECK_OUT' | 'UNKNOWN';
  plateNumber?: string;
  vehicleType?: VehicleType;
  spotCode?: string;
  confidence: number;
  message: string;
}
