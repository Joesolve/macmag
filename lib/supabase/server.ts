import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-component / Route-handler / Server-action Supabase instance.
 * Reads the session cookie to authenticate the request.
 * Must be called inside an async context where `cookies()` is available.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — cookies cannot be
            // mutated from there. The middleware handles session refresh.
          }
        },
      },
    }
  )
}
