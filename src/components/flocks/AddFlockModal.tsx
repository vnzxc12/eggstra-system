'use client';

// ==============================================================================
// Eggstra - Add New Flock Modal (Dual Theme)
// ==============================================================================

import React, { useState } from 'react';
import { X, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';
import { usePoultry } from '@/lib/context/PoultryContext';
import { FlockStatus } from '@/lib/types/poultry';

interface AddFlockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_BREEDS = [
  'Lohmann Brown-Classic',
  'Hy-Line Brown',
  'ISA Brown',
  'Dekalb White',
  'Novogen Brown',
  'Bovans Brown',
  'H&N Nick Chick',
  'Shaver Brown',
  'Heritage Rhode Island Red',
  'Other Commercial Hybrid',
];

export const AddFlockModal: React.FC<AddFlockModalProps> = ({ isOpen, onClose }) => {
  const { addFlock } = usePoultry();

  const [flockName, setFlockName] = useState('');
  const [breed, setBreed] = useState(COMMON_BREEDS[0]);
  const [placementDate, setPlacementDate] = useState(new Date().toISOString().split('T')[0]);
  const [initialCount, setInitialCount] = useState<number>(3000);
  const [status, setStatus] = useState<FlockStatus>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!flockName.trim()) {
      setErrorMessage('Please enter a flock name or pen identifier.');
      return;
    }
    if (initialCount <= 0) {
      setErrorMessage('Initial headcount must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addFlock({
        flock_name: flockName.trim(),
        breed,
        placement_date: placementDate,
        initial_count: Number(initialCount),
        status,
      });

      setFlockName('');
      setInitialCount(3000);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create flock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xs">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Register New Flock</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add a new layer flock batch into management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/20 border border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Flock / Pen Name
            </label>
            <input
              type="text"
              placeholder="e.g., Pen 4 - Lohmann Brown 2026 Batch B"
              value={flockName}
              onChange={(e) => setFlockName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Layer Breed
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {COMMON_BREEDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Placement / Hatch Date
              </label>
              <input
                type="date"
                value={placementDate}
                onChange={(e) => setPlacementDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Initial Headcount (Birds)
              </label>
              <input
                type="number"
                min="1"
                value={initialCount}
                onChange={(e) => setInitialCount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FlockStatus)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="active">Active (Laying / Rearing)</option>
                <option value="culled">Culled / Depopulated</option>
                <option value="sold">Sold as Spent Hens</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : 'Register Flock'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
