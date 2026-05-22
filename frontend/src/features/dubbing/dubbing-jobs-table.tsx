import { AlertCircle, Download, LoaderCircle } from 'lucide-react'
import { type MouseEvent } from 'react'
import { useSnackbar } from '@/app/providers/snackbar-context'
import { getDubbingLanguageName } from './dubbing-languages'
import { getDubbingJobDownloadUrl, useDubbingJobs } from './use-dubbing-jobs'

const statusClasses = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  processing: 'border-blue-200 bg-blue-50 text-blue-700',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  failed: 'border-red-200 bg-red-50 text-red-700',
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
          <p className="font-mono text-xs font-semibold text-(--color-blue)">
            Job queue
          </p>
          <h2 className="mt-2 font-serif text-4xl leading-tight text-(--color-text)">
            Status and downloads
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-(--color-text-dim)">
          Active rows refresh automatically. Completed videos expose authenticated download links.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-(--color-border) bg-(--color-surface) shadow-[0_18px_50px_rgba(21,23,19,0.08)]">
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-12 text-sm text-(--color-text-dim)">
            <LoaderCircle className="size-4 animate-spin text-(--color-blue)" />
            Loading jobs
          </div>
        ) : isError ? (
          <div className="flex items-center gap-3 px-6 py-12 text-sm text-red-700">
            <AlertCircle className="size-4" />
            {error instanceof Error ? error.message : 'Unable to load dubbing jobs'}
          </div>
        ) : !jobs || jobs.length === 0 ? (
          <div className="px-6 py-12 text-sm text-(--color-text-dim)">
            No dubbing jobs yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="border-b border-(--color-border) bg-(--color-bg) font-mono text-xs text-(--color-text-dim)">
                <tr>
                  <th className="px-4 py-4 font-semibold">Video</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-4 py-4 font-semibold">Source</th>
                  <th className="px-4 py-4 font-semibold">Target</th>
                  <th className="px-4 py-4 font-semibold">Created</th>
                  <th className="px-4 py-4 font-semibold">Error</th>
                  <th className="px-4 py-4 font-semibold">Download</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-t border-(--color-border) align-middle transition hover:bg-(--color-bg)"
                  >
                    <td className="px-4 py-4 text-center">
                      <p className="max-w-56 truncate font-semibold text-(--color-text)">
                        {job.id}
                      </p>
                      <p className="mt-1 font-mono text-xs text-(--color-muted)">
                        Updated {formatDate(job.updatedAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex rounded-md border px-2.5 py-1 font-mono text-xs font-semibold ${statusClasses[job.status]}`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-(--color-text-dim)">
                      {job.transcriptionLanguage
                        ? getDubbingLanguageName(job.transcriptionLanguage)
                        : getDubbingLanguageName(job.sourceLanguage)}
                    </td>
                    <td className="px-4 py-4 text-center text-(--color-text-dim)">
                      {getDubbingLanguageName(job.targetLanguage)}
                    </td>
                    <td className="px-4 py-4 text-center text-(--color-text-dim)">
                      {formatDate(job.createdAt)}
                    </td>
                    <td className="max-w-xs px-4 py-4 text-center text-(--color-text-dim)">
                      {job.errorMessage ?? 'None'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {job.status === 'completed' && job.dubbedVideoKey ? (
                        <a
                          className="inline-flex items-center gap-2 rounded-md border border-(--color-text) bg-white px-3 py-2 text-sm font-semibold text-(--color-text) transition hover:bg-(--color-accent)"
                          href={getDubbingJobDownloadUrl(job.id)}
                          onClick={(event) => void handleDownload(event, job.id)}
                        >
                          <Download className="size-4" />
                          Download
                        </a>
                      ) : (
                        <span className="font-mono text-xs text-(--color-muted)">
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
