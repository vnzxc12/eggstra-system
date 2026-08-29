'use client';

// ==============================================================================
// Eggstra - Database, SQL Schema & Settings Page (PHP & Dual Theme)
// ==============================================================================

import React, { useState } from 'react';
import {
  Database,
  Copy,
  Check,
  RotateCcw,
  Download,
  Code2,
  Zap,
  Sun,
  Moon,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { usePoultry } from '@/lib/context/PoultryContext';
import { useTheme } from '@/lib/context/ThemeContext';

const SCHEMA_SQL_SNIPPET = `-- ==============================================================================
-- Eggstra Poultry Farm Management System - Supabase Migration Schema
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Flocks Table
CREATE TABLE IF NOT EXISTS public.flocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    flock_name TEXT NOT NULL,
    breed TEXT NOT NULL,
    placement_date DATE NOT NULL,
    initial_count INT NOT NULL CHECK (initial_count > 0),
    current_count INT NOT NULL CHECK (current_count >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'culled', 'sold', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Daily Logs Table
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flock_id UUID NOT NULL REFERENCES public.flocks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    mortality_count INT NOT NULL DEFAULT 0 CHECK (mortality_count >= 0),
    culled_count INT NOT NULL DEFAULT 0 CHECK (culled_count >= 0),
    good_eggs INT NOT NULL DEFAULT 0 CHECK (good_eggs >= 0),
    damaged_eggs INT NOT NULL DEFAULT 0 CHECK (damaged_eggs >= 0),
    total_eggs INT GENERATED ALWAYS AS (good_eggs + damaged_eggs) STORED,
    trays_packed NUMERIC(10,2) GENERATED ALWAYS AS (good_eggs / 30.0) STORED,
    feed_consumed_kg NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (feed_consumed_kg >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_flock_log_date UNIQUE (flock_id, log_date)
);

-- 3. Sales Records Table (PHP)
CREATE TABLE IF NOT EXISTS public.sales_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    item_type TEXT NOT NULL CHECK (item_type IN ('eggs_tray', 'eggs_piece', 'cull_birds', 'poultry_manure')),
    quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    total_revenue NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    buyer_name TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'partial')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Expenses Table (PHP)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT NOT NULL CHECK (category IN ('feed', 'medication_vaccines', 'labor', 'bedding', 'utilities', 'other')),
    item_name TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    total_cost NUMERIC(10,2) NOT NULL CHECK (total_cost >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Automatic Flock Headcount Recalculation Trigger
CREATE OR REPLACE FUNCTION public.fn_sync_flock_headcount()
RETURNS TRIGGER AS $$
DECLARE
    target_flock_id UUID;
    v_initial_count INT;
    v_total_lost INT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_flock_id := OLD.flock_id;
    ELSE
        target_flock_id := NEW.flock_id;
    END IF;

    SELECT initial_count INTO v_initial_count FROM public.flocks WHERE id = target_flock_id;
    IF v_initial_count IS NOT NULL THEN
        SELECT COALESCE(SUM(mortality_count + culled_count), 0) INTO v_total_lost FROM public.daily_logs WHERE flock_id = target_flock_id;
        UPDATE public.flocks SET current_count = GREATEST(0, v_initial_count - v_total_lost) WHERE id = target_flock_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalculate_flock_count ON public.daily_logs;
CREATE TRIGGER trg_recalculate_flock_count
AFTER INSERT OR UPDATE OR DELETE ON public.daily_logs
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_flock_headcount();

-- 6. Row Level Security (RLS)
ALTER TABLE public.flocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own flocks" ON public.flocks FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can manage own daily logs" ON public.daily_logs FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can manage own sales records" ON public.sales_records FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can manage own expenses" ON public.expenses FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);`;

const WIPE_DATA_SQL = `-- Wipe all farm data and start fresh with empty tables:
TRUNCATE TABLE public.daily_logs, public.sales_records, public.expenses, public.flocks CASCADE;`;

export default function SettingsPage() {
  const {
    resetToSampleData,
    clearAllData,
    exportAllToJSON,
    isSupabaseLive,
    flocks,
    dailyLogs,
    sales,
    expenses,
  } = usePoultry();
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [copiedWipeSQL, setCopiedWipeSQL] = useState(false);
  const [resetConfirmed, setResetConfirmed] = useState(false);
  const [wipeConfirmed, setWipeConfirmed] = useState(false);

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SCHEMA_SQL_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyWipeSQL = () => {
    navigator.clipboard.writeText(WIPE_DATA_SQL);
    setCopiedWipeSQL(true);
    setTimeout(() => setCopiedWipeSQL(false), 2500);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all farm records back to Philippine commercial 30-day sample data in PHP (₱)?')) {
      resetToSampleData();
      setResetConfirmed(true);
      setTimeout(() => setResetConfirmed(false), 2500);
    }
  };

  const handleClearAllData = async () => {
    const confirm1 = window.confirm(
      '⚠️ WARNING: Are you sure you want to WIPE AND DELETE ALL DATA?\n\nThis will remove all flocks, daily egg logs, sales records, and expenses so you can start completely fresh.'
    );
    if (!confirm1) return;

    await clearAllData();
    setWipeConfirmed(true);
    setTimeout(() => setWipeConfirmed(false), 3000);
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportAllToJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eggstra_farm_backup_php_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/40 text-white border border-slate-800/80 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Database Configuration &amp; Appearance Settings
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Supabase connection status, theme preferences (Default Light Mode / Dark Mode), and Philippine Peso (₱) settings.
          </p>
        </div>
      </div>

      {/* 1. Appearance & Theme Settings Card */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">
              Application Theme &amp; Currency
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Eggstra defaults to clean Light Mode with instant Dark Mode toggle support.
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-xs hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>Switch to Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Switch to Light Mode</span>
              </>
            )}
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
          <span>Active Currency Standard:</span>
          <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
            Philippine Peso (₱ / PHP)
          </span>
        </div>
      </div>

      {/* 2. Supabase Connection Status Card */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                isSupabaseLive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Database Engine Status:
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-bold ${
                    isSupabaseLive
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30'
                  }`}
                >
                  {isSupabaseLive ? 'Live Supabase Connected' : 'Local Storage / Demo Mode (PHP)'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isSupabaseLive
                  ? 'Connected to live PostgreSQL database with active realtime subscriptions.'
                  : 'Operating in local browser storage with automatic commercial layer sample dataset.'}
              </p>
            </div>
          </div>
        </div>

        {/* Database statistics strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-center">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Flocks</span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">{flocks.length}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Daily Logs</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{dailyLogs.length}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Sales Records</span>
            <span className="text-lg font-bold text-amber-700 dark:text-amber-300 font-mono">{sales.length}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Expense Records</span>
            <span className="text-lg font-bold text-rose-600 dark:text-rose-400 font-mono">{expenses.length}</span>
          </div>
        </div>

        {/* Quick Connection Instructions */}
        {!isSupabaseLive && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <p className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              How to connect your live Supabase project:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
              <li>
                Create a project on{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 underline font-semibold"
                >
                  supabase.com
                </a>
              </li>
              <li>Open your project SQL Editor and paste the migration SQL below.</li>
              <li>
                Add your Project URL and Anon Key in{' '}
                <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                  .env.local
                </code>
                :
              </li>
            </ol>
            <div className="p-2.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] border border-slate-800 select-all">
              NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
              <br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
            </div>
          </div>
        )}
      </div>

      {/* 3. Farm Data Management & Wipe Controls */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Farm Data Management &amp; Database Actions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Start completely fresh with 0 records or reset to commercial Philippine sample data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Wipe All Data Button */}
          <button
            onClick={handleClearAllData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{wipeConfirmed ? 'All Data Wiped Clean!' : 'Wipe & Delete All Data (Start Clean)'}</span>
          </button>

          {/* Reset to Sample Data */}
          <button
            onClick={handleResetData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-500" />
            <span>{resetConfirmed ? 'Reset Successful!' : 'Reset to 30-Day Sample Data (PHP)'}</span>
          </button>

          {/* Backup JSON */}
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Download Farm JSON Backup</span>
          </button>
        </div>

        {/* Supabase Truncate SQL Help Box */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Supabase SQL Editor Command (to wipe cloud database):
            </span>
            <button
              onClick={handleCopyWipeSQL}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
            >
              {copiedWipeSQL ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedWipeSQL ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>
          <code className="block p-2.5 rounded-lg bg-slate-900 text-rose-400 font-mono text-xs select-all">
            {WIPE_DATA_SQL}
          </code>
        </div>
      </div>

      {/* 4. SQL Migration Viewer */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">
              PostgreSQL Migration Script (Supabase Ready)
            </h2>
          </div>

          <button
            onClick={handleCopySQL}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SQL Migration</span>
              </>
            )}
          </button>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800">
          <pre className="p-4 bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed select-text">
            {SCHEMA_SQL_SNIPPET}
          </pre>
        </div>
      </div>
    </div>
  );
}
