'use client';

// ==============================================================================
// Eggstra - Sales & Point of Sale (POS) Page (Philippine Peso ₱ & Dual Theme)
// ==============================================================================

import React, { useState } from 'react';
import {
  ShoppingBag,
  PlusCircle,
  Package,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { SalesTable } from '@/components/sales/SalesTable';
import { POSModal } from '@/components/sales/POSModal';
import { usePoultry } from '@/lib/context/PoultryContext';
import { formatPHP, CURRENCY_SYMBOL } from '@/lib/utils/formatters';

export default function SalesPage() {
  const { metrics, sales } = usePoultry();
  const [isPOSOpen, setIsPOSOpen] = useState(false);

  // Calculate pending revenue total
  const pendingSales = sales.filter((s) => s.payment_status === 'pending');
  const pendingRevenueTotal = pendingSales.reduce(
    (sum, s) => sum + (Number(s.total_revenue) || s.quantity * s.unit_price),
    0
  );

  // Total 30-egg trays sold
  const totalTraysSold = sales
    .filter((s) => s.item_type === 'eggs_tray')
    .reduce((sum, s) => sum + Number(s.quantity), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-amber-950/40 text-white border border-slate-800/80 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Sales, Invoicing &amp; Point of Sale (PHP ₱)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Issue orders for 30-egg table trays, loose pieces, cull hens, and manure fertilizer with printable official receipts in Philippine Peso.
          </p>
        </div>

        <button
          onClick={() => setIsPOSOpen(true)}
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ New Sales Order (POS)</span>
        </button>
      </div>

      {/* KPI Cards in PHP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Today&apos;s Sales (PHP)</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {formatPHP(metrics.todayRevenue)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
              <span>{CURRENCY_SYMBOL}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">30-Day Revenue (PHP)</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-1">
                {formatPHP(metrics.monthlyRevenue)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Trays Dispatched</p>
              <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 font-mono mt-1">
                {totalTraysSold.toLocaleString()} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">trays</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pending Receivables (PHP)</p>
              <p
                className={`text-2xl font-extrabold font-mono mt-1 ${
                  pendingRevenueTotal > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {formatPHP(pendingRevenueTotal)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Transactions Ledger */}
      <SalesTable />

      {/* Point of Sale Modal */}
      <POSModal isOpen={isPOSOpen} onClose={() => setIsPOSOpen(false)} />
    </div>
  );
}
