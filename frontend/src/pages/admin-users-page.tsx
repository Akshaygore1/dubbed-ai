import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AudioWaveform,
  CheckCircle2,
  LoaderCircle,
  LogOut,
  ShieldCheck,
  UserRoundPlus,
} from 'lucide-react'
import { useState } from 'react'
import { adminSessionQueryKey } from '@/features/admin/use-admin-session'
import { adminUsersQueryKey, useAdminUsers } from '@/features/admin/use-admin-users'
import { api } from '@/lib/api'

const tabs = ['pending', 'approved'] as const

const formatDate = (value: string | null) => {
  if (!value) {
    return 'Not approved'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('pending')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { data: users = [], isLoading } = useAdminUsers(activeTab)

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.post(`/admin/users/${userId}/approve`)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminUsersQueryKey('pending') }),
        queryClient.invalidateQueries({ queryKey: adminUsersQueryKey('approved') }),
      ])
    },
  })

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await api.post('/admin/logout')
      await queryClient.invalidateQueries({ queryKey: adminSessionQueryKey })
      navigateToAdminLogin()
    } finally {
      setIsLoggingOut(false)
    }
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
              Admin portal
            </p>
            <h1 className="mt-3 font-serif text-5xl leading-tight">
              Review account approvals.
            </h1>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-(--color-border) bg-white px-4 py-3 text-sm font-semibold transition hover:border-(--color-text) disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoggingOut}
            onClick={handleLogout}
            type="button"
          >
            {isLoggingOut ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            Log out
          </button>
        </header>

        <div className="mb-6 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? 'border-(--color-text) bg-(--color-text) text-(--color-bg)'
                  : 'border-(--color-border) bg-white text-(--color-text)'
              }`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab === 'pending' ? 'Pending' : 'Approved'}
            </button>
          ))}
        </div>

        <section className="overflow-x-auto rounded-lg border border-(--color-border) bg-white">
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
                          className="inline-flex items-center gap-2 rounded-md border border-emerald-700 bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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

function navigateToAdminLogin() {
  window.location.assign('/admin/login')
}
