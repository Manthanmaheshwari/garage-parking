import React from 'react';
import { Activity, Shield, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900">
              <Activity className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              ParkPulse Smart Garage Architecture
            </span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Strict Stall Allocation Active
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-sky-500" />
              Audit Trail Engine v2.4
            </span>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} ParkPulse Technologies Inc. Enterprise SaaS Spec.
          </p>
        </div>
      </div>
    </footer>
  );
};
