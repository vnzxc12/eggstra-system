'use client';

// ==============================================================================
// Eggstra - Financial Overview Chart (Philippine Peso ₱ / PHP & Dual Theme)
// ==============================================================================

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';
import { usePoultry } from '@/lib/context/PoultryContext';
import { formatPHP, formatPHPShort, CURRENCY_SYMBOL } from '@/lib/utils/formatters';

export const FinancialOverviewChart: React.FC = () => {
  const { financialTrendData, metrics } = usePoultry();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[220px]">
          <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1">
            {data.date}
          </p>
          <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
            <span>Sales Revenue:</span>
            <span className="font-bold font-mono">{formatPHP(data.revenue)}</span>
          </div>
          <div className="flex justify-between items-center text-amber-600 dark:text-amber-400">
            <span>Feed Expense:</span>
            <span className="font-mono">{formatPHP(data.feedExpense)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span>Other Expenses:</span>
            <span className="font-mono">{formatPHP(data.otherExpense)}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800 font-bold">
            <span className="text-slate-800 dark:text-slate-300">Net Daily Margin:</span>
            <span
              className={`font-mono ${
                data.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatPHP(data.netProfit)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Revenue vs Operating Cost Trend (PHP)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Egg tray sales vs commercial layer mash &amp; farm expenses over 14 days
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Monthly Net: </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatPHP(metrics.monthlyNetProfit)}
            </span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={financialTrendData} margin={{ top: 10, right: 10, left: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="feedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
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
              tickFormatter={(val) => formatPHPShort(val)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
              formatter={(value) => <span className="text-slate-700 dark:text-slate-300">{value}</span>}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Sales Revenue (₱)"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#revGrad)"
            />
            <Area
              type="monotone"
              dataKey="feedExpense"
              name="Feed Cost (₱)"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#feedGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
