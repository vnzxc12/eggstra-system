'use client';

// ==============================================================================
// Eggstra - Printable POS Invoice & Thermal Receipt (Philippine Peso ₱)
// ==============================================================================

import React, { useEffect } from 'react';
import { X, Printer, Egg } from 'lucide-react';
import { SalesRecord } from '@/lib/types/poultry';
import { formatPHP, CURRENCY_SYMBOL } from '@/lib/utils/formatters';

interface InvoiceModalProps {
  sale: SalesRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

const ITEM_NAMES: Record<string, string> = {
  eggs_tray: 'Fresh Table Eggs (30-Egg Tray)',
  eggs_piece: 'Table Eggs (Loose Individual Pieces)',
  cull_birds: 'Spent / Culled Live Hens',
  poultry_manure: 'Processed Organic Poultry Manure (50kg Bag)',
};

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ sale, isOpen, onClose }) => {
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

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${sale.id.slice(-6).toUpperCase()}`;

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

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden my-0 sm:my-6 max-h-[92vh] sm:max-h-[88vh] flex flex-col">
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header (No Print) */}
        <div className="no-print flex items-center justify-between px-4 py-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-sm">Receipt &amp; Invoice Summary (PHP)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 bg-white text-slate-900 font-mono text-xs select-text" id="printable-receipt">
          {/* Farm Header */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
            <div className="flex items-center justify-center gap-1.5 font-bold text-base tracking-wider text-emerald-800">
              <Egg className="w-4 h-4 text-amber-600 fill-amber-500/30" />
              <span>EGGSTRA POULTRY FARMS PH</span>
            </div>
            <p className="text-[10px] text-slate-500">Commercial Layer &amp; Egg Operations</p>
            <p className="text-[10px] text-slate-500">Batangas / Central Luzon • BAI-REG-2026-994</p>
            <div className="pt-2 text-[11px] font-bold text-slate-800 flex justify-between">
              <span>{invoiceNumber}</span>
              <span>{sale.sale_date}</span>
            </div>
          </div>

          {/* Customer & Status */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-bold text-slate-800">{sale.buyer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment:</span>
              <span className="font-bold uppercase text-emerald-700">{sale.payment_status}</span>
            </div>
          </div>

          {/* Itemized Line Items */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
            <div className="flex justify-between font-bold text-slate-600 pb-1 border-b border-slate-200">
              <span>Description</span>
              <span>Total</span>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-800">
                {ITEM_NAMES[sale.item_type] || sale.item_type}
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>
                  {sale.quantity} @ {formatPHP(sale.unit_price)}
                </span>
                <span className="font-bold text-slate-900">
                  {formatPHP(Number(sale.total_revenue) || (sale.quantity * sale.unit_price))}
                </span>
              </div>
            </div>
          </div>

          {/* Total Amount Due */}
          <div className="py-4 space-y-1 text-right">
            <div className="flex justify-between text-sm font-extrabold text-slate-900">
              <span>TOTAL (PHP):</span>
              <span>{formatPHP(Number(sale.total_revenue) || (sale.quantity * sale.unit_price))}</span>
            </div>
            <p className="text-[10px] text-slate-500 pt-2 text-center">
              Maraming salamat sa pagtangkilik sa Eggstra Farms!
            </p>
            <p className="text-[9px] text-slate-400 text-center">
              Store fresh table eggs at 12°C - 15°C away from direct sunlight.
            </p>
          </div>
        </div>

        {/* Modal Footer Controls (No Print) */}
        <div className="no-print p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
