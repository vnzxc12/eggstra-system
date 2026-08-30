'use client';

// ==============================================================================
// Eggstra - Point of Sale (POS) Modal (Mobile Bottom-Sheet & Numeric Touch)
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Coins,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  User,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePoultry } from '@/lib/context/PoultryContext';
import { useToast } from '@/components/common/ToastContext';
import { ItemType, PaymentStatus } from '@/lib/types/poultry';
import { formatPHP, CURRENCY_SYMBOL } from '@/lib/utils/formatters';

interface POSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ITEM_DEFAULTS: Record<ItemType, { label: string; unit: string; defaultPrice: number }> = {
  eggs_tray: { label: '30-Egg Table Tray', unit: 'trays', defaultPrice: 240.00 },
  eggs_piece: { label: 'Loose Eggs (Individual)', unit: 'eggs', defaultPrice: 8.50 },
  cull_birds: { label: 'Spent / Cull Live Hens', unit: 'birds', defaultPrice: 220.00 },
  poultry_manure: { label: 'Organic Manure Sacks', unit: 'sacks (50kg)', defaultPrice: 150.00 },
};

export const POSModal: React.FC<POSModalProps> = ({ isOpen, onClose }) => {
  const { addSale } = usePoultry();
  const { showToast } = useToast();

  const [itemType, setItemType] = useState<ItemType>('eggs_tray');
  const [quantity, setQuantity] = useState<number>(100);
  const [unitPrice, setUnitPrice] = useState<number>(ITEM_DEFAULTS.eggs_tray.defaultPrice);
  const [buyerName, setBuyerName] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalRevenue = +(quantity * unitPrice).toFixed(2);

  const handleItemTypeChange = (type: ItemType) => {
    setItemType(type);
    setUnitPrice(ITEM_DEFAULTS[type].defaultPrice);
    if (type === 'eggs_piece') setQuantity(300);
    else if (type === 'cull_birds') setQuantity(50);
    else if (type === 'poultry_manure') setQuantity(20);
    else setQuantity(100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!buyerName.trim()) {
      setErrorMessage('Please enter the customer / buyer name.');
      return;
    }
    if (quantity <= 0) {
      setErrorMessage('Quantity must be greater than zero.');
      return;
    }
    if (unitPrice < 0) {
      setErrorMessage('Unit price cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addSale({
        item_type: itemType,
        quantity: Number(quantity),
        unit_price: Number(unitPrice),
        buyer_name: buyerName.trim(),
        payment_status: paymentStatus,
        sale_date: saleDate,
      });

      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b'],
      });

      showToast(
        'Sales Order Recorded',
        `Invoice for ${buyerName} (${formatPHP(totalRevenue)}) saved successfully.`,
        'success',
        4000
      );

      setBuyerName('');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record sales order.');
      showToast('Sales Record Error', err.message || 'Failed to save sale.', 'error', 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Clickable backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col transition-all">
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-400 p-0.5 shadow-xs shrink-0">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">Create Sales Invoice (PHP)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Egg trays, spent hens, and organic manure</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/20 border border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Item Type Quick Selector Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Product / Item Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ITEM_DEFAULTS) as ItemType[]).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => handleItemTypeChange(type)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                    itemType === type
                      ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <span className="font-bold block text-slate-900 dark:text-slate-200">{ITEM_DEFAULTS[type].label}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Default: {formatPHP(ITEM_DEFAULTS[type].defaultPrice)} / {ITEM_DEFAULTS[type].unit}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Buyer Name & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Customer / Buyer Name
              </label>
              <input
                type="text"
                placeholder="e.g., Manila Bakery, Tagaytay Mart"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Sale Date
              </label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Quantity & Unit Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Quantity ({ITEM_DEFAULTS[itemType].unit})
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Unit Price (₱)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Payment Status & Total Preview in PHP */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Payment Status
              </label>
              <div className="flex gap-1.5 sm:gap-2">
                {(['paid', 'pending', 'partial'] as PaymentStatus[]).map((st) => (
                  <button
                    type="button"
                    key={st}
                    onClick={() => setPaymentStatus(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      paymentStatus === st
                        ? st === 'paid'
                          ? 'bg-emerald-600 text-white'
                          : st === 'pending'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-sky-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                Total Invoice
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {formatPHP(totalRevenue)}
              </span>
            </div>
          </div>

          {/* Action Buttons: Cancel and Submit */}
          <div className="pt-3 pb-2 sm:pb-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 order-2 sm:order-1"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 order-1 sm:order-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording Sale...' : 'Save & Issue Invoice (PHP)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
