'use client';

// ==============================================================================
// Eggstra - 30-Day Egg Production vs Expected Laying Curve Chart (Dual Theme)
// ==============================================================================

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { usePoultry } from '@/lib/context/PoultryContext';

export const EggProductionChart: React.FC = () => {
  const { layingCurveData, selectedFlockId, activeFlocks } = usePoultry();
  const [viewMode, setViewMode] = useState<'eggs' | 'trays'>('eggs');

  const selectedFlockName =
    selectedFlockId === 'all'
      ? 'All Active Flocks'
      : activeFlocks.find((f) => f.id === selectedFlockId)?.flock_name || 'Selected Flock';

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[200px]">
          <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center justify-between">
            <span>{data.date}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono">{data.henDayRate}% Hen-Day</span>
          </p>
          <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
              Actual Output:
            </span>
            <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {viewMode === 'eggs'
                ? `${data.actualProduction.toLocaleString()} eggs`
                : `${data.traysPacked} trays`}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
              Expected Curve (90%):
            </span>
            <span className="font-mono text-amber-600 dark:text-amber-300">
              {viewMode === 'eggs'
                ? `${data.expectedBenchmark.toLocaleString()} eggs`
                : `${(data.expectedBenchmark / 30.0).toFixed(1)} trays`}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <span>Good: {data.goodEggs.toLocaleString()}</span>
            <span className="text-orange-500">Damaged: {data.damagedEggs.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              30-Day Egg Production vs Standard Laying Curve
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tracking actual daily collection for {selectedFlockName} against 90% peak commercial benchmark
          </p>
        </div>

        {/* View Switcher: Eggs vs 30-Egg Trays */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 self-start sm:self-auto text-xs">
          <button
            onClick={() => setViewMode('eggs')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              viewMode === 'eggs'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Total Eggs
          </button>
          <button
            onClick={() => setViewMode('trays')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              viewMode === 'trays'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            30-Egg Trays
          </button>
        </div>
      </div>

      {/* Recharts Composed Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={layingCurveData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="eggBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
            <XAxis
              dataKey="dayLabel"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(val) => (viewMode === 'eggs' ? `${(val / 1000).toFixed(1)}k` : `${val}`)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
              formatter={(value) => <span className="text-slate-700 dark:text-slate-300">{value}</span>}
            />
            <Bar
              dataKey={viewMode === 'eggs' ? 'actualProduction' : 'traysPacked'}
              name={viewMode === 'eggs' ? 'Actual Eggs Collected' : 'Trays Packed (30-egg)'}
              fill="url(#eggBarGrad)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Line
              type="monotone"
              dataKey={viewMode === 'eggs' ? 'expectedBenchmark' : (entry: any) => +(entry.expectedBenchmark / 30.0).toFixed(1)}
              name="Expected Commercial Curve (90%)"
              stroke="#f59e0b"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 5, fill: '#f59e0b' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
