import React, { useState } from 'react';
import type { Spot, SpotType } from '../../types/parking';
import { useGarage } from '../../context/GarageContext';
import { calculateParkingFee, formatDuration } from '../../utils/tariffCalculator';
import { Zap, Car, Clock, X } from 'lucide-react';

export const GarageGrid: React.FC = () => {
  const { spots, tariffConfig } = useGarage();
  const [filter, setFilter] = useState<'ALL' | SpotType>('ALL');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  const filteredSpots = spots.filter(s => filter === 'ALL' || s.type === filter);

  const getSpotColorClass = (spot: Spot) => {
    if (!spot.isOccupied) {
      if (spot.type === 'EV') return 'bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20';
      return 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20';
    }
    return 'bg-slate-200 dark:bg-slate-800 border-slate-400 text-slate-800 dark:text-slate-200 hover:border-slate-500';
  };

  const getSpotBadge = (spot: Spot) => {
    if (!spot.isOccupied) {
      if (spot.type === 'EV') {
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500 text-white">
            <Zap className="w-2.5 h-2.5 mr-0.5" /> EV FREE
          </span>
        );
      }
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
          FREE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-500 text-white">
        OCCUPIED
      </span>
    );
  };

  let liveFee;
  let durationStr = 'N/A';
  if (selectedSpot?.isOccupied && selectedSpot.entryTime) {
    const feeObj = calculateParkingFee(selectedSpot.entryTime, new Date().toISOString(), tariffConfig);
    liveFee = feeObj.totalFee;
    durationStr = formatDuration(feeObj.durationMinutes);
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Garage Floor Plan Visualizer
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border border-slate-200 dark:border-slate-700">
              LEVEL 1
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time occupancy map. Click any stall card to inspect vehicle status and running tariff fee.
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {(['ALL', 'EV', 'COMPACT', 'STANDARD'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Stalls' : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500"></span> Available Spot
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-sky-500"></span> EV Charging Spot
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-400"></span> Occupied Stall
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mt-2">
        {filteredSpots.map(spot => (
          <div
            key={spot.id}
            onClick={() => setSelectedSpot(spot)}
            className={`cursor-pointer border-2 rounded-xl p-3.5 flex flex-col justify-between h-28 transition-all duration-200 transform hover:-translate-y-0.5 ${getSpotColorClass(
              spot
            )}`}
          >
            <div className="flex items-start justify-between">
              <span className="font-extrabold text-sm tracking-wide">{spot.code}</span>
              {getSpotBadge(spot)}
            </div>

            <div className="my-auto">
              {spot.isOccupied ? (
                <div>
                  <div className="font-mono font-bold text-xs truncate text-slate-900 dark:text-white">
                    {spot.currentPlate}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <Car className="w-3 h-3" /> {spot.vehicleType}
                  </div>
                </div>
              ) : (
                <div className="text-xs font-semibold opacity-75">
                  {spot.type === 'EV' ? 'Ready for EV' : spot.type}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] font-semibold border-t border-slate-300/40 dark:border-slate-700/50 pt-1.5">
              <span>{spot.type}</span>
              {spot.activeCharging && (
                <span className="text-sky-600 dark:text-sky-400 flex items-center">
                  <Zap className="w-2.5 h-2.5 mr-0.5 animate-pulse" /> 150kW
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedSpot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  Stall {selectedSpot.code}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {selectedSpot.type}
                </span>
              </div>
              <button
                onClick={() => setSelectedSpot(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Current Status</span>
                <span
                  className={`font-semibold px-2.5 py-0.5 rounded-md text-xs ${
                    selectedSpot.isOccupied
                      ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {selectedSpot.isOccupied ? 'Occupied' : 'Vacant & Ready'}
                </span>
              </div>

              {selectedSpot.isOccupied ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>License Plate</span>
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {selectedSpot.currentPlate}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Vehicle Category</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {selectedSpot.vehicleType}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Entry Time</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {selectedSpot.entryTime ? new Date(selectedSpot.entryTime).toLocaleTimeString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Duration Parked</span>
                      <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {durationStr}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 block font-medium">
                        Accrued Tariff Fee
                      </span>
                      <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">
                        ₹{liveFee?.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-500">₹</span>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center text-slate-500 text-xs">
                  This stall is empty and ready for incoming vehicle assignment.
                  {selectedSpot.type === 'EV' && (
                    <p className="text-sky-600 dark:text-sky-400 font-semibold mt-1 flex items-center justify-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> High-speed charger available
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedSpot(null)}
                className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
