-- ============================================================
-- LST Poultry Farm — Seed Data
-- Run AFTER 001_schema.sql and 002_rls_policies.sql
--
-- NOTE: User creation must be done via the Supabase Auth Admin API
-- or the Dashboard (Auth → Users → Add user) because auth.users
-- rows cannot be inserted directly from SQL for security reasons.
--
-- Step 1: Create the 3 users in Supabase Dashboard or via this script
--         using the service role (see instructions below).
-- Step 2: Copy the UUIDs of those users and replace the placeholders
--         below, then run the rest of this file.
--
-- Users to create first (Dashboard → Auth → Users):
--   owner@lstfarm.com      password: LST@farm2025
--   accountant@lstfarm.com password: LST@farm2025
--   staff@lstfarm.com      password: LST@farm2025
-- ============================================================

-- ─── Replace these with real UUIDs from auth.users after creating the users ───
-- DO $$
-- DECLARE
--   owner_id      uuid := 'REPLACE-WITH-OWNER-UUID';
--   accountant_id uuid := 'REPLACE-WITH-ACCOUNTANT-UUID';
--   staff_id      uuid := 'REPLACE-WITH-STAFF-UUID';
-- BEGIN

-- ─── user_profiles ────────────────────────────────────────────────────────────
-- Run this block after replacing the UUIDs above.
-- The trigger handle_new_user() creates these automatically on sign-up,
-- but we override role here to ensure correct assignment.

-- UPDATE public.user_profiles SET full_name = 'Farm Owner',    role = 'owner'       WHERE id = owner_id;
-- UPDATE public.user_profiles SET full_name = 'Farm Accountant', role = 'accountant' WHERE id = accountant_id;
-- UPDATE public.user_profiles SET full_name = 'Field Staff',   role = 'field_staff' WHERE id = staff_id;


-- ─── Alternatively: use this single-file seed after creating users ─────────────
-- After you have the UUIDs, run the block below directly replacing the values:

/*
-- ─── targets (current month) ──────────────────────────────────────────────────
INSERT INTO public.targets (
  month_year,
  target_egg_laying_ratio,
  max_broken_egg_ratio,
  max_mortality_rate,
  target_feed_conversion_ratio,
  target_revenue_ksh,
  target_net_profit_ksh,
  target_eggs_produced,
  max_expense_ksh,
  notes
) VALUES (
  to_char(now(), 'YYYY-MM'),
  0.800,   -- 80% laying ratio target
  0.010,   -- max 1% broken eggs
  0.050,   -- max 5% mortality
  2.50,    -- feed conversion ratio
  150000,  -- Ksh 150,000 revenue target
  80000,   -- Ksh 80,000 net profit target
  3500,    -- target 3,500 eggs/month
  70000,   -- max Ksh 70,000 expenses
  'Monthly targets for LST Poultry Farm'
) ON CONFLICT (month_year) DO NOTHING;


-- ─── daily_records (7 days, ~145 hens, 90-100 eggs/day) ──────────────────────
-- Replace 'STAFF-UUID' with actual staff user UUID

INSERT INTO public.daily_records (
  date, entered_by, total_birds_count, hens_count, roosters_count,
  chicks_count, mortality_count, mortality_cause,
  eggs_collected, broken_eggs, feed_type, feed_qty_kg,
  water_available, notes
) VALUES
  (current_date - 6, 'STAFF-UUID', 198, 145, 18, 35, 0, NULL,  96, 2, 'Layers Mash', 28.50, true,  NULL),
  (current_date - 5, 'STAFF-UUID', 198, 145, 18, 35, 1, 'Disease', 94, 1, 'Layers Mash', 28.00, true, 'One hen found dead in corner'),
  (current_date - 4, 'STAFF-UUID', 197, 144, 18, 35, 0, NULL,  98, 3, 'Layers Mash', 28.50, true,  NULL),
  (current_date - 3, 'STAFF-UUID', 197, 144, 18, 35, 2, 'Unknown', 91, 2, 'Layers Mash', 27.00, true, 'Two roosters died - unknown cause'),
  (current_date - 2, 'STAFF-UUID', 195, 143, 17, 35, 0, NULL, 100, 1, 'Layers Mash', 28.50, true,  NULL),
  (current_date - 1, 'STAFF-UUID', 195, 143, 17, 35, 1, 'Injury', 92, 2, 'Layers Mash', 28.00, false, 'Water pipe burst — fixed by afternoon'),
  (current_date,     'STAFF-UUID', 194, 143, 17, 34, 0, NULL,  97, 1, 'Layers Mash', 28.50, true,  NULL);


-- ─── sales (5 records) ────────────────────────────────────────────────────────
-- Replace 'ACCOUNTANT-UUID' with actual accountant user UUID

INSERT INTO public.sales (
  date, sale_type, quantity, unit, unit_price_ksh,
  buyer_name, payment_method, payment_received, notes, entered_by
) VALUES
  (current_date - 5, 'Egg Sales',  360, 'pieces', 18.00,  'Mama Njeri Kiosk',  'M-Pesa',       true,  '2 trays of 30 eggs x 6', 'ACCOUNTANT-UUID'),
  (current_date - 4, 'Egg Sales',  180, 'pieces', 18.00,  'Walk-in customer',  'Cash',          true,  NULL, 'ACCOUNTANT-UUID'),
  (current_date - 3, 'Bird Sales',  10, 'birds',  800.00, 'Local butcher',     'M-Pesa',        true,  'Spent cockerels', 'ACCOUNTANT-UUID'),
  (current_date - 2, 'Egg Sales',  540, 'pieces', 17.00,  'Quickmart Supermarket', 'Bank Transfer', false, 'Invoice #INV-2025-031 — awaiting payment', 'ACCOUNTANT-UUID'),
  (current_date - 1, 'Meat Sales',  15, 'kg',     500.00, 'Hotel Sovereign',   'Cash',          true,  'Dressed chicken at Ksh 500/kg', 'ACCOUNTANT-UUID');


-- ─── expenses (6 records) ─────────────────────────────────────────────────────
INSERT INTO public.expenses (
  date, category, description, amount_ksh, supplier,
  payment_method, approved, notes, entered_by
) VALUES
  (current_date - 6, 'Animal Feeds',  'Layers Mash 50kg x 4 bags',    8400.00,  'Unga Farm Care',    'M-Pesa',       true,  NULL, 'ACCOUNTANT-UUID'),
  (current_date - 5, 'Vet Services',  'Vaccination — Newcastle disease', 3500.00, 'Dr. Kamau Vet',   'Cash',         true,  'Routine monthly vaccination', 'ACCOUNTANT-UUID'),
  (current_date - 4, 'Labour',        'Farm hand wages — weekly',      7000.00,  NULL,                'Cash',         true,  '2 workers x Ksh 3,500', 'ACCOUNTANT-UUID'),
  (current_date - 3, 'Electricity',   'KPLC prepaid token',            2200.00,  'KPLC',             'M-Pesa',       true,  NULL, 'ACCOUNTANT-UUID'),
  (current_date - 2, 'Maintenance',   'Repair chicken wire fencing',   1800.00,  'Jua Kali welder',  'Cash',         false, 'East side fence — needs final inspection', 'ACCOUNTANT-UUID'),
  (current_date - 1, 'Supplements',   'Calcium supplements 5kg',        950.00,  'Farmers Choice',   'M-Pesa',       true,  NULL, 'ACCOUNTANT-UUID');


-- ─── stock_events (opening balance) ───────────────────────────────────────────
INSERT INTO public.stock_events (
  date, event_type, bird_type, quantity, unit_cost_ksh,
  supplier_or_buyer, age_weeks, notes, entered_by
) VALUES
  (date_trunc('month', now())::date, 'Opening Balance', 'Layers/Hens', 145, NULL,  NULL, 72, 'Opening balance at start of month', 'ACCOUNTANT-UUID'),
  (date_trunc('month', now())::date, 'Opening Balance', 'Roosters',     18, NULL,  NULL, 72, 'Opening balance at start of month', 'ACCOUNTANT-UUID'),
  (date_trunc('month', now())::date, 'Opening Balance', 'Chicks',       35, NULL,  NULL,  3, 'Opening balance at start of month', 'ACCOUNTANT-UUID');

*/

-- END $$;
