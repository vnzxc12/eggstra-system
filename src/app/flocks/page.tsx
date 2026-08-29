'use client';

// ==============================================================================
// Eggstra - Flock Management Page (Dual Theme)
// ==============================================================================

import React, { useState } from 'react';
import {
  Layers,
  PlusCircle,
  Bird,
  ShieldCheck,
  TrendingUp,
  History,
} from 'lucide-react';
import { FlockCard } from '@/components/flocks/FlockCard';
import { AddFlockModal } from '@/components/flocks/AddFlockModal';
import { DailyLogModal } from '@/components/logs/DailyLogModal';
import { usePoultry } from '@/lib/context/PoultryContext';

export default function FlocksPage() {
  const { flockAnalyticsList } = usePoultry();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [quickLogFlockId, setQuickLogFlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'historical'>('active');

  const activeFlocks = flockAnalyticsList.filter((f) => f.status === 'active');
  const historicalFlocks = flockAnalyticsList.filter((f) => f.status !== 'active');

  const totalLivingHens = activeFlocks.reduce((sum, f) => sum + f.current_count, 0);
  const totalInitialHens = activeFlocks.reduce((sum, f) => sum + f.initial_count, 0);
  const overallSurvival =
    totalInitialHens > 0 ? +((totalLivingHens / totalInitialHens) * 100).toFixed(2) : 100;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/40 text-white border border-slate-800/80 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Flock Lifecycle &amp; Batch Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Track layer batches from pullet placement to peak lay, survival curves, and lifetime egg output.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Register New Flock</span>
        </button>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Active Flocks</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {activeFlocks.length} Active Pens
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Bird className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Active Living Capacity</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {totalLivingHens.toLocaleString()}{' '}
              <span className="text-xs text-slate-400 font-normal">/ {totalInitialHens.toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Overall Flock Survival</p>
            <p className="text-xl font-bold text-teal-700 dark:text-teal-300 font-mono">
              {overallSurvival}% Survival
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Active Flocks ({activeFlocks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('historical')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'historical'
              ? 'bg-amber-50 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Culled &amp; Archived Batches ({historicalFlocks.length})</span>
        </button>
      </div>

      {/* Flock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(activeTab === 'active' ? activeFlocks : historicalFlocks).map((flock) => (
          <FlockCard
            key={flock.id}
            flock={flock}
            onOpenQuickLogForFlock={(id) => setQuickLogFlockId(id)}
          />
        ))}
      </div>

      {/* Add Flock Modal */}
      <AddFlockModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Quick Log Modal for specific flock */}
      <DailyLogModal
        isOpen={Boolean(quickLogFlockId)}
        initialFlockId={quickLogFlockId || undefined}
        onClose={() => setQuickLogFlockId(null)}
      />
    </div>
  );
}
