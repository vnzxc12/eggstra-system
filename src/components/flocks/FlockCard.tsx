'use client';

// ==============================================================================
// Eggstra - Flock Detail Card Component (Dual Theme)
// ==============================================================================

import React, { useState } from 'react';
import {
  Bird,
  Calendar,
  Layers,
  Egg,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  MoreVertical,
  Trash2,
  PlusCircle,
} from 'lucide-react';
import { usePoultry } from '@/lib/context/PoultryContext';
import { FlockAnalytics, FlockStatus } from '@/lib/types/poultry';

interface FlockCardProps {
  flock: FlockAnalytics;
  onOpenQuickLogForFlock: (flockId: string) => void;
}

export const FlockCard: React.FC<FlockCardProps> = ({ flock, onOpenQuickLogForFlock }) => {
  const { updateFlock, deleteFlock } = usePoultry();
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const getProductionStage = (ageWeeks: number) => {
    if (ageWeeks < 18) return { label: 'Pullet Stage', color: 'text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/30' };
    if (ageWeeks <= 35) return { label: 'Peak Laying Stage (90%+)', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30' };
    if (ageWeeks <= 65) return { label: 'Mid Laying Cycle', color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30' };
    return { label: 'End of Lay Cycle', color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-500/10 border-slate-300 dark:border-slate-500/30' };
  };

  const stage = getProductionStage(flock.ageInWeeks);

  const handleStatusChange = async (newStatus: FlockStatus) => {
    await updateFlock(flock.id, { status: newStatus });
    setShowStatusMenu(false);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${flock.flock_name}? All associated daily logs will also be removed.`
      )
    ) {
      await deleteFlock(flock.id);
    }
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-4 relative overflow-hidden flex flex-col justify-between">
      {/* Top Details & Badges */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                  flock.status === 'active'
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30'
                    : flock.status === 'culled'
                    ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30'
                    : flock.status === 'sold'
                    ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                }`}
              >
                {flock.status}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${stage.color}`}>
                {stage.label}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">{flock.flock_name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Bird className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{flock.breed}</span>
              <span>•</span>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Placed {flock.placement_date}</span>
            </p>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showStatusMenu && (
              <div className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Change Status
                </div>
                {(['active', 'culled', 'sold', 'archived'] as FlockStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between capitalize cursor-pointer ${
                      flock.status === st ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
                    }`}
                  >
                    <span>{st}</span>
                    {flock.status === st && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </button>
                ))}
                <div className="border-t border-slate-200 dark:border-slate-800 my-1" />
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Flock</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Headcount and Age Strip */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Current Headcount
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {flock.current_count.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ {flock.initial_count.toLocaleString()}</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
              {flock.survivalRate}% Survival
            </span>
          </div>

          <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Flock Age</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold text-amber-700 dark:text-amber-300 font-mono">
                {flock.ageInWeeks}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">weeks</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              ({flock.ageInDays.toLocaleString()} days)
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-2 text-center text-xs border-t border-slate-200 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/40">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Lifetime Eggs</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
              {flock.totalEggsProduced.toLocaleString()}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/40">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Eggs / Hen</span>
            <span className="font-bold text-amber-700 dark:text-amber-400 font-mono">
              {flock.lifetimeEggsPerHen}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/40">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Cum. Mortality</span>
            <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
              {flock.cumulativeMortalityRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer: Quick Log Button */}
      {flock.status === 'active' && (
        <button
          onClick={() => onOpenQuickLogForFlock(flock.id)}
          className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-900 dark:hover:bg-emerald-600/20 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>+ Log Today for {flock.flock_name.split('-')[0].trim()}</span>
        </button>
      )}
    </div>
  );
};
