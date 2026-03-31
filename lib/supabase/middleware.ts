import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware Supabase instance.
 * Used exclusively in middleware.ts to refresh the session cookie.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: do not add logic between createServerClient and getUser().
  // A simple mistake will make it very hard to debug issues with users being
  // randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch role from user_profiles if authenticated
  let role: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role ?? null
  }

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Public routes — allow through unauthenticated
  const publicPaths = ['/auth/login', '/auth/callback', '/auth/error']
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return supabaseResponse
  }

  // Unauthenticated user — redirect to login
  if (!user) {
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Role-based route guards
  const roleRouteMap: Record<string, string> = {
    field_staff: '/staff',
    accountant: '/accounts',
    owner: '/dashboard',
  }

  const allowedBase = role ? roleRouteMap[role] : null

  // Root path — redirect to role home
  if (pathname === '/') {
    url.pathname = allowedBase ?? '/auth/login'
    return NextResponse.redirect(url)
  }

  // Cross-role access — redirect to own section
  if (allowedBase && !pathname.startsWith(allowedBase)) {
    // Allow API routes for authenticated users
    if (pathname.startsWith('/api/')) return supabaseResponse
    url.pathname = allowedBase
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
