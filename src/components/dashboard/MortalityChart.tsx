'use client';

// ==============================================================================
// Eggstra - Daily Mortality & Culls Bar Chart (Dual-Theme Support)
// ==============================================================================

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { usePoultry } from '@/lib/context/PoultryContext';

export const MortalityChart: React.FC = () => {
  const { mortalityChartData } = usePoultry();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[180px]">
          <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1 flex justify-between">
            <span>{data.date}</span>
            <span
              className={`font-mono font-bold ${
                data.status === 'critical'
                  ? 'text-rose-600 dark:text-rose-400'
                  : data.status === 'warning'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {data.ratePercent}%
            </span>
          </p>
          <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
            <span className="text-rose-600 dark:text-rose-400 font-medium">Dead (Mortality):</span>
            <span className="font-bold font-mono text-rose-600 dark:text-rose-300">{data.mortality} birds</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span>Culled / Isolated:</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{data.culled} birds</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            Status:{' '}
            <span
              className={`font-semibold uppercase ${
                data.status === 'critical'
                  ? 'text-rose-600 dark:text-rose-400'
                  : data.status === 'warning'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {data.status}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Daily Mortality &amp; Culls (14-Day)</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Severity thresholds: Green &lt;0.1%, Yellow &gt;0.1%, Red &gt;0.3%
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Safe
          </span>
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Warning
          </span>
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Critical
          </span>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mortalityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="mortality" name="Mortality" radius={[4, 4, 0, 0]} maxBarSize={20}>
              {mortalityChartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.status === 'critical'
                      ? '#f43f5e'
                      : entry.status === 'warning'
                      ? '#f59e0b'
                      : '#10b981'
                  }
                />
              ))}
            </Bar>
            <Bar dataKey="culled" name="Culled" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
