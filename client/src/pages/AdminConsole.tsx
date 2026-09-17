import React from 'react';
import { GarageConfigurator } from '../components/admin/GarageConfigurator';
import { TariffConfigurator } from '../components/admin/TariffConfigurator';
import { FinancialReport } from '../components/admin/FinancialReport';
import { ShieldCheck } from 'lucide-react';

export const AdminConsole: React.FC = () => {
  return (
    <div className="space-y-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Admin Configuration Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Full Permissions
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic garage layout builder, tiered tariff rules, and end-of-day financial analytics reporting.
          </p>
        </div>
      </div>

      {/* Grid for Configuration Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Garage Setup Builder */}
        <GarageConfigurator />

        {/* 2. Tariff Configurator */}
        <TariffConfigurator />
      </div>

      {/* 3. Financial End-of-Day Report */}
      <FinancialReport />
    </div>
  );
};
