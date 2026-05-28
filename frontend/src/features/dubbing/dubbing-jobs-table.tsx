import { AlertCircle, Download, LoaderCircle } from "lucide-react";
import { type MouseEvent, useMemo, useState } from "react";
import { useSnackbar } from "@/app/providers/snackbar-context";
import { getDubbingLanguageName } from "./dubbing-languages";
import { getDubbingJobDownloadUrl, useDubbingJobs } from "./use-dubbing-jobs";

const RECENT_JOB_LIMIT = 6;

const updatedTimeFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const statusClasses = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  processing: "border-blue-200 bg-blue-50 text-blue-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-red-200 bg-red-50 text-red-700",
} as const;

const shortJobId = (id: string) => id.slice(0, 8);

const formatUpdatedTime = (value: string) =>
  updatedTimeFormatter.format(new Date(value));

export function DubbingJobsTable() {
  const { data: jobs, isLoading, isError, error } = useDubbingJobs();
  const { showSnackbar } = useSnackbar();
  const [showAll, setShowAll] = useState(false);

  const sortedJobs = useMemo(
    () =>
      (jobs ?? []).toSorted(
        (first, second) =>
          new Date(second.updatedAt).getTime() -
          new Date(first.updatedAt).getTime(),
      ),
    [jobs],
  );
  const hasActiveJobs = sortedJobs.some(
    (job) => job.status === "pending" || job.status === "processing",
  );
  const visibleJobs = showAll
    ? sortedJobs
    : sortedJobs.slice(0, RECENT_JOB_LIMIT);
  const canToggleJobs = sortedJobs.length > RECENT_JOB_LIMIT;

  const handleDownload = async (
    event: MouseEvent<HTMLAnchorElement>,
    jobId: string,
  ) => {
    event.preventDefault();

    try {
      const downloadUrl = getDubbingJobDownloadUrl(jobId);
      const response = await fetch(downloadUrl, {
        credentials: "include",
        redirect: "manual",
      });

      if (!response.ok && response.type !== "opaqueredirect") {
        throw new Error("Download is not available yet");
      }

      window.location.assign(downloadUrl);
      showSnackbar({
        message: "Download started for the processed video.",
        variant: "success",
      });
    } catch {
      showSnackbar({
        message:
          "Unable to download this video. Try again after processing completes.",
        variant: "error",
      });
    }
  };

  return (
    <section className="rounded-lg border border-(--color-border) bg-(--color-surface) shadow-[0_16px_42px_rgba(21,23,19,0.07)]">
      <div className="flex flex-col gap-3 border-b border-(--color-border) px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div>
          <p className="font-mono text-xs font-semibold text-(--color-blue)">
            Recent jobs
          </p>
          <h2 className="mt-1 font-serif text-2xl leading-tight text-(--color-text)">
            Status and downloads
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {hasActiveJobs ? (
            <span className="inline-flex items-center gap-2 font-mono text-xs text-(--color-text-dim)">
              <LoaderCircle className="size-3.5 animate-spin text-(--color-blue)" />
              Live refresh
            </span>
          ) : null}

          {canToggleJobs ? (
            <button
              type="button"
              className="rounded-md border border-(--color-border) bg-white px-3 py-2 text-sm font-semibold text-(--color-text) transition hover:border-(--color-text)"
              onClick={() => setShowAll((value) => !value)}
            >
              {showAll ? "Show less" : `Show all ${sortedJobs.length}`}
            </button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 px-4 py-10 text-sm text-(--color-text-dim)">
          <LoaderCircle className="size-4 animate-spin text-(--color-blue)" />
          Loading jobs
        </div>
      ) : isError ? (
        <div className="flex items-center gap-3 px-4 py-10 text-sm text-red-700 md:px-5">
          <AlertCircle className="size-4 shrink-0" />
          {error instanceof Error ? error.message : "Unable to load dubbing jobs"}
        </div>
      ) : sortedJobs.length === 0 ? (
        <div className="px-4 py-10 text-sm leading-6 text-(--color-text-dim) md:px-5">
          No dubbing jobs yet. New uploads will appear here as soon as they
          start processing.
        </div>
      ) : (
        <div className="divide-y divide-(--color-border)">
          {visibleJobs.map((job) => {
            const isActive =
              job.status === "pending" || job.status === "processing";
            const canDownload =
              job.status === "completed" && Boolean(job.dubbedVideoKey);

            return (
              <div
                key={job.id}
                className="grid gap-3 px-4 py-4 transition hover:bg-(--color-bg) sm:grid-cols-[1fr_auto] sm:items-center md:px-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-(--color-muted)">
                      #{shortJobId(job.id)}
                    </span>
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${statusClasses[job.status]}`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                    <p className="font-semibold text-(--color-text)">
                      {getDubbingLanguageName(job.targetLanguage)}
                    </p>
                    <p className="font-mono text-xs text-(--color-text-dim)">
                      Updated {formatUpdatedTime(job.updatedAt)}
                    </p>
                  </div>

                  {job.status === "failed" && job.errorMessage ? (
                    <p className="mt-2 text-sm leading-6 text-red-700">
                      {job.errorMessage}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center justify-start sm:justify-end">
                  {canDownload ? (
                    <a
                      className="inline-flex items-center gap-2 rounded-md border border-(--color-text) bg-white px-3 py-2 text-sm font-semibold text-(--color-text) transition hover:bg-(--color-accent)"
                      href={getDubbingJobDownloadUrl(job.id)}
                      onClick={(event) => void handleDownload(event, job.id)}
                    >
                      <Download className="size-4" />
                      Download
                    </a>
                  ) : isActive ? (
                    <span className="inline-flex items-center gap-2 font-mono text-xs text-(--color-text-dim)">
                      <LoaderCircle className="size-3.5 animate-spin text-(--color-blue)" />
                      Processing
                    </span>
                  ) : job.status === "failed" ? (
                    <span className="font-mono text-xs font-semibold text-red-700">
                      Failed
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-(--color-muted)">
                      Preparing
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
