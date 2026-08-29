'use client';

// ==============================================================================
// Eggstra - Navigation Sidebar Component (Dual-Theme Support)
// ==============================================================================

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Layers,
  ShoppingBag,
  DollarSign,
  BarChart3,
  Settings,
  Egg,
  TrendingUp,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';
import { usePoultry } from '@/lib/context/PoultryContext';

interface SidebarProps {
  onOpenQuickLog: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenQuickLog }) => {
  const pathname = usePathname();
  const { metrics, activeFlocks } = usePoultry();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Daily Logs', href: '/logs', icon: ClipboardList },
    { name: 'Flock Management', href: '/flocks', icon: Layers, badge: activeFlocks.length },
    { name: 'Sales & POS (₱)', href: '/sales', icon: ShoppingBag },
    { name: 'Feed & Expenses (₱)', href: '/expenses', icon: DollarSign },
    { name: 'Analytics & Reports', href: '/reports', icon: BarChart3 },
    { name: 'Database & SQL', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-950/90 border-r border-slate-200 dark:border-slate-800/80 min-h-screen text-slate-800 dark:text-slate-200 transition-colors">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-400 p-0.5 shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Egg className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-amber-700 dark:from-white dark:via-slate-100 dark:to-amber-200 bg-clip-text text-transparent">
                Eggstra
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                OS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Poultry Layer Ops • PHP (₱)</p>
          </div>
        </Link>
      </div>

      {/* Quick Action Button */}
      <div className="p-4">
        <button
          onClick={onOpenQuickLog}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-md shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Log Today&apos;s Eggs</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Mini Live KPI Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40">
        <div className="rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-3 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Living Hens
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {metrics.totalLivingBirds.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Hen-Day Lay
            </span>
            <span
              className={`font-semibold font-mono ${
                metrics.henDayPercentage >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {metrics.henDayPercentage}%
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                metrics.henDayPercentage >= 80
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
              style={{ width: `${Math.min(100, metrics.henDayPercentage)}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
