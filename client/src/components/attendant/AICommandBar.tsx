import React, { useState } from 'react';
import { parseAICommand } from '../../utils/aiParser';
import { useGarage } from '../../context/GarageContext';
import type { Ticket } from '../../types/parking';
import { Sparkles, Terminal, ArrowRight, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface AICommandBarProps {
  onCheckoutComplete: (ticket: Ticket) => void;
}

export const AICommandBar: React.FC<AICommandBarProps> = ({ onCheckoutComplete }) => {
  const { checkInVehicle, checkOutVehicle } = useGarage();
  const [command, setCommand] = useState('');
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const presets = [
    'Check in EV plate VOLT-100',
    'Check in compact car plate MINI-77',
    'Check in standard plate FORD-99 to spot ST-3',
    'Check out plate TESLA-X1',
  ];

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const parse = parseAICommand(command);

    if (parse.intent === 'CHECK_IN') {
      if (!parse.plateNumber) {
        setResultMessage({ type: 'error', text: 'AI Parser Error: Could not extract license plate. Format example: "Check in EV plate XYZ-123"' });
        return;
      }
      const vehicleType = parse.vehicleType || 'STANDARD';
      const result = await checkInVehicle(parse.plateNumber, vehicleType, parse.spotCode);
      if (result.success) {
        setResultMessage({ type: 'success', text: `AI Action Executed: ${result.message}` });
        setCommand('');
      } else {
        setResultMessage({ type: 'error', text: `AI Action Failed: ${result.message}` });
      }
    } else if (parse.intent === 'CHECK_OUT') {
      const target = parse.plateNumber || parse.spotCode;
      if (!target) {
        setResultMessage({ type: 'error', text: 'AI Parser Error: Could not extract plate number or spot code for checkout.' });
        return;
      }
      const result = await checkOutVehicle(target);
      if (result.success && result.ticket) {
        setResultMessage({ type: 'success', text: `AI Action Executed: ${result.message}` });
        onCheckoutComplete(result.ticket);
        setCommand('');
      } else {
        setResultMessage({ type: 'error', text: `AI Action Failed: ${result.message}` });
      }
    } else {
      setResultMessage({ type: 'info', text: 'AI Command Parser: Intent unclear. Try "Check in EV plate ABC-123" or "Check out plate ABC-123".' });
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-wide">ParkPulse AI Natural Language Command Interface</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          Client-Side Regex Engine
        </span>
      </div>

      {/* Preset Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Terminal className="w-3 h-3 text-slate-500" /> Presets:
        </span>
        {presets.map(preset => (
          <button
            key={preset}
            type="button"
            onClick={() => setCommand(preset)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Command Form */}
      <form onSubmit={handleExecute} className="mt-3.5 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Type command e.g., 'Check in EV plate TESLA-99' or 'Check out plate MINI-909'..."
            value={command}
            onChange={e => setCommand(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm rounded-xl transition-colors flex items-center gap-1.5 shadow-md shrink-0"
        >
          Parse & Run <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Result Message */}
      {resultMessage && (
        <div
          className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            resultMessage.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
              : resultMessage.type === 'error'
              ? 'bg-rose-950/70 border-rose-800 text-rose-300'
              : 'bg-slate-800 border-slate-700 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {resultMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : resultMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <span>{resultMessage.text}</span>
          </div>
          <button
            onClick={() => setResultMessage(null)}
            className="text-slate-400 hover:text-white text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
