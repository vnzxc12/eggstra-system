'use client';

// ==============================================================================
// Eggstra - Executive Dashboard Metric Cards (High Contrast & Dual Theme)
// ==============================================================================

import React from 'react';
import {
  Egg,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Coins,
  Scale,
  ArrowUpRight,
  Package,
  Layers,
} from 'lucide-react';
import { usePoultry } from '@/lib/context/PoultryContext';
import { formatPHP, CURRENCY_SYMBOL } from '@/lib/utils/formatters';

import { MetricCardsGridSkeleton } from '../common/SkeletonLoader';

export const MetricCards: React.FC = () => {
  const { metrics, selectedFlockId, activeFlocks, isLoading } = usePoultry();

  if (isLoading) {
    return <MetricCardsGridSkeleton />;
  }

  const selectedFlockName =
    selectedFlockId === 'all'
      ? `All Active Flocks (${activeFlocks.length})`
      : activeFlocks.find((f) => f.id === selectedFlockId)?.flock_name || 'Selected Flock';

  return (
    <div className="space-y-4">
      {/* Mortality Alert Banner if triggered */}
      {metrics.mortalityAlertLevel !== 'normal' && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
            metrics.mortalityAlertLevel === 'critical'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/50 text-rose-800 dark:text-rose-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/50 text-amber-900 dark:text-amber-200'
          }`}
        >
          <div
            className={`p-2 rounded-xl shrink-0 ${
              metrics.mortalityAlertLevel === 'critical'
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
            }`}
          >
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm tracking-wide">
                {metrics.mortalityAlertLevel === 'critical'
                  ? 'CRITICAL MORTALITY THRESHOLD BREACHED'
                  : 'ELEVATED MORTALITY WARNING'}
              </h4>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/10 dark:bg-black/40">
                {metrics.mortalityRatePercentage}% Daily Loss
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
              {metrics.mortalityAlertLevel === 'critical'
                ? `Today's mortality of ${metrics.todayMortality} birds exceeds the standard safety threshold of 0.30%. Inspect water supply, temperature, and isolate symptomatic birds immediately.`
                : `Today's mortality of ${metrics.todayMortality} birds exceeds 0.10% baseline. Monitor flock behavior, feed intake, and ventilation.`}
            </p>
          </div>
        </div>
      )}

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Living Birds Count */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Living Flock Headcount
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-mono mt-1.5">
                {metrics.totalLivingBirds.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="truncate max-w-[150px] font-medium">{selectedFlockName}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Tracked</span>
          </div>
        </div>

        {/* 2. Today's Egg Production & Trays */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Egg className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                Today&apos;s Egg Production
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-300 font-mono mt-1.5">
                {metrics.todayTotalEggs.toLocaleString()}
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">eggs</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
              {metrics.todayTraysPacked} trays (30-egg)
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {metrics.todayDamagedEggs} cracks ({metrics.todayTotalEggs > 0 ? ((metrics.todayDamagedEggs / metrics.todayTotalEggs) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        </div>

        {/* 3. Hen-Day Laying Percentage */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Hen-Day Laying Rate
              </p>
              <h3
                className={`text-2xl sm:text-3xl font-black font-mono mt-1.5 ${
                  metrics.henDayPercentage >= 85
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : metrics.henDayPercentage >= 75
                    ? 'text-amber-600 dark:text-amber-300'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {metrics.henDayPercentage}%
              </h3>
            </div>
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                metrics.henDayPercentage >= 80
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
              <span>Target: &gt;80%</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {metrics.henDayPercentage >= 80 ? 'Optimal Yield' : 'Sub-Target'}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  metrics.henDayPercentage >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, metrics.henDayPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4. Mortality Rate & Loss */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                Daily Mortality Rate
              </p>
              <h3
                className={`text-2xl sm:text-3xl font-black font-mono mt-1.5 ${
                  metrics.mortalityAlertLevel === 'critical'
                    ? 'text-rose-600 dark:text-rose-400'
                    : metrics.mortalityAlertLevel === 'warning'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {metrics.mortalityRatePercentage}%
              </h3>
            </div>
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                metrics.mortalityAlertLevel === 'critical'
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
                  : metrics.mortalityAlertLevel === 'warning'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 font-medium">
            <span>
              {metrics.todayMortality} dead / {metrics.todayCulls} culls
            </span>
            <span
              className={`font-bold ${
                metrics.mortalityAlertLevel === 'normal'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : metrics.mortalityAlertLevel === 'warning'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {metrics.mortalityAlertLevel === 'normal' ? 'Normal (<0.1%)' : 'Exceeded Limit'}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Financial & Feed Performance Strip in Philippine Peso (₱) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Today's Net Profit (PHP) */}
        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
              <span>{CURRENCY_SYMBOL}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Today&apos;s Net Margin (PHP)</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {formatPHP(metrics.todayNetProfit)}
              </p>
            </div>
          </div>
          <div className="text-right text-xs font-semibold">
            <p className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">+{formatPHP(metrics.todayRevenue, 0)}</p>
            <p className="text-slate-500 dark:text-slate-400 font-mono">-{formatPHP(metrics.todayExpense, 0)}</p>
          </div>
        </div>

        {/* 30-Day Monthly Net Profit (PHP) */}
        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">30-Day Net Margin (PHP)</p>
              <p className="text-lg font-extrabold text-teal-700 dark:text-teal-300 font-mono">
                {formatPHP(metrics.monthlyNetProfit)}
              </p>
            </div>
          </div>
          <div className="text-right text-xs font-semibold">
            <p className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">+{formatPHP(metrics.monthlyRevenue, 0)}</p>
            <p className="text-slate-500 dark:text-slate-400 font-mono">-{formatPHP(metrics.monthlyExpense, 0)}</p>
          </div>
        </div>

        {/* Feed Conversion Ratio (FCR) */}
        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Feed Conversion (FCR)</p>
              <p className="text-lg font-extrabold text-amber-700 dark:text-amber-300 font-mono">
                {metrics.feedConversionRatio} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">kg/doz</span>
              </p>
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold">
              Standard
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
