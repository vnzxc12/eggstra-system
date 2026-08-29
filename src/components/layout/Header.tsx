'use client';

// ==============================================================================
// Eggstra - Responsive Header with Mobile Drawer Toggle & Profile
// ==============================================================================

import React from 'react';
import {
  Calendar,
  Layers,
  Plus,
  Sun,
  Moon,
  AlertTriangle,
  Coins,
  LogOut,
  Menu,
} from 'lucide-react';
import { usePoultry } from '@/lib/context/PoultryContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { useAuth } from '@/lib/context/AuthContext';
import { CURRENCY_SYMBOL } from '@/lib/utils/formatters';

interface HeaderProps {
  onOpenQuickLog: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuickLog, onToggleMobileSidebar }) => {
  const {
    activeFlocks,
    selectedFlockId,
    setSelectedFlockId,
    metrics,
  } = usePoultry();

  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 transition-colors">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Drawer Trigger & Flock Selector */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Hamburger Menu on Mobile & Tablet */}
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Flock Selector Dropdown */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-xs max-w-[200px] sm:max-w-xs">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <select
              value={selectedFlockId}
              onChange={(e) => setSelectedFlockId(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer pr-1 truncate"
              aria-label="Filter by flock"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                All Flocks ({activeFlocks.length})
              </option>
              {activeFlocks.map((flock) => (
                <option key={flock.id} value={flock.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {flock.flock_name} ({flock.current_count.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Date Indicator (Tablet/Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{todayFormatted}</span>
          </div>

          {/* Currency Indicator Badge (Desktop only) */}
          <div className="hidden xl:flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <Coins className="w-3.5 h-3.5" />
            <span>PHP ({CURRENCY_SYMBOL})</span>
          </div>
        </div>

        {/* Right: Theme Switcher, Alert Status, Profile & Quick Log */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mortality Warning Banner if alert is active */}
          {metrics.mortalityAlertLevel !== 'normal' && (
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold animate-pulse ${
                metrics.mortalityAlertLevel === 'critical'
                  ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40'
                  : 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[160px]">
                {metrics.mortalityAlertLevel === 'critical' ? 'High Loss Alert' : 'Elevated Loss'}
              </span>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 transition-all cursor-pointer shadow-xs"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme Mode"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700 hover:text-indigo-600 transition-colors" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-colors" />
            )}
          </button>

          {/* User Profile & Sign Out (Tablet/Desktop) */}
          {user && (
            <div className="hidden sm:flex items-center gap-1.5 pl-1 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[80px]">{user.username}</span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-rose-300 bg-slate-50 hover:bg-rose-50 dark:bg-slate-950 dark:hover:bg-rose-950/30 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-all cursor-pointer shadow-xs"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Add Log Button */}
          <button
            onClick={onOpenQuickLog}
            className="flex items-center gap-1.5 py-1.5 sm:py-2 px-2.5 sm:px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Quick Log</span>
          </button>
        </div>
      </div>
    </header>
  );
};
