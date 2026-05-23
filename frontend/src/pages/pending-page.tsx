import { useQueryClient } from '@tanstack/react-query'
import { AudioWaveform, Clock3, LoaderCircle, LogOut, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authClient } from '@/lib/auth-client'
import { useCurrentUser } from '@/features/auth/use-current-user'

export function PendingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { data: currentUser } = useCurrentUser({
    enabled: true,
    refetchInterval: 3000,
  })

  const handleSignOut = async () => {
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
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-between px-5 py-6 md:px-8 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link className="flex items-center gap-3" to="/">
            <span className="flex size-9 items-center justify-center rounded-md border border-(--color-text) bg-(--color-accent) text-(--color-accent-text)">
              <AudioWaveform className="size-5" />
            </span>
            <span className="font-serif text-2xl leading-none">DubStudio AI</span>
          </Link>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-(--color-border) bg-white px-4 py-2 text-sm font-semibold transition hover:border-(--color-text) disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSigningOut}
            onClick={handleSignOut}
            type="button"
          >
            {isSigningOut ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            Sign out
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div className="rounded-lg border border-(--color-text) bg-[linear-gradient(135deg,#fffdf4_0%,#f4f0dc_100%)] p-6 shadow-[10px_10px_0_rgba(21,23,19,0.12)] md:p-8">
            <p className="font-mono text-xs font-semibold text-(--color-blue)">
              Approval required
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-tight md:text-6xl">
              Your workspace is waiting for approval.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-(--color-text-dim)">
              {currentUser?.email
                ? `${currentUser.email} has signed in successfully, but uploads stay locked until an admin approves the account.`
                : 'You are signed in successfully, but uploads stay locked until an admin approves the account.'}
            </p>
            <div className="mt-8 flex items-center gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <LoaderCircle className="size-4 animate-spin" />
              This page checks your approval status automatically.
            </div>
          </div>

          <div className="grid gap-4">
            <article className="rounded-lg border border-(--color-border) bg-white p-5">
              <div className="mb-4 flex items-center gap-2 text-(--color-blue)">
                <ShieldCheck className="size-4" />
                <span className="font-mono text-xs font-semibold">status</span>
              </div>
              <p className="text-2xl font-semibold capitalize">
                {currentUser?.approvalStatus ?? 'pending'}
              </p>
              <p className="mt-2 text-sm leading-6 text-(--color-text-dim)">
                New accounts start as pending and unlock automatically after approval.
              </p>
            </article>

            <article className="rounded-lg border border-(--color-border) bg-white p-5">
              <div className="mb-4 flex items-center gap-2 text-(--color-blue)">
                <Clock3 className="size-4" />
                <span className="font-mono text-xs font-semibold">next step</span>
              </div>
              <p className="text-2xl font-semibold">Wait here</p>
              <p className="mt-2 text-sm leading-6 text-(--color-text-dim)">
                Once approved, this screen redirects you into `/workspace` without another sign-in.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  )
}
