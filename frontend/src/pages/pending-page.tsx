import { useQueryClient } from '@tanstack/react-query'
import { Clock3, LoaderCircle, LogOut, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient } from '@/lib/auth-client'
import { useCurrentUser } from '@/features/auth/use-current-user'
import { Brand } from './landing-page'

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
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col justify-between px-5 py-5 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <Brand />
          <button
            className="ui-button ui-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
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

        <div className="my-auto grid gap-8 py-14 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <div>
            <p className="ui-eyebrow">
              Approval required
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-[0.98] tracking-[-0.035em] md:text-6xl">
              Your workspace is waiting for approval.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-(--color-text-dim)">
              {currentUser?.email
                ? `${currentUser.email} has signed in successfully, but uploads stay locked until an admin approves the account.`
                : 'You are signed in successfully, but uploads stay locked until an admin approves the account.'}
            </p>
            <div className="mt-8 flex items-center gap-3 border-t border-(--color-border) pt-5 text-sm text-(--color-text-dim)">
              <LoaderCircle className="size-4 animate-spin" />
              This page checks your approval status automatically.
            </div>
          </div>

          <div className="grid gap-4">
            <article className="ui-panel p-5">
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

            <article className="ui-panel p-5">
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
