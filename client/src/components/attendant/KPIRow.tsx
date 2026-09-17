import React from 'react';
import { Car, Zap, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';
import { useGarage } from '../../context/GarageContext';

export const KPIRow: React.FC = () => {
  const { spots } = useGarage();

  const total = spots.length;
  const totalOccupied = spots.filter(s => s.isOccupied).length;
  const occPercentage = total > 0 ? Math.round((totalOccupied / total) * 100) : 0;

  const evSpots = spots.filter(s => s.type === 'EV');
  const evOccupied = evSpots.filter(s => s.isOccupied).length;
  const evAvailable = evSpots.length - evOccupied;

  const cpSpots = spots.filter(s => s.type === 'COMPACT');
  const cpOccupied = cpSpots.filter(s => s.isOccupied).length;
  const cpAvailable = cpSpots.length - cpOccupied;

  const stSpots = spots.filter(s => s.type === 'STANDARD');
  const stOccupied = stSpots.filter(s => s.isOccupied).length;
  const stAvailable = stSpots.length - stOccupied;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Capacity */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            Total Capacity
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
            <Car className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalOccupied}</span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/ {total} Occupied</span>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Utilization</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{occPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                occPercentage > 85 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${occPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Card 2: EV Charger Stalls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            EV Charging Stalls
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">{evAvailable}</span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/ {evSpots.length} Free</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Occupied: {evOccupied}</span>
          <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 font-medium">
            High Power 150kW
          </span>
        </div>
      </div>

      {/* Card 3: Compact Stalls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            Compact Stalls
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{cpAvailable}</span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/ {cpSpots.length} Free</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Occupied: {cpOccupied}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Ready
          </span>
        </div>
      </div>

      {/* Card 4: Standard Stalls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            Standard Stalls
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{stAvailable}</span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/ {stSpots.length} Free</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Occupied: {stOccupied}</span>
          <span className="text-slate-600 dark:text-slate-400 font-medium">Wide Bays</span>
        </div>
      </div>
    </div>
  );
};
