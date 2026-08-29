'use client';

// ==============================================================================
// Eggstra - Analytics, Reports & P&L Statement (Philippine Peso ₱ & Dual Theme)
// ==============================================================================

import React, { useMemo } from 'react';
import {
  DollarSign,
  Egg,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  Coins,
} from 'lucide-react';
import { usePoultry } from '@/lib/context/PoultryContext';
import { formatPHP, CURRENCY_SYMBOL } from '@/lib/utils/formatters';
import { ExportCSVButton } from '@/components/common/ExportCSVButton';

export default function ReportsPage() {
  const { flocks, dailyLogs, sales, expenses, flockAnalyticsList, metrics } = usePoultry();

  // P&L Breakdown in PHP
  const plSummary = useMemo(() => {
    const eggSales = sales
      .filter((s) => s.item_type === 'eggs_tray' || s.item_type === 'eggs_piece')
      .reduce((sum, s) => sum + (Number(s.total_revenue) || s.quantity * s.unit_price), 0);

    const birdSales = sales
      .filter((s) => s.item_type === 'cull_birds')
      .reduce((sum, s) => sum + (Number(s.total_revenue) || s.quantity * s.unit_price), 0);

    const manureSales = sales
      .filter((s) => s.item_type === 'poultry_manure')
      .reduce((sum, s) => sum + (Number(s.total_revenue) || s.quantity * s.unit_price), 0);

    const grossRevenue = eggSales + birdSales + manureSales;

    const feedCost = expenses
      .filter((e) => e.category === 'feed')
      .reduce((sum, e) => sum + (Number(e.total_cost) || 0), 0);

    const vetCost = expenses
      .filter((e) => e.category === 'medication_vaccines')
      .reduce((sum, e) => sum + (Number(e.total_cost) || 0), 0);

    const laborCost = expenses
      .filter((e) => e.category === 'labor')
      .reduce((sum, e) => sum + (Number(e.total_cost) || 0), 0);

    const otherCost = expenses
      .filter((e) => !['feed', 'medication_vaccines', 'labor'].includes(e.category))
      .reduce((sum, e) => sum + (Number(e.total_cost) || 0), 0);

    const totalExpenses = feedCost + vetCost + laborCost + otherCost;
    const netProfit = grossRevenue - totalExpenses;
    const netMarginPercent = grossRevenue > 0 ? +((netProfit / grossRevenue) * 100).toFixed(1) : 0;

    return {
      eggSales,
      birdSales,
      manureSales,
      grossRevenue,
      feedCost,
      vetCost,
      laborCost,
      otherCost,
      totalExpenses,
      netProfit,
      netMarginPercent,
    };
  }, [sales, expenses]);

  // Comprehensive Farm Summary Data for Export in PHP
  const farmSummaryCSV = useMemo(() => {
    return [
      {
        Metric: 'Total Gross Revenue (PHP)',
        Value: plSummary.grossRevenue.toFixed(2),
      },
      {
        Metric: 'Table Egg Revenue (PHP)',
        Value: plSummary.eggSales.toFixed(2),
      },
      {
        Metric: 'Culled Bird Sales (PHP)',
        Value: plSummary.birdSales.toFixed(2),
      },
      {
        Metric: 'Manure Fertilizer Sales (PHP)',
        Value: plSummary.manureSales.toFixed(2),
      },
      {
        Metric: 'Total Feed Expense (PHP)',
        Value: plSummary.feedCost.toFixed(2),
      },
      {
        Metric: 'Total Vet & Vaccine Expense (PHP)',
        Value: plSummary.vetCost.toFixed(2),
      },
      {
        Metric: 'Labor Expense (PHP)',
        Value: plSummary.laborCost.toFixed(2),
      },
      {
        Metric: 'Net Farm Operating Profit (PHP)',
        Value: plSummary.netProfit.toFixed(2),
      },
      {
        Metric: 'Net Operating Margin (%)',
        Value: `${plSummary.netMarginPercent}%`,
      },
      {
        Metric: 'Feed Conversion Ratio (kg/dozen)',
        Value: metrics.feedConversionRatio,
      },
    ];
  }, [plSummary, metrics]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30 text-white border border-slate-800/80 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Executive Analytics &amp; Financial P&amp;L (PHP ₱)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Comprehensive Philippine layer flock production benchmarking, Profit &amp; Loss statements, and batch CSV reports.
          </p>
        </div>

        <ExportCSVButton
          filename="eggstra_financial_pl_report_php"
          data={farmSummaryCSV}
          label="Export P&L Summary (CSV)"
        />
      </div>

      {/* 1. Profit & Loss (P&L) Statement Card */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">
              Farm Profit &amp; Loss (P&amp;L) Statement (PHP)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Cumulative Performance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
              <span>Operating Revenue</span>
              <span className="font-mono text-sm">{formatPHP(plSummary.grossRevenue)}</span>
            </h3>

            <div className="space-y-2 text-xs divide-y divide-slate-200 dark:divide-slate-800/50">
              <div className="flex justify-between pt-1 text-slate-700 dark:text-slate-300">
                <span>Table Egg Sales (Trays &amp; Pieces):</span>
                <span className="font-mono font-semibold">{formatPHP(plSummary.eggSales)}</span>
              </div>
              <div className="flex justify-between pt-1.5 text-slate-700 dark:text-slate-300">
                <span>Spent / Cull Hen Disposals:</span>
                <span className="font-mono font-semibold">{formatPHP(plSummary.birdSales)}</span>
              </div>
              <div className="flex justify-between pt-1.5 text-slate-700 dark:text-slate-300">
                <span>Organic Poultry Manure Sacks:</span>
                <span className="font-mono font-semibold">{formatPHP(plSummary.manureSales)}</span>
              </div>
            </div>
          </div>

          {/* Operating Costs Breakdown */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <h3 className="font-bold text-xs uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center justify-between">
              <span>Operating Expenses</span>
              <span className="font-mono text-sm">-{formatPHP(plSummary.totalExpenses)}</span>
            </h3>

            <div className="space-y-2 text-xs divide-y divide-slate-200 dark:divide-slate-800/50">
              <div className="flex justify-between pt-1 text-slate-700 dark:text-slate-300">
                <span>Commercial Layer Mash (50kg bags):</span>
                <span className="font-mono font-semibold text-rose-600 dark:text-rose-300">{formatPHP(plSummary.feedCost)}</span>
              </div>
              <div className="flex justify-between pt-1.5 text-slate-700 dark:text-slate-300">
                <span>Medications, Vaccines &amp; Supplements:</span>
                <span className="font-mono font-semibold">{formatPHP(plSummary.vetCost)}</span>
              </div>
              <div className="flex justify-between pt-1.5 text-slate-700 dark:text-slate-300">
                <span>Farm Hand Wages &amp; Labor:</span>
                <span className="font-mono font-semibold">{formatPHP(plSummary.laborCost)}</span>
              </div>
              <div className="flex justify-between pt-1.5 text-slate-700 dark:text-slate-300">
                <span>Utilities (Meralco Power), Bedding &amp; Spares:</span>
                <span className="font-mono font-semibold">{formatPHP(plSummary.otherCost)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Profit Bottom Line */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-100 via-emerald-50 to-slate-100 dark:from-slate-900 dark:via-emerald-950/30 dark:to-slate-900 border border-emerald-300 dark:border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Net Operating Farm Margin (PHP)
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                  plSummary.netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                {formatPHP(plSummary.netProfit)}
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                ({plSummary.netMarginPercent}% margin)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-500/40 text-xs font-bold">
              Profitable Operation
            </span>
          </div>
        </div>
      </div>

      {/* 2. Flock Performance Comparison Matrix */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">
              Flock Comparative Performance Matrix
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Hen-Housed vs Hen-Day metrics</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-3.5">Flock / Pen</th>
                <th className="py-3 px-3.5">Breed</th>
                <th className="py-3 px-3.5 text-right">Age (Wks)</th>
                <th className="py-3 px-3.5 text-right">Headcount</th>
                <th className="py-3 px-3.5 text-right text-emerald-700 dark:text-emerald-400">Survival %</th>
                <th className="py-3 px-3.5 text-right text-amber-700 dark:text-amber-400">Lifetime Eggs</th>
                <th className="py-3 px-3.5 text-right font-mono">Eggs / Hen</th>
                <th className="py-3 px-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-sans">
              {flockAnalyticsList.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-slate-100">{f.flock_name}</td>
                  <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">{f.breed}</td>
                  <td className="py-3 px-3.5 text-right font-mono text-amber-700 dark:text-amber-300">{f.ageInWeeks}</td>
                  <td className="py-3 px-3.5 text-right font-mono">
                    {f.current_count.toLocaleString()} / {f.initial_count.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {f.survivalRate}%
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    {f.totalEggsProduced.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono text-amber-700 dark:text-amber-300 font-semibold">
                    {f.lifetimeEggsPerHen}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        f.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
