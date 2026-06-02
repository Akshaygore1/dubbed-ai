import { queryOptions, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type AdminAnalyticsRange = '7d' | '30d' | '90d' | 'all'

export type AdminAiAnalyticsTotals = {
  eventCount: number
  totalInrMicros: number
  totalUsdMicros: number
  convertedTotalInrMicros: number | null
}

export type AdminAiAnalyticsQueue = {
  queueName: string
  eventCount: number
  totalInrMicros: number
  totalUsdMicros: number
  convertedTotalInrMicros: number | null
  lastEventAt: string | null
}

export type AdminAiAnalyticsBreakdown = {
  queueName: string
  provider: 'sarvam' | 'smallest'
  operation: 'transcription' | 'translation' | 'voice_clone' | 'tts'
  model: string | null
  eventCount: number
  totalBillableQuantity: number
  totalInrMicros: number
  totalUsdMicros: number
  convertedTotalInrMicros: number | null
  lastEventAt: string | null
}

export type AdminAiAnalyticsEvent = {
  id: string
  queueName: string
  jobId: string | null
  provider: 'sarvam' | 'smallest'
  operation: 'transcription' | 'translation' | 'voice_clone' | 'tts'
  model: string | null
  billableUnit: 'audio_second' | 'character' | 'request'
  billableQuantity: number
  currency: 'INR' | 'USD' | null
  rateMicros: number | null
  estimatedCostMicros: number | null
  metadata: Record<string, unknown> | null
  createdAt: string | null
}

export type AdminAiAnalytics = {
  range: AdminAnalyticsRange
  since: string | null
  usdToInrRate: number | null
  totals: AdminAiAnalyticsTotals
  queues: AdminAiAnalyticsQueue[]
  breakdown: AdminAiAnalyticsBreakdown[]
  recentEvents: AdminAiAnalyticsEvent[]
}

type AdminAiAnalyticsResponse = {
  success: boolean
  data: AdminAiAnalytics
}

const fetchAdminAiAnalytics = async (range: AdminAnalyticsRange) => {
  const { data } = await api.get<AdminAiAnalyticsResponse>('/admin/ai-analytics', {
    params: { range },
  })

  return data.data
}

const adminAiAnalyticsQueryKey = (range: AdminAnalyticsRange) =>
  ['admin-ai-analytics', range] as const

const adminAiAnalyticsQueryOptions = (range: AdminAnalyticsRange) =>
  queryOptions({
    queryKey: adminAiAnalyticsQueryKey(range),
    queryFn: () => fetchAdminAiAnalytics(range),
    retry: false,
  })

export const useAdminAiAnalytics = (range: AdminAnalyticsRange, enabled = true) =>
  useQuery({
    ...adminAiAnalyticsQueryOptions(range),
    enabled,
  })
