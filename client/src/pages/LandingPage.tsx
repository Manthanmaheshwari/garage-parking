import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Zap,
  Search,
  Building,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { AdminAuthModal } from '../components/auth/AdminAuthModal';
import { AttendantAuthModal } from '../components/auth/AttendantAuthModal';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [attendantModalOpen, setAttendantModalOpen] = useState(false);

  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('user_role');

  const handleAttendantClick = () => {
    if (token && role === 'attendant') {
      navigate('/attendant');
    } else {
      setAttendantModalOpen(true);
    }
  };

  const handleAdminClick = () => {
    if (token && role === 'admin') {
      navigate('/admin');
    } else {
      setAdminModalOpen(true);
    }
  };

  return (
    <div className="space-y-16 py-8 sm:py-12">
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-14 border border-slate-800 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>ENTERPRISE MULTI-TENANT SMART PARKING PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Next-Gen Multi-Tenant Smart Garage & <span className="text-emerald-400 font-black">Tiered Tariff</span> Infrastructure
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            ParkPulse Engine powers high-volume municipal garages and commercial parking hubs with isolated tenant architectures, dynamic layout visualization, strict EV stall enforcement, and real-time financial audit reporting.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={handleAttendantClick}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <UserCheck className="w-4 h-4" /> Attendant Sign In / Register
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleAdminClick}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <ShieldCheck className="w-4 h-4 text-sky-400" /> Garage Owner Console
            </button>
          </div>
        </div>

        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Core Architectural Capabilities
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Engineered to handle high-concurrency multi-tenant operations with zero data leakage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Tiered Tariff Engine
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Automated part-hour ceiling calculations rounding up to full billable increments. Enforces base hour rates, subsequent hourly step-downs, and automated 24-hour daily caps.
            </p>
            <div className="pt-2 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Automated Cap Calculation
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Strict EV Stall Allocation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Algorithmic enforcement preventing non-EV combustion vehicles from occupying high-speed charging stalls. Assures 100% charger availability for electric fleet vehicles.
            </p>
            <div className="pt-2 flex items-center text-xs font-semibold text-sky-600 dark:text-sky-400 gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zero ICE Charger Squatting
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Multi-Tenant Audit Trails
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Sub-second query engine for active and completed vehicle tickets scoped strictly to your registered garage tenant code.
            </p>
            <div className="pt-2 flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Tenant-Isolated Session Logs
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 space-y-6">
        <div className="max-w-xl space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Target Audience & Deployment Models
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tailored software configurations built specifically for high-capacity operators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Municipal Operators
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                City parking authorities managing multi-level municipal garages, public transit commuter hubs, and civic plazas requiring strict compliance and transparent EOD financial audits.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Commercial Garages
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Private airport valet complexes, corporate office towers, and shopping mall garages seeking high-turnover yield optimization, custom tariff caps, and EV infrastructure monetization.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Platform Engineering Roadmap
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upcoming feature releases scheduled for Q4 deployment
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
              Phase 1 • Q4 Release
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-500" /> 1. ALPR Gate Integration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Automated License Plate Recognition barrier control allowing zero-touch optical camera check-ins and automatic boom gate triggers upon invoice settlement.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
              Phase 2 • Q1 Release
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-500" /> 2. Driver-Side Pre-Reservations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Mobile driver interface allowing commuters to pre-reserve and lock specific EV charger stalls ahead of arrival with QR code gate access tokens.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
              Phase 3 • Q2 Release
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" /> 3. Dynamic Surge Pricing
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Real-time automated tariff adjustments based on garage occupancy velocity, nearby event schedules, and peak demand algorithms.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-bold">Ready to Access Multi-Tenant Portals?</h3>
          <p className="text-xs text-slate-400 font-normal">Choose your identity role to sign in or register a new garage tenant account.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAttendantClick}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-colors"
          >
            Attendant Operations
          </button>
          <button
            onClick={handleAdminClick}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 transition-colors"
          >
            Garage Owner Console
          </button>
        </div>
      </section>

      <AdminAuthModal isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
      <AttendantAuthModal isOpen={attendantModalOpen} onClose={() => setAttendantModalOpen(false)} />
    </div>
  );
};
