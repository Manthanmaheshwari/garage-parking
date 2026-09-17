import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { Building2, Save, CheckCircle2, RotateCcw } from 'lucide-react';

export const GarageConfigurator: React.FC = () => {
  const { garageConfig, updateGarageConfig, resetToDefaults } = useGarage();
  const [code, setCode] = useState(garageConfig.code);
  const [evSpots, setEvSpots] = useState(garageConfig.evSpots);
  const [compactSpots, setCompactSpots] = useState(garageConfig.compactSpots);
  const [standardSpots, setStandardSpots] = useState(garageConfig.standardSpots);
  const [saved, setSaved] = useState(false);

  const total = evSpots + compactSpots + standardSpots;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGarageConfig({
      code: code.toUpperCase(),
      evSpots: Number(evSpots),
      compactSpots: Number(compactSpots),
      standardSpots: Number(standardSpots),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    resetToDefaults();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Garage Setup Builder</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure floor layout stall distribution</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Facility Garage Identification Code
          </label>
          <input
            type="text"
            required
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono font-bold focus:ring-2 focus:ring-slate-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1.5">
              EV Charger Stalls
            </label>
            <input
              type="number"
              min={1}
              max={50}
              required
              value={evSpots}
              onChange={e => setEvSpots(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-sky-300 dark:border-sky-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5">
              Compact Stalls
            </label>
            <input
              type="number"
              min={1}
              max={50}
              required
              value={compactSpots}
              onChange={e => setCompactSpots(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Standard Stalls
            </label>
            <input
              type="number"
              min={1}
              max={100}
              required
              value={standardSpots}
              onChange={e => setStandardSpots(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-slate-500 outline-none"
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Calculated Garage Total Stall Capacity:</span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{total} Stalls</span>
        </div>

        {saved && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Garage floor configuration updated successfully. Floor plan re-rendered.</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Garage Configuration
        </button>
      </form>
    </div>
  );
};
