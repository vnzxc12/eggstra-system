'use client';

// ==============================================================================
// Eggstra - Feed & Expense Tracker Page (Philippine Peso ₱ & Dual Theme)
// ==============================================================================

import React from 'react';
import { DollarSign, Coins } from 'lucide-react';
import { FCRCalculatorCard } from '@/components/expenses/FCRCalculatorCard';
import { ExpenseTracker } from '@/components/expenses/ExpenseTracker';
import { usePoultry } from '@/lib/context/PoultryContext';

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-amber-950/40 text-white border border-slate-800/80 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Feed Inventory, FCR &amp; Farm Expenses (PHP ₱)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Calculate Feed Conversion Ratio (FCR), track feed bag runway, veterinary supplies, and labor expenses in Philippine Peso.
          </p>
        </div>
      </div>

      {/* 1. Automated Feed Conversion Ratio (FCR) & Runway Calculator */}
      <FCRCalculatorCard />

      {/* 2. Expense Ledger & Category Analysis */}
      <div className="space-y-2">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          Operating Expense Ledger (PHP ₱)
        </h3>
        <ExpenseTracker />
      </div>
    </div>
  );
}
