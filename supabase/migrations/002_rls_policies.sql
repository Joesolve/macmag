-- ============================================================
-- LST Poultry Farm — Row Level Security Policies
-- Run AFTER 001_schema.sql
-- ============================================================

-- Helper: get the current user's role from user_profiles
-- Used inline in policies to avoid repeated subqueries.

-- ─── user_profiles ────────────────────────────────────────────────────────────

-- Everyone can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (id = auth.uid());

-- Owner can read all profiles
CREATE POLICY "Owner reads all profiles"
  ON public.user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

-- Service role (used in seed scripts) can do anything — no policy needed
-- (service role bypasses RLS)


-- ─── daily_records ────────────────────────────────────────────────────────────

-- field_staff: INSERT their own rows
CREATE POLICY "field_staff can insert daily_records"
  ON public.daily_records FOR INSERT
  WITH CHECK (
    entered_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'field_staff'
    )
  );

-- field_staff: SELECT only their own rows
CREATE POLICY "field_staff can select own daily_records"
  ON public.daily_records FOR SELECT
  USING (
    entered_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'field_staff'
    )
  );

-- accountant: SELECT all daily_records (read-only, for reports)
CREATE POLICY "accountant can select daily_records"
  ON public.daily_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'accountant'
    )
  );

-- owner: SELECT all daily_records (read-only)
CREATE POLICY "owner can select daily_records"
  ON public.daily_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );


-- ─── sales ────────────────────────────────────────────────────────────────────

-- field_staff: INSERT their own sales (walk-in farm gate sales)
CREATE POLICY "field_staff can insert sales"
  ON public.sales FOR INSERT
  WITH CHECK (
    entered_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'field_staff'
    )
  );

-- field_staff: SELECT their own sales
CREATE POLICY "field_staff can select own sales"
  ON public.sales FOR SELECT
  USING (
    entered_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'field_staff'
    )
  );

-- accountant: INSERT + SELECT all sales
CREATE POLICY "accountant can insert sales"
  ON public.sales FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'accountant'
    )
  );

CREATE POLICY "accountant can select sales"
  ON public.sales FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'accountant'
    )
  );

-- accountant: UPDATE their own sales records (e.g. mark payment received)
CREATE POLICY "accountant can update sales"
  ON public.sales FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'accountant'
    )
  );

-- owner: SELECT all sales
CREATE POLICY "owner can select sales"
  ON public.sales FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );


-- ─── expenses ─────────────────────────────────────────────────────────────────

-- accountant: INSERT + SELECT all expenses
CREATE POLICY "accountant can insert expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'accountant'
    )
  );

CREATE POLICY "accountant can select expenses"
  ON public.expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'accountant'
    )
  );

-- accountant: UPDATE expenses (edit/approve their own records)
CREATE POLICY "accountant can update expenses"
  ON public.expenses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'accountant'
    )
  );

-- owner: SELECT all expenses
CREATE POLICY "owner can select expenses"
  ON public.expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );


-- ─── stock_events ─────────────────────────────────────────────────────────────

-- accountant: INSERT + SELECT stock events (restocking ties to expenses)
CREATE POLICY "accountant can insert stock_events"
  ON public.stock_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'accountant'
    )
  );

CREATE POLICY "accountant can select stock_events"
  ON public.stock_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'accountant'
    )
  );

-- field_staff: SELECT stock_events (to see current flock count)
CREATE POLICY "field_staff can select stock_events"
  ON public.stock_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'field_staff'
    )
  );

-- owner: SELECT all stock_events
CREATE POLICY "owner can select stock_events"
  ON public.stock_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );


-- ─── targets ──────────────────────────────────────────────────────────────────

-- All authenticated roles: SELECT targets
CREATE POLICY "all roles can select targets"
  ON public.targets FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- owner only: INSERT + UPDATE targets
CREATE POLICY "owner can insert targets"
  ON public.targets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

CREATE POLICY "owner can update targets"
  ON public.targets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );


-- ─── Storage bucket for receipt photos ────────────────────────────────────────
-- Run this in Storage → Policies after creating a bucket named 'receipts'

-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

-- CREATE POLICY "accountant can upload receipts"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'receipts'
--     AND EXISTS (
--       SELECT 1 FROM public.user_profiles p
--       WHERE p.id = auth.uid() AND p.role = 'accountant'
--     )
--   );

-- CREATE POLICY "accountant and owner can read receipts"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'receipts'
--     AND EXISTS (
--       SELECT 1 FROM public.user_profiles p
--       WHERE p.id = auth.uid() AND p.role IN ('accountant', 'owner')
--     )
--   );
