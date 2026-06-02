import { BarChart3, Bot, IndianRupee, LoaderCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { AdminShell } from '@/features/admin/admin-shell'
import {
  type AdminAiAnalyticsBreakdown,
  type AdminAiAnalyticsEvent,
  type AdminAnalyticsRange,
  useAdminAiAnalytics,
} from '@/features/admin/use-admin-ai-analytics'

const ranges: AdminAnalyticsRange[] = ['7d', '30d', '90d', 'all']

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const integerFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
})

const decimalFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const formatDate = (value: string | null) => {
  if (!value) {
    return 'No events'
  }

  return dateFormatter.format(new Date(value))
}

const formatMicros = (currency: 'INR' | 'USD', micros: number | null) => {
  if (micros === null) {
    return 'Not priced'
  }

  const amount = micros / 1_000_000
  const symbol = currency === 'INR' ? '₹' : '$'
  return `${symbol}${decimalFormatter.format(amount)}`
}

const formatRangeLabel = (range: AdminAnalyticsRange) => {
  if (range === 'all') {
    return 'All time'
  }

  return `Last ${range.slice(0, -1)} days`
}

const formatOperation = (value: AdminAiAnalyticsBreakdown['operation']) =>
  value.replaceAll('_', ' ')

const formatMetadata = (event: AdminAiAnalyticsEvent) => {
  const metadata = event.metadata

  if (!metadata) {
    return 'No metadata'
  }

  if (event.operation === 'voice_clone') {
    const sampleDurationSeconds = metadata.sampleDurationSeconds
    return typeof sampleDurationSeconds === 'number'
      ? `${decimalFormatter.format(sampleDurationSeconds)}s sample`
      : 'Clone request'
  }

  if (typeof metadata.segmentIndex === 'number') {
    return `Segment ${metadata.segmentIndex}`
  }

  return 'Captured'
}

export function AdminAnalyticsPage() {
  const [activeRange, setActiveRange] = useState<AdminAnalyticsRange>('30d')
  const { data, isLoading } = useAdminAiAnalytics(activeRange)

  return (
    <AdminShell
      activePath="/admin/analytics"
      eyebrow="Admin analytics"
      title="Track AI spend by queue."
    >
      <div className="mb-6 flex flex-wrap gap-3">
        {ranges.map((range) => (
          <button
            className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
              activeRange === range
                ? 'border-(--color-text) bg-(--color-text) text-(--color-bg)'
                : 'border-(--color-border) bg-white text-(--color-text)'
            }`}
            key={range}
            onClick={() => setActiveRange(range)}
            type="button"
          >
            {formatRangeLabel(range)}
          </button>
        ))}
      </div>

      {isLoading || !data ? (
        <section className="flex min-h-[320px] items-center justify-center gap-3 rounded-lg border border-(--color-border) bg-white px-5 py-10 text-sm text-(--color-text-dim)">
          <LoaderCircle className="size-4 animate-spin text-(--color-blue)" />
          Loading analytics
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={BarChart3}
              label="Provider calls"
              value={integerFormatter.format(data.totals.eventCount)}
              detail={formatRangeLabel(data.range)}
            />
            <MetricCard
              icon={IndianRupee}
              label="Sarvam total"
              value={formatMicros('INR', data.totals.totalInrMicros)}
              detail="Native INR estimate"
            />
            <MetricCard
              icon={Sparkles}
              label="Smallest total"
              value={formatMicros('USD', data.totals.totalUsdMicros)}
              detail="Native USD estimate"
            />
            <MetricCard
              icon={Bot}
              label="Combined"
              value={
                data.totals.convertedTotalInrMicros === null
                  ? 'Rate not set'
                  : formatMicros('INR', data.totals.convertedTotalInrMicros)
              }
              detail={
                data.usdToInrRate === null
                  ? 'Set AI_ANALYTICS_USD_TO_INR_RATE'
                  : `USD to INR ${decimalFormatter.format(data.usdToInrRate)}`
              }
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_1.5fr]">
            <div className="rounded-lg border border-(--color-border) bg-white">
              <div className="border-b border-(--color-border) px-5 py-4">
                <h2 className="font-serif text-2xl">Queue totals</h2>
              </div>

              {data.queues.length === 0 ? (
                <EmptyState label="No usage events in this range" />
              ) : (
                <div className="divide-y divide-(--color-border)">
                  {data.queues.map((queue) => (
                    <div className="px-5 py-4" key={queue.queueName}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-mono text-xs font-semibold uppercase tracking-wide text-(--color-blue)">
                            {queue.queueName}
                          </p>
                          <p className="mt-2 text-sm text-(--color-text-dim)">
                            {integerFormatter.format(queue.eventCount)} provider calls
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-semibold">
                            {queue.convertedTotalInrMicros === null
                              ? formatMicros('INR', queue.totalInrMicros)
                              : formatMicros('INR', queue.convertedTotalInrMicros)}
                          </p>
                          <p className="mt-1 text-(--color-text-dim)">
                            {formatMicros('USD', queue.totalUsdMicros)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-(--color-text-dim)">
                        Last event {formatDate(queue.lastEventAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <section className="overflow-x-auto rounded-lg border border-(--color-border) bg-white">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-[1fr_0.8fr_0.9fr_1.1fr_0.8fr_0.9fr] gap-4 border-b border-(--color-border) px-5 py-4 font-mono text-xs font-semibold uppercase tracking-wide text-(--color-text-dim)">
                  <span>Queue</span>
                  <span>Provider</span>
                  <span>Operation</span>
                  <span>Model</span>
                  <span>Usage</span>
                  <span>Estimate</span>
                </div>

                {data.breakdown.length === 0 ? (
                  <EmptyState label="No provider breakdown yet" />
                ) : (
                  data.breakdown.map((row) => (
                    <div
                      className="grid grid-cols-[1fr_0.8fr_0.9fr_1.1fr_0.8fr_0.9fr] gap-4 border-b border-(--color-border) px-5 py-4 text-sm last:border-b-0"
                      key={`${row.queueName}-${row.provider}-${row.operation}-${row.model ?? 'none'}`}
                    >
                      <span className="font-semibold">{row.queueName}</span>
                      <span className="capitalize">{row.provider}</span>
                      <span className="capitalize">{formatOperation(row.operation)}</span>
                      <span className="text-(--color-text-dim)">{row.model ?? 'N/A'}</span>
                      <span className="text-(--color-text-dim)">
                        {integerFormatter.format(row.totalBillableQuantity)}
                      </span>
                      <span className="font-semibold">
                        {formatBreakdownEstimate(row)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </section>

          <section className="mt-6 overflow-x-auto rounded-lg border border-(--color-border) bg-white">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[0.9fr_0.8fr_0.9fr_1fr_0.8fr_0.8fr_1.4fr_1.1fr] gap-4 border-b border-(--color-border) px-5 py-4 font-mono text-xs font-semibold uppercase tracking-wide text-(--color-text-dim)">
                <span>Time</span>
                <span>Queue</span>
                <span>Provider</span>
                <span>Operation</span>
                <span>Usage</span>
                <span>Cost</span>
                <span>Metadata</span>
                <span>Job</span>
              </div>

              {data.recentEvents.length === 0 ? (
                <EmptyState label="No recent usage events" />
              ) : (
                data.recentEvents.map((event) => (
                  <div
                    className="grid grid-cols-[0.9fr_0.8fr_0.9fr_1fr_0.8fr_0.8fr_1.4fr_1.1fr] gap-4 border-b border-(--color-border) px-5 py-4 text-sm last:border-b-0"
                    key={event.id}
                  >
                    <span className="text-(--color-text-dim)">{formatDate(event.createdAt)}</span>
                    <span className="font-semibold">{event.queueName}</span>
                    <span className="capitalize">{event.provider}</span>
                    <span className="capitalize">{formatOperation(event.operation)}</span>
                    <span className="text-(--color-text-dim)">
                      {integerFormatter.format(event.billableQuantity)} {event.billableUnit}
                    </span>
                    <span className="font-semibold">
                      {event.currency ? formatMicros(event.currency, event.estimatedCostMicros) : 'N/A'}
                    </span>
                    <span className="text-(--color-text-dim)">{formatMetadata(event)}</span>
                    <span className="truncate font-mono text-xs text-(--color-text-dim)">
                      {event.jobId ?? 'No job'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </AdminShell>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof BarChart3
  label: string
  value: string
  detail: string
}) {
  return (
    <article className="rounded-lg border border-(--color-border) bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs font-semibold uppercase tracking-wide text-(--color-text-dim)">
          {label}
        </p>
        <Icon className="size-4 text-(--color-blue)" />
      </div>
      <p className="mt-4 font-serif text-3xl leading-none">{value}</p>
      <p className="mt-3 text-sm text-(--color-text-dim)">{detail}</p>
    </article>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center px-5 py-10 text-sm text-(--color-text-dim)">
      {label}
    </div>
  )
}

function formatBreakdownEstimate(row: AdminAiAnalyticsBreakdown) {
  if (row.provider === 'smallest') {
    if (row.operation === 'voice_clone') {
      return 'Unpriced'
    }

    return formatMicros('USD', row.totalUsdMicros)
  }

  return formatMicros('INR', row.totalInrMicros)
}
