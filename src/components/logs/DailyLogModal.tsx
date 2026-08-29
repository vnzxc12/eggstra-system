'use client';

// ==============================================================================
// Eggstra - Quick Daily Egg & Mortality Log Modal (Mobile Bottom-Sheet & Steppers)
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  Egg,
  AlertTriangle,
  Scale,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePoultry } from '@/lib/context/PoultryContext';
import { useToast } from '@/components/common/ToastContext';

interface DailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFlockId?: string;
  initialDate?: string;
}

export const DailyLogModal: React.FC<DailyLogModalProps> = ({
  isOpen,
  onClose,
  initialFlockId,
  initialDate,
}) => {
  const { activeFlocks, addDailyLog, dailyLogs } = usePoultry();
  const { showToast } = useToast();

  const [flockId, setFlockId] = useState<string>('');
  const [logDate, setLogDate] = useState<string>('');
  const [goodEggs, setGoodEggs] = useState<number>(0);
  const [damagedEggs, setDamagedEggs] = useState<number>(0);
  const [mortalityCount, setMortalityCount] = useState<number>(0);
  const [culledCount, setCulledCount] = useState<number>(0);
  const [feedKg, setFeedKg] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize defaults on open
  useEffect(() => {
    if (isOpen) {
      const today = initialDate || new Date().toISOString().split('T')[0];
      setLogDate(today);

      const targetFlock = initialFlockId || (activeFlocks[0] ? activeFlocks[0].id : '');
      setFlockId(targetFlock);

      const existing = dailyLogs.find((l) => l.flock_id === targetFlock && l.log_date === today);
      if (existing) {
        setGoodEggs(existing.good_eggs);
        setDamagedEggs(existing.damaged_eggs);
        setMortalityCount(existing.mortality_count);
        setCulledCount(existing.culled_count);
        setFeedKg(existing.feed_consumed_kg);
        setNotes(existing.notes || '');
      } else {
        const flock = activeFlocks.find((f) => f.id === targetFlock);
        const count = flock ? flock.current_count : 4000;
        const defaultGood = Math.round(count * 0.90);
        const defaultDamaged = Math.round(defaultGood * 0.015);
        const defaultFeed = +(count * 0.115).toFixed(1);

        setGoodEggs(defaultGood);
        setDamagedEggs(defaultDamaged);
        setMortalityCount(1);
        setCulledCount(0);
        setFeedKg(defaultFeed);
        setNotes('');
      }
      setErrorMessage(null);
    }
  }, [isOpen, initialFlockId, initialDate, activeFlocks, dailyLogs]);

  const selectedFlock = activeFlocks.find((f) => f.id === flockId);
  const livingBirds = selectedFlock ? selectedFlock.current_count : 0;

  const totalEggs = (Number(goodEggs) || 0) + (Number(damagedEggs) || 0);
  const traysPacked = +((Number(goodEggs) || 0) / 30.0).toFixed(2);
  const henDayRate = livingBirds > 0 ? +((totalEggs / livingBirds) * 100).toFixed(1) : 0;
  const mortalityLoss = (Number(mortalityCount) || 0) + (Number(culledCount) || 0);
  const mortalityPercent = livingBirds > 0 ? +(((Number(mortalityCount) || 0) / livingBirds) * 100).toFixed(3) : 0;

  const adjustValue = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    delta: number,
    min = 0,
    max = Infinity
  ) => {
    setter((prev) => Math.max(min, Math.min(max, (Number(prev) || 0) + delta)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!flockId) {
      setErrorMessage('Please select a flock.');
      return;
    }
    if (!logDate) {
      setErrorMessage('Please select a date.');
      return;
    }
    if (goodEggs < 0 || damagedEggs < 0 || mortalityCount < 0 || culledCount < 0 || feedKg < 0) {
      setErrorMessage('Values cannot be negative.');
      return;
    }
    if (mortalityLoss > livingBirds && livingBirds > 0) {
      setErrorMessage(`Total mortality + culls (${mortalityLoss}) cannot exceed living birds (${livingBirds}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      await addDailyLog({
        flock_id: flockId,
        log_date: logDate,
        good_eggs: Number(goodEggs),
        damaged_eggs: Number(damagedEggs),
        mortality_count: Number(mortalityCount),
        culled_count: Number(culledCount),
        feed_consumed_kg: Number(feedKg),
        notes: notes.trim() || null,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#f59e0b', '#3b82f6'],
      });

      showToast(
        'Daily Record Saved',
        `Successfully logged ${goodEggs.toLocaleString()} eggs (${traysPacked} trays) for ${logDate}.`,
        'success',
        4000
      );

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save daily log.');
      showToast('Log Save Error', err.message || 'Failed to sync with Supabase.', 'error', 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[94vh] sm:max-h-[88vh] flex flex-col transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xs shrink-0">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Egg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Daily Production Entry
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  Live Sync
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Egg collection, mortality, and layer feed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/20 border border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Flock & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Select Flock / Pen
              </label>
              <select
                value={flockId}
                onChange={(e) => setFlockId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              >
                {activeFlocks.map((flock) => (
                  <option key={flock.id} value={flock.id}>
                    {flock.flock_name} ({flock.current_count.toLocaleString()} hens)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Log Date
              </label>
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Live Calculated Stats Strip */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <div className="text-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Total Eggs</span>
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">{totalEggs.toLocaleString()}</span>
            </div>
            <div className="text-center border-x border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 block uppercase tracking-wider">30-Trays</span>
              <span className="text-base sm:text-lg font-bold text-amber-700 dark:text-amber-300 font-mono">{traysPacked}</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider">Hen-Day Lay</span>
              <span
                className={`text-base sm:text-lg font-bold font-mono ${
                  henDayRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {henDayRate}%
              </span>
            </div>
          </div>

          {/* 1. Good Eggs Counter */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Egg className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                Good Table Eggs (Pieces)
              </label>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-mono font-medium">
                = {(goodEggs / 30.0).toFixed(1)} trays
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={goodEggs}
                onChange={(e) => setGoodEggs(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            {/* Touch Steppers */}
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {[-100, -30, -10, +10, +30, +100].map((delta) => (
                <button
                  type="button"
                  key={delta}
                  onClick={() => adjustValue(setGoodEggs, delta, 0)}
                  className="py-2 text-xs font-bold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700/60 active:scale-95 transition-all cursor-pointer text-center"
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Damaged Eggs */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Damaged / Cracked Eggs
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {totalEggs > 0 ? ((damagedEggs / totalEggs) * 100).toFixed(1) : 0}% loss
              </span>
            </div>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={damagedEggs}
              onChange={(e) => setDamagedEggs(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-orange-600 dark:text-orange-400 font-mono focus:outline-none focus:border-orange-500"
            />
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {[-10, -1, +1, +5, +10, +25].map((delta) => (
                <button
                  type="button"
                  key={delta}
                  onClick={() => adjustValue(setDamagedEggs, delta, 0)}
                  className="py-2 text-xs font-bold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700/60 active:scale-95 transition-all cursor-pointer text-center"
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Mortality & Culls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  Dead Birds (Mortality)
                </label>
                <span className="text-[11px] text-rose-600 dark:text-rose-400 font-mono">
                  {mortalityPercent}%
                </span>
              </div>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={mortalityCount}
                onChange={(e) => setMortalityCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-bold text-rose-600 dark:text-rose-400 font-mono focus:outline-none focus:border-rose-500"
              />
              <div className="grid grid-cols-4 gap-1.5">
                {[-1, +1, +2, +5].map((delta) => (
                  <button
                    type="button"
                    key={delta}
                    onClick={() => adjustValue(setMortalityCount, delta, 0)}
                    className="py-1.5 text-xs font-bold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700/60 active:scale-95 transition-all cursor-pointer text-center"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Culled / Sick Birds
              </label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={culledCount}
                onChange={(e) => setCulledCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-900 dark:text-slate-200 font-mono focus:outline-none focus:border-slate-500"
              />
              <div className="grid grid-cols-4 gap-1.5">
                {[-1, +1, +2, +5].map((delta) => (
                  <button
                    type="button"
                    key={delta}
                    onClick={() => adjustValue(setCulledCount, delta, 0)}
                    className="py-1.5 text-xs font-bold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700/60 active:scale-95 transition-all cursor-pointer text-center"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Feed Intake */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Feed Fed (Kilograms)
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                ~{(feedKg / 50).toFixed(1)} bags (50kg)
              </span>
            </div>
            <input
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              value={feedKg}
              onChange={(e) => setFeedKg(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[-50, -10, +10, +50, +100].map((delta) => (
                <button
                  type="button"
                  key={delta}
                  onClick={() => adjustValue(setFeedKg, delta, 0)}
                  className="py-1.5 text-xs font-bold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700/60 active:scale-95 transition-all cursor-pointer text-center"
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Notes &amp; Observations (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Cleaned drinkers, normal appetite"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 pb-2 sm:pb-0">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Saving Record...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Daily Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
