import { useQueryClient } from "@tanstack/react-query";
import {
  AudioWaveform,
  Clock3,
  LoaderCircle,
  LogOut,
  UploadCloud,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DubbingForm } from "@/features/dubbing/dubbing-form";
import { DubbingJobsTable } from "@/features/dubbing/dubbing-jobs-table";
import { useDubbingJobs } from "@/features/dubbing/use-dubbing-jobs";
import { authClient } from "@/lib/auth-client";

export function WorkspacePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { data: jobs, isLoading: isLoadingJobs } = useDubbingJobs();
  const hasJobs = Boolean(jobs?.length);

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
      <header className="border-b border-(--color-border) bg-white/82 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8 lg:px-10">
          <Link className="flex items-center gap-3" to="/">
            <span className="flex size-9 items-center justify-center rounded-md border border-(--color-text) bg-(--color-accent) text-(--color-accent-text)">
              <AudioWaveform className="size-5" />
            </span>
            <span>
              <span className="block font-serif text-2xl leading-none">
                DubStudio AI
              </span>
              <span className="mt-1 block font-mono text-xs text-(--color-muted)">
                workspace
              </span>
            </span>
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm font-semibold text-(--color-text) transition hover:border-(--color-text) disabled:cursor-not-allowed disabled:opacity-60"
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
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 lg:px-10">
        <section className="mb-8 grid gap-5 border-b border-(--color-border) pb-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="font-mono text-xs font-semibold text-(--color-blue)">
              Dubbing workspace
            </p>
            <h1 className="mt-3 font-serif text-5xl leading-tight md:text-6xl">
              {hasJobs ? "Queue and uploads" : "Create your first dubbing job"}
            </h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-4">
              <div className="mb-4 flex items-center gap-2 text-(--color-blue)">
                <UploadCloud className="size-4" />
                <span className="font-mono text-xs font-semibold">jobs</span>
              </div>
              <p className="text-3xl font-semibold">{jobs?.length ?? 0}</p>
              <p className="mt-1 text-sm text-(--color-text-dim)">
                Total videos in this workspace
              </p>
            </div>
            <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-4">
              <div className="mb-4 flex items-center gap-2 text-(--color-blue)">
                <Clock3 className="size-4" />
                <span className="font-mono text-xs font-semibold">refresh</span>
              </div>
              <p className="text-3xl font-semibold">live</p>
              <p className="mt-1 text-sm text-(--color-text-dim)">
                Active jobs poll while processing
              </p>
            </div>
          </div>
        </section>

        <section className={hasJobs ? "mb-10 max-w-3xl" : "mx-auto max-w-5xl"}>
          <DubbingForm isEmptyState={!hasJobs} />
        </section>

        {hasJobs ? (
          <section className="mt-10">
            <DubbingJobsTable />
          </section>
        ) : isLoadingJobs ? (
          <div className="mt-10 flex items-center justify-center gap-3 font-mono text-xs text-(--color-text-dim)">
            <LoaderCircle className="size-4 animate-spin text-(--color-blue)" />
            Checking queue
          </div>
        ) : null}
      </div>
    </main>
  );
}
