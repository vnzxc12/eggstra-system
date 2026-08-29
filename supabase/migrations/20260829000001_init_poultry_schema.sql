-- ==============================================================================
-- Eggstra Poultry Farm Management System - Supabase Migration Schema
-- Version: 1.0.0
-- Description: Complete schema for flocks, daily logs, sales, expenses,
--              PostgreSQL headcount recalculation trigger, RLS policies, and indexes.
-- ==============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Table: flocks
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 2. Table: daily_logs
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 3. Table: sales_records
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 4. Table: expenses
-- ------------------------------------------------------------------------------
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

-- ==============================================================================
-- 5. Automatic Flock Headcount Recalculation Trigger
-- Formula: current_count = initial_count - SUM(mortality_count + culled_count)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.fn_sync_flock_headcount()
RETURNS TRIGGER AS $$
DECLARE
    target_flock_id UUID;
    v_initial_count INT;
    v_total_lost INT;
    v_new_current INT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_flock_id := OLD.flock_id;
    ELSE
        target_flock_id := NEW.flock_id;
    END IF;

    -- Fetch the initial flock count
    SELECT initial_count INTO v_initial_count
    FROM public.flocks
    WHERE id = target_flock_id;

    IF v_initial_count IS NOT NULL THEN
        -- Calculate total cumulative mortality + culls across all daily logs for this flock
        SELECT COALESCE(SUM(mortality_count + culled_count), 0)
        INTO v_total_lost
        FROM public.daily_logs
        WHERE flock_id = target_flock_id;

        v_new_current := GREATEST(0, v_initial_count - v_total_lost);

        -- Update the flock record
        UPDATE public.flocks
        SET current_count = v_new_current
        WHERE id = target_flock_id;
    END IF;

    -- Handle case where flock_id is changed during an UPDATE
    IF (TG_OP = 'UPDATE' AND OLD.flock_id IS DISTINCT FROM NEW.flock_id) THEN
        SELECT initial_count INTO v_initial_count
        FROM public.flocks
        WHERE id = OLD.flock_id;

        IF v_initial_count IS NOT NULL THEN
            SELECT COALESCE(SUM(mortality_count + culled_count), 0)
            INTO v_total_lost
            FROM public.daily_logs
            WHERE flock_id = OLD.flock_id;

            UPDATE public.flocks
            SET current_count = GREATEST(0, v_initial_count - v_total_lost)
            WHERE id = OLD.flock_id;
        END IF;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to daily_logs table for INSERT, UPDATE, DELETE
DROP TRIGGER IF EXISTS trg_recalculate_flock_count ON public.daily_logs;
CREATE TRIGGER trg_recalculate_flock_count
AFTER INSERT OR UPDATE OR DELETE ON public.daily_logs
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_flock_headcount();

-- ==============================================================================
-- 6. Indexes for High-Performance Queries & Analytics
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_flocks_user_status ON public.flocks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_logs_flock_date ON public.daily_logs(flock_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_user_date ON public.sales_records(user_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);

-- ==============================================================================
-- 7. Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.flocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Flocks Policies
CREATE POLICY "Users can view own flocks"
    ON public.flocks FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own flocks"
    ON public.flocks FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own flocks"
    ON public.flocks FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own flocks"
    ON public.flocks FOR DELETE
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Daily Logs Policies
CREATE POLICY "Users can view own daily logs"
    ON public.daily_logs FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own daily logs"
    ON public.daily_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own daily logs"
    ON public.daily_logs FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own daily logs"
    ON public.daily_logs FOR DELETE
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Sales Records Policies
CREATE POLICY "Users can view own sales records"
    ON public.sales_records FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own sales records"
    ON public.sales_records FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own sales records"
    ON public.sales_records FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own sales records"
    ON public.sales_records FOR DELETE
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Expenses Policies
CREATE POLICY "Users can view own expenses"
    ON public.expenses FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own expenses"
    ON public.expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own expenses"
    ON public.expenses FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own expenses"
    ON public.expenses FOR DELETE
    USING (auth.uid() = user_id OR user_id IS NULL);

-- ==============================================================================
-- 8. Real-time Publication
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'flocks'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.flocks;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'daily_logs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_logs;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'sales_records'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.sales_records;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'expenses'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
