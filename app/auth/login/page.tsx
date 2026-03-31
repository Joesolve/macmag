'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !data.user) {
      setError(authError?.message ?? 'Login failed. Check your credentials.')
      setLoading(false)
      return
    }

    // Fetch the user's role to redirect to the correct section
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const roleRouteMap: Record<string, string> = {
      field_staff: '/staff',
      accountant:  '/accounts',
      owner:       '/dashboard',
    }

    const destination = profile?.role ? roleRouteMap[profile.role] : '/auth/error'
    router.push(destination)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0D4A2C] flex flex-col items-center justify-center px-4">
      {/* Logo / Brand */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1D9E75] mb-4">
          {/* Chicken SVG icon */}
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
            <circle cx="20" cy="20" r="20" fill="#1D9E75"/>
            <path d="M28 14c0-2.2-1.8-4-4-4s-4 1.8-4 4c0 .7.2 1.4.5 2H12l-2 4h4l1 8h10l1-8h4l-2-4h-.5c.3-.6.5-1.3.5-2z" fill="white"/>
            <circle cx="25" cy="13" r="1.5" fill="#EF9F27"/>
          </svg>
        </div>
        <h1 className="text-white text-2xl font-bold tracking-tight">LST Poultry Farm</h1>
        <p className="text-green-200 text-sm mt-1">Farm Management System</p>
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm bg-white rounded-[12px] shadow-xl p-6">
        <h2 className="text-[#1A1A18] text-xl font-semibold mb-6">Sign in</h2>

        <form onSubmit={handleLogin} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1A1A18] mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@lstfarm.com"
                className="input"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1A1A18] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="input"
                disabled={loading}
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-[8px] bg-red-50 border border-red-200 px-4 py-3 text-sm text-[#E24B4A]"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>

      <p className="mt-8 text-green-300 text-xs text-center">
        LST Poultry Farm &copy; {new Date().getFullYear()}
      </p>
    </div>
  )
}
