# 🥚 Eggstra OS - Production Poultry Farm Management System

**Eggstra OS** is an agricultural operating system and commercial layer poultry tracking platform built with **Next.js (App Router)**, **Tailwind CSS**, **Lucide Icons**, **Recharts**, and **Supabase (PostgreSQL with Row Level Security and automated headcount triggers)**. Defaulted to **Philippine Peso (₱ / PHP)** and featuring a dual **Light/Dark Mode** theme system.

---

## 🌟 Key Features

### 📊 1. Executive Analytics Dashboard (`/`)
- **Living Flock Headcount**: Live active hen count aggregated across all active pens with 100% capacity tracking.
- **Today's Egg Harvest & 30-Egg Trays**: Instant conversion of table eggs into standard 30-egg commercial trays.
- **Hen-Day Laying Percentage**: Automated calculation `(Total Eggs / Living Flock) * 100` against the 80%+ industry benchmark.
- **Daily Mortality Early Warning System**: Visual threshold alerts (`>0.1%` yellow warning, `>0.3%` critical alert) for rapid biosecurity intervention.
- **30-Day Laying Curve vs Expected Commercial Benchmark**: Interactive Recharts curve comparing actual production against the 90% peak breed curve.
- **Financial Pulse**: Real-time daily and 30-day net margin in Philippine Peso (₱).

### 📝 2. Mobile-First Quick Daily Log (`/logs`)
- Field-friendly touch stepper buttons (`-100`, `-30`, `+30`, `+100`) for rapid collection entry on smartphones.
- Damaged / cracked egg logging with loss percentage calculation.
- Dead bird mortality and cull logging with constraint validation preventing impossible values.
- Confetti celebration on successful harvest logging.
- Searchable log ledger with inline editing and one-click CSV export.

### 🐔 3. Flock Lifecycle & Batch Management (`/flocks`)
- Support for commercial layer breeds (*Lohmann Brown, Hy-Line Brown, Dekalb White, ISA Brown, etc.*).
- Automatic calculations: Flock age in weeks & days, survival rate %, cumulative mortality %, and lifetime eggs per hen housed (HHP).
- Full lifecycle status management (*Active, Culled, Sold, Archived*).

### 🛒 4. Sales & Point of Sale (POS) Invoicing (`/sales`)
- Fast order entry for **30-Egg Trays (₱240/tray)**, **Loose Eggs (₱8.50/egg)**, **Spent Cull Hens (₱220/bird)**, and **Organic Poultry Manure Sacks (₱150/bag)**.
- Printable thermal receipt & official invoice modal with `@media print` styling.
- Filterable transactions ledger by customer, product, and payment status (*Paid, Pending, Partial*).

### 🌾 5. Feed Conversion Ratio (FCR) & Expense Tracker (`/expenses`)
- Automated **Feed Conversion Ratio (FCR)** calculator: `kg of feed consumed per dozen eggs produced`.
- **Feed Stock Runway Forecaster**: Days of feed inventory remaining based on active flock daily consumption.
- Categorized expense ledger (*Layer mash, vaccines, labor payroll, bedding, utilities/Meralco*).

### 📈 6. Farm Profit & Loss (P&L) Statement (`/reports`)
- Comprehensive P&L statement breaking down table egg revenues, cull bird sales, manure revenues against feed, veterinary, and labor costs.
- Flock comparative performance matrix and batch CSV export hub.

### 🗄️ 7. Database Engine & Supabase Migrations (`/settings`)
- In-app PostgreSQL schema viewer with one-click copy for the Supabase SQL Editor.
- Built-in data backup downloader and sample data resetter.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with dual Light & Dark themes
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts & Data Visualization**: [Recharts](https://recharts.org/)
- **Database & Realtime**: [Supabase](https://supabase.com/) (PostgreSQL, RLS, Triggers, Realtime)
- **Delight**: Canvas Confetti

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/vnzxc12/eggstra-system.git
cd eggstra-system
npm install
```

### 2. Configure Environment Variables (Optional for Live Supabase)
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
> **Note**: Eggstra OS comes with an offline fallback and realistic 30-day Philippine layer farm dataset out-of-the-box if Supabase credentials are not provided.

### 3. Run Supabase Database Migration
Open your Supabase SQL Editor and execute the script located in:
[`supabase/migrations/20260829000001_init_poultry_schema.sql`](./supabase/migrations/20260829000001_init_poultry_schema.sql)

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 📄 License
MIT License. Built for commercial egg producers, poultry farmers, and agribusinesses.
