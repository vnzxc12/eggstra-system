'use client';

// ==============================================================================
// Eggstra - Header Component with Theme Switcher & Currency Indicator
// ==============================================================================

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Layers,
  Database,
  Plus,
  Sun,
  Moon,
  AlertTriangle,
  Coins,
} from 'lucide-react';
import { usePoultry } from '@/lib/context/PoultryContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { CURRENCY_SYMBOL } from '@/lib/utils/formatters';

interface HeaderProps {
  onOpenQuickLog: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuickLog }) => {
  const {
    activeFlocks,
    selectedFlockId,
    setSelectedFlockId,
    metrics,
    isSupabaseLive,
  } = usePoultry();

  const { theme, toggleTheme } = useTheme();

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 lg:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Flock Selector & Date */}
        <div className="flex items-center gap-3">
          {/* Flock Selector Dropdown */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-xs">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <select
              value={selectedFlockId}
              onChange={(e) => setSelectedFlockId(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium focus:outline-none cursor-pointer pr-2"
              aria-label="Filter by flock"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                All Active Flocks ({activeFlocks.length})
              </option>
              {activeFlocks.map((flock) => (
                <option key={flock.id} value={flock.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  {flock.flock_name} ({flock.current_count.toLocaleString()} hens)
                </option>
              ))}
            </select>
          </div>

          {/* Date Indicator */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 rounded-xl px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{todayFormatted}</span>
          </div>

          {/* Currency Indicator Badge */}
          <div className="hidden xl:flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Coins className="w-3.5 h-3.5" />
            <span>PHP ({CURRENCY_SYMBOL})</span>
          </div>
        </div>

        {/* Right: Theme Switcher, Alert Status, Supabase Indicator & Quick Log */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mortality Warning Banner if alert is active */}
          {metrics.mortalityAlertLevel !== 'normal' && (
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold animate-pulse ${
                metrics.mortalityAlertLevel === 'critical'
                  ? 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-400 dark:border-rose-500/40'
                  : 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400 dark:border-amber-500/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>
                {metrics.mortalityAlertLevel === 'critical'
                  ? `MORTALITY ALERT (${metrics.mortalityRatePercentage}%)`
                  : `Elevated Loss (${metrics.mortalityRatePercentage}%)`}
              </span>
            </div>
          )}

          {/* Theme Toggle Button (Light / Dark Mode) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme Mode"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700 hover:text-indigo-600 transition-colors" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-colors" />
            )}
          </button>

          {/* Supabase Status Pill */}
          <Link
            href="/settings"
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition-all ${
              isSupabaseLive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300'
            }`}
            title={
              isSupabaseLive
                ? 'Connected to Live Supabase Database with Realtime Sync'
                : 'Running in Local Storage / Demo Mode (PHP)'
            }
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isSupabaseLive ? 'Supabase Live' : 'Demo Mode (PHP)'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseLive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
              }`}
            />
          </Link>

          {/* Quick Add Log Button */}
          <button
            onClick={onOpenQuickLog}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Quick Log</span>
          </button>
        </div>
      </div>
    </header>
  );
};
