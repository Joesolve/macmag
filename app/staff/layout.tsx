import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'field_staff') {
    const roleRouteMap: Record<string, string> = {
      accountant: '/accounts',
      owner:      '/dashboard',
    }
    redirect(roleRouteMap[profile?.role ?? ''] ?? '/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#F4F2ED]">
      {/* Header */}
      <header className="bg-[#0D4A2C] px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-white font-semibold text-sm">LST Poultry Farm</p>
          <p className="text-green-300 text-xs">{profile?.full_name ?? 'Field Staff'}</p>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="text-green-300 text-xs underline underline-offset-2"
          >
            Sign out
          </button>
        </form>
      </header>

      {/* Page content */}
      <main className="pb-20">{children}</main>

      {/* Bottom nav placeholder — tabs rendered per-page */}
    </div>
  )
}
