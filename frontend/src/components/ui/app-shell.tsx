import { Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Outlet />
    </div>
  )
}