import { AlertCircle, LoaderCircle } from 'lucide-react'
import { useDubbingJobs } from './use-dubbing-jobs'

const statusClasses = {
  pending: 'text-amber-300',
  processing: 'text-sky-300',
  completed: 'text-emerald-300',
  failed: 'text-red-400',
} as const

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export function DubbingJobsTable() {
  const { data: jobs, isLoading, isError, error } = useDubbingJobs()

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-accent)]">
            Dubbing Jobs
          </p>
          <h2 className="mt-2 font-serif text-3xl tracking-tight text-[var(--color-text)]">
            Status overview
          </h2>
        </div>
      </div>

      <div className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]/80">
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
              <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.2em] text-[var(--color-text-dim)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Job ID</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Target</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium">Error</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-t border-[var(--color-border)] align-top">
                    <td className="px-4 py-4 font-medium text-[var(--color-text)]">{job.id}</td>
                    <td className={`px-4 py-4 font-medium uppercase ${statusClasses[job.status]}`}>
                      {job.status}
                    </td>
                    <td className="px-4 py-4 text-[var(--color-text-dim)]">{job.sourceLanguage}</td>
                    <td className="px-4 py-4 text-[var(--color-text-dim)]">{job.targetLanguage}</td>
                    <td className="px-4 py-4 text-[var(--color-text-dim)]">{formatDate(job.createdAt)}</td>
                    <td className="px-4 py-4 text-[var(--color-text-dim)]">{formatDate(job.updatedAt)}</td>
                    <td className="max-w-xs px-4 py-4 text-[var(--color-text-dim)]">
                      {job.errorMessage ?? '—'}
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
