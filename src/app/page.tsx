'use client';

// ==============================================================================
// Eggstra - Executive Dashboard Page (Dual Theme & Philippine Peso ₱)
// ==============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { EggProductionChart } from '@/components/dashboard/EggProductionChart';
import { MortalityChart } from '@/components/dashboard/MortalityChart';
import { FinancialOverviewChart } from '@/components/dashboard/FinancialOverviewChart';
import { DailyLogsTable } from '@/components/logs/DailyLogsTable';
import { DailyLogModal } from '@/components/logs/DailyLogModal';
import { usePoultry } from '@/lib/context/PoultryContext';

export default function DashboardPage() {
  const { metrics, activeFlocks } = usePoultry();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Dashboard Top Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/40 text-white border border-slate-800/80 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Executive Poultry Operations
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
              Live Layer Tracking (PHP ₱)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time hen-day laying performance, mortality early-warning, egg tray dispatch &amp; FCR monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Daily Production Log</span>
          </button>
        </div>
      </div>

      {/* 1. Core Metric Cards Grid */}
      <MetricCards />

      {/* 2. Main 30-Day Laying Curve vs Expected Commercial Benchmark */}
      <EggProductionChart />

      {/* 3. Side-by-Side Operational & Financial Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MortalityChart />
        <FinancialOverviewChart />
      </div>

      {/* 4. Recent Production Logs Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Recent Collection Records</h3>
          </div>
          <Link
            href="/logs"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>View All Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <DailyLogsTable />
      </div>

      {/* Quick Entry Modal */}
      <DailyLogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />
    </div>
  );
}
