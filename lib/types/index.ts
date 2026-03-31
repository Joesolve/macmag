// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'field_staff' | 'accountant' | 'owner'

export type MortalityCause =
  | 'Unknown'
  | 'Disease'
  | 'Injury'
  | 'Predator'
  | 'Heat stress'
  | 'Other'

export type FeedType =
  | 'Layers Mash'
  | 'Growers Mash'
  | 'Chick Mash'
  | 'Broiler Mash'
  | 'Maize Grains'
  | 'Green Leaves'
  | 'Mixed'

export type SaleType =
  | 'Egg Sales'
  | 'Meat Sales'
  | 'Bird Sales'
  | 'Other Revenue'

export type SaleUnit = 'pieces' | 'kg' | 'birds' | 'lot'

export type PaymentMethod = 'Cash' | 'M-Pesa' | 'Bank Transfer' | 'Credit'

export type ExpensePaymentMethod = 'Cash' | 'M-Pesa' | 'Bank Transfer' | 'Cheque'

export type ExpenseCategory =
  | 'Animal Feeds'
  | 'Restocking'
  | 'Maintenance'
  | 'Rent'
  | 'Security'
  | 'Electricity'
  | 'Supplements'
  | 'Vet Services'
  | 'Marketing'
  | 'Trainings'
  | 'Labour'
  | 'Other'

export type StockEventType =
  | 'Restocking'
  | 'Bird Sale'
  | 'Culled'
  | 'Transfer In'
  | 'Transfer Out'
  | 'Opening Balance'

export type BirdType = 'Layers/Hens' | 'Roosters' | 'Chicks' | 'Broilers'

// ─── Table row types ───────────────────────────────────────────────────────────

export interface DailyRecord {
  id: string
  date: string                        // ISO date string YYYY-MM-DD
  entered_by: string | null
  total_birds_count: number
  hens_count: number
  roosters_count: number
  chicks_count: number
  mortality_count: number
  mortality_cause: MortalityCause | null
  eggs_collected: number
  broken_eggs: number
  feed_type: FeedType
  feed_qty_kg: number
  water_available: boolean
  notes: string | null
  created_at: string
}

export interface Sale {
  id: string
  date: string
  sale_type: SaleType
  quantity: number
  unit: SaleUnit
  unit_price_ksh: number
  total_amount_ksh: number            // generated column
  buyer_name: string | null
  payment_method: PaymentMethod
  payment_received: boolean
  notes: string | null
  entered_by: string | null
  created_at: string
}

export interface Expense {
  id: string
  date: string
  category: ExpenseCategory
  description: string
  amount_ksh: number
  supplier: string | null
  payment_method: ExpensePaymentMethod
  receipt_photo_url: string | null
  approved: boolean
  notes: string | null
  entered_by: string | null
  created_at: string
}

export interface StockEvent {
  id: string
  date: string
  event_type: StockEventType
  bird_type: BirdType
  quantity: number
  unit_cost_ksh: number | null
  supplier_or_buyer: string | null
  age_weeks: number | null
  notes: string | null
  entered_by: string | null
  created_at: string
}

export interface Target {
  id: string
  month_year: string                  // YYYY-MM
  target_egg_laying_ratio: number
  max_broken_egg_ratio: number
  max_mortality_rate: number
  target_feed_conversion_ratio: number | null
  target_revenue_ksh: number
  target_net_profit_ksh: number | null
  target_eggs_produced: number | null
  max_expense_ksh: number | null
  notes: string | null
  created_at: string
}

export interface UserProfile {
  id: string
  full_name: string
  role: UserRole
  created_at: string
}

// ─── Insert types (omit generated/defaulted fields) ───────────────────────────

export type DailyRecordInsert = Omit<DailyRecord, 'id' | 'created_at'>
export type SaleInsert = Omit<Sale, 'id' | 'total_amount_ksh' | 'created_at'>
export type ExpenseInsert = Omit<Expense, 'id' | 'created_at'>
export type StockEventInsert = Omit<StockEvent, 'id' | 'created_at'>
export type TargetInsert = Omit<Target, 'id' | 'created_at'>
export type UserProfileInsert = Omit<UserProfile, 'created_at'>

// ─── Dashboard calculation types ──────────────────────────────────────────────

export interface MonthlyFinancials {
  month_year: string
  total_revenue: number
  total_expenses: number
  net_profit: number
  eggs_produced: number
  total_birds_avg: number
  mortality_count: number
  mortality_rate: number | null
  egg_laying_ratio: number | null
  broken_egg_ratio: number | null
}

export interface KpiStatus {
  value: number | null
  target: number | null
  status: 'great' | 'not_bad' | 'alert' | 'no_data'
  label: string
}

export interface SalesBreakdown {
  egg_sales: number
  meat_sales: number
  bird_sales: number
  other_revenue: number
}

export interface ExpenseBreakdown {
  category: ExpenseCategory
  amount: number
  percentage: number
}

export interface DailyChartPoint {
  date: string            // YYYY-MM-DD
  eggs_collected: number
  projected: number | null
}

export interface FeedChartPoint {
  feed_type: string
  total_kg: number
}
