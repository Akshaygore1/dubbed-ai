import { Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="min-h-screen text-[var(--color-text)]">
      <Outlet />
    </div>
  )
}
