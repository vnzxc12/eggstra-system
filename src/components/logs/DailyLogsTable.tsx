'use client';

// ==============================================================================
// Eggstra - Daily Logs History Table Component (Dual-Theme Support)
// ==============================================================================

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { usePoultry } from '@/lib/context/PoultryContext';
import { DailyLog } from '@/lib/types/poultry';
import { ExportCSVButton } from '../common/ExportCSVButton';

interface DailyLogsTableProps {
  onEditLog?: (log: DailyLog) => void;
}

export const DailyLogsTable: React.FC<DailyLogsTableProps> = ({ onEditLog }) => {
  const { dailyLogs, flocks, deleteDailyLog, updateDailyLog } = usePoultry();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFlockFilter, setSelectedFlockFilter] = useState<string>('all');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DailyLog>>({});

  const flockMap = useMemo(() => {
    const map = new Map<string, string>();
    flocks.forEach((f) => map.set(f.id, f.flock_name));
    return map;
  }, [flocks]);

  const filteredLogs = useMemo(() => {
    return dailyLogs.filter((log) => {
      const flockName = (flockMap.get(log.flock_id) || '').toLowerCase();
      const notes = (log.notes || '').toLowerCase();
      const date = log.log_date;
      const q = searchQuery.toLowerCase();

      const matchesSearch = flockName.includes(q) || notes.includes(q) || date.includes(q);
      const matchesFlock = selectedFlockFilter === 'all' || log.flock_id === selectedFlockFilter;

      return matchesSearch && matchesFlock;
    });
  }, [dailyLogs, searchQuery, selectedFlockFilter, flockMap]);

  const exportData = useMemo(() => {
    return filteredLogs.map((l) => ({
      Log_Date: l.log_date,
      Flock_Name: flockMap.get(l.flock_id) || l.flock_id,
      Good_Eggs: l.good_eggs,
      Damaged_Eggs: l.damaged_eggs,
      Total_Eggs: l.total_eggs || l.good_eggs + l.damaged_eggs,
      Trays_Packed_30: l.trays_packed || +(l.good_eggs / 30).toFixed(2),
      Mortality_Count: l.mortality_count,
      Culled_Count: l.culled_count,
      Feed_Consumed_Kg: l.feed_consumed_kg,
      Notes: l.notes || '',
    }));
  }, [filteredLogs, flockMap]);

  const handleStartEdit = (log: DailyLog) => {
    setEditingLogId(log.id);
    setEditForm({
      good_eggs: log.good_eggs,
      damaged_eggs: log.damaged_eggs,
      mortality_count: log.mortality_count,
      culled_count: log.culled_count,
      feed_consumed_kg: log.feed_consumed_kg,
      notes: log.notes || '',
    });
  };

  const handleSaveEdit = async (id: string) => {
    await updateDailyLog(id, editForm);
    setEditingLogId(null);
  };

  const handleDelete = async (id: string, date: string) => {
    if (window.confirm(`Are you sure you want to delete the daily log for ${date}?`)) {
      await deleteDailyLog(id);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      {/* Controls: Search, Filter, Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search date, flock, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Flock Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <select
              value={selectedFlockFilter}
              onChange={(e) => setSelectedFlockFilter(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-white dark:bg-slate-900">
                All Flocks
              </option>
              {flocks.map((f) => (
                <option key={f.id} value={f.id} className="bg-white dark:bg-slate-900">
                  {f.flock_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CSV Export Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {filteredLogs.length} record{filteredLogs.length === 1 ? '' : 's'}
          </span>
          <ExportCSVButton filename="eggstra_daily_logs" data={exportData} />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs sm:text-sm text-slate-700 dark:text-slate-300 border-collapse">
          <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-3.5">Date &amp; Flock</th>
              <th className="py-3 px-3.5 text-right">Good Eggs</th>
              <th className="py-3 px-3.5 text-right">30-Trays</th>
              <th className="py-3 px-3.5 text-right">Damaged</th>
              <th className="py-3 px-3.5 text-right text-rose-600 dark:text-rose-400">Mortality</th>
              <th className="py-3 px-3.5 text-right text-slate-500 dark:text-slate-400">Culls</th>
              <th className="py-3 px-3.5 text-right">Feed (kg)</th>
              <th className="py-3 px-3.5">Notes</th>
              <th className="py-3 px-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-sans">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 dark:text-slate-500">
                  No matching logs found. Click &quot;+ Quick Log&quot; to add a new record.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isEditing = editingLogId === log.id;
                const flockName = flockMap.get(log.flock_id) || 'Unknown Flock';

                return (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    {/* Date & Flock */}
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-200">{log.log_date}</div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate max-w-[160px]">
                        {flockName}
                      </div>
                    </td>

                    {/* Good Eggs */}
                    <td className="py-3 px-3.5 text-right font-mono font-medium text-emerald-700 dark:text-emerald-400">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.good_eggs ?? log.good_eggs}
                          onChange={(e) =>
                            setEditForm({ ...editForm, good_eggs: parseInt(e.target.value) || 0 })
                          }
                          className="w-20 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-right text-xs"
                        />
                      ) : (
                        log.good_eggs.toLocaleString()
                      )}
                    </td>

                    {/* Trays Packed */}
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                      {log.trays_packed || (log.good_eggs / 30.0).toFixed(2)}
                    </td>

                    {/* Damaged Eggs */}
                    <td className="py-3 px-3.5 text-right font-mono text-orange-600 dark:text-orange-400">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.damaged_eggs ?? log.damaged_eggs}
                          onChange={(e) =>
                            setEditForm({ ...editForm, damaged_eggs: parseInt(e.target.value) || 0 })
                          }
                          className="w-16 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-right text-xs"
                        />
                      ) : (
                        log.damaged_eggs
                      )}
                    </td>

                    {/* Mortality */}
                    <td className="py-3 px-3.5 text-right font-mono font-semibold text-rose-600 dark:text-rose-400">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.mortality_count ?? log.mortality_count}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              mortality_count: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-16 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-right text-xs"
                        />
                      ) : (
                        log.mortality_count
                      )}
                    </td>

                    {/* Culls */}
                    <td className="py-3 px-3.5 text-right font-mono text-slate-500 dark:text-slate-400">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.culled_count ?? log.culled_count}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              culled_count: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-16 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-right text-xs"
                        />
                      ) : (
                        log.culled_count
                      )}
                    </td>

                    {/* Feed Kg */}
                    <td className="py-3 px-3.5 text-right font-mono text-slate-700 dark:text-slate-300">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editForm.feed_consumed_kg ?? log.feed_consumed_kg}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              feed_consumed_kg: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-20 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-right text-xs"
                        />
                      ) : (
                        `${log.feed_consumed_kg} kg`
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-3.5 text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.notes ?? log.notes ?? ''}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs"
                        />
                      ) : (
                        log.notes || <span className="text-slate-400 dark:text-slate-600">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(log.id)}
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                              title="Save changes"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingLogId(null)}
                              className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(log)}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                              title="Edit log"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(log.id, log.log_date)}
                              className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete log"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
