import type { KpiStatus } from '@/lib/types'

const styles: Record<KpiStatus['status'], string> = {
  great:   'badge-great',
  not_bad: 'badge-not-bad',
  alert:   'badge-alert',
  no_data: 'badge-no-data',
}

const labels: Record<KpiStatus['status'], string> = {
  great:   'Great',
  not_bad: 'Not Bad',
  alert:   'Alert',
  no_data: 'No Data',
}

export function StatusBadge({ status }: { status: KpiStatus['status'] }) {
  return (
    <span className={styles[status]}>
      {labels[status]}
    </span>
  )
}
