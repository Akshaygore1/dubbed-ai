import { LoaderCircle, Lock, Mail, User, UserPlus } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { authClient } from '@/lib/auth-client'

type AuthMode = 'sign-in' | 'sign-up'

const authCopy = {
  'sign-in': {
    eyebrow: 'Private workspace',
    title: 'Sign in to continue.',
    action: 'Sign in',
    alternate: 'Create an account',
  },
  'sign-up': {
    eyebrow: 'New account',
    title: 'Create your workspace.',
    action: 'Create account',
    alternate: 'Use an existing account',
  },
} as const

export function AuthPanel() {
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const copy = authCopy[mode]

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const result =
      mode === 'sign-in'
        ? await authClient.signIn.email({
            email,
            password,
            rememberMe: true,
          })
        : await authClient.signUp.email({
            name,
            email,
            password,
          })

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error.message ?? 'Unable to authenticate')
    }
  }

  const switchMode = () => {
    setMode((value) => (value === 'sign-in' ? 'sign-up' : 'sign-in'))
    setError(null)
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12 lg:px-12">
      <section className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="max-w-2xl space-y-7">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-accent)]">
            Auto Dubbing AI
          </p>
          <h1 className="font-serif text-5xl font-normal leading-[1.08] text-[var(--color-text)] sm:text-6xl">
            Your dubbing jobs stay tied to your account.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-[var(--color-text-dim)]">
            Sign in before uploading so every generated video, transcript, and status update stays private to you.
          </p>
        </div>

        <form
          className="border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-6"
          onSubmit={handleSubmit}
        >
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]">
                {copy.eyebrow}
              </p>
              <h2 className="mt-3 font-serif text-3xl text-[var(--color-text)]">
                {copy.title}
              </h2>
            </div>
            <div className="flex size-10 items-center justify-center border border-[var(--color-border)] text-[var(--color-accent)]">
              <UserPlus className="size-4" />
            </div>
          </div>

          <div className="space-y-4">
            {mode === 'sign-up' && (
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-wider text-[var(--color-text-dim)]">
                  Name
                </span>
                <span className="flex items-center gap-3 border-b border-[var(--color-border)] py-3 focus-within:border-[var(--color-accent)]">
                  <User className="size-4 shrink-0 text-[var(--color-text-dim)]" />
                  <input
                    className="w-full bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-dim)]"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    required
                  />
                </span>
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-wider text-[var(--color-text-dim)]">
                Email
              </span>
              <span className="flex items-center gap-3 border-b border-[var(--color-border)] py-3 focus-within:border-[var(--color-accent)]">
                <Mail className="size-4 shrink-0 text-[var(--color-text-dim)]" />
                <input
                  className="w-full bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-dim)]"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-wider text-[var(--color-text-dim)]">
                Password
              </span>
              <span className="flex items-center gap-3 border-b border-[var(--color-border)] py-3 focus-within:border-[var(--color-accent)]">
                <Lock className="size-4 shrink-0 text-[var(--color-text-dim)]" />
                <input
                  className="w-full bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-dim)]"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </span>
            </label>
          </div>

          {error && <p className="mt-5 text-xs text-red-400">{error}</p>}

          <button
            className="mt-8 flex w-full items-center justify-center gap-2 border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-3 text-sm font-medium uppercase tracking-wider text-black transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
            {copy.action}
          </button>

          <button
            className="mt-4 w-full text-center text-xs uppercase tracking-wider text-[var(--color-text-dim)] transition hover:text-[var(--color-text)]"
            onClick={switchMode}
            type="button"
          >
            {copy.alternate}
          </button>
        </form>
      </section>
    </main>
  )
}
