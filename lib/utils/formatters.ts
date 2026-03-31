/**
 * Format a number as Kenyan Shilling currency.
 * Display format: Ksh 54,700  (no decimals, comma-separated)
 */
export function formatKsh(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return `Ksh ${Math.round(amount).toLocaleString('en-KE')}`
}

/**
 * Format a ratio as a percentage string.
 * e.g. 0.73 → "73%"
 */
export function formatPercent(ratio: number | null | undefined, decimals = 0): string {
  if (ratio == null) return '—'
  return `${(ratio * 100).toFixed(decimals)}%`
}

/**
 * Format a date string YYYY-MM-DD as a human-readable date.
 * e.g. "2025-03-31" → "31 Mar 2025"
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-KE', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  })
}

/**
 * Format a date string YYYY-MM-DD as "Mon DD"
 * e.g. "2025-03-31" → "Mar 31"
 */
export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
}

/**
 * Return today's date as a YYYY-MM-DD string (local timezone).
 */
export function todayISO(): string {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

/**
 * Return the current month as YYYY-MM.
 */
export function currentMonthISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Format a month_year string "YYYY-MM" as "March 2025".
 */
export function formatMonthYear(monthYear: string): string {
  const [year, month] = monthYear.split('-')
  const d = new Date(Number(year), Number(month) - 1, 1)
  return d.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })
}

/**
 * Format a decimal kg value for display.
 * e.g. 28.5 → "28.5 kg"
 */
export function formatKg(kg: number | null | undefined): string {
  if (kg == null) return '—'
  return `${kg % 1 === 0 ? kg : kg.toFixed(1)} kg`
}

/**
 * Merge Tailwind class names, removing duplicates and handling undefined.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
