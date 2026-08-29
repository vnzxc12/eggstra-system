'use client';

// ==============================================================================
// Eggstra - Responsive Skeleton Loaders (Tailwind animate-pulse)
// ==============================================================================

import React from 'react';

export const MetricCardSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-8 w-36 bg-slate-300 dark:bg-slate-700 rounded-lg" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-between">
        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>
    </div>
  );
};

export const MetricCardsGridSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-panel rounded-2xl p-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-1.5">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="h-6 w-28 bg-slate-300 dark:bg-slate-700 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-3 w-64 bg-slate-100 dark:bg-slate-900 rounded-md" />
        </div>
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
      <div className="h-64 w-full bg-slate-100 dark:bg-slate-950/60 rounded-xl flex items-end justify-between p-4 gap-2">
        {[40, 65, 30, 80, 55, 90, 75, 45, 85, 70, 60, 95].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
      <div className="space-y-2">
        <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 w-full bg-slate-100 dark:bg-slate-900 rounded-xl" />
        ))}
      </div>
    </div>
  );
};
