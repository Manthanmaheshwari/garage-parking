import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Sun, Moon, ShieldCheck, UserCheck, LayoutDashboard, LogOut, KeyRound } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { AdminAuthModal } from '../auth/AdminAuthModal';
import { AttendantAuthModal } from '../auth/AttendantAuthModal';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [attendantModalOpen, setAttendantModalOpen] = useState(false);

  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('user_role');
  const garageCode = localStorage.getItem('garage_code') || 'AURIGA-01';

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('garage_code');
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 shadow-sm group-hover:scale-105 transition-transform duration-200">
                <Activity className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Park<span className="text-emerald-600 dark:text-emerald-400">Pulse</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  TENANT: {garageCode}
                </span>
              </div>
            </Link>

            <nav className="flex items-center space-x-1 sm:space-x-2">
              <Link
                to="/"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </Link>

              <button
                onClick={() => {
                  if (token && role === 'attendant') {
                    navigate('/attendant');
                  } else {
                    setAttendantModalOpen(true);
                  }
                }}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/attendant')
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Attendant Portal</span>
              </button>

              <button
                onClick={() => {
                  if (token && role === 'admin') {
                    navigate('/admin');
                  } else {
                    setAdminModalOpen(true);
                  }
                }}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/admin')
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Admin Console</span>
              </button>
            </nav>

            <div className="flex items-center space-x-3">
              {token ? (
                <div className="flex items-center space-x-2">
                  <div className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-medium flex items-center space-x-1">
                    <KeyRound className="w-3 h-3 text-emerald-500" />
                    <span className="capitalize">{role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-slate-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>LIVE TENANT</span>
                </div>
              )}

              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 text-slate-700" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AdminAuthModal isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
      <AttendantAuthModal isOpen={attendantModalOpen} onClose={() => setAttendantModalOpen(false)} />
    </>
  );
};
