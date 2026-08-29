'use client';

// ==============================================================================
// Eggstra - Sales Ledger & POS Transactions Table Component (PHP ₱ & Dual Theme)
// ==============================================================================

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Printer,
  DollarSign,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  Clock,
  Egg,
  Coins,
} from 'lucide-react';
import { usePoultry } from '@/lib/context/PoultryContext';
import { SalesRecord, PaymentStatus, ItemType } from '@/lib/types/poultry';
import { formatPHP, CURRENCY_SYMBOL } from '@/lib/utils/formatters';
import { ExportCSVButton } from '../common/ExportCSVButton';
import { InvoiceModal } from './InvoiceModal';

const ITEM_LABELS: Record<ItemType, string> = {
  eggs_tray: '30-Egg Trays',
  eggs_piece: 'Loose Eggs',
  cull_birds: 'Spent Hens',
  poultry_manure: 'Manure (Bags)',
};

export const SalesTable: React.FC = () => {
  const { sales, deleteSale, updateSale } = usePoultry();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('all');
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<SalesRecord | null>(null);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        s.buyer_name.toLowerCase().includes(q) ||
        s.sale_date.includes(q) ||
        ITEM_LABELS[s.item_type]?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || s.payment_status === statusFilter;
      const matchesType = itemTypeFilter === 'all' || s.item_type === itemTypeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [sales, searchQuery, statusFilter, itemTypeFilter]);

  const totalFilteredRevenue = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + (Number(s.total_revenue) || (s.quantity * s.unit_price)), 0);
  }, [filteredSales]);

  const exportData = useMemo(() => {
    return filteredSales.map((s) => ({
      Invoice_ID: s.id,
      Sale_Date: s.sale_date,
      Buyer_Name: s.buyer_name,
      Item_Type: ITEM_LABELS[s.item_type] || s.item_type,
      Quantity: s.quantity,
      Unit_Price_PHP: s.unit_price,
      Total_Revenue_PHP: s.total_revenue || +(s.quantity * s.unit_price).toFixed(2),
      Payment_Status: s.payment_status,
    }));
  }, [filteredSales]);

  const handleTogglePayment = async (sale: SalesRecord) => {
    const nextStatus: PaymentStatus =
      sale.payment_status === 'paid' ? 'pending' : 'paid';
    await updateSale(sale.id, { payment_status: nextStatus });
  };

  const handleDelete = async (id: string, buyer: string) => {
    if (window.confirm(`Are you sure you want to delete invoice for ${buyer}?`)) {
      await deleteSale(id);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, item, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300">
            <span className="text-slate-500 dark:text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-white dark:bg-slate-900">All Statuses</option>
              <option value="paid" className="bg-white dark:bg-slate-900">Paid</option>
              <option value="pending" className="bg-white dark:bg-slate-900">Pending</option>
              <option value="partial" className="bg-white dark:bg-slate-900">Partial</option>
            </select>
          </div>

          {/* Product Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300">
            <span className="text-slate-500 dark:text-slate-400">Product:</span>
            <select
              value={itemTypeFilter}
              onChange={(e) => setItemTypeFilter(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-white dark:bg-slate-900">All Products</option>
              <option value="eggs_tray" className="bg-white dark:bg-slate-900">30-Egg Trays</option>
              <option value="eggs_piece" className="bg-white dark:bg-slate-900">Loose Eggs</option>
              <option value="cull_birds" className="bg-white dark:bg-slate-900">Spent Hens</option>
              <option value="poultry_manure" className="bg-white dark:bg-slate-900">Manure Sacks</option>
            </select>
          </div>
        </div>

        {/* Revenue Total & CSV Export */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right text-xs">
            <span className="text-slate-500 dark:text-slate-400 block">Filtered Total:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
              {formatPHP(totalFilteredRevenue)}
            </span>
          </div>
          <ExportCSVButton filename="eggstra_sales_ledger_php" data={exportData} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs sm:text-sm text-slate-700 dark:text-slate-300 border-collapse">
          <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-3.5">Date</th>
              <th className="py-3 px-3.5">Buyer / Customer</th>
              <th className="py-3 px-3.5">Product</th>
              <th className="py-3 px-3.5 text-right">Quantity</th>
              <th className="py-3 px-3.5 text-right">Unit Price (₱)</th>
              <th className="py-3 px-3.5 text-right">Total Revenue (PHP)</th>
              <th className="py-3 px-3.5 text-center">Payment Status</th>
              <th className="py-3 px-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-sans">
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500">
                  No matching sales records found.
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-3.5 font-mono text-slate-500 dark:text-slate-400">{sale.sale_date}</td>
                  <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-slate-100">{sale.buyer_name}</td>
                  <td className="py-3 px-3.5">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                      {ITEM_LABELS[sale.item_type] || sale.item_type}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-medium text-slate-800 dark:text-slate-200">
                    {sale.quantity.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono text-slate-500 dark:text-slate-400">
                    {formatPHP(sale.unit_price)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatPHP(Number(sale.total_revenue) || (sale.quantity * sale.unit_price))}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <button
                      onClick={() => handleTogglePayment(sale)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase transition-all cursor-pointer ${
                        sale.payment_status === 'paid'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                          : sale.payment_status === 'pending'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                          : 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30 hover:bg-sky-500/25'
                      }`}
                      title="Click to toggle payment status"
                    >
                      {sale.payment_status}
                    </button>
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedReceiptSale(sale)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                        title="Print official receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sale.id, sale.buyer_name)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Printable Receipt Modal */}
      <InvoiceModal
        sale={selectedReceiptSale}
        isOpen={Boolean(selectedReceiptSale)}
        onClose={() => setSelectedReceiptSale(null)}
      />
    </div>
  );
};
