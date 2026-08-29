'use client';

// ==============================================================================
// Eggstra - Add Expense Record Modal (Philippine Peso ₱ & Dual Theme)
// ==============================================================================

import React, { useState } from 'react';
import { X, Calendar, Tag, CheckCircle2, AlertTriangle, Coins } from 'lucide-react';
import { usePoultry } from '@/lib/context/PoultryContext';
import { ExpenseCategory } from '@/lib/types/poultry';
import { CURRENCY_SYMBOL } from '@/lib/utils/formatters';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS: { id: ExpenseCategory; label: string; placeholder: string }[] = [
  { id: 'feed', label: 'Feed & Nutrition', placeholder: 'e.g., Commercial Layer Mash 16% (50kg Bags), Limestone Grit' },
  { id: 'medication_vaccines', label: 'Medication & Vaccines', placeholder: 'e.g., Newcastle + IB Water Soluble Vaccine, Vitamins' },
  { id: 'labor', label: 'Farm Staff Labor', placeholder: 'e.g., Weekly Farm Hand & Egg Packing Wages' },
  { id: 'bedding', label: 'Bedding & Litter', placeholder: 'e.g., Kiln-Dried Pine Wood Shavings Bales' },
  { id: 'utilities', label: 'Electricity & Utilities', placeholder: 'e.g., Poultry Ventilation & Water Pump Meralco Bill' },
  { id: 'other', label: 'Maintenance & Other', placeholder: 'e.g., Drinker Nipple Spares, Egg Trays, Disinfectant' },
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addExpense } = usePoultry();

  const [category, setCategory] = useState<ExpenseCategory>('feed');
  const [itemName, setItemName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [totalCost, setTotalCost] = useState<number>(1750); // Default PHP
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCategory = CATEGORY_OPTIONS.find((c) => c.id === category) || CATEGORY_OPTIONS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!itemName.trim()) {
      setErrorMessage('Please describe the item or expense.');
      return;
    }
    if (totalCost < 0) {
      setErrorMessage('Total cost cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addExpense({
        category,
        item_name: itemName.trim(),
        quantity: Number(quantity),
        total_cost: Number(totalCost),
        date: expenseDate,
      });

      setItemName('');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-xs">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center text-amber-500 font-bold">
                <span>{CURRENCY_SYMBOL}</span>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Log Farm Expense (PHP)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Record layer feed, medication, bedding, and labor costs in Philippine Peso</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/20 border border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Expense Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all text-left truncate cursor-pointer ${
                    category === c.id
                      ? 'bg-amber-50 dark:bg-amber-500/20 border-amber-500 text-amber-800 dark:text-amber-300'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Item Name / Description
            </label>
            <input
              type="text"
              placeholder={currentCategory.placeholder}
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Quantity & Cost & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Quantity / Units
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0.1, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Total Cost (₱)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={totalCost}
                onChange={(e) => setTotalCost(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-rose-600 dark:text-rose-400 font-mono focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Date
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Logging...' : 'Save Expense Record (PHP)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
