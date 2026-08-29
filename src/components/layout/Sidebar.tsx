'use client';

// ==============================================================================
// Eggstra - Responsive Sidebar Drawer Component (Desktop + Mobile/Tablet Off-Canvas)
// ==============================================================================

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Layers,
  ShoppingBag,
  Coins,
  BarChart3,
  Egg,
  TrendingUp,
  ShieldCheck,
  PlusCircle,
  LogOut,
  UserCheck,
  X,
} from 'lucide-react';
import { usePoultry } from '@/lib/context/PoultryContext';
import { useAuth } from '@/lib/context/AuthContext';

interface SidebarProps {
  onOpenQuickLog: () => void;
  onCloseMobileDrawer?: () => void;
  isMobileDrawer?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenQuickLog,
  onCloseMobileDrawer,
  isMobileDrawer = false,
}) => {
  const pathname = usePathname();
  const { metrics, activeFlocks } = usePoultry();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Daily Logs', href: '/logs', icon: ClipboardList },
    { name: 'Flock Management', href: '/flocks', icon: Layers, badge: activeFlocks.length },
    { name: 'Sales & POS (₱)', href: '/sales', icon: ShoppingBag },
    { name: 'Feed & Expenses (₱)', href: '/expenses', icon: Coins },
    { name: 'Analytics & Reports', href: '/reports', icon: BarChart3 },
  ];

  const handleNavClick = () => {
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  return (
    <aside
      className={`flex flex-col w-72 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-screen text-slate-800 dark:text-slate-100 transition-colors ${
        isMobileDrawer ? 'h-full' : 'hidden lg:flex'
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <Link href="/" onClick={handleNavClick} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-400 p-0.5 shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Egg className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-800 dark:from-white dark:via-slate-100 dark:to-emerald-300 bg-clip-text text-transparent">
                Eggstra
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                OS
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Poultry Layer Ops • PHP (₱)</p>
          </div>
        </Link>

        {isMobileDrawer && (
          <button
            onClick={onCloseMobileDrawer}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Action Button */}
      <div className="p-4">
        <button
          onClick={() => {
            if (isMobileDrawer && onCloseMobileDrawer) onCloseMobileDrawer();
            onOpenQuickLog();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Log Today&apos;s Eggs</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-400'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Session Strip & Sign Out */}
      {user && (
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="truncate max-w-[130px]">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.username}</p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Master Admin</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isMobileDrawer && onCloseMobileDrawer) onCloseMobileDrawer();
              logout();
            }}
            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mini Live KPI Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Living Hens
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
              {metrics.totalLivingBirds.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Hen-Day Lay
            </span>
            <span
              className={`font-bold font-mono ${
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
