import { useQueryClient } from '@tanstack/react-query'
import { AudioWaveform, KeyRound, LoaderCircle, Mail, Shield } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminSessionQueryKey } from '@/features/admin/use-admin-session'
import { api } from '@/lib/api'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await api.post('/admin/login', {
        email,
        password,
      })
      await queryClient.invalidateQueries({ queryKey: adminSessionQueryKey })
      navigate('/admin/users', { replace: true })
    } catch {
      setError('Invalid admin credentials')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-(--color-bg) px-5 py-6 text-(--color-text) md:px-8 lg:px-10">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-between rounded-lg border border-(--color-border) bg-[linear-gradient(145deg,#f7faf2_0%,#dceccc_100%)] p-6 md:p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md border border-(--color-text) bg-(--color-accent) text-(--color-accent-text)">
              <AudioWaveform className="size-5" />
            </span>
            <div>
              <p className="font-serif text-2xl leading-none">DubStudio AI</p>
              <p className="mt-1 font-mono text-xs text-(--color-text-dim)">admin access</p>
            </div>
          </div>

          <div>
            <p className="font-mono text-xs font-semibold text-(--color-blue)">
              Internal approval portal
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-tight md:text-6xl">
              Review new accounts and unlock workspaces.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-(--color-text-dim)">
              This login is separate from normal user auth and only grants access to the approval list.
            </p>
          </div>

          <Link
            className="inline-flex w-fit items-center gap-2 rounded-md border border-(--color-border) bg-white px-4 py-2 text-sm font-semibold transition hover:border-(--color-text)"
            to="/"
          >
            Back to site
          </Link>
        </div>

        <form
          className="self-center rounded-lg border border-(--color-text) bg-white p-6 shadow-[10px_10px_0_rgba(21,23,19,0.12)] md:p-7"
          onSubmit={handleSubmit}
        >
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-semibold text-(--color-blue)">
                Admin portal
              </p>
              <h2 className="mt-3 font-serif text-3xl">Sign in</h2>
            </div>
            <span className="flex size-10 items-center justify-center rounded-md border border-(--color-border) bg-(--color-panel) text-(--color-blue)">
              <Shield className="size-4" />
            </span>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block font-mono text-xs font-semibold text-(--color-text-dim)">
                Admin email
              </span>
              <span className="flex items-center gap-3 rounded-md border border-(--color-border) bg-(--color-bg) p-3">
                <Mail className="size-4 shrink-0 text-(--color-text-dim)" />
                <input
                  aria-label="Admin email"
                  className="w-full bg-transparent text-sm outline-none"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block font-mono text-xs font-semibold text-(--color-text-dim)">
                Password
              </span>
              <span className="flex items-center gap-3 rounded-md border border-(--color-border) bg-(--color-bg) p-3">
                <KeyRound className="size-4 shrink-0 text-(--color-text-dim)" />
                <input
                  aria-label="Password"
                  className="w-full bg-transparent text-sm outline-none"
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </span>
            </label>
          </div>

          {error ? <p className="mt-5 text-sm text-red-600">{error}</p> : null}

          <button
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md border border-(--color-text) bg-(--color-text) px-4 py-3 text-sm font-semibold text-(--color-bg) transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
            Open admin portal
          </button>
        </form>
      </section>
    </main>
  )
}
