-- ============================================================
-- LST Poultry Farm — Database Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() (already enabled in Supabase)
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── 1. user_profiles ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name   text NOT NULL,
  role        text NOT NULL CHECK (role IN ('field_staff', 'accountant', 'owner')),
  created_at  timestamptz DEFAULT now()
);

-- Trigger: auto-create a user_profiles row when a new auth.users row is inserted
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'field_staff')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── 2. daily_records ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_records (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date                date NOT NULL,
  entered_by          uuid REFERENCES auth.users ON DELETE SET NULL,
  total_birds_count   integer NOT NULL CHECK (total_birds_count >= 0),
  hens_count          integer NOT NULL CHECK (hens_count >= 0),
  roosters_count      integer NOT NULL CHECK (roosters_count >= 0),
  chicks_count        integer NOT NULL CHECK (chicks_count >= 0),
  mortality_count     integer NOT NULL DEFAULT 0 CHECK (mortality_count >= 0),
  mortality_cause     text CHECK (mortality_cause IN (
                        'Unknown', 'Disease', 'Injury',
                        'Predator', 'Heat stress', 'Other'
                      )),
  eggs_collected      integer NOT NULL CHECK (eggs_collected >= 0),
  broken_eggs         integer NOT NULL DEFAULT 0 CHECK (broken_eggs >= 0),
  feed_type           text NOT NULL CHECK (feed_type IN (
                        'Layers Mash', 'Growers Mash', 'Chick Mash',
                        'Broiler Mash', 'Maize Grains', 'Green Leaves', 'Mixed'
                      )),
  feed_qty_kg         decimal(8,2) NOT NULL CHECK (feed_qty_kg > 0),
  water_available     boolean NOT NULL DEFAULT true,
  notes               text,
  created_at          timestamptz DEFAULT now(),
  UNIQUE (date, entered_by)   -- prevent duplicate submission per user per day
);


-- ─── 3. sales ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sales (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date                date NOT NULL,
  sale_type           text NOT NULL CHECK (sale_type IN (
                        'Egg Sales', 'Meat Sales', 'Bird Sales', 'Other Revenue'
                      )),
  quantity            decimal(10,2) NOT NULL CHECK (quantity > 0),
  unit                text NOT NULL CHECK (unit IN ('pieces', 'kg', 'birds', 'lot')),
  unit_price_ksh      decimal(10,2) NOT NULL CHECK (unit_price_ksh >= 0),
  total_amount_ksh    decimal(10,2) GENERATED ALWAYS AS (quantity * unit_price_ksh) STORED,
  buyer_name          text,
  payment_method      text NOT NULL CHECK (payment_method IN (
                        'Cash', 'M-Pesa', 'Bank Transfer', 'Credit'
                      )),
  payment_received    boolean DEFAULT false,
  notes               text,
  entered_by          uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at          timestamptz DEFAULT now()
);


-- ─── 4. expenses ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.expenses (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date                date NOT NULL,
  category            text NOT NULL CHECK (category IN (
                        'Animal Feeds', 'Restocking', 'Maintenance', 'Rent',
                        'Security', 'Electricity', 'Supplements', 'Vet Services',
                        'Marketing', 'Trainings', 'Labour', 'Other'
                      )),
  description         text NOT NULL,
  amount_ksh          decimal(10,2) NOT NULL CHECK (amount_ksh > 0),
  supplier            text,
  payment_method      text NOT NULL CHECK (payment_method IN (
                        'Cash', 'M-Pesa', 'Bank Transfer', 'Cheque'
                      )),
  receipt_photo_url   text,
  approved            boolean DEFAULT false,
  notes               text,
  entered_by          uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at          timestamptz DEFAULT now()
);


-- ─── 5. stock_events ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stock_events (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date                date NOT NULL,
  event_type          text NOT NULL CHECK (event_type IN (
                        'Restocking', 'Bird Sale', 'Culled',
                        'Transfer In', 'Transfer Out', 'Opening Balance'
                      )),
  bird_type           text NOT NULL CHECK (bird_type IN (
                        'Layers/Hens', 'Roosters', 'Chicks', 'Broilers'
                      )),
  quantity            integer NOT NULL CHECK (quantity > 0),
  unit_cost_ksh       decimal(10,2),
  supplier_or_buyer   text,
  age_weeks           integer CHECK (age_weeks >= 0),
  notes               text,
  entered_by          uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at          timestamptz DEFAULT now()
);


-- ─── 6. targets ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.targets (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year                    text NOT NULL UNIQUE,   -- YYYY-MM
  target_egg_laying_ratio       decimal(4,3) NOT NULL CHECK (target_egg_laying_ratio BETWEEN 0 AND 1),
  max_broken_egg_ratio          decimal(4,3) NOT NULL CHECK (max_broken_egg_ratio BETWEEN 0 AND 1),
  max_mortality_rate            decimal(4,3) NOT NULL CHECK (max_mortality_rate BETWEEN 0 AND 1),
  target_feed_conversion_ratio  decimal(5,2),
  target_revenue_ksh            decimal(12,2) NOT NULL CHECK (target_revenue_ksh >= 0),
  target_net_profit_ksh         decimal(12,2),
  target_eggs_produced          integer CHECK (target_eggs_produced >= 0),
  max_expense_ksh               decimal(12,2) CHECK (max_expense_ksh >= 0),
  notes                         text,
  created_at                    timestamptz DEFAULT now()
);


-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_daily_records_date        ON public.daily_records (date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_records_entered_by  ON public.daily_records (entered_by);
CREATE INDEX IF NOT EXISTS idx_sales_date                ON public.sales (date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_date             ON public.expenses (date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_events_date         ON public.stock_events (date DESC);


-- ─── Enable Row Level Security ────────────────────────────────────────────────
ALTER TABLE public.user_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets        ENABLE ROW LEVEL SECURITY;
