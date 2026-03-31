import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AccountsLayout({
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

  if (profile?.role !== 'accountant') {
    const roleRouteMap: Record<string, string> = {
      field_staff: '/staff',
      owner:       '/dashboard',
    }
    redirect(roleRouteMap[profile?.role ?? ''] ?? '/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#F4F2ED] flex">
      {/* Sidebar — hidden on mobile */}
      <aside className="hidden md:flex flex-col w-56 bg-[#0D4A2C] min-h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-green-800">
          <p className="text-white font-semibold text-sm">LST Poultry Farm</p>
          <p className="text-green-300 text-xs mt-0.5">{profile?.full_name ?? 'Accountant'}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { href: '/accounts/expenses', label: 'Expenses' },
            { href: '/accounts/sales',    label: 'Sales' },
            { href: '/accounts/reports',  label: 'Reports' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2.5 rounded-[8px] text-sm text-green-100 hover:bg-[#1D9E75] hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <form action="/api/auth/signout" method="POST" className="p-4 border-t border-green-800">
          <button type="submit" className="text-green-400 text-xs hover:text-white">
            Sign out
          </button>
        </form>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="md:hidden bg-[#0D4A2C] px-4 py-3 flex items-center justify-between">
          <p className="text-white font-semibold text-sm">Accounts</p>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="text-green-300 text-xs">Sign out</button>
          </form>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
