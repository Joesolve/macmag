'use client'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  if (isOnline) return null

  return (
    <div
      role="alert"
      className="fixed top-0 inset-x-0 z-50 bg-amber-500 text-white text-sm text-center py-2 px-4"
    >
      You are offline — form data will be saved locally and submitted when reconnected.
    </div>
  )
}
