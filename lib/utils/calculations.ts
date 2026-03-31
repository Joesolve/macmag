import type { DailyRecord, Sale, Expense, Target, KpiStatus, SalesBreakdown, ExpenseBreakdown } from '@/lib/types'

/**
 * Safe division — returns null if denominator is 0 or null.
 */
function safeDivide(numerator: number, denominator: number | null): number | null {
  if (!denominator || denominator === 0) return null
  return numerator / denominator
}

/**
 * Egg laying ratio = total eggs collected / total hens count for the period.
 */
export function calcEggLayingRatio(records: DailyRecord[]): number | null {
  const totalEggs = records.reduce((sum, r) => sum + r.eggs_collected, 0)
  const totalHens = records.reduce((sum, r) => sum + r.hens_count, 0)
  return safeDivide(totalEggs, totalHens)
}

/**
 * Broken egg ratio = total broken eggs / total eggs collected.
 */
export function calcBrokenEggRatio(records: DailyRecord[]): number | null {
  const totalBroken = records.reduce((sum, r) => sum + r.broken_eggs, 0)
  const totalEggs   = records.reduce((sum, r) => sum + r.eggs_collected, 0)
  return safeDivide(totalBroken, totalEggs)
}

/**
 * Mortality rate = total mortality / average birds count.
 */
export function calcMortalityRate(records: DailyRecord[]): number | null {
  if (records.length === 0) return null
  const totalMortality = records.reduce((sum, r) => sum + r.mortality_count, 0)
  const avgBirds = records.reduce((sum, r) => sum + r.total_birds_count, 0) / records.length
  return safeDivide(totalMortality, avgBirds)
}

/**
 * Total feed consumed in kg.
 */
export function calcTotalFeedKg(records: DailyRecord[]): number {
  return records.reduce((sum, r) => sum + Number(r.feed_qty_kg), 0)
}

/**
 * Feed conversion ratio = total feed kg / total eggs collected.
 * Lower is better.
 */
export function calcFeedConversionRatio(records: DailyRecord[]): number | null {
  const totalFeed = calcTotalFeedKg(records)
  const totalEggs = records.reduce((sum, r) => sum + r.eggs_collected, 0)
  return safeDivide(totalFeed, totalEggs)
}

/**
 * Total revenue from sales records.
 */
export function calcTotalRevenue(sales: Sale[]): number {
  return sales.reduce((sum, s) => sum + Number(s.total_amount_ksh), 0)
}

/**
 * Total expenses.
 */
export function calcTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + Number(e.amount_ksh), 0)
}

/**
 * Net profit = revenue - expenses.
 */
export function calcNetProfit(sales: Sale[], expenses: Expense[]): number {
  return calcTotalRevenue(sales) - calcTotalExpenses(expenses)
}

/**
 * Revenue breakdown by sale type.
 */
export function calcSalesBreakdown(sales: Sale[]): SalesBreakdown {
  return {
    egg_sales:    sales.filter(s => s.sale_type === 'Egg Sales').reduce((sum, s) => sum + Number(s.total_amount_ksh), 0),
    meat_sales:   sales.filter(s => s.sale_type === 'Meat Sales').reduce((sum, s) => sum + Number(s.total_amount_ksh), 0),
    bird_sales:   sales.filter(s => s.sale_type === 'Bird Sales').reduce((sum, s) => sum + Number(s.total_amount_ksh), 0),
    other_revenue: sales.filter(s => s.sale_type === 'Other Revenue').reduce((sum, s) => sum + Number(s.total_amount_ksh), 0),
  }
}

/**
 * Expense breakdown by category, sorted descending by amount.
 */
export function calcExpenseBreakdown(expenses: Expense[]): ExpenseBreakdown[] {
  const totals: Record<string, number> = {}
  const total = calcTotalExpenses(expenses)

  for (const e of expenses) {
    totals[e.category] = (totals[e.category] ?? 0) + Number(e.amount_ksh)
  }

  return Object.entries(totals)
    .map(([category, amount]) => ({
      category: category as ExpenseBreakdown['category'],
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

/**
 * Determine KPI status badge based on actual vs target/max.
 * For metrics where lower is better (broken_egg, mortality), invert the logic.
 */
export function getKpiStatus(
  actual: number | null,
  target: number | null,
  label: string,
  lowerIsBetter = false
): KpiStatus {
  if (actual == null) {
    return { value: null, target, status: 'no_data', label }
  }
  if (target == null) {
    return { value: actual, target: null, status: 'no_data', label }
  }

  const ratio = lowerIsBetter
    ? actual / target        // < 1 means we're under the max (good)
    : actual / target        // > 1 means we exceeded the target (good)

  if (lowerIsBetter) {
    if (ratio <= 0.5)   return { value: actual, target, status: 'great',   label }
    if (ratio <= 1.0)   return { value: actual, target, status: 'not_bad', label }
    return                   { value: actual, target, status: 'alert',   label }
  } else {
    if (ratio >= 1.0)   return { value: actual, target, status: 'great',   label }
    if (ratio >= 0.75)  return { value: actual, target, status: 'not_bad', label }
    return                   { value: actual, target, status: 'alert',   label }
  }
}

/**
 * Build daily egg production chart data for a given month,
 * filling gaps with null for missing days.
 */
export function buildEggChartData(
  records: DailyRecord[],
  monthYear: string,
  dailyTarget: number | null
) {
  const [year, month] = monthYear.split('-').map(Number)
  const daysInMonth   = new Date(year, month, 0).getDate()
  const recordMap     = new Map(records.map(r => [r.date, r]))

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day  = String(i + 1).padStart(2, '0')
    const date = `${monthYear}-${day}`
    const rec  = recordMap.get(date)
    return {
      date,
      eggs_collected: rec?.eggs_collected ?? null,
      projected:      dailyTarget,
    }
  })
}

/**
 * Aggregate feed consumption by type for the bar chart.
 */
export function buildFeedChartData(records: DailyRecord[]) {
  const totals: Record<string, number> = {}
  for (const r of records) {
    totals[r.feed_type] = (totals[r.feed_type] ?? 0) + Number(r.feed_qty_kg)
  }
  return Object.entries(totals).map(([feed_type, total_kg]) => ({ feed_type, total_kg }))
}
