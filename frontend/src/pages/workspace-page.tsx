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
      <header className="border-b border-(--color-border) bg-(--color-bg)">
        <div className="mx-auto flex h-14 max-w-[960px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3"><Brand /><span className="border-l border-(--color-border) pl-3 text-xs text-(--color-text-dim)">Workspace</span></div>

          <button
            className="inline-flex h-8 items-center gap-1.5 px-1 text-xs font-medium text-(--color-text-dim) transition hover:text-(--color-text) disabled:cursor-not-allowed disabled:opacity-60"
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

      <div className="mx-auto flex max-w-[960px] flex-col gap-10 px-4 py-7 sm:px-6 sm:py-9">
        <section>
          <DubbingForm />
        </section>

        <DubbingJobsTable />
      </div>
    </main>
  );
}
