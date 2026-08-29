'use client';

// ==============================================================================
// Eggstra - AppShell Component (Layout Wrapper with Dual-Theme)
// ==============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Layers,
  ShoppingBag,
  DollarSign,
  BarChart3,
  Plus,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DailyLogModal } from '../logs/DailyLogModal';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  const mobileNavItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Logs', href: '/logs', icon: ClipboardList },
    { name: 'Flocks', href: '/flocks', icon: Layers },
    { name: 'Sales', href: '/sales', icon: ShoppingBag },
    { name: 'Expenses', href: '/expenses', icon: DollarSign },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Desktop Sidebar */}
      <Sidebar onOpenQuickLog={() => setIsQuickLogOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-6">
        <Header onOpenQuickLog={() => setIsQuickLogOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <button
        onClick={() => setIsQuickLogOpen(true)}
        className="lg:hidden fixed right-4 bottom-20 z-40 w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
        aria-label="Quick daily egg log"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Global Quick Log Modal */}
      <DailyLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
      />
    </div>
  );
};
