import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
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

  if (profile?.role !== 'owner') {
    const roleRouteMap: Record<string, string> = {
      field_staff: '/staff',
      accountant:  '/accounts',
    }
    redirect(roleRouteMap[profile?.role ?? ''] ?? '/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#F4F2ED]">
      {/* Header */}
      <header className="bg-[#0D4A2C] px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-white font-semibold">LST Poultry Farm</p>
          <p className="text-green-300 text-xs">Owner Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:block text-green-200 text-sm">{profile?.full_name}</span>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="text-green-300 text-xs hover:text-white">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="px-4 md:px-8 py-6">{children}</main>
    </div>
  )
}
