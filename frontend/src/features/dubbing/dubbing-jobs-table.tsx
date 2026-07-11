import { AlertCircle, ChevronDown, Download, LoaderCircle } from "lucide-react";
import { type MouseEvent, useMemo } from "react";
import { useSnackbar } from "@/app/providers/snackbar-context";
import { getDubbingLanguageName } from "./dubbing-languages";
import {
  type DubbingJob,
  getDubbingJobDownloadUrl,
  type SourceVideo,
  useDubbingJobs,
} from "./use-dubbing-jobs";

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

const isActive = (version: DubbingJob) =>
  version.status === "pending" || version.status === "processing";

const formatUpdatedTime = (value: string) =>
  updatedTimeFormatter.format(new Date(value));

export function DubbingJobsTable() {
  const { data: sources, isLoading, isError, error } = useDubbingJobs();
  const { showSnackbar } = useSnackbar();
  const sortedSources = useMemo(
    () =>
      (sources ?? []).toSorted(
        (first, second) =>
          new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime(),
      ),
    [sources],
  );
  const hasActiveVersions = sortedSources.some((source) =>
    source.versions.some(isActive),
  );

  const handleDownload = (
    event: MouseEvent<HTMLAnchorElement>,
    versionId: string,
  ) => {
    event.preventDefault();
    window.location.assign(getDubbingJobDownloadUrl(versionId));
    showSnackbar({ message: "Download started for the language version.", variant: "success" });
  };

  return (
    <section aria-labelledby="source-videos-heading">
      <div className="flex flex-col gap-3 border-b border-(--color-border) pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="source-videos-heading" className="text-lg font-semibold tracking-[-0.015em] text-(--color-text)">Your source videos</h2>
          <p className="mt-1 text-sm text-(--color-text-dim)">Each source keeps its language versions together.</p>
        </div>
        {hasActiveVersions ? <span className="inline-flex items-center gap-1.5 text-xs text-(--color-text-dim)"><LoaderCircle className="size-3.5 animate-spin text-(--color-blue)" />Live refresh</span> : null}
      </div>

      {isLoading ? <State icon={<LoaderCircle className="size-4 animate-spin text-(--color-blue)" />} text="Loading source videos" /> : null}
      {isError ? <State icon={<AlertCircle className="size-4 text-red-700" />} text={error instanceof Error ? error.message : "Unable to load source videos"} /> : null}
      {!isLoading && !isError && sortedSources.length === 0 ? <State text="No source videos yet. Your first uploaded video will appear here." /> : null}
      {!isLoading && !isError ? <div>{sortedSources.map((source) => <SourceGroup key={source.id} source={source} onDownload={handleDownload} />)}</div> : null}
    </section>
  );
}

function State({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return <div className="flex min-h-32 items-center justify-center gap-2 border-b border-(--color-border) py-7 text-sm text-(--color-text-dim)">{icon}{text}</div>;
}

function SourceGroup({ source, onDownload }: { source: SourceVideo; onDownload: (event: MouseEvent<HTMLAnchorElement>, versionId: string) => void }) {
  const active = source.versions.some(isActive);
  const newestUpdate = source.versions[0]?.updatedAt ?? source.updatedAt;
  return (
    <details className="group border-b border-(--color-border)" open={active}>
      <summary className="flex cursor-pointer list-none items-center gap-3 py-4 marker:content-none sm:px-3">
        <ChevronDown className="size-4 shrink-0 text-(--color-text-dim) transition group-open:rotate-180" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-semibold text-(--color-text)">{source.displayTitle}</h3>{active ? <span className="ui-status ui-status-active">active</span> : null}</div>
          <p className="mt-1 text-xs text-(--color-text-dim)">{getDubbingLanguageName(source.sourceLanguage)} source · {source.versions.length} {source.versions.length === 1 ? "language version" : "language versions"} · {active ? "Processing activity" : `Last activity ${formatUpdatedTime(newestUpdate)}`}</p>
        </div>
      </summary>
      <div className="border-t border-(--color-border) bg-(--color-surface) px-3 sm:pl-10">
        {source.versions.map((version) => <VersionRow key={version.id} version={version} onDownload={onDownload} />)}
      </div>
    </details>
  );
}

function VersionRow({ version, onDownload }: { version: DubbingJob; onDownload: (event: MouseEvent<HTMLAnchorElement>, versionId: string) => void }) {
  const canDownload = version.status === "completed" && Boolean(version.dubbedVideoKey);
  return <div className="flex flex-col gap-3 border-b border-(--color-border) py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
    <div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-(--color-text)">{getDubbingLanguageName(version.targetLanguage)}</p><span className={statusClasses[version.status]}>{version.status}</span></div><p className="mt-1 font-mono text-xs text-(--color-text-dim)">Updated {formatUpdatedTime(version.updatedAt)}</p>{version.status === "failed" && version.errorMessage ? <p className="mt-2 text-sm text-red-700">{version.errorMessage}</p> : null}</div>
    {canDownload ? <a className="inline-flex h-8 w-fit items-center gap-1.5 border border-(--color-border) px-2.5 text-xs font-medium text-(--color-text) transition hover:border-(--color-text)" href={getDubbingJobDownloadUrl(version.id)} onClick={(event) => void onDownload(event, version.id)}><Download className="size-4" />Download</a> : isActive(version) ? <span className="inline-flex items-center gap-1.5 text-xs text-(--color-text-dim)"><LoaderCircle className="size-3.5 animate-spin text-(--color-blue)" />Processing</span> : null}
  </div>;
}
