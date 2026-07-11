import { useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DubbingForm } from "@/features/dubbing/dubbing-form";
import { DubbingJobsTable } from "@/features/dubbing/dubbing-jobs-table";
import { authClient } from "@/lib/auth-client";
import { Brand } from "./landing-page";

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
      <header className="border-b border-(--color-border) bg-(--color-surface)">
        <div className="mx-auto flex h-14 max-w-[960px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3"><Brand /><span className="border-l border-(--color-border) pl-3 text-xs text-(--color-text-dim)">Creator workspace</span></div>

          <button
            className="inline-flex min-h-11 items-center gap-1.5 px-1 text-xs font-medium text-(--color-text-dim) transition hover:text-(--color-text) disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSigningOut}
            onClick={handleSignOut}
            type="button"
          >
            {isSigningOut ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-3.5" />
            )}
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[960px] flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
        <section className="border-b border-(--color-border) pb-8">
          <div>
            <p className="text-sm font-medium text-(--color-text-dim)">Localization studio</p>
            <h1 className="mt-2 font-serif text-4xl leading-none tracking-[-0.03em] sm:text-5xl">Prepare the next version.</h1>
            <p className="mt-4 max-w-xl leading-7 text-(--color-text-dim)">Upload a finished video, choose its audience, and follow the processing status below.</p>
          </div>
        </section>

        <section>
          <DubbingForm />
        </section>

        <DubbingJobsTable />
      </div>
    </main>
  );
}
