'use client';

// ==============================================================================
// Eggstra - Expenses Ledger & Category Analysis (Philippine Peso ₱ & Dual Theme)
// ==============================================================================

import React, { useState, useMemo } from 'react';
import {
  Search,
  Trash2,
  Tag,
  Plus,
  Coins,
} from 'lucide-react';
import { usePoultry } from '@/lib/context/PoultryContext';
import { ExpenseRecord, ExpenseCategory } from '@/lib/types/poultry';
import { formatPHP, CURRENCY_SYMBOL } from '@/lib/utils/formatters';
import { ExportCSVButton } from '../common/ExportCSVButton';
import { AddExpenseModal } from './AddExpenseModal';

const CATEGORY_NAMES: Record<ExpenseCategory, string> = {
  feed: 'Feed & Nutrition',
  medication_vaccines: 'Medication & Vaccines',
  labor: 'Farm Staff Labor',
  bedding: 'Bedding & Litter',
  utilities: 'Electricity & Utilities',
  other: 'Maintenance & Other',
};

export const ExpenseTracker: React.FC = () => {
  const { expenses, deleteExpense } = usePoultry();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        e.item_name.toLowerCase().includes(q) ||
        e.date.includes(q) ||
        CATEGORY_NAMES[e.category]?.toLowerCase().includes(q);

      const matchesCat = categoryFilter === 'all' || e.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [expenses, searchQuery, categoryFilter]);

  const totalCost = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (Number(e.total_cost) || 0), 0);
  }, [filteredExpenses]);

  // Category breakdown distribution
  const categoryBreakdown = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    expenses.forEach((e) => {
      const curr = map.get(e.category) || 0;
      map.set(e.category, curr + (Number(e.total_cost) || 0));
    });
    return Array.from(map.entries()).map(([cat, total]) => ({
      category: cat,
      label: CATEGORY_NAMES[cat] || cat,
      total,
      percentage: expenses.reduce((s, x) => s + Number(x.total_cost), 0) > 0
        ? +((total / expenses.reduce((s, x) => s + Number(x.total_cost), 0)) * 100).toFixed(1)
        : 0,
    }));
  }, [expenses]);

  const exportData = useMemo(() => {
    return filteredExpenses.map((e) => ({
      Expense_ID: e.id,
      Date: e.date,
      Category: CATEGORY_NAMES[e.category] || e.category,
      Item_Name: e.item_name,
      Quantity: e.quantity,
      Total_Cost_PHP: e.total_cost,
    }));
  }, [filteredExpenses]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete expense for ${name}?`)) {
      await deleteExpense(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Cost Distribution Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {categoryBreakdown.map((item) => (
          <div
            key={item.category}
            onClick={() => setCategoryFilter(categoryFilter === item.category ? 'all' : item.category)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              categoryFilter === item.category
                ? 'bg-amber-50 dark:bg-amber-500/20 border-amber-400 dark:border-amber-500/50 shadow-xs'
                : 'glass-panel hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">{item.label}</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono block mt-0.5">
              {formatPHP(item.total, 0)}
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-medium">{item.percentage}% share</span>
          </div>
        ))}
      </div>

      {/* Main Table Panel */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search expense description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300">
              <Tag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="all" className="bg-white dark:bg-slate-900">All Categories</option>
                <option value="feed" className="bg-white dark:bg-slate-900">Feed & Nutrition</option>
                <option value="medication_vaccines" className="bg-white dark:bg-slate-900">Medication & Vaccines</option>
                <option value="labor" className="bg-white dark:bg-slate-900">Farm Staff Labor</option>
                <option value="bedding" className="bg-white dark:bg-slate-900">Bedding & Litter</option>
                <option value="utilities" className="bg-white dark:bg-slate-900">Utilities</option>
                <option value="other" className="bg-white dark:bg-slate-900">Other</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <div className="text-right text-xs">
              <span className="text-slate-500 dark:text-slate-400 block">Total Expenses:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 font-mono text-sm">
                {formatPHP(totalCost)}
              </span>
            </div>
            <ExportCSVButton filename="eggstra_expenses_php" data={exportData} />
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">Item Description</th>
                <th className="py-3 px-3.5 text-right">Quantity</th>
                <th className="py-3 px-3.5 text-right">Total Cost (PHP)</th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-sans">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No matching expenses found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-slate-500 dark:text-slate-400">{exp.date}</td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-700 dark:text-amber-300 text-xs">
                        {CATEGORY_NAMES[exp.category] || exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-slate-200">{exp.item_name}</td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-700 dark:text-slate-300">{exp.quantity}</td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                      {formatPHP(Number(exp.total_cost))}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <button
                        onClick={() => handleDelete(exp.id, exp.item_name)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
