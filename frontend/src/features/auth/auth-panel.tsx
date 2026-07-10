import {
  ArrowLeft,
  AudioWaveform,
  LoaderCircle,
  Lock,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import { type FormEvent, useReducer } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";

const authCopy = {
  "sign-in": {
    eyebrow: "Private studio",
    title: "Sign in to DubStudio.",
    action: "Sign in",
    alternate: "Create an account",
  },
  "sign-up": {
    eyebrow: "New studio",
    title: "Create your workspace.",
    action: "Create account",
    alternate: "Use an existing account",
  },
} as const;

type AuthState = {
  mode: AuthMode;
  name: string;
  email: string;
  password: string;
  error: string | null;
  isSubmitting: boolean;
};

const initialAuthState: AuthState = {
  mode: "sign-in",
  name: "",
  email: "",
  password: "",
  error: null,
  isSubmitting: false,
};

function authReducer(state: AuthState, update: Partial<AuthState>) {
  return { ...state, ...update };
}

export function AuthPanel() {
  const navigate = useNavigate();
  const [state, updateAuth] = useReducer(authReducer, initialAuthState);
  const { mode, name, email, password, error, isSubmitting } = state;
  const copy = authCopy[mode];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateAuth({ error: null, isSubmitting: true });

    try {
      const result =
        mode === "sign-in"
          ? await authClient.signIn.email({
              email,
              password,
              rememberMe: true,
            })
          : await authClient.signUp.email({
              name,
              email,
              password,
            });

      if (result.error) {
        updateAuth({
          error: result.error.message ?? "Unable to authenticate",
        });
        return;
      }

      navigate("/auth", { replace: true });
    } catch {
      updateAuth({
        error: "Unable to authenticate. Check your details and try again.",
      });
    } finally {
      updateAuth({ isSubmitting: false });
    }
  };

  const switchMode = () => {
    updateAuth({
      mode: mode === "sign-in" ? "sign-up" : "sign-in",
      error: null,
    });
  };

  return (
    <main className="min-h-screen bg-(--color-bg) text-(--color-text)">
      <section className="mx-auto grid min-h-screen max-w-7xl gap-8 px-5 py-6 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <div className="flex flex-col justify-between rounded-lg border border-(--color-border) bg-[linear-gradient(145deg,#f7faf2_0%,#dceccc_100%)] p-5 md:p-7">
          <div className="flex items-center justify-between gap-4">
            <Link className="flex items-center gap-3" to="/">
              <span className="flex size-9 items-center justify-center rounded-md border border-(--color-text) bg-(--color-accent) text-(--color-accent-text)">
                <AudioWaveform className="size-5" />
              </span>
              <span className="font-serif text-2xl leading-none">
                DubStudio AI
              </span>
            </Link>
          </div>

          <div className="my-16 max-w-2xl lg:my-0">
            <p className="font-mono text-xs font-semibold text-(--color-blue)">
              Account access
            </p>
            <h1 className="mt-4 font-serif text-6xl leading-none md:text-7xl">
              Keep each dubbing job tied to your studio.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-(--color-text-dim)">
              Uploads, processing status, and download links stay private to
              your signed-in workspace.
            </p>
          </div>

          <Link
            className="inline-flex w-fit items-center gap-2 rounded-md border border-(--color-border) bg-white px-3 py-2 text-sm font-semibold transition hover:border-(--color-text)"
            to="/"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </div>

        <form
          className="self-center rounded-lg border border-(--color-text) bg-(--color-surface) p-5 shadow-[8px_8px_0_rgba(21,23,19,0.12)] md:p-6"
          onSubmit={handleSubmit}
        >
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-semibold text-(--color-blue)">
                {copy.eyebrow}
              </p>
              <h2 className="mt-3 font-serif text-3xl text-(--color-text)">
                {copy.title}
              </h2>
            </div>
            <div className="flex size-10 items-center justify-center rounded-md border border-(--color-border) bg-(--color-panel) text-(--color-blue)">
              <UserPlus className="size-4" />
            </div>
          </div>

          <div className="space-y-4">
            {mode === "sign-up" && (
              <label className="block">
                <span className="mb-2 block font-mono text-xs font-semibold text-(--color-text-dim)">
                  Name
                </span>
                <span className="flex items-center gap-3 rounded-md border border-(--color-border) bg-(--color-bg) p-3 focus-within:border-(--color-blue)">
                  <User className="size-4 shrink-0 text-(--color-text-dim)" />
                  <input
                    aria-label="Name"
                    className="w-full bg-transparent text-sm text-(--color-text) outline-none placeholder:text-(--color-muted)"
                    value={name}
                    onChange={(event) => updateAuth({ name: event.target.value })}
                    placeholder="Your name"
                    required
                  />
                </span>
              </label>
            )}

            <label className="block">
              <span className="mb-2 block font-mono text-xs font-semibold text-(--color-text-dim)">
                Email
              </span>
              <span className="flex items-center gap-3 rounded-md border border-(--color-border) bg-(--color-bg) p-3 focus-within:border-(--color-blue)">
                <Mail className="size-4 shrink-0 text-(--color-text-dim)" />
                <input
                  aria-label="Email"
                  className="w-full bg-transparent text-sm text-(--color-text) outline-none placeholder:text-(--color-muted)"
                  type="email"
                  value={email}
                  onChange={(event) => updateAuth({ email: event.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block font-mono text-xs font-semibold text-(--color-text-dim)">
                Password
              </span>
              <span className="flex items-center gap-3 rounded-md border border-(--color-border) bg-(--color-bg) p-3 focus-within:border-(--color-blue)">
                <Lock className="size-4 shrink-0 text-(--color-text-dim)" />
                <input
                  aria-label="Password"
                  className="w-full bg-transparent text-sm text-(--color-text) outline-none placeholder:text-(--color-muted)"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    updateAuth({ password: event.target.value })
                  }
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </span>
            </label>
          </div>

          {error && <p className="mt-5 text-sm text-red-600">{error}</p>}

          {mode === "sign-up" ? (
            <p className="mt-5 text-sm text-(--color-text-dim)">
              New accounts can sign in immediately, but workspace access unlocks
              after admin approval.
            </p>
          ) : null}

          <button
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-md border border-(--color-text) bg-(--color-accent) px-4 py-3 text-sm font-semibold text-(--color-accent-text) transition hover:bg-(--color-accent-hover) disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
            {copy.action}
          </button>

          <button
            className="mt-4 w-full rounded-md px-3 py-2 text-center text-sm font-semibold text-(--color-text-dim) transition hover:bg-(--color-panel) hover:text-(--color-text)"
            onClick={switchMode}
            type="button"
          >
            {copy.alternate}
          </button>
        </form>
      </section>
    </main>
  );
}
