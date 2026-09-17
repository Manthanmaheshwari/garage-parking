import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import type { Spot, Ticket, TariffConfig, GarageConfig, VehicleType, SpotType } from '../types/parking';
import { calculateParkingFee } from '../utils/tariffCalculator';

interface GarageContextType {
  spots: Spot[];
  tickets: Ticket[];
  tariffConfig: TariffConfig;
  garageConfig: GarageConfig;
  checkInVehicle: (plateNumber: string, vehicleType: VehicleType, requestedSpotId?: string) => Promise<{ success: boolean; message: string; ticket?: Ticket }>;
  checkOutVehicle: (identifier: string) => Promise<{ success: boolean; message: string; ticket?: Ticket }>;
  updateTariffConfig: (config: TariffConfig) => Promise<void>;
  updateGarageConfig: (config: GarageConfig) => Promise<void>;
  resetToDefaults: () => void;
  refetchAvailability: () => Promise<void>;
}

const API_BASE = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const DEFAULT_TARIFF: TariffConfig = {
  firstHourRate: 50.00,
  subsequentHourRate: 30.00,
  dailyCap: 250.00,
};

const DEFAULT_GARAGE_CONFIG: GarageConfig = {
  code: 'AURIGA-01',
  evSpots: 5,
  compactSpots: 5,
  standardSpots: 10,
};

const generateInitialSpots = (config: GarageConfig): Spot[] => {
  const spots: Spot[] = [];
  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

  for (let i = 1; i <= config.evSpots; i++) {
    spots.push({ id: `ev-${i}`, code: `EV-${i}`, type: 'EV', isOccupied: false });
  }
  for (let i = 1; i <= config.compactSpots; i++) {
    spots.push({ id: `cp-${i}`, code: `CP-${i}`, type: 'COMPACT', isOccupied: false });
  }
  for (let i = 1; i <= config.standardSpots; i++) {
    spots.push({ id: `st-${i}`, code: `ST-${i}`, type: 'STANDARD', isOccupied: false });
  }

  if (spots.length >= 10) {
    spots[0].isOccupied = true;
    spots[0].currentPlate = 'MH-02-EV-1001';
    spots[0].vehicleType = 'EV';
    spots[0].entryTime = hoursAgo(2.5);
    spots[0].activeCharging = true;

    spots[2].isOccupied = true;
    spots[2].currentPlate = 'KA-01-EV-9999';
    spots[2].vehicleType = 'EV';
    spots[2].entryTime = hoursAgo(3.8);
    spots[2].activeCharging = true;

    spots[5].isOccupied = true;
    spots[5].currentPlate = 'RJ-14-CZ-1234';
    spots[5].vehicleType = 'COMPACT';
    spots[5].entryTime = hoursAgo(1.2);

    spots[10].isOccupied = true;
    spots[10].currentPlate = 'KA-05-MH-8888';
    spots[10].vehicleType = 'STANDARD';
    spots[10].entryTime = hoursAgo(4.5);

    spots[13].isOccupied = true;
    spots[13].currentPlate = 'HR-26-DQ-5555';
    spots[13].vehicleType = 'STANDARD';
    spots[13].entryTime = hoursAgo(0.75);
  }

  return spots;
};

const generateInitialTickets = (spots: Spot[], tariff: TariffConfig): Ticket[] => {
  const activeTickets: Ticket[] = spots
    .filter(s => s.isOccupied && s.currentPlate && s.entryTime && s.vehicleType)
    .map((s, idx) => ({
      id: `TCK-ACT-${100 + idx}`,
      plateNumber: s.currentPlate!,
      vehicleType: s.vehicleType!,
      spotId: s.id,
      spotCode: s.code,
      entryTime: s.entryTime!,
      status: 'ACTIVE',
    }));

  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

  const completedTickets: Ticket[] = [
    {
      id: 'TCK-CMP-001',
      plateNumber: 'TN-09-AX-7788',
      vehicleType: 'STANDARD',
      spotId: 'st-2',
      spotCode: 'ST-2',
      entryTime: hoursAgo(5),
      exitTime: hoursAgo(3),
      feeBreakdown: calculateParkingFee(hoursAgo(5), hoursAgo(3), tariff),
      totalFee: calculateParkingFee(hoursAgo(5), hoursAgo(3), tariff).totalFee,
      status: 'COMPLETED',
    },
    {
      id: 'TCK-CMP-002',
      plateNumber: 'DL-3C-AB-5678',
      vehicleType: 'EV',
      spotId: 'ev-2',
      spotCode: 'EV-2',
      entryTime: hoursAgo(8),
      exitTime: hoursAgo(2),
      feeBreakdown: calculateParkingFee(hoursAgo(8), hoursAgo(2), tariff),
      totalFee: calculateParkingFee(hoursAgo(8), hoursAgo(2), tariff).totalFee,
      status: 'COMPLETED',
    },
    {
      id: 'TCK-CMP-003',
      plateNumber: 'UP-32-EF-4321',
      vehicleType: 'COMPACT',
      spotId: 'cp-1',
      spotCode: 'CP-1',
      entryTime: hoursAgo(2),
      exitTime: hoursAgo(1),
      feeBreakdown: calculateParkingFee(hoursAgo(2), hoursAgo(1), tariff),
      totalFee: calculateParkingFee(hoursAgo(2), hoursAgo(1), tariff).totalFee,
      status: 'COMPLETED',
    },
    {
      id: 'TCK-CMP-004',
      plateNumber: 'GJ-01-AB-9000',
      vehicleType: 'STANDARD',
      spotId: 'st-5',
      spotCode: 'ST-5',
      entryTime: hoursAgo(14),
      exitTime: hoursAgo(0.5),
      feeBreakdown: calculateParkingFee(hoursAgo(14), hoursAgo(0.5), tariff),
      totalFee: calculateParkingFee(hoursAgo(14), hoursAgo(0.5), tariff).totalFee,
      status: 'COMPLETED',
    },
  ];

  return [...activeTickets, ...completedTickets];
};

const GarageContext = createContext<GarageContextType | undefined>(undefined);

export const GarageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tariffConfig, setTariffConfigState] = useState<TariffConfig>(DEFAULT_TARIFF);
  const [garageConfig, setGarageConfigState] = useState<GarageConfig>(DEFAULT_GARAGE_CONFIG);
  const [spots, setSpots] = useState<Spot[]>(() => generateInitialSpots(DEFAULT_GARAGE_CONFIG));
  const [tickets, setTickets] = useState<Ticket[]>(() => generateInitialTickets(generateInitialSpots(DEFAULT_GARAGE_CONFIG), DEFAULT_TARIFF));

  const refetchAvailability = async () => {
    try {
      const res = await api.get('/availability');
      if (res.data && res.data.spots) {
        setSpots(res.data.spots);
      }
      const logRes = await api.get('/logs');
      if (logRes.data && Array.isArray(logRes.data)) {
        setTickets(logRes.data);
      }
    } catch (e) {
    }
  };

  useEffect(() => {
    refetchAvailability();
    const interval = setInterval(() => {
      refetchAvailability();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const checkInVehicle = async (
    plateNumber: string,
    vehicleType: VehicleType,
    requestedSpotId?: string
  ) => {
    const cleanPlate = plateNumber.trim().toUpperCase();
    if (!cleanPlate) {
      return { success: false, message: 'License plate number is required.' };
    }

    try {
      const res = await api.post('/check-in', {
        plateNumber: cleanPlate,
        vehicleType,
        requestedSpotId: requestedSpotId || undefined
      });
      if (res.data) {
        await refetchAvailability();
        return {
          success: true,
          message: `Successfully checked in ${vehicleType} (${cleanPlate}) to spot ${res.data.spotCode}.`,
          ticket: res.data
        };
      }
    } catch (err: any) {
      if (err.response?.data?.detail) {
        return { success: false, message: err.response.data.detail };
      }
    }

    const alreadyParked = spots.find(s => s.isOccupied && s.currentPlate?.toUpperCase() === cleanPlate);
    if (alreadyParked) {
      return { success: false, message: `Vehicle ${cleanPlate} is already parked in spot ${alreadyParked.code}.` };
    }

    let targetSpot: Spot | undefined;
    if (requestedSpotId) {
      targetSpot = spots.find(s => (s.id === requestedSpotId || s.code.toUpperCase() === requestedSpotId.toUpperCase()));
      if (!targetSpot) return { success: false, message: `Spot ${requestedSpotId} does not exist.` };
      if (targetSpot.isOccupied) return { success: false, message: `Spot ${targetSpot.code} is occupied.` };
    }

    if (vehicleType === 'EV') {
      if (targetSpot && targetSpot.type !== 'EV') {
        return { success: false, message: `EV vehicle ${cleanPlate} must be parked in an EV stall.` };
      }
      if (!targetSpot) {
        targetSpot = spots.find(s => !s.isOccupied && s.type === 'EV');
        if (!targetSpot) return { success: false, message: 'No available EV charger stalls.' };
      }
    } else {
      if (targetSpot && targetSpot.type === 'EV') {
        return { success: false, message: `STRICT ENFORCEMENT: Non-EV vehicles cannot park in EV charger stalls.` };
      }
      if (!targetSpot) {
        const prefType: SpotType = vehicleType === 'COMPACT' ? 'COMPACT' : 'STANDARD';
        targetSpot = spots.find(s => !s.isOccupied && s.type === prefType) ||
                     spots.find(s => !s.isOccupied && s.type !== 'EV');
        if (!targetSpot) return { success: false, message: 'Garage is at full capacity for non-EV vehicles.' };
      }
    }

    const entryTime = new Date().toISOString();
    const newTicket: Ticket = {
      id: `TCK-${Date.now().toString().slice(-6)}`,
      plateNumber: cleanPlate,
      vehicleType,
      spotId: targetSpot.id,
      spotCode: targetSpot.code,
      entryTime,
      status: 'ACTIVE',
    };

    setSpots(prev => prev.map(s => {
      if (s.id === targetSpot!.id) {
        return { ...s, isOccupied: true, currentPlate: cleanPlate, vehicleType, entryTime, activeCharging: vehicleType === 'EV' };
      }
      return s;
    }));
    setTickets(prev => [newTicket, ...prev]);

    return {
      success: true,
      message: `Checked in ${vehicleType} (${cleanPlate}) to stall ${targetSpot.code}.`,
      ticket: newTicket,
    };
  };

  const checkOutVehicle = async (identifier: string) => {
    const cleanId = identifier.trim().toUpperCase();
    if (!cleanId) return { success: false, message: 'Identifier is required.' };

    try {
      const res = await api.post('/check-out', { identifier: cleanId });
      if (res.data) {
        await refetchAvailability();
        return {
          success: true,
          message: `Checked out ${res.data.plateNumber} from ${res.data.spotCode}. Fee: ₹${res.data.totalFee.toFixed(2)}`,
          ticket: res.data
        };
      }
    } catch (err: any) {
      if (err.response?.data?.detail) {
        return { success: false, message: err.response.data.detail };
      }
    }

    const ticket = tickets.find(t =>
      t.status === 'ACTIVE' && (
        t.plateNumber.toUpperCase() === cleanId ||
        t.spotCode.toUpperCase() === cleanId ||
        t.id.toUpperCase() === cleanId
      )
    );

    if (!ticket) {
      return { success: false, message: `No active ticket found matching '${identifier}'.` };
    }

    const exitTime = new Date().toISOString();
    const feeBreakdown = calculateParkingFee(ticket.entryTime, exitTime, tariffConfig);

    const completedTicket: Ticket = {
      ...ticket,
      exitTime,
      feeBreakdown,
      totalFee: feeBreakdown.totalFee,
      status: 'COMPLETED',
    };

    setSpots(prev => prev.map(s => {
      if (s.id === ticket.spotId) {
        return { ...s, isOccupied: false, currentPlate: undefined, vehicleType: undefined, entryTime: undefined, activeCharging: false };
      }
      return s;
    }));
    setTickets(prev => prev.map(t => (t.id === ticket.id ? completedTicket : t)));

    return {
      success: true,
      message: `Checked out ${ticket.plateNumber} from ${ticket.spotCode}. Total Fee: ₹${feeBreakdown.totalFee.toFixed(2)}`,
      ticket: completedTicket,
    };
  };

  const updateTariffConfig = async (newConfig: TariffConfig) => {
    setTariffConfigState(newConfig);
    try {
      await api.put('/admin/tariff', newConfig);
    } catch (e) {}
  };

  const updateGarageConfig = async (newConfig: GarageConfig) => {
    setGarageConfigState(newConfig);
    setSpots(generateInitialSpots(newConfig));
    try {
      await api.put('/admin/garage', newConfig);
    } catch (e) {}
  };

  const resetToDefaults = () => {
    setTariffConfigState(DEFAULT_TARIFF);
    setGarageConfigState(DEFAULT_GARAGE_CONFIG);
    setSpots(generateInitialSpots(DEFAULT_GARAGE_CONFIG));
    setTickets(generateInitialTickets(generateInitialSpots(DEFAULT_GARAGE_CONFIG), DEFAULT_TARIFF));
  };

  return (
    <GarageContext.Provider
      value={{
        spots,
        tickets,
        tariffConfig,
        garageConfig,
        checkInVehicle,
        checkOutVehicle,
        updateTariffConfig,
        updateGarageConfig,
        resetToDefaults,
        refetchAvailability
      }}
    >
      {children}
    </GarageContext.Provider>
  );
};

export const useGarage = () => {
  const context = useContext(GarageContext);
  if (!context) {
    throw new Error('useGarage must be used within GarageProvider');
  }
  return context;
};
