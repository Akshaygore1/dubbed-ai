import { AudioWaveform, BarChart3, LoaderCircle, LogOut, UsersRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { useAdminLogoutMutation } from '@/features/admin/use-admin-session'

type AdminShellProps = {
  activePath: '/admin/users' | '/admin/analytics'
  eyebrow: string
  title: string
  children: ReactNode
}

const navItems = [
  {
    href: '/admin/users',
    label: 'Users',
    icon: UsersRound,
  },
  {
    href: '/admin/analytics',
    label: 'AI analytics',
    icon: BarChart3,
  },
] as const

export function AdminShell({ activePath, eyebrow, title, children }: AdminShellProps) {
  const logoutMutation = useAdminLogoutMutation()

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    window.location.assign('/admin/login')
  }

  return (
    <main className="min-h-screen bg-(--color-bg) text-(--color-text)">
      <section className="mx-auto max-w-7xl px-5 py-6 md:px-8 lg:px-10">
        <header className="mb-8 flex flex-col gap-4 rounded-lg border border-(--color-border) bg-[linear-gradient(135deg,#ffffff_0%,#eef6e6_100%)] p-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-md border border-(--color-text) bg-(--color-accent) text-(--color-accent-text)">
                <AudioWaveform className="size-5" />
              </span>
              <span className="font-serif text-2xl leading-none">DubStudio AI</span>
            </div>
            <p className="mt-6 font-mono text-xs font-semibold text-(--color-blue)">
              {eyebrow}
            </p>
            <h1 className="mt-3 font-serif text-5xl leading-tight">{title}</h1>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-(--color-border) bg-white px-4 py-3 text-sm font-semibold transition hover:border-(--color-text) disabled:cursor-not-allowed disabled:opacity-60"
            disabled={logoutMutation.isPending}
            onClick={handleLogout}
            type="button"
          >
            {logoutMutation.isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            Log out
          </button>
        </header>

        <nav className="mb-6 flex flex-wrap gap-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === activePath

            return (
              <button
                className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'border-(--color-text) bg-(--color-text) text-(--color-bg)'
                    : 'border-(--color-border) bg-white text-(--color-text)'
                }`}
                key={item.href}
                onClick={() => window.location.assign(item.href)}
                type="button"
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {children}
      </section>
    </main>
  )
}
