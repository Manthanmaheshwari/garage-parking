import React, { useState, useMemo } from 'react';
import axios from 'axios';
import type { Ticket } from '../../types/parking';
import { useGarage } from '../../context/GarageContext';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle, Clock, FileText, Repeat, X, ShieldAlert } from 'lucide-react';
import { formatDuration, calculateParkingFee } from '../../utils/tariffCalculator';

interface TicketLogTableProps {
  onSelectTicket?: (ticket: Ticket) => void;
}

export const TicketLogTable: React.FC<TicketLogTableProps> = ({ onSelectTicket }) => {
  const { tickets, tariffConfig, refetchAvailability } = useGarage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [sortField, setSortField] = useState<'entryTime' | 'plateNumber' | 'totalFee'>('entryTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [valetModalTicket, setValetModalTicket] = useState<Ticket | null>(null);
  const [newPlate, setNewPlate] = useState('');
  const [valetStatus, setValetStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ticket.spotCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, statusFilter]);

  const sortedTickets = useMemo(() => {
    return [...filteredTickets].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'entryTime') {
        aVal = new Date(a.entryTime).getTime();
        bVal = new Date(b.entryTime).getTime();
      } else if (sortField === 'totalFee') {
        aVal = a.totalFee || 0;
        bVal = b.totalFee || 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTickets, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedTickets.length / itemsPerPage));
  const paginatedTickets = sortedTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: 'entryTime' | 'plateNumber' | 'totalFee') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleValetTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valetModalTicket || !newPlate.trim()) return;

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/parking/valet-transfer', {
        ticketId: valetModalTicket.id,
        newPlateNumber: newPlate.trim().toUpperCase()
      });
      setValetStatus({ type: 'success', message: res.data.message });
      await refetchAvailability();
      setTimeout(() => {
        setValetModalTicket(null);
        setNewPlate('');
        setValetStatus(null);
      }, 1500);
    } catch (err: any) {
      setValetStatus({ type: 'error', message: err.response?.data?.detail || 'Valet transfer failed.' });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Audit Trail & Ticket Log
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border border-slate-200 dark:border-slate-700">
              {filteredTickets.length} Records
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time searchable database of active check-ins and completed transactions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by plate number..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map(status => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === status
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3">Ticket ID</th>
              <th
                className="p-3 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => toggleSort('plateNumber')}
              >
                <div className="flex items-center gap-1">
                  License Plate <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3">Category</th>
              <th className="p-3">Stall</th>
              <th
                className="p-3 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => toggleSort('entryTime')}
              >
                <div className="flex items-center gap-1">
                  Entry Time <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3">Duration</th>
              <th className="p-3">Status</th>
              <th
                className="p-3 cursor-pointer hover:text-slate-900 dark:hover:text-white text-right"
                onClick={() => toggleSort('totalFee')}
              >
                <div className="flex items-center justify-end gap-1">
                  Tariff Fee (₹) <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {paginatedTickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  No ticket records found matching criteria.
                </td>
              </tr>
            ) : (
              paginatedTickets.map(ticket => {
                const isActive = ticket.status === 'ACTIVE';
                const nowStr = new Date().toISOString();
                const currentFeeObj = isActive
                  ? calculateParkingFee(ticket.entryTime, nowStr, tariffConfig)
                  : ticket.feeBreakdown;

                const displayFee = isActive ? currentFeeObj?.totalFee : ticket.totalFee;

                return (
                  <tr
                    key={ticket.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-200">
                      {ticket.id}
                    </td>
                    <td className="p-3 font-mono font-extrabold text-slate-900 dark:text-white">
                      {ticket.plateNumber}
                    </td>
                    <td className="p-3">{ticket.vehicleType}</td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-300">{ticket.spotCode}</td>
                    <td className="p-3">{new Date(ticket.entryTime).toLocaleTimeString()}</td>
                    <td className="p-3">
                      {isActive && currentFeeObj
                        ? formatDuration(currentFeeObj.durationMinutes)
                        : ticket.feeBreakdown
                        ? formatDuration(ticket.feeBreakdown.durationMinutes)
                        : 'N/A'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Clock className="w-2.5 h-2.5 mr-1 animate-spin" /> ACTIVE
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-2.5 h-2.5 mr-1" /> COMPLETED
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center justify-end gap-1.5">
                        <span>₹{displayFee?.toFixed(2)}</span>
                        {isActive && (
                          <button
                            onClick={() => {
                              setValetModalTicket(ticket);
                              setNewPlate('');
                              setValetStatus(null);
                            }}
                            title="Valet Hand-off / License Transfer"
                            className="p-1 rounded bg-sky-100 hover:bg-sky-200 dark:bg-sky-950 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 text-[10px] font-semibold flex items-center gap-1"
                          >
                            <Repeat className="w-3 h-3" /> Valet
                          </button>
                        )}
                        {!isActive && onSelectTicket && (
                          <button
                            onClick={() => onSelectTicket(ticket)}
                            title="View Invoice Receipt"
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <div>
          Showing Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of{' '}
          <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span> ({sortedTickets.length} total entries)
        </div>

        <div className="flex items-center space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold px-2">{currentPage}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {valetModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Repeat className="w-4 h-4 text-sky-500" /> Level 3 - Valet Hand-off Transfer
              </h3>
              <button
                onClick={() => setValetModalTicket(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleValetTransfer} className="mt-4 space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                <div><span className="text-slate-500">Ticket ID:</span> <span className="font-mono font-bold text-slate-900 dark:text-white">{valetModalTicket.id}</span></div>
                <div><span className="text-slate-500">Stall Code:</span> <span className="font-bold text-slate-900 dark:text-white">{valetModalTicket.spotCode}</span></div>
                <div><span className="text-slate-500">Original Plate:</span> <span className="font-mono font-bold text-slate-900 dark:text-white">{valetModalTicket.plateNumber}</span></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  New Driver / Valet License Plate *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RJ-14-CZ-9999"
                  value={newPlate}
                  onChange={e => setNewPlate(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              {valetStatus && (
                <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  valetStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {valetStatus.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <ShieldAlert className="w-4 h-4 text-rose-600" />}
                  <span>{valetStatus.message}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Execute Valet Transfer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
