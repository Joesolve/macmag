/**
 * Root page — middleware handles the redirect to the correct role section.
 * This page is only rendered if middleware fails (should not happen).
 */
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/auth/login')
}
