'use client';

// ==============================================================================
// Eggstra - Daily Logs Management Page (Dual Theme)
// ==============================================================================

import React, { useState } from 'react';
import {
  PlusCircle,
} from 'lucide-react';
import { DailyLogsTable } from '@/components/logs/DailyLogsTable';
import { DailyLogModal } from '@/components/logs/DailyLogModal';
import { usePoultry } from '@/lib/context/PoultryContext';

export default function DailyLogsPage() {
  const { metrics } = usePoultry();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/40 text-white border border-slate-800/80 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Daily Egg Collection &amp; Mortality Logs
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Mobile-first log history for table egg harvests, cracked/damaged counts, dead bird culls, and feed.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Record Today&apos;s Collection</span>
        </button>
      </div>

      {/* Mini KPI summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel rounded-xl p-3.5">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Today&apos;s Output</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {metrics.todayTotalEggs.toLocaleString()} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">eggs</span>
          </span>
          <span className="text-[11px] text-amber-700 dark:text-amber-400 font-mono block">
            {metrics.todayTraysPacked} trays (30-egg)
          </span>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Hen-Day Laying</span>
          <span
            className={`text-xl font-bold font-mono ${
              metrics.henDayPercentage >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {metrics.henDayPercentage}%
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Target: &gt;80%</span>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Today&apos;s Loss</span>
          <span
            className={`text-xl font-bold font-mono ${
              metrics.mortalityAlertLevel === 'normal' ? 'text-slate-900 dark:text-slate-100' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {metrics.todayMortality} <span className="text-xs text-slate-400 font-normal">dead</span>
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">
            {metrics.todayCulls} culled
          </span>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Today&apos;s Feed Intake</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {metrics.todayFeedConsumedKg.toLocaleString()} <span className="text-xs text-slate-400 font-normal">kg</span>
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">
            ~{(metrics.todayFeedConsumedKg / 50).toFixed(1)} bags (50kg)
          </span>
        </div>
      </div>

      {/* Logs Table */}
      <DailyLogsTable />

      {/* Quick Entry Modal */}
      <DailyLogModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
