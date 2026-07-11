import { useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  LoaderCircle,
  LogOut,
  ShieldCheck,
  UserRoundPlus,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminUsers, useApproveAdminUserMutation } from '@/features/admin/use-admin-users'
import { authClient } from '@/lib/auth-client'
import { Brand } from './landing-page'

const tabs = ['pending', 'approved'] as const

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const formatDate = (value: string | null) => {
  if (!value) {
    return 'Not approved'
  }

  return dateFormatter.format(new Date(value))
}

export function AdminUsersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('pending')
  const { data: users = [], isLoading } = useAdminUsers(activeTab)
  const approveMutation = useApproveAdminUserMutation()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleLogout = async () => {
    setIsSigningOut(true)

    try {
      await authClient.signOut()
      queryClient.clear()
      navigate('/auth', { replace: true })
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <main className="min-h-screen bg-(--color-bg) text-(--color-text)">
      <section className="mx-auto max-w-7xl px-5 py-6 md:px-8 lg:px-10">
        <header className="mb-10 flex flex-col gap-7 border-b border-(--color-border) pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <Brand />
            <p className="mt-10 text-sm font-medium text-(--color-text-dim)">Workspace access</p>
            <h1 className="mt-3 font-serif text-5xl leading-[0.98] tracking-[-0.035em]">
              Account approvals.
            </h1>
            <p className="mt-4 max-w-xl leading-7 text-(--color-text-dim)">Review new creators and educators before their upload workspace becomes available.</p>
          </div>

          <button
            className="ui-button ui-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSigningOut}
            onClick={handleLogout}
            type="button"
          >
            {isSigningOut ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            Log out
          </button>
        </header>

        <div className="mb-6 flex gap-6 border-b border-(--color-border)">
          {tabs.map((tab) => (
            <button
              className={`border-b-2 px-0 py-3 text-sm font-semibold transition ${
                activeTab === tab
                  ? 'border-(--color-blue) text-(--color-blue)'
                  : 'border-transparent text-(--color-text-dim) hover:text-(--color-text)'
              }`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab === 'pending' ? 'Pending' : 'Approved'}
            </button>
          ))}
        </div>

        <section className="overflow-x-auto border-t border-(--color-text) bg-(--color-surface)">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-[1.1fr_1.2fr_1fr_0.9fr_1fr_auto] gap-4 border-b border-(--color-border) px-5 py-4 font-mono text-xs font-semibold uppercase tracking-wide text-(--color-text-dim)">
              <span>Name</span>
              <span>Email</span>
              <span>Signup date</span>
              <span>Status</span>
              <span>Approval date</span>
              <span>Action</span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center gap-3 px-5 py-10 text-sm text-(--color-text-dim)">
                <LoaderCircle className="size-4 animate-spin text-(--color-blue)" />
                Loading users
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-5 py-14 text-center">
                <ShieldCheck className="size-10 text-(--color-blue)" />
                <div>
                  <p className="text-lg font-semibold">No {activeTab} users</p>
                  <p className="mt-2 text-sm text-(--color-text-dim)">
                    This list only shows the current approval bucket.
                  </p>
                </div>
              </div>
            ) : (
              users.map((user) => {
                const isApproving =
                  approveMutation.isPending && approveMutation.variables === user.id

                return (
                  <div
                    className="grid grid-cols-[1.1fr_1.2fr_1fr_0.9fr_1fr_auto] gap-4 border-b border-(--color-border) px-5 py-4 last:border-b-0"
                    key={user.id}
                  >
                    <span className="font-semibold">{user.name}</span>
                    <span className="truncate text-sm text-(--color-text-dim)">{user.email}</span>
                    <span className="text-sm text-(--color-text-dim)">
                      {formatDate(user.createdAt)}
                    </span>
                    <span className="text-sm capitalize">{user.approvalStatus}</span>
                    <span className="text-sm text-(--color-text-dim)">
                      {formatDate(user.approvedAt)}
                    </span>
                    <span className="flex justify-end">
                      {user.approvalStatus === 'pending' ? (
                        <button
                          className="ui-button ui-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isApproving}
                          onClick={() => approveMutation.mutate(user.id)}
                          type="button"
                        >
                          {isApproving ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <UserRoundPlus className="size-4" />
                          )}
                          Approve
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                          <CheckCircle2 className="size-4" />
                          Approved
                        </span>
                      )}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </section>
    </main>
  )
}
