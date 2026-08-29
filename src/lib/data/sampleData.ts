// ==============================================================================
// Eggstra Poultry Farm Management System - Philippine Commercial Farm Sample Data
// Currency: Philippine Peso (₱ / PHP)
// ==============================================================================

import { Flock, DailyLog, SalesRecord, ExpenseRecord } from '../types/poultry';

// Generate consistent past dates relative to current date
function formatDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export const INITIAL_FLOCKS: Flock[] = [
  {
    id: 'flock-pen1-lohmann',
    flock_name: 'Pen 1 - Lohmann Brown 2026',
    breed: 'Lohmann Brown-Classic',
    placement_date: formatDate(168), // ~24 weeks ago (peak laying age)
    initial_count: 5000,
    current_count: 4892,
    status: 'active',
    created_at: new Date(Date.now() - 168 * 86400000).toISOString(),
  },
  {
    id: 'flock-pen2-hyline',
    flock_name: 'Pen 2 - Hy-Line Brown Alpha',
    breed: 'Hy-Line Brown',
    placement_date: formatDate(112), // ~16 weeks ago (entering lay)
    initial_count: 4000,
    current_count: 3945,
    status: 'active',
    created_at: new Date(Date.now() - 112 * 86400000).toISOString(),
  },
  {
    id: 'flock-pen3-dekalb',
    flock_name: 'Pen 3 - Dekalb White Express',
    breed: 'Dekalb White',
    placement_date: formatDate(70), // ~10 weeks ago (grower/pullet stage transitioning to layer)
    initial_count: 3500,
    current_count: 3470,
    status: 'active',
    created_at: new Date(Date.now() - 70 * 86400000).toISOString(),
  },
  {
    id: 'flock-pen4-isabrown',
    flock_name: 'Pen 4 - ISA Brown Batch 2025',
    breed: 'ISA Brown',
    placement_date: formatDate(560), // ~80 weeks ago (completed 72-week lay cycle)
    initial_count: 3000,
    current_count: 0,
    status: 'culled',
    created_at: new Date(Date.now() - 560 * 86400000).toISOString(),
  },
];

// Helper to generate 30 days of realistic commercial logs
function generate30DayLogs(): DailyLog[] {
  const logs: DailyLog[] = [];

  for (let day = 29; day >= 0; day--) {
    const logDate = formatDate(day);
    const dayVariation = Math.sin(day * 0.4) * 0.02;

    // --- Flock 1: Lohmann Brown (Peak laying ~92%) ---
    const f1Good = Math.round(4892 * (0.915 + dayVariation));
    const f1Damaged = Math.round(f1Good * 0.018);
    const f1Mort = day % 7 === 0 ? 3 : (day % 3 === 0 ? 2 : 1);
    const f1Cull = day % 12 === 0 ? 2 : 0;
    const f1Feed = +(4892 * 0.118).toFixed(1); // 118 grams/hen = ~577 kg

    logs.push({
      id: `log-f1-${logDate}`,
      flock_id: 'flock-pen1-lohmann',
      log_date: logDate,
      mortality_count: f1Mort,
      culled_count: f1Cull,
      good_eggs: f1Good,
      damaged_eggs: f1Damaged,
      total_eggs: f1Good + f1Damaged,
      trays_packed: +(f1Good / 30.0).toFixed(2),
      feed_consumed_kg: f1Feed,
      notes: day === 0 ? 'Optimal automated water pressure and nipple drinkers flushed.' : null,
      created_at: new Date(Date.now() - day * 86400000).toISOString(),
    });

    // --- Flock 2: Hy-Line Brown (Rising laying ~87%) ---
    const f2Good = Math.round(3945 * (0.865 + dayVariation * 0.8));
    const f2Damaged = Math.round(f2Good * 0.015);
    const f2Mort = day % 5 === 0 ? 2 : (day % 2 === 0 ? 1 : 0);
    const f2Cull = day % 14 === 0 ? 1 : 0;
    const f2Feed = +(3945 * 0.114).toFixed(1); // 114g/hen = ~450 kg

    logs.push({
      id: `log-f2-${logDate}`,
      flock_id: 'flock-pen2-hyline',
      log_date: logDate,
      mortality_count: f2Mort,
      culled_count: f2Cull,
      good_eggs: f2Good,
      damaged_eggs: f2Damaged,
      total_eggs: f2Good + f2Damaged,
      trays_packed: +(f2Good / 30.0).toFixed(2),
      feed_consumed_kg: f2Feed,
      notes: day === 3 ? 'Egg size grading calibrated (Large: 63g avg).' : null,
      created_at: new Date(Date.now() - day * 86400000).toISOString(),
    });

    // --- Flock 3: Dekalb White (Early lay ~78%) ---
    const f3Good = Math.round(3470 * (0.77 + (30 - day) * 0.004));
    const f3Damaged = Math.round(f3Good * 0.012);
    const f3Mort = day % 6 === 0 ? 1 : 0;
    const f3Cull = 0;
    const f3Feed = +(3470 * 0.108).toFixed(1);

    logs.push({
      id: `log-f3-${logDate}`,
      flock_id: 'flock-pen3-dekalb',
      log_date: logDate,
      mortality_count: f3Mort,
      culled_count: f3Cull,
      good_eggs: f3Good,
      damaged_eggs: f3Damaged,
      total_eggs: f3Good + f3Damaged,
      trays_packed: +(f3Good / 30.0).toFixed(2),
      feed_consumed_kg: f3Feed,
      notes: day === 0 ? 'Light cycle maintained at 15.5 hrs.' : null,
      created_at: new Date(Date.now() - day * 86400000).toISOString(),
    });
  }

  return logs;
}

export const INITIAL_DAILY_LOGS: DailyLog[] = generate30DayLogs();

// Philippine Peso (₱) Realistic Commercial Sales Records
export const INITIAL_SALES: SalesRecord[] = [
  {
    id: 'sale-001',
    sale_date: formatDate(0),
    item_type: 'eggs_tray',
    quantity: 320,
    unit_price: 240.00, // ₱240/tray (30 eggs)
    total_revenue: 76800.00,
    buyer_name: 'Metro Manila Wholesale Egg Depot',
    payment_status: 'paid',
    created_at: new Date(Date.now()).toISOString(),
  },
  {
    id: 'sale-002',
    sale_date: formatDate(1),
    item_type: 'eggs_tray',
    quantity: 280,
    unit_price: 245.00,
    total_revenue: 68600.00,
    buyer_name: 'Golden Sunrise Bakeshop & Cafe',
    payment_status: 'paid',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'sale-003',
    sale_date: formatDate(2),
    item_type: 'poultry_manure',
    quantity: 85, // 85 bags
    unit_price: 150.00, // ₱150/bag
    total_revenue: 12750.00,
    buyer_name: 'Batangas Organic Vegetable Farms',
    payment_status: 'paid',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'sale-004',
    sale_date: formatDate(3),
    item_type: 'eggs_tray',
    quantity: 340,
    unit_price: 240.00,
    total_revenue: 81600.00,
    buyer_name: 'SuperFresh Supermarket Tagaytay',
    payment_status: 'paid',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'sale-005',
    sale_date: formatDate(5),
    item_type: 'cull_birds',
    quantity: 150,
    unit_price: 220.00, // ₱220/bird
    total_revenue: 33000.00,
    buyer_name: 'Apex Dressed Poultry & Dressed Chicken Corp',
    payment_status: 'paid',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'sale-006',
    sale_date: formatDate(7),
    item_type: 'eggs_piece',
    quantity: 1200,
    unit_price: 8.50, // ₱8.50/egg
    total_revenue: 10200.00,
    buyer_name: 'Public Market Direct Retail Walk-ins',
    payment_status: 'paid',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'sale-007',
    sale_date: formatDate(10),
    item_type: 'eggs_tray',
    quantity: 300,
    unit_price: 238.00,
    total_revenue: 71400.00,
    buyer_name: 'Delight Confectioneries & Pastry Hub',
    payment_status: 'pending',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'sale-008',
    sale_date: formatDate(14),
    item_type: 'eggs_tray',
    quantity: 350,
    unit_price: 240.00,
    total_revenue: 84000.00,
    buyer_name: 'Metro Manila Wholesale Egg Depot',
    payment_status: 'paid',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

// Philippine Peso (₱) Realistic Commercial Farm Operating Expenses
export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-001',
    date: formatDate(0),
    category: 'feed',
    item_name: 'Commercial Layer Mash 16% (50kg Bags)',
    quantity: 25,
    total_cost: 43750.00, // ₱1,750/bag
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp-002',
    date: formatDate(2),
    category: 'medication_vaccines',
    item_name: 'Newcastle Disease + IB Water Soluble Booster & Probiotics',
    quantity: 4,
    total_cost: 7400.00,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'exp-003',
    date: formatDate(4),
    category: 'feed',
    item_name: 'Commercial Layer Mash 16% (50kg Bags)',
    quantity: 30,
    total_cost: 52500.00,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'exp-004',
    date: formatDate(7),
    category: 'labor',
    item_name: 'Bi-Weekly Farm Hand & Egg Packing Staff Payroll',
    quantity: 1,
    total_cost: 28500.00,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'exp-005',
    date: formatDate(10),
    category: 'bedding',
    item_name: 'Kiln-Dried Pine Wood Shavings Bedding (Bales)',
    quantity: 20,
    total_cost: 4800.00,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'exp-006',
    date: formatDate(14),
    category: 'utilities',
    item_name: 'Poultry House Ventilation, Lighting & Water Pump Meralco Power',
    quantity: 1,
    total_cost: 16800.00,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'exp-007',
    date: formatDate(18),
    category: 'feed',
    item_name: 'Coarse Limestone Grit & Oyster Shell (Eggshell Hardener)',
    quantity: 15,
    total_cost: 5400.00,
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
];
