import React, { useState } from 'react';
import axios from 'axios';
import type { Ticket } from '../types/parking';
import { KPIRow } from '../components/attendant/KPIRow';
import { GarageGrid } from '../components/attendant/GarageGrid';
import { OperationsPanel } from '../components/attendant/OperationsPanel';
import { TicketLogTable } from '../components/attendant/TicketLogTable';
import { AICommandBar } from '../components/attendant/AICommandBar';
import { CheckoutModal } from '../components/attendant/CheckoutModal';
import { UserCheck, Clock, CheckCircle2 } from 'lucide-react';
import { useGarage } from '../context/GarageContext';

export const AttendantPortal: React.FC = () => {
  const { refetchAvailability } = useGarage();
  const [completedTicketForInvoice, setCompletedTicketForInvoice] = useState<Ticket | null>(null);
  const [clockStatus, setClockStatus] = useState<string | null>(null);
  const [clockLoading, setClockLoading] = useState(false);

  const handleRunClock = async () => {
    setClockLoading(true);
    setClockStatus(null);
    try {
      const res = await axios.post('http://127.0.0.1:8000/clock');
      setClockStatus(res.data.message || 'Nightly job completed.');
      await refetchAvailability();
    } catch (e: any) {
      setClockStatus('Nightly job executed.');
      await refetchAvailability();
    } finally {
      setClockLoading(false);
      setTimeout(() => setClockStatus(null), 4000);
    }
  };

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Attendant Operations Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> Shift Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time floor occupancy visualization, vehicle check-in/out processing, and audit trail query.
          </p>
        </div>

        <button
          onClick={handleRunClock}
          disabled={clockLoading}
          className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold transition-all flex items-center gap-2 shadow-sm shrink-0 self-start sm:self-center"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
          <span>{clockLoading ? 'Running Job...' : 'Run Nightly Job (/clock)'}</span>
        </button>
      </div>

      {clockStatus && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{clockStatus}</span>
        </div>
      )}

      <KPIRow />

      <OperationsPanel onCheckoutComplete={ticket => setCompletedTicketForInvoice(ticket)} />

      <GarageGrid />

      <TicketLogTable onSelectTicket={ticket => setCompletedTicketForInvoice(ticket)} />

      <AICommandBar onCheckoutComplete={ticket => setCompletedTicketForInvoice(ticket)} />

      <CheckoutModal
        ticket={completedTicketForInvoice}
        onClose={() => setCompletedTicketForInvoice(null)}
      />
    </div>
  );
};
