'use client';

// ==============================================================================
// Eggstra - Feed Conversion Ratio (FCR) & Feed Runway Calculator (Dual Theme)
// ==============================================================================

import React, { useState } from 'react';
import { Scale, Package, Sparkles } from 'lucide-react';
import { usePoultry } from '@/lib/context/PoultryContext';

export const FCRCalculatorCard: React.FC = () => {
  const { metrics, activeFlocks } = usePoultry();

  const [stockBagsOnHand, setStockBagsOnHand] = useState<number>(180); // 50kg bags

  // Daily flock feed consumption in kg
  const dailyFlockIntakeKg = activeFlocks.reduce((sum, f) => sum + f.current_count * 0.115, 0); // 115g/bird
  const totalStockKg = stockBagsOnHand * 50;
  const feedRunwayDays = dailyFlockIntakeKg > 0 ? Math.floor(totalStockKg / dailyFlockIntakeKg) : 0;

  const getFCRBenchmark = (fcr: number) => {
    if (fcr <= 1.40) return { label: 'Elite Feed Efficiency', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30' };
    if (fcr <= 1.60) return { label: 'Standard Commercial Target', color: 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border-teal-300 dark:border-teal-500/30' };
    if (fcr <= 1.80) return { label: 'Sub-Optimal (Check Waste)', color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30' };
    return { label: 'High Feed Wastage Alert', color: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30' };
  };

  const currentBenchmark = getFCRBenchmark(metrics.feedConversionRatio);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Live FCR Benchmark Gauge Card */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Feed Conversion Ratio (FCR)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Kilograms of feed consumed per dozen eggs produced</p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${currentBenchmark.color}`}>
            {currentBenchmark.label}
          </span>
        </div>

        {/* Big Number Gauge */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              30-Day Operational FCR
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold text-amber-700 dark:text-amber-300 font-mono">
                {metrics.feedConversionRatio}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">kg / dozen</span>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div>
              Industry Target: <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">1.35 - 1.55 kg</span>
            </div>
            <div>
              Egg Equivalent: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">~115g feed / egg</span>
            </div>
          </div>
        </div>

        {/* FCR Explanation Note */}
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Why FCR Matters in the Philippines:
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-[11px]">
            Commercial layer mash accounts for 65-70% of total egg farm expenses. Keeping FCR under 1.50 kg/dozen ensures strong profit margins per 30-egg tray sold.
          </p>
        </div>
      </div>

      {/* 2. Feed Inventory & Runway Forecast Card */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Feed Stock Runway Forecast
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Days of layer mash remaining based on active flock intake</p>
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              feedRunwayDays > 10
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30'
                : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30'
            }`}
          >
            {feedRunwayDays > 10 ? 'Healthy Stock' : 'Reorder Needed'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Estimated Feed Runway
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {feedRunwayDays}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">days left</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              at {dailyFlockIntakeKg.toFixed(0)} kg / day intake
            </span>
          </div>

          <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
            <label className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider mb-1">
              Bags on Hand (50kg)
            </label>
            <input
              type="number"
              min="0"
              value={stockBagsOnHand}
              onChange={(e) => setStockBagsOnHand(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-base font-bold text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
              = {(stockBagsOnHand * 50).toLocaleString()} kg total
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span>Active Laying Hens: {activeFlocks.reduce((sum, f) => sum + f.current_count, 0).toLocaleString()}</span>
          <span className="text-amber-600 dark:text-amber-400 font-mono">Reorder trigger: &lt; 7 days</span>
        </div>
      </div>
    </div>
  );
};
