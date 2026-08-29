'use client';

// ==============================================================================
// Eggstra Poultry Farm Management System - Unified Data & Realtime Context
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Flock,
  DailyLog,
  SalesRecord,
  ExpenseRecord,
  DashboardMetrics,
  FlockAnalytics,
  LayingCurvePoint,
  MortalityPoint,
  DailyFinancialPoint,
} from '../types/poultry';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { INITIAL_FLOCKS, INITIAL_DAILY_LOGS, INITIAL_SALES, INITIAL_EXPENSES } from '../data/sampleData';

interface PoultryContextType {
  // Data entities
  flocks: Flock[];
  activeFlocks: Flock[];
  dailyLogs: DailyLog[];
  sales: SalesRecord[];
  expenses: ExpenseRecord[];
  isLoading: boolean;
  isSupabaseLive: boolean;

  // Selected flock filter for dashboard/logs
  selectedFlockId: string | 'all';
  setSelectedFlockId: (id: string | 'all') => void;

  // Computed metrics & charts
  metrics: DashboardMetrics;
  flockAnalyticsList: FlockAnalytics[];
  getFlockAnalytics: (flockId: string) => FlockAnalytics | null;
  layingCurveData: LayingCurvePoint[];
  mortalityChartData: MortalityPoint[];
  financialTrendData: DailyFinancialPoint[];

  // Mutations
  addFlock: (flock: Omit<Flock, 'id' | 'created_at' | 'current_count'>) => Promise<Flock>;
  updateFlock: (id: string, updates: Partial<Flock>) => Promise<void>;
  deleteFlock: (id: string) => Promise<void>;

  addDailyLog: (log: Omit<DailyLog, 'id' | 'created_at' | 'total_eggs' | 'trays_packed'>) => Promise<DailyLog>;
  updateDailyLog: (id: string, updates: Partial<DailyLog>) => Promise<void>;
  deleteDailyLog: (id: string) => Promise<void>;

  addSale: (sale: Omit<SalesRecord, 'id' | 'created_at' | 'total_revenue'>) => Promise<SalesRecord>;
  updateSale: (id: string, updates: Partial<SalesRecord>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;

  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'created_at'>) => Promise<ExpenseRecord>;
  updateExpense: (id: string, updates: Partial<ExpenseRecord>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Data helpers
  resetToSampleData: () => void;
  clearAllData: () => Promise<void>;
  exportAllToJSON: () => string;
}

const PoultryContext = createContext<PoultryContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  FLOCKS: 'eggstra_flocks_v1',
  LOGS: 'eggstra_logs_v1',
  SALES: 'eggstra_sales_v1',
  EXPENSES: 'eggstra_expenses_v1',
};

export const PoultryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flocks, setFlocks] = useState<Flock[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(false);
  const [selectedFlockId, setSelectedFlockId] = useState<string | 'all'>('all');

  // Recalculate flock current count based on initial_count - SUM(mortality + culled)
  const recalculateFlockCounts = useCallback((flocksList: Flock[], logsList: DailyLog[]): Flock[] => {
    return flocksList.map((flock) => {
      const flockLogs = logsList.filter((log) => log.flock_id === flock.id);
      const totalLost = flockLogs.reduce(
        (sum, log) => sum + (Number(log.mortality_count) || 0) + (Number(log.culled_count) || 0),
        0
      );
      const current = Math.max(0, flock.initial_count - totalLost);
      return { ...flock, current_count: current };
    });
  }, []);

  // Save to localStorage
  const persistLocal = useCallback((f: Flock[], l: DailyLog[], s: SalesRecord[], e: ExpenseRecord[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.FLOCKS, JSON.stringify(f));
        localStorage.setItem(LOCAL_STORAGE_KEYS.LOGS, JSON.stringify(l));
        localStorage.setItem(LOCAL_STORAGE_KEYS.SALES, JSON.stringify(s));
        localStorage.setItem(LOCAL_STORAGE_KEYS.EXPENSES, JSON.stringify(e));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      if (isSupabaseConfigured && supabase) {
        try {
          const [flocksRes, logsRes, salesRes, expRes] = await Promise.all([
            supabase.from('flocks').select('*').order('created_at', { ascending: false }),
            supabase.from('daily_logs').select('*').order('log_date', { ascending: false }),
            supabase.from('sales_records').select('*').order('sale_date', { ascending: false }),
            supabase.from('expenses').select('*').order('date', { ascending: false }),
          ]);

          if (!flocksRes.error && flocksRes.data !== null) {
            setFlocks(flocksRes.data as Flock[]);
            setDailyLogs((logsRes.data as DailyLog[]) || []);
            setSales((salesRes.data as SalesRecord[]) || []);
            setExpenses((expRes.data as ExpenseRecord[]) || []);
            setIsSupabaseLive(true);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase query error, checking local store:', err);
        }
      }

      // Load from localStorage if available
      if (typeof window !== 'undefined') {
        const storedFlocks = localStorage.getItem(LOCAL_STORAGE_KEYS.FLOCKS);
        const storedLogs = localStorage.getItem(LOCAL_STORAGE_KEYS.LOGS);
        const storedSales = localStorage.getItem(LOCAL_STORAGE_KEYS.SALES);
        const storedExpenses = localStorage.getItem(LOCAL_STORAGE_KEYS.EXPENSES);

        if (storedFlocks !== null && storedLogs !== null) {
          try {
            const parsedFlocks = JSON.parse(storedFlocks);
            const parsedLogs = JSON.parse(storedLogs);
            const parsedSales = storedSales !== null ? JSON.parse(storedSales) : [];
            const parsedExpenses = storedExpenses !== null ? JSON.parse(storedExpenses) : [];

            setFlocks(recalculateFlockCounts(parsedFlocks, parsedLogs));
            setDailyLogs(parsedLogs);
            setSales(parsedSales);
            setExpenses(parsedExpenses);
            setIsLoading(false);
            return;
          } catch (e) {
            console.error('Error parsing localStorage:', e);
          }
        }
      }

      // Default to empty state ready for user entry
      setFlocks([]);
      setDailyLogs([]);
      setSales([]);
      setExpenses([]);
      persistLocal([], [], [], []);
      setIsLoading(false);
    }

    loadData();
  }, [persistLocal, recalculateFlockCounts]);

  // Set up Supabase Realtime subscriptions if connected
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client || !isSupabaseLive) return;

    const channel = client
      .channel('poultry-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flocks' }, () => {
        client.from('flocks').select('*').then((res) => {
          if (res.data) setFlocks(res.data as Flock[]);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_logs' }, () => {
        client.from('daily_logs').select('*').order('log_date', { ascending: false }).then((res) => {
          if (res.data) setDailyLogs(res.data as DailyLog[]);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales_records' }, () => {
        client.from('sales_records').select('*').order('sale_date', { ascending: false }).then((res) => {
          if (res.data) setSales(res.data as SalesRecord[]);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        client.from('expenses').select('*').order('date', { ascending: false }).then((res) => {
          if (res.data) setExpenses(res.data as ExpenseRecord[]);
        });
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [isSupabaseLive]);

  // Active flocks filter
  const activeFlocks = useMemo(() => {
    return flocks.filter((f) => f.status === 'active');
  }, [flocks]);

  // Helper for single flock analytics
  const getFlockAnalytics = useCallback(
    (flockId: string): FlockAnalytics | null => {
      const flock = flocks.find((f) => f.id === flockId);
      if (!flock) return null;

      const flockLogs = dailyLogs.filter((l) => l.flock_id === flockId);
      const placementDate = new Date(flock.placement_date);
      const now = new Date();
      const diffTime = Math.max(0, now.getTime() - placementDate.getTime());
      const ageInDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const ageInWeeks = +(ageInDays / 7).toFixed(1);

      const totalGoodEggs = flockLogs.reduce((sum, l) => sum + (Number(l.good_eggs) || 0), 0);
      const totalDamagedEggs = flockLogs.reduce((sum, l) => sum + (Number(l.damaged_eggs) || 0), 0);
      const totalEggsProduced = totalGoodEggs + totalDamagedEggs;
      const totalMortality = flockLogs.reduce((sum, l) => sum + (Number(l.mortality_count) || 0), 0);
      const totalCulled = flockLogs.reduce((sum, l) => sum + (Number(l.culled_count) || 0), 0);
      const totalFeed = flockLogs.reduce((sum, l) => sum + (Number(l.feed_consumed_kg) || 0), 0);

      const initialCount = flock.initial_count || 1;
      const cumulativeMortalityRate = +((totalMortality / initialCount) * 100).toFixed(2);
      const survivalRate = +(100 - cumulativeMortalityRate).toFixed(2);
      const lifetimeEggsPerHen = +(totalEggsProduced / initialCount).toFixed(1);

      const averageHenDayRate =
        flockLogs.length > 0
          ? +(
              flockLogs.reduce((sum, l) => {
                const dayTotal = Number(l.total_eggs) || Number(l.good_eggs) + Number(l.damaged_eggs);
                const dayRate = flock.current_count > 0 ? (dayTotal / flock.current_count) * 100 : 0;
                return sum + dayRate;
              }, 0) / flockLogs.length
            ).toFixed(1)
          : 0;

      return {
        ...flock,
        ageInWeeks,
        ageInDays,
        totalEggsProduced,
        totalGoodEggs,
        totalDamagedEggs,
        totalMortality,
        totalCulled,
        cumulativeMortalityRate,
        survivalRate,
        lifetimeEggsPerHen,
        averageHenDayRate,
        totalFeedConsumedKg: totalFeed,
      };
    },
    [flocks, dailyLogs]
  );

  // List of analytics for all flocks
  const flockAnalyticsList = useMemo(() => {
    return flocks.map((f) => getFlockAnalytics(f.id)!).filter(Boolean);
  }, [flocks, getFlockAnalytics]);

  // Executive Dashboard KPIs
  const metrics: DashboardMetrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    // Relevant flocks based on selection
    const targetFlocks = selectedFlockId === 'all'
      ? activeFlocks
      : activeFlocks.filter((f) => f.id === selectedFlockId);

    const totalLivingBirds = targetFlocks.reduce((sum, f) => sum + (Number(f.current_count) || 0), 0);

    // Logs for today (or fallback to most recent log date if today not yet entered)
    const targetFlockIds = new Set(targetFlocks.map((f) => f.id));
    const relevantLogs = dailyLogs.filter((l) => targetFlockIds.has(l.flock_id));

    const todayLogs = relevantLogs.filter((l) => l.log_date === todayStr);
    const effectiveLogs = todayLogs.length > 0
      ? todayLogs
      : relevantLogs.slice(0, targetFlocks.length); // fallback to latest day

    const todayGoodEggs = effectiveLogs.reduce((sum, l) => sum + (Number(l.good_eggs) || 0), 0);
    const todayDamagedEggs = effectiveLogs.reduce((sum, l) => sum + (Number(l.damaged_eggs) || 0), 0);
    const todayTotalEggs = todayGoodEggs + todayDamagedEggs;
    const todayTraysPacked = +(todayGoodEggs / 30.0).toFixed(2);
    const todayFeedConsumedKg = effectiveLogs.reduce((sum, l) => sum + (Number(l.feed_consumed_kg) || 0), 0);
    const todayMortality = effectiveLogs.reduce((sum, l) => sum + (Number(l.mortality_count) || 0), 0);
    const todayCulls = effectiveLogs.reduce((sum, l) => sum + (Number(l.culled_count) || 0), 0);

    // Hen-Day % = (todayTotalEggs / totalLivingBirds) * 100
    const henDayPercentage = totalLivingBirds > 0
      ? +((todayTotalEggs / totalLivingBirds) * 100).toFixed(1)
      : 0;

    // Daily Mortality Rate % = (todayMortality / totalLivingBirds) * 100
    const mortalityRatePercentage = totalLivingBirds > 0
      ? +((todayMortality / totalLivingBirds) * 100).toFixed(3)
      : 0;

    let mortalityAlertLevel: 'normal' | 'warning' | 'critical' = 'normal';
    if (mortalityRatePercentage > 0.3) {
      mortalityAlertLevel = 'critical';
    } else if (mortalityRatePercentage > 0.1) {
      mortalityAlertLevel = 'warning';
    }

    // Sales & Revenue Calculations
    const todaySales = sales.filter((s) => s.sale_date === todayStr);
    const todayRevenue = todaySales.reduce((sum, s) => sum + (Number(s.total_revenue) || (s.quantity * s.unit_price)), 0);

    const todayExpensesList = expenses.filter((e) => e.date === todayStr);
    const todayExpense = todayExpensesList.reduce((sum, e) => sum + (Number(e.total_cost) || 0), 0);
    const todayNetProfit = +(todayRevenue - todayExpense).toFixed(2);

    // 30-Day Monthly Calculations
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const monthlySales = sales.filter((s) => s.sale_date >= thirtyDaysAgoStr);
    const monthlyRevenue = monthlySales.reduce((sum, s) => sum + (Number(s.total_revenue) || (s.quantity * s.unit_price)), 0);

    const monthlyExpensesList = expenses.filter((e) => e.date >= thirtyDaysAgoStr);
    const monthlyExpense = monthlyExpensesList.reduce((sum, e) => sum + (Number(e.total_cost) || 0), 0);
    const monthlyNetProfit = +(monthlyRevenue - monthlyExpense).toFixed(2);

    // Feed Conversion Ratio (FCR) = kg of feed consumed / dozen eggs produced
    const last30DaysLogs = relevantLogs.filter((l) => l.log_date >= thirtyDaysAgoStr);
    const last30FeedKg = last30DaysLogs.reduce((sum, l) => sum + (Number(l.feed_consumed_kg) || 0), 0);
    const last30TotalEggs = last30DaysLogs.reduce((sum, l) => sum + (Number(l.total_eggs) || (Number(l.good_eggs) + Number(l.damaged_eggs))), 0);
    const last30Dozens = last30TotalEggs / 12.0;

    const feedConversionRatio = last30Dozens > 0
      ? +(last30FeedKg / last30Dozens).toFixed(2)
      : 1.45; // standard nominal benchmark

    return {
      totalLivingBirds,
      activeFlockCount: targetFlocks.length,
      todayGoodEggs,
      todayDamagedEggs,
      todayTotalEggs,
      todayTraysPacked,
      todayFeedConsumedKg,
      todayMortality,
      todayCulls,
      henDayPercentage,
      mortalityRatePercentage,
      mortalityAlertLevel,
      todayRevenue: +todayRevenue.toFixed(2),
      todayExpense: +todayExpense.toFixed(2),
      todayNetProfit,
      monthlyRevenue: +monthlyRevenue.toFixed(2),
      monthlyExpense: +monthlyExpense.toFixed(2),
      monthlyNetProfit,
      feedConversionRatio,
    };
  }, [activeFlocks, dailyLogs, sales, expenses, selectedFlockId]);

  // 30-Day Laying Curve vs Standard Benchmark
  const layingCurveData: LayingCurvePoint[] = useMemo(() => {
    // Collect last 30 distinct dates
    const dateMap = new Map<string, { good: number; damaged: number; feed: number }>();

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      dateMap.set(dStr, { good: 0, damaged: 0, feed: 0 });
    }

    const targetFlocks = selectedFlockId === 'all'
      ? activeFlocks
      : activeFlocks.filter((f) => f.id === selectedFlockId);
    const targetFlockIds = new Set(targetFlocks.map((f) => f.id));
    const totalLiving = targetFlocks.reduce((sum, f) => sum + (Number(f.current_count) || 0), 0) || 1;

    dailyLogs.forEach((log) => {
      if (targetFlockIds.has(log.flock_id) && dateMap.has(log.log_date)) {
        const curr = dateMap.get(log.log_date)!;
        curr.good += Number(log.good_eggs) || 0;
        curr.damaged += Number(log.damaged_eggs) || 0;
        curr.feed += Number(log.feed_consumed_kg) || 0;
      }
    });

    const result: LayingCurvePoint[] = [];
    dateMap.forEach((val, dateStr) => {
      const totalEggs = val.good + val.damaged;
      const henDayRate = totalLiving > 0 ? +((totalEggs / totalLiving) * 100).toFixed(1) : 0;
      
      // Expected commercial benchmark is standard 90% peak commercial curve
      const expectedBenchmark = Math.round(totalLiving * 0.90);

      // Short day label: "Aug 24"
      const dateObj = new Date(dateStr + 'T00:00:00');
      const dayLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      result.push({
        date: dateStr,
        dayLabel,
        actualProduction: totalEggs,
        expectedBenchmark,
        goodEggs: val.good,
        damagedEggs: val.damaged,
        traysPacked: +(val.good / 30.0).toFixed(1),
        henDayRate,
      });
    });

    return result;
  }, [dailyLogs, activeFlocks, selectedFlockId]);

  // Mortality & Culls Chart Data
  const mortalityChartData: MortalityPoint[] = useMemo(() => {
    const dateMap = new Map<string, { mort: number; cull: number }>();

    for (let i = 14; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      dateMap.set(dStr, { mort: 0, cull: 0 });
    }

    const targetFlocks = selectedFlockId === 'all'
      ? activeFlocks
      : activeFlocks.filter((f) => f.id === selectedFlockId);
    const targetFlockIds = new Set(targetFlocks.map((f) => f.id));
    const totalLiving = targetFlocks.reduce((sum, f) => sum + (Number(f.current_count) || 0), 0) || 1;

    dailyLogs.forEach((log) => {
      if (targetFlockIds.has(log.flock_id) && dateMap.has(log.log_date)) {
        const curr = dateMap.get(log.log_date)!;
        curr.mort += Number(log.mortality_count) || 0;
        curr.cull += Number(log.culled_count) || 0;
      }
    });

    const result: MortalityPoint[] = [];
    dateMap.forEach((val, dateStr) => {
      const ratePercent = totalLiving > 0 ? +((val.mort / totalLiving) * 100).toFixed(3) : 0;
      const status: 'normal' | 'warning' | 'critical' =
        ratePercent > 0.3 ? 'critical' : ratePercent > 0.1 ? 'warning' : 'normal';

      const dateObj = new Date(dateStr + 'T00:00:00');
      const dayLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      result.push({
        date: dateStr,
        dayLabel,
        mortality: val.mort,
        culled: val.cull,
        ratePercent,
        status,
      });
    });

    return result;
  }, [dailyLogs, activeFlocks, selectedFlockId]);

  // Financial Trend Data (Last 14 days)
  const financialTrendData: DailyFinancialPoint[] = useMemo(() => {
    const dateMap = new Map<string, { rev: number; feed: number; otherExp: number }>();

    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      dateMap.set(dStr, { rev: 0, feed: 0, otherExp: 0 });
    }

    sales.forEach((s) => {
      if (dateMap.has(s.sale_date)) {
        const curr = dateMap.get(s.sale_date)!;
        curr.rev += Number(s.total_revenue) || (s.quantity * s.unit_price);
      }
    });

    expenses.forEach((e) => {
      if (dateMap.has(e.date)) {
        const curr = dateMap.get(e.date)!;
        const cost = Number(e.total_cost) || 0;
        if (e.category === 'feed') {
          curr.feed += cost;
        } else {
          curr.otherExp += cost;
        }
      }
    });

    const result: DailyFinancialPoint[] = [];
    dateMap.forEach((val, dateStr) => {
      const dateObj = new Date(dateStr + 'T00:00:00');
      const dayLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const netProfit = +(val.rev - (val.feed + val.otherExp)).toFixed(2);

      result.push({
        date: dateStr,
        dayLabel,
        revenue: +val.rev.toFixed(2),
        feedExpense: +val.feed.toFixed(2),
        otherExpense: +val.otherExp.toFixed(2),
        netProfit,
      });
    });

    return result;
  }, [sales, expenses]);

  // ----------------------------------------------------------------------------
  // MUTATIONS (Flocks)
  // ----------------------------------------------------------------------------
  const addFlock = async (flockData: Omit<Flock, 'id' | 'created_at' | 'current_count'>): Promise<Flock> => {
    const newFlock: Flock = {
      ...flockData,
      id: isSupabaseLive ? undefined as any : `flock-${Date.now()}`,
      current_count: flockData.initial_count,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseLive && supabase) {
      const { data, error } = await supabase.from('flocks').insert([newFlock]).select().single();
      if (error) throw error;
      const inserted = data as Flock;
      setFlocks((prev) => [inserted, ...prev]);
      return inserted;
    } else {
      const updated = [newFlock, ...flocks];
      setFlocks(updated);
      persistLocal(updated, dailyLogs, sales, expenses);
      return newFlock;
    }
  };

  const updateFlock = async (id: string, updates: Partial<Flock>): Promise<void> => {
    if (isSupabaseLive && supabase) {
      const { error } = await supabase.from('flocks').update(updates).eq('id', id);
      if (error) throw error;
    }
    const updated = flocks.map((f) => (f.id === id ? { ...f, ...updates } : f));
    const synced = recalculateFlockCounts(updated, dailyLogs);
    setFlocks(synced);
    persistLocal(synced, dailyLogs, sales, expenses);
  };

  const deleteFlock = async (id: string): Promise<void> => {
    if (isSupabaseLive && supabase) {
      const { error } = await supabase.from('flocks').delete().eq('id', id);
      if (error) throw error;
    }
    const updatedFlocks = flocks.filter((f) => f.id !== id);
    const updatedLogs = dailyLogs.filter((l) => l.flock_id !== id);
    setFlocks(updatedFlocks);
    setDailyLogs(updatedLogs);
    persistLocal(updatedFlocks, updatedLogs, sales, expenses);
  };

  // ----------------------------------------------------------------------------
  // MUTATIONS (Daily Logs)
  // ----------------------------------------------------------------------------
  const addDailyLog = async (
    logData: Omit<DailyLog, 'id' | 'created_at' | 'total_eggs' | 'trays_packed'>
  ): Promise<DailyLog> => {
    const good = Number(logData.good_eggs) || 0;
    const damaged = Number(logData.damaged_eggs) || 0;
    const totalEggs = good + damaged;
    const traysPacked = +(good / 30.0).toFixed(2);

    const newLog: DailyLog = {
      ...logData,
      id: isSupabaseLive ? undefined as any : `log-${Date.now()}`,
      good_eggs: good,
      damaged_eggs: damaged,
      total_eggs: totalEggs,
      trays_packed: traysPacked,
      mortality_count: Number(logData.mortality_count) || 0,
      culled_count: Number(logData.culled_count) || 0,
      feed_consumed_kg: Number(logData.feed_consumed_kg) || 0,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseLive && supabase) {
      // In PostgreSQL, generated columns are computed on server
      const payload: any = { ...newLog };
      delete payload.total_eggs;
      delete payload.trays_packed;
      delete payload.id;

      const { data, error } = await supabase.from('daily_logs').insert([payload]).select().single();
      if (error) throw error;
      const inserted = data as DailyLog;
      
      // Update local logs and refresh flocks
      const updatedLogs = [inserted, ...dailyLogs];
      setDailyLogs(updatedLogs);
      const syncedFlocks = recalculateFlockCounts(flocks, updatedLogs);
      setFlocks(syncedFlocks);
      return inserted;
    } else {
      // Remove any existing log for same flock and date (matches UNIQUE constraint)
      const filteredLogs = dailyLogs.filter(
        (l) => !(l.flock_id === logData.flock_id && l.log_date === logData.log_date)
      );
      const updatedLogs = [newLog, ...filteredLogs];
      const syncedFlocks = recalculateFlockCounts(flocks, updatedLogs);

      setDailyLogs(updatedLogs);
      setFlocks(syncedFlocks);
      persistLocal(syncedFlocks, updatedLogs, sales, expenses);
      return newLog;
    }
  };

  const updateDailyLog = async (id: string, updates: Partial<DailyLog>): Promise<void> => {
    if (isSupabaseLive && supabase) {
      const payload = { ...updates };
      delete payload.total_eggs;
      delete payload.trays_packed;
      const { error } = await supabase.from('daily_logs').update(payload).eq('id', id);
      if (error) throw error;
    }

    const updatedLogs = dailyLogs.map((l) => {
      if (l.id === id) {
        const good = updates.good_eggs !== undefined ? Number(updates.good_eggs) : l.good_eggs;
        const damaged = updates.damaged_eggs !== undefined ? Number(updates.damaged_eggs) : l.damaged_eggs;
        return {
          ...l,
          ...updates,
          good_eggs: good,
          damaged_eggs: damaged,
          total_eggs: good + damaged,
          trays_packed: +(good / 30.0).toFixed(2),
        };
      }
      return l;
    });

    const syncedFlocks = recalculateFlockCounts(flocks, updatedLogs);
    setDailyLogs(updatedLogs);
    setFlocks(syncedFlocks);
    persistLocal(syncedFlocks, updatedLogs, sales, expenses);
  };

  const deleteDailyLog = async (id: string): Promise<void> => {
    if (isSupabaseLive && supabase) {
      const { error } = await supabase.from('daily_logs').delete().eq('id', id);
      if (error) throw error;
    }
    const updatedLogs = dailyLogs.filter((l) => l.id !== id);
    const syncedFlocks = recalculateFlockCounts(flocks, updatedLogs);
    setDailyLogs(updatedLogs);
    setFlocks(syncedFlocks);
    persistLocal(syncedFlocks, updatedLogs, sales, expenses);
  };

  // ----------------------------------------------------------------------------
  // MUTATIONS (Sales)
  // ----------------------------------------------------------------------------
  const addSale = async (saleData: Omit<SalesRecord, 'id' | 'created_at' | 'total_revenue'>): Promise<SalesRecord> => {
    const qty = Number(saleData.quantity) || 0;
    const price = Number(saleData.unit_price) || 0;
    const totalRev = +(qty * price).toFixed(2);

    const newSale: SalesRecord = {
      ...saleData,
      id: isSupabaseLive ? undefined as any : `sale-${Date.now()}`,
      quantity: qty,
      unit_price: price,
      total_revenue: totalRev,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseLive && supabase) {
      const payload: any = { ...newSale };
      delete payload.total_revenue;
      delete payload.id;
      const { data, error } = await supabase.from('sales_records').insert([payload]).select().single();
      if (error) throw error;
      const inserted = data as SalesRecord;
      setSales((prev) => [inserted, ...prev]);
      return inserted;
    } else {
      const updatedSales = [newSale, ...sales];
      setSales(updatedSales);
      persistLocal(flocks, dailyLogs, updatedSales, expenses);
      return newSale;
    }
  };

  const updateSale = async (id: string, updates: Partial<SalesRecord>): Promise<void> => {
    if (isSupabaseLive && supabase) {
      const payload = { ...updates };
      delete payload.total_revenue;
      const { error } = await supabase.from('sales_records').update(payload).eq('id', id);
      if (error) throw error;
    }
    const updatedSales = sales.map((s) => {
      if (s.id === id) {
        const qty = updates.quantity !== undefined ? Number(updates.quantity) : s.quantity;
        const price = updates.unit_price !== undefined ? Number(updates.unit_price) : s.unit_price;
        return {
          ...s,
          ...updates,
          quantity: qty,
          unit_price: price,
          total_revenue: +(qty * price).toFixed(2),
        };
      }
      return s;
    });
    setSales(updatedSales);
    persistLocal(flocks, dailyLogs, updatedSales, expenses);
  };

  const deleteSale = async (id: string): Promise<void> => {
    if (isSupabaseLive && supabase) {
      const { error } = await supabase.from('sales_records').delete().eq('id', id);
      if (error) throw error;
    }
    const updatedSales = sales.filter((s) => s.id !== id);
    setSales(updatedSales);
    persistLocal(flocks, dailyLogs, updatedSales, expenses);
  };

  // ----------------------------------------------------------------------------
  // MUTATIONS (Expenses)
  // ----------------------------------------------------------------------------
  const addExpense = async (expenseData: Omit<ExpenseRecord, 'id' | 'created_at'>): Promise<ExpenseRecord> => {
    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: isSupabaseLive ? undefined as any : `exp-${Date.now()}`,
      quantity: Number(expenseData.quantity) || 1,
      total_cost: +(Number(expenseData.total_cost) || 0).toFixed(2),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseLive && supabase) {
      const payload: any = { ...newExpense };
      delete payload.id;
      const { data, error } = await supabase.from('expenses').insert([payload]).select().single();
      if (error) throw error;
      const inserted = data as ExpenseRecord;
      setExpenses((prev) => [inserted, ...prev]);
      return inserted;
    } else {
      const updatedExpenses = [newExpense, ...expenses];
      setExpenses(updatedExpenses);
      persistLocal(flocks, dailyLogs, sales, updatedExpenses);
      return newExpense;
    }
  };

  const updateExpense = async (id: string, updates: Partial<ExpenseRecord>): Promise<void> => {
    if (isSupabaseLive && supabase) {
      const { error } = await supabase.from('expenses').update(updates).eq('id', id);
      if (error) throw error;
    }
    const updatedExpenses = expenses.map((e) => (e.id === id ? { ...e, ...updates } : e));
    setExpenses(updatedExpenses);
    persistLocal(flocks, dailyLogs, sales, updatedExpenses);
  };

  const deleteExpense = async (id: string): Promise<void> => {
    if (isSupabaseLive && supabase) {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    }
    const updatedExpenses = expenses.filter((e) => e.id !== id);
    setExpenses(updatedExpenses);
    persistLocal(flocks, dailyLogs, sales, updatedExpenses);
  };

  // Reset to sample data
  const resetToSampleData = () => {
    const initialSynced = recalculateFlockCounts(INITIAL_FLOCKS, INITIAL_DAILY_LOGS);
    setFlocks(initialSynced);
    setDailyLogs(INITIAL_DAILY_LOGS);
    setSales(INITIAL_SALES);
    setExpenses(INITIAL_EXPENSES);
    persistLocal(initialSynced, INITIAL_DAILY_LOGS, INITIAL_SALES, INITIAL_EXPENSES);
  };

  // Clear all data (Start fresh with 0 records)
  const clearAllData = async (): Promise<void> => {
    if (isSupabaseLive && supabase) {
      try {
        await supabase.from('daily_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('sales_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('flocks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.error('Failed to wipe Supabase database:', err);
      }
    }
    setFlocks([]);
    setDailyLogs([]);
    setSales([]);
    setExpenses([]);
    persistLocal([], [], [], []);
  };

  const exportAllToJSON = (): string => {
    return JSON.stringify({ flocks, dailyLogs, sales, expenses }, null, 2);
  };

  const value: PoultryContextType = {
    flocks,
    activeFlocks,
    dailyLogs,
    sales,
    expenses,
    isLoading,
    isSupabaseLive,
    selectedFlockId,
    setSelectedFlockId,
    metrics,
    flockAnalyticsList,
    getFlockAnalytics,
    layingCurveData,
    mortalityChartData,
    financialTrendData,
    addFlock,
    updateFlock,
    deleteFlock,
    addDailyLog,
    updateDailyLog,
    deleteDailyLog,
    addSale,
    updateSale,
    deleteSale,
    addExpense,
    updateExpense,
    deleteExpense,
    resetToSampleData,
    clearAllData,
    exportAllToJSON,
  };

  return <PoultryContext.Provider value={value}>{children}</PoultryContext.Provider>;
};

export const usePoultry = (): PoultryContextType => {
  const context = useContext(PoultryContext);
  if (!context) {
    throw new Error('usePoultry must be used within a PoultryProvider');
  }
  return context;
};
