import { useQueryClient } from "@tanstack/react-query";
import { AudioWaveform, LoaderCircle, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DubbingForm } from "@/features/dubbing/dubbing-form";
import { DubbingJobsTable } from "@/features/dubbing/dubbing-jobs-table";
import { authClient } from "@/lib/auth-client";

export function WorkspacePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await authClient.signOut();
      queryClient.clear();
      navigate("/auth", { replace: true });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-(--color-bg) text-(--color-text)">
      <header className="border-b border-(--color-border) bg-white/88 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-3 md:px-8">
          <Link className="flex items-center gap-3" to="/">
            <span className="flex size-8 items-center justify-center rounded-md border border-(--color-text) bg-(--color-accent) text-(--color-accent-text)">
              <AudioWaveform className="size-4" />
            </span>
            <span>
              <span className="block font-serif text-xl leading-none">
                DubStudio AI
              </span>
              <span className="mt-0.5 block font-mono text-[11px] text-(--color-muted)">
                workspace
              </span>
            </span>
          </Link>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm font-semibold text-(--color-text) transition hover:border-(--color-text) disabled:cursor-not-allowed disabled:opacity-60"
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
      </header>

      <div className="mx-auto flex max-w-4xl flex-col gap-5 px-5 py-6 md:px-8 md:py-8">
        <section>
          <DubbingForm />
        </section>

        <DubbingJobsTable />
      </div>
    </main>
  );
}
