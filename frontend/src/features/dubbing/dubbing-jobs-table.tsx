import { AlertCircle, Download, LoaderCircle, Trash2 } from "lucide-react";
import { type MouseEvent, useMemo, useState } from "react";
import { useSnackbar } from "@/app/providers/snackbar-context";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDubbingLanguageName } from "./dubbing-languages";
import {
  type DubbingJob,
  getDubbingJobDownloadUrl,
  useDeleteDubbingJobMutation,
  useDubbingJobs,
} from "./use-dubbing-jobs";

const RECENT_JOB_LIMIT = 6;

const updatedTimeFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const statusClasses = {
  pending: "ui-status ui-status-pending",
  processing: "ui-status ui-status-active",
  completed: "ui-status ui-status-complete",
  failed: "ui-status ui-status-failed",
} as const;

const shortJobId = (id: string) => id.slice(0, 8);

const formatUpdatedTime = (value: string) =>
  updatedTimeFormatter.format(new Date(value));

export function DubbingJobsTable() {
  const { data: jobs, isLoading, isError, error } = useDubbingJobs();
  const deleteMutation = useDeleteDubbingJobMutation();
  const { showSnackbar } = useSnackbar();
  const [showAll, setShowAll] = useState(false);
  const [jobPendingDelete, setJobPendingDelete] = useState<DubbingJob | null>(
    null,
  );

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

  const handleDelete = async () => {
    if (!jobPendingDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(jobPendingDelete.id);
      setJobPendingDelete(null);
      showSnackbar({
        message: "Video deleted.",
        variant: "success",
      });
    } catch {
      showSnackbar({
        message: "Unable to delete this video. Try again in a moment.",
        variant: "error",
      });
    }
  };

  return (
    <section className="border-t border-(--color-border)">
      <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-(--color-text)">Recent jobs</h2>
          <p className="mt-0.5 text-xs text-(--color-text-dim)">Processing status and finished videos</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {hasActiveJobs ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-(--color-text-dim)">
              <LoaderCircle className="size-3.5 animate-spin text-(--color-blue)" />
              Live refresh
            </span>
          ) : null}

          {canToggleJobs ? (
            <button
              type="button"
              className="inline-flex h-8 items-center px-2 text-xs font-medium text-(--color-text-dim) transition hover:text-(--color-text)"
              onClick={() => setShowAll((value) => !value)}
            >
              {showAll ? "Show less" : `Show all ${sortedJobs.length}`}
            </button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 border-t border-(--color-border) py-7 text-xs text-(--color-text-dim)">
          <LoaderCircle className="size-4 animate-spin text-(--color-blue)" />
          Loading jobs
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 border-t border-(--color-border) py-7 text-xs text-red-700">
          <AlertCircle className="size-4 shrink-0" />
          {error instanceof Error ? error.message : "Unable to load dubbing jobs"}
        </div>
      ) : sortedJobs.length === 0 ? (
        <div className="border-t border-(--color-border) py-7 text-xs leading-5 text-(--color-text-dim)">
          No jobs yet. Submitted videos will appear here.
        </div>
      ) : (
        <div className="border-t border-(--color-border)">
          {visibleJobs.map((job) => {
            const isActive =
              job.status === "pending" || job.status === "processing";
            const canDownload =
              job.status === "completed" && Boolean(job.dubbedVideoKey);
            const isDeleting =
              deleteMutation.isPending && deleteMutation.variables === job.id;

            return (
              <div
                key={job.id}
                className="grid gap-3 border-b border-(--color-border) py-3 transition sm:min-h-16 sm:grid-cols-[auto_1fr_auto] sm:items-center"
              >
                <span className={`hidden size-2 rounded-full sm:block ${isActive ? "bg-(--color-accent)" : job.status === "completed" ? "bg-[#4b705d]" : job.status === "failed" ? "bg-[#a64139]" : "bg-[#8b6c35]"}`} aria-hidden="true" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-(--color-muted)">
                      #{shortJobId(job.id)}
                    </span>
                    <span className={statusClasses[job.status]}>
                      {job.status}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                    <p className="text-sm font-medium text-(--color-text)">
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

                <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                  {canDownload ? (
                    <a
                      className="inline-flex h-8 items-center gap-1.5 border border-(--color-border) px-2.5 text-xs font-medium text-(--color-text) transition hover:border-(--color-text)"
                      href={getDubbingJobDownloadUrl(job.id)}
                      onClick={(event) => void handleDownload(event, job.id)}
                    >
                      <Download className="size-4" />
                      Download
                    </a>
                  ) : isActive ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-(--color-text-dim)">
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

                  <button
                    type="button"
                    aria-label="Delete video"
                    className="inline-flex size-8 items-center justify-center text-(--color-text-dim) transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isActive || isDeleting}
                    onClick={() => setJobPendingDelete(job)}
                    title={
                      isActive
                        ? "Processing jobs cannot be deleted"
                        : "Delete video"
                    }
                  >
                    {isDeleting ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    <span className="sr-only">Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Dialog
        open={Boolean(jobPendingDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setJobPendingDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this video?</DialogTitle>
            <DialogDescription>
              This will permanently remove job #
              {jobPendingDelete ? shortJobId(jobPendingDelete.id) : ""} and
              its generated files from storage. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {jobPendingDelete ? (
            <div className="border-y border-(--color-border) py-3">
              <p className="text-sm font-semibold text-(--color-text)">
                {getDubbingLanguageName(jobPendingDelete.targetLanguage)}
              </p>
              <p className="mt-1 font-mono text-xs text-(--color-text-dim)">
                {jobPendingDelete.status} · Updated{" "}
                {formatUpdatedTime(jobPendingDelete.updatedAt)}
              </p>
            </div>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-(--color-border) bg-white px-4 py-2.5 text-sm font-semibold text-(--color-text) transition hover:border-(--color-text) disabled:cursor-not-allowed disabled:opacity-60"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-red-700 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={deleteMutation.isPending}
              onClick={() => void handleDelete()}
            >
              {deleteMutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete video
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
