import { AlertCircle, Download, LoaderCircle } from 'lucide-react'
import { type MouseEvent } from 'react'
import { useSnackbar } from '@/app/providers/snackbar-context'
import { getDubbingJobDownloadUrl, useDubbingJobs } from './use-dubbing-jobs'

const statusClasses = {
  pending: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  processing: 'border-sky-300/30 bg-sky-300/10 text-sky-200',
  completed: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200',
  failed: 'border-red-400/30 bg-red-400/10 text-red-300',
} as const

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export function DubbingJobsTable() {
  const { data: jobs, isLoading, isError, error } = useDubbingJobs()
  const { showSnackbar } = useSnackbar()

  const handleDownload = async (
    event: MouseEvent<HTMLAnchorElement>,
    jobId: string,
  ) => {
    event.preventDefault()

    try {
      const downloadUrl = getDubbingJobDownloadUrl(jobId)
      const response = await fetch(downloadUrl, {
        credentials: 'include',
        redirect: 'manual',
      })

      if (!response.ok && response.type !== 'opaqueredirect') {
        throw new Error('Download is not available yet')
      }

      window.location.assign(downloadUrl)
      showSnackbar({
        message: 'Download started for the processed video.',
        variant: 'success',
      })
    } catch {
      showSnackbar({
        message: 'Unable to download this video. Try again after processing completes.',
        variant: 'error',
      })
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-accent)]">
            Processed Queue
          </p>
          <h2 className="mt-2 font-serif text-3xl tracking-tight text-[var(--color-text)]">
            Status and downloads
          </h2>
        </div>
        <p className="max-w-sm text-xs leading-relaxed text-[var(--color-text-dim)]">
          Active rows refresh automatically. Completed videos are available as signed,
          authenticated downloads.
        </p>
      </div>

      <div className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-panel)]/80 shadow-2xl shadow-black/20 backdrop-blur">
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-12 text-sm text-[var(--color-text-dim)]">
            <LoaderCircle className="size-4 animate-spin" />
            Loading jobs
          </div>
        ) : isError ? (
          <div className="flex items-center gap-3 px-6 py-12 text-sm text-red-400">
            <AlertCircle className="size-4" />
            {error instanceof Error ? error.message : 'Unable to load dubbing jobs'}
          </div>
        ) : !jobs || jobs.length === 0 ? (
          <div className="px-6 py-12 text-sm text-[var(--color-text-dim)]">
            No dubbing jobs yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-[var(--color-text-dim)]">
                <tr>
                  <th className="px-4 py-4 font-medium">Video</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Target</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Error</th>
                  <th className="px-4 py-3 font-medium">Download</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-t border-[var(--color-border)] align-top transition hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-4">
                      <p className="max-w-56 truncate font-medium text-[var(--color-text)]">
                        {job.id}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-dim)]">
                        Updated {formatDate(job.updatedAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] ${statusClasses[job.status]}`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[var(--color-text-dim)]">{job.sourceLanguage}</td>
                    <td className="px-4 py-4 text-[var(--color-text-dim)]">{job.targetLanguage}</td>
                    <td className="px-4 py-4 text-[var(--color-text-dim)]">{formatDate(job.createdAt)}</td>
                    <td className="max-w-xs px-4 py-4 text-[var(--color-text-dim)]">
                      {job.errorMessage ?? '—'}
                    </td>
                    <td className="px-4 py-4">
                      {job.status === 'completed' && job.dubbedVideoKey ? (
                        <a
                          className="inline-flex items-center gap-2 border border-[var(--color-accent)] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[var(--color-accent)] transition hover:bg-[var(--color-accent)] hover:text-black"
                          href={getDubbingJobDownloadUrl(job.id)}
                          onClick={(event) => void handleDownload(event, job.id)}
                        >
                          <Download className="size-3.5" />
                          Download
                        </a>
                      ) : (
                        <span className="text-xs text-[var(--color-text-dim)]">
                          Not ready
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
