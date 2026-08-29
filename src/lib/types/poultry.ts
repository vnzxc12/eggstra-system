// ==============================================================================
// Eggstra Poultry Farm Management System - TypeScript Data Types
// ==============================================================================

export type FlockStatus = 'active' | 'culled' | 'sold' | 'archived';

export type ItemType = 'eggs_tray' | 'eggs_piece' | 'cull_birds' | 'poultry_manure';

export type PaymentStatus = 'paid' | 'pending' | 'partial';

export type ExpenseCategory = 'feed' | 'medication_vaccines' | 'labor' | 'bedding' | 'utilities' | 'other';

export interface Flock {
  id: string;
  user_id?: string | null;
  flock_name: string;
  breed: string;
  placement_date: string; // YYYY-MM-DD
  initial_count: number;
  current_count: number;
  status: FlockStatus;
  created_at: string;
}

export interface DailyLog {
  id: string;
  flock_id: string;
  user_id?: string | null;
  log_date: string; // YYYY-MM-DD
  mortality_count: number;
  culled_count: number;
  good_eggs: number;
  damaged_eggs: number;
  total_eggs: number;      // Stored generated: good_eggs + damaged_eggs
  trays_packed: number;    // Stored generated: good_eggs / 30.0
  feed_consumed_kg: number;
  notes?: string | null;
  created_at: string;
}

export interface SalesRecord {
  id: string;
  user_id?: string | null;
  sale_date: string; // YYYY-MM-DD
  item_type: ItemType;
  quantity: number;
  unit_price: number;
  total_revenue: number;   // Stored generated: quantity * unit_price
  buyer_name: string;
  payment_status: PaymentStatus;
  created_at: string;
}

export interface ExpenseRecord {
  id: string;
  user_id?: string | null;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  item_name: string;
  quantity: number;
  total_cost: number;
  created_at: string;
}

// Analytics and Calculated KPI Metrics
export interface DashboardMetrics {
  totalLivingBirds: number;
  activeFlockCount: number;
  todayGoodEggs: number;
  todayDamagedEggs: number;
  todayTotalEggs: number;
  todayTraysPacked: number;
  todayFeedConsumedKg: number;
  todayMortality: number;
  todayCulls: number;
  henDayPercentage: number;     // (todayTotalEggs / totalLivingBirds) * 100
  mortalityRatePercentage: number; // (todayMortality / totalLivingBirds) * 100
  mortalityAlertLevel: 'normal' | 'warning' | 'critical'; // >0.1% warning, >0.3% critical
  todayRevenue: number;
  todayExpense: number;
  todayNetProfit: number;
  monthlyRevenue: number;
  monthlyExpense: number;
  monthlyNetProfit: number;
  feedConversionRatio: number;  // kg feed / dozen eggs (last 30 days)
  avgEggWeightGram?: number;
}

export interface FlockAnalytics extends Flock {
  ageInWeeks: number;
  ageInDays: number;
  totalEggsProduced: number;
  totalGoodEggs: number;
  totalDamagedEggs: number;
  totalMortality: number;
  totalCulled: number;
  cumulativeMortalityRate: number; // (totalMortality / initial_count) * 100
  survivalRate: number;            // 100 - cumulativeMortalityRate
  lifetimeEggsPerHen: number;      // totalEggsProduced / initial_count
  averageHenDayRate: number;       // average % over active period
  totalFeedConsumedKg: number;
}

export interface LayingCurvePoint {
  date: string;
  dayLabel: string;
  actualProduction: number;
  expectedBenchmark: number; // Standard commercial curve benchmark (e.g. Lohmann/Hy-Line 88-94%)
  goodEggs: number;
  damagedEggs: number;
  traysPacked: number;
  henDayRate: number;
}

export interface DailyFinancialPoint {
  date: string;
  dayLabel: string;
  revenue: number;
  feedExpense: number;
  otherExpense: number;
  netProfit: number;
}

export interface MortalityPoint {
  date: string;
  dayLabel: string;
  mortality: number;
  culled: number;
  ratePercent: number;
  status: 'normal' | 'warning' | 'critical';
}
