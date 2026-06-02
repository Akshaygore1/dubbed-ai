import { LoaderCircle } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useAdminSession } from '@/features/admin/use-admin-session'
import { useCurrentUser } from '@/features/auth/use-current-user'
import { authClient } from '@/lib/auth-client'
import { AdminAnalyticsPage } from '@/pages/admin-analytics-page'
import { AdminLoginPage } from '@/pages/admin-login-page'
import { AdminUsersPage } from '@/pages/admin-users-page'
import { AuthPage } from '@/pages/auth-page'
import { PendingPage } from '@/pages/pending-page'
import { WorkspacePage } from '@/pages/workspace-page'

export function AuthRoute() {
  const session = authClient.useSession()
  const currentUser = useCurrentUser({
    enabled: Boolean(session.data),
    refetchInterval: false,
  })

  if (session.isPending) {
    return <RouteLoader label="Opening sign in" />
  }

  if (!session.data) {
    return <AuthPage />
  }

  if (currentUser.isLoading) {
    return <RouteLoader label="Checking account status" />
  }

  if (currentUser.isError || !currentUser.data) {
    return <Navigate to="/auth" replace />
  }

  if (currentUser.data.approvalStatus === 'approved') {
    return <Navigate to="/workspace" replace />
  }

  return <Navigate to="/pending" replace />
}

export function WorkspaceRoute() {
  const session = authClient.useSession()
  const currentUser = useCurrentUser({
    enabled: Boolean(session.data),
    refetchInterval: false,
  })

  if (session.isPending) {
    return <RouteLoader label="Loading workspace" />
  }

  if (!session.data) {
    return <Navigate to="/auth" replace />
  }

  if (currentUser.isLoading) {
    return <RouteLoader label="Loading workspace" />
  }

  if (currentUser.isError || !currentUser.data) {
    return <Navigate to="/auth" replace />
  }

  if (currentUser.data.approvalStatus !== 'approved') {
    return <Navigate to="/pending" replace />
  }

  return <WorkspacePage />
}

export function PendingRoute() {
  const session = authClient.useSession()
  const currentUser = useCurrentUser({
    enabled: Boolean(session.data),
    refetchInterval: 3000,
  })

  if (session.isPending || currentUser.isLoading) {
    return <RouteLoader label="Checking approval" />
  }

  if (!session.data) {
    return <Navigate to="/auth" replace />
  }

  if (currentUser.isError || !currentUser.data) {
    return <Navigate to="/auth" replace />
  }

  if (currentUser.data.approvalStatus === 'approved') {
    return <Navigate to="/workspace" replace />
  }

  return <PendingPage />
}

export function AdminLoginRoute() {
  const adminSession = useAdminSession()

  if (adminSession.isLoading) {
    return <RouteLoader label="Opening admin portal" />
  }

  if (adminSession.data) {
    return <Navigate to="/admin/analytics" replace />
  }

  return <AdminLoginPage />
}

export function AdminUsersRoute() {
  const adminSession = useAdminSession()

  if (adminSession.isLoading) {
    return <RouteLoader label="Loading admin portal" />
  }

  if (adminSession.isError || !adminSession.data) {
    return <Navigate to="/admin/login" replace />
  }

  return <AdminUsersPage />
}

export function AdminAnalyticsRoute() {
  const adminSession = useAdminSession()

  if (adminSession.isLoading) {
    return <RouteLoader label="Loading admin analytics" />
  }

  if (adminSession.isError || !adminSession.data) {
    return <Navigate to="/admin/login" replace />
  }

  return <AdminAnalyticsPage />
}

function RouteLoader({ label }: { label: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-(--color-text-dim)">
      <LoaderCircle className="mr-3 size-4 animate-spin text-(--color-blue)" />
      {label}
    </main>
  )
}
