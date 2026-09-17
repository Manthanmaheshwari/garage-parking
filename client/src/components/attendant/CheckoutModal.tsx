import React from 'react';
import type { Ticket } from '../../types/parking';
import { useGarage } from '../../context/GarageContext';
import { Printer, CheckCircle, Shield, Activity, Clock } from 'lucide-react';
import { formatDuration } from '../../utils/tariffCalculator';

interface CheckoutModalProps {
  ticket: Ticket | null;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ ticket, onClose }) => {
  const { tariffConfig } = useGarage();

  if (!ticket || !ticket.feeBreakdown) return null;

  const { feeBreakdown } = ticket;
  const entryFormatted = new Date(ticket.entryTime).toLocaleString();
  const exitFormatted = ticket.exitTime ? new Date(ticket.exitTime).toLocaleString() : new Date().toLocaleString();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs no-print-bg">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 overflow-hidden">
        
        {/* Printable Card Container */}
        <div id="printable-receipt" className="space-y-5">
          {/* Receipt Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900">
                <Activity className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  ParkPulse Billing Receipt
                </h2>
                <p className="text-xs text-slate-500">Invoice ID: {ticket.id}</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> PAID
            </span>
          </div>

          {/* Key Ticket Details */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">License Plate</span>
              <span className="font-mono font-extrabold text-base text-slate-900 dark:text-white">
                {ticket.plateNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Stall Code</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {ticket.spotCode} ({ticket.vehicleType})
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Entry Timestamp</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{entryFormatted}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Exit Timestamp</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{exitFormatted}</span>
            </div>
          </div>

          {/* Duration Summary */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" /> Total Duration:
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatDuration(feeBreakdown.durationMinutes)} ({feeBreakdown.billableHours} billable hrs)
            </span>
          </div>

          {/* Tiered Fee Breakdown Table (INR Currency ₹) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Tiered Tariff Itemization (INR)
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800/80 font-semibold border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="p-2.5 flex justify-between border-b border-slate-100 dark:border-slate-800/50">
                <span>First Hour Base Rate (₹{tariffConfig.firstHourRate.toFixed(2)}/hr)</span>
                <span className="font-mono">₹{feeBreakdown.firstHourFee.toFixed(2)}</span>
              </div>
              {feeBreakdown.subsequentHoursCount > 0 && (
                <div className="p-2.5 flex justify-between border-b border-slate-100 dark:border-slate-800/50">
                  <span>
                    Subsequent {feeBreakdown.subsequentHoursCount} hr(s) @ ₹{tariffConfig.subsequentHourRate.toFixed(2)}/hr
                  </span>
                  <span className="font-mono">₹{feeBreakdown.subsequentHoursFee.toFixed(2)}</span>
                </div>
              )}
              {feeBreakdown.capAdjustment > 0 && (
                <div className="p-2.5 flex justify-between border-b border-slate-100 dark:border-slate-800/50 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>24-Hour Daily Cap Discount Adjustment</span>
                  <span className="font-mono">-₹{feeBreakdown.capAdjustment.toFixed(2)}</span>
                </div>
              )}
              <div className="p-3 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex justify-between font-bold text-base">
                <span>Total Amount Charged</span>
                <span className="font-mono">₹{feeBreakdown.totalFee.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Verified by ParkPulse Tariff Engine • Audit Hash #{ticket.id}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3 no-print pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print Invoice Card
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
          >
            Confirm Payment & Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
