'use client'

import { useState, useEffect } from 'react'

/**
 * Persists form data to localStorage as a draft.
 * On mount, restores any saved draft.
 * Clears the draft after successful submission.
 *
 * @param key    - unique localStorage key per form (e.g. 'draft:checkin')
 * @param initial - default form state
 */
export function useOfflineDraft<T extends object>(key: string, initial: T) {
  const [draft, setDraft]     = useState<T>(initial)
  const [hasDraft, setHasDraft] = useState(false)

  // On mount: restore draft if one exists
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        setDraft(JSON.parse(stored) as T)
        setHasDraft(true)
      }
    } catch {
      // Corrupt localStorage — ignore
    }
  }, [key])

  // Save draft whenever the value changes
  function saveDraft(value: T) {
    setDraft(value)
    try {
      localStorage.setItem(key, JSON.stringify(value))
      setHasDraft(true)
    } catch {
      // Storage full or unavailable — ignore
    }
  }

  // Clear draft after successful submit
  function clearDraft() {
    setDraft(initial)
    setHasDraft(false)
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
  }

  return { draft, hasDraft, saveDraft, clearDraft }
}
