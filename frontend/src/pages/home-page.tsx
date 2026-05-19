import { useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, LogOut } from 'lucide-react'
import { useState } from 'react'
import { AuthPanel } from '@/features/auth/auth-panel'
import { DubbingForm } from '@/features/dubbing/dubbing-form'
import { DubbingJobsTable } from '@/features/dubbing/dubbing-jobs-table'
import { useDubbingJobs } from '@/features/dubbing/use-dubbing-jobs'
import { authClient } from '@/lib/auth-client'

export function HomePage() {
  const session = authClient.useSession()

  if (session.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-[var(--color-text-dim)]">
        <LoaderCircle className="mr-3 size-4 animate-spin text-[var(--color-accent)]" />
        Loading workspace
      </main>
    )
  }

  if (!session.data) {
    return <AuthPanel />
  }

  return <AuthenticatedHome userName={session.data.user.name || session.data.user.email} />
}

function AuthenticatedHome({ userName }: { userName: string }) {
  const queryClient = useQueryClient()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { data: jobs, isLoading: isLoadingJobs } = useDubbingJobs()
  const hasJobs = Boolean(jobs?.length)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await authClient.signOut()
    queryClient.clear()
    setIsSigningOut(false)
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-8 md:px-8 lg:px-12">
      <header className="mb-10 flex flex-col gap-4 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-accent)]">
            Signed in
          </p>
          <p className="mt-2 text-sm text-[var(--color-text-dim)]">
            {userName}
          </p>
        </div>
        <button
          className="flex w-fit items-center gap-2 border border-[var(--color-border)] bg-black/20 px-4 py-2 text-xs uppercase tracking-wider text-[var(--color-text-dim)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60"
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
      </header>

      <section className="mx-auto flex w-full max-w-3xl justify-center py-4 lg:py-10">
        <DubbingForm isEmptyState={!hasJobs} />
      </section>

      {hasJobs ? (
        <section className="mt-14">
          <DubbingJobsTable />
        </section>
      ) : isLoadingJobs ? (
        <div className="mt-10 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.22em] text-[var(--color-text-dim)]">
          <LoaderCircle className="size-4 animate-spin text-[var(--color-accent)]" />
          Checking queue
        </div>
      ) : null}
    </main>
  )
}
