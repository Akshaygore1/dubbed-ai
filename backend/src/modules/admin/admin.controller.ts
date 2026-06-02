import type { Request, Response } from 'express'
import { and, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { env } from '../../config/env.js'
import { db } from '../../db/client.js'
import { aiUsageEvents, user } from '../../db/schema.js'
import {
  clearAdminSessionCookie,
  createAdminSessionToken,
  setAdminSessionCookie,
} from '../../lib/admin-session.js'
import { HttpError } from '../../lib/http-error.js'

const adminLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

const adminUserStatusSchema = z.enum(['pending', 'approved'])
const adminAnalyticsRangeSchema = z.enum(['7d', '30d', '90d', 'all']).catch('30d')

const selectAdminUserFields = {
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  approvalStatus: user.approvalStatus,
  approvedAt: user.approvedAt,
}

type AnalyticsTotalsRow = {
  event_count: number | string
  total_inr_micros: number | string
  total_usd_micros: number | string
}

type QueueSummaryRow = {
  queue_name: string
  event_count: number | string
  total_inr_micros: number | string
  total_usd_micros: number | string
  last_event_at: Date | string | null
}

type ProviderBreakdownRow = {
  queue_name: string
  provider: 'sarvam' | 'smallest'
  operation: 'transcription' | 'translation' | 'voice_clone' | 'tts'
  model: string | null
  event_count: number | string
  total_billable_quantity: number | string
  total_inr_micros: number | string
  total_usd_micros: number | string
  last_event_at: Date | string | null
}

type RecentEventRow = {
  id: string
  queue_name: string
  job_id: string | null
  provider: 'sarvam' | 'smallest'
  operation: 'transcription' | 'translation' | 'voice_clone' | 'tts'
  model: string | null
  billable_unit: 'audio_second' | 'character' | 'request'
  billable_quantity: number | string
  currency: 'INR' | 'USD' | null
  rate_micros: number | string | null
  estimated_cost_micros: number | string | null
  metadata_json: string | null
  created_at: Date | string
}

const toNumber = (value: number | string | null | undefined) => {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string' && value.length > 0) {
    return Number(value)
  }

  return 0
}

const toNullableNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return null
  }

  return toNumber(value)
}

const toIsoString = (value: Date | string | null) => {
  if (!value) {
    return null
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

const parseMetadata = (value: string | null) => {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as Record<string, unknown>
  } catch {
    return null
  }
}

const getAnalyticsSince = (range: z.infer<typeof adminAnalyticsRangeSchema>) => {
  if (range === 'all') {
    return null
  }

  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

const buildWhereClause = (since: Date | null) =>
  since ? sql`where ${aiUsageEvents.createdAt} >= ${since}` : sql``

const toConvertedInrMicros = (
  inrMicros: number,
  usdMicros: number,
  usdToInrRate?: number,
) => {
  if (!usdToInrRate) {
    return null
  }

  return Math.round(inrMicros + usdMicros * usdToInrRate)
}

export const loginAdmin = async (req: Request, res: Response) => {
  const payload = adminLoginSchema.parse(req.body)

  if (payload.email !== env.ADMIN_EMAIL || payload.password !== env.ADMIN_PASSWORD) {
    throw new HttpError(401, 'Invalid admin credentials')
  }

  const session = createAdminSessionToken()
  setAdminSessionCookie(res, session)

  res.json({
    success: true,
    data: {
      email: env.ADMIN_EMAIL,
      expiresAt: session.expiresAt,
    },
  })
}

export const logoutAdmin = async (_req: Request, res: Response) => {
  clearAdminSessionCookie(res)
  res.status(204).send()
}

export const getAdminSession = async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      email: res.locals.adminEmail,
      expiresAt: res.locals.adminSessionExpiresAt,
    },
  })
}

export const listAdminUsers = async (req: Request, res: Response) => {
  const status = adminUserStatusSchema.parse(req.query.status)
  const users = await db
    .select(selectAdminUserFields)
    .from(user)
    .where(eq(user.approvalStatus, status))
    .orderBy(desc(user.createdAt))

  res.json({
    success: true,
    data: users,
  })
}

export const approveAdminUser = async (req: Request, res: Response) => {
  const userIdParam = req.params.id
  const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam

  if (!userId) {
    throw new HttpError(400, 'User id is required')
  }

  const approvedAt = new Date()
  const [approvedUser] = await db
    .update(user)
    .set({
      approvalStatus: 'approved',
      approvedAt,
      approvedBy: env.ADMIN_EMAIL,
      updatedAt: approvedAt,
    })
    .where(and(eq(user.id, userId), eq(user.approvalStatus, 'pending')))
    .returning(selectAdminUserFields)

  if (!approvedUser) {
    const [existingUser] = await db
      .select(selectAdminUserFields)
      .from(user)
      .where(eq(user.id, userId))

    if (!existingUser) {
      throw new HttpError(404, 'User not found')
    }

    res.json({
      success: true,
      data: existingUser,
    })
    return
  }

  res.json({
    success: true,
    data: approvedUser,
  })
}

export const getAdminAiAnalytics = async (req: Request, res: Response) => {
  const range = adminAnalyticsRangeSchema.parse(req.query.range)
  const since = getAnalyticsSince(range)
  const whereClause = buildWhereClause(since)

  const totalsResult = await db.execute<AnalyticsTotalsRow>(sql`
    select
      count(*)::int as event_count,
      coalesce(sum(case when ${aiUsageEvents.currency} = 'INR' then ${aiUsageEvents.estimatedCostMicros} else 0 end), 0)::bigint as total_inr_micros,
      coalesce(sum(case when ${aiUsageEvents.currency} = 'USD' then ${aiUsageEvents.estimatedCostMicros} else 0 end), 0)::bigint as total_usd_micros
    from ${aiUsageEvents}
    ${whereClause}
  `)

  const queueSummaryResult = await db.execute<QueueSummaryRow>(sql`
    select
      ${aiUsageEvents.queueName} as queue_name,
      count(*)::int as event_count,
      coalesce(sum(case when ${aiUsageEvents.currency} = 'INR' then ${aiUsageEvents.estimatedCostMicros} else 0 end), 0)::bigint as total_inr_micros,
      coalesce(sum(case when ${aiUsageEvents.currency} = 'USD' then ${aiUsageEvents.estimatedCostMicros} else 0 end), 0)::bigint as total_usd_micros,
      max(${aiUsageEvents.createdAt}) as last_event_at
    from ${aiUsageEvents}
    ${whereClause}
    group by ${aiUsageEvents.queueName}
    order by ${aiUsageEvents.queueName} asc
  `)

  const providerBreakdownResult = await db.execute<ProviderBreakdownRow>(sql`
    select
      ${aiUsageEvents.queueName} as queue_name,
      ${aiUsageEvents.provider} as provider,
      ${aiUsageEvents.operation} as operation,
      ${aiUsageEvents.model} as model,
      count(*)::int as event_count,
      coalesce(sum(${aiUsageEvents.billableQuantity}), 0)::bigint as total_billable_quantity,
      coalesce(sum(case when ${aiUsageEvents.currency} = 'INR' then ${aiUsageEvents.estimatedCostMicros} else 0 end), 0)::bigint as total_inr_micros,
      coalesce(sum(case when ${aiUsageEvents.currency} = 'USD' then ${aiUsageEvents.estimatedCostMicros} else 0 end), 0)::bigint as total_usd_micros,
      max(${aiUsageEvents.createdAt}) as last_event_at
    from ${aiUsageEvents}
    ${whereClause}
    group by
      ${aiUsageEvents.queueName},
      ${aiUsageEvents.provider},
      ${aiUsageEvents.operation},
      ${aiUsageEvents.model}
    order by
      ${aiUsageEvents.queueName} asc,
      ${aiUsageEvents.provider} asc,
      ${aiUsageEvents.operation} asc,
      ${aiUsageEvents.model} asc
  `)

  const recentEventsResult = await db.execute<RecentEventRow>(sql`
    select
      ${aiUsageEvents.id} as id,
      ${aiUsageEvents.queueName} as queue_name,
      ${aiUsageEvents.jobId} as job_id,
      ${aiUsageEvents.provider} as provider,
      ${aiUsageEvents.operation} as operation,
      ${aiUsageEvents.model} as model,
      ${aiUsageEvents.billableUnit} as billable_unit,
      ${aiUsageEvents.billableQuantity} as billable_quantity,
      ${aiUsageEvents.currency} as currency,
      ${aiUsageEvents.rateMicros} as rate_micros,
      ${aiUsageEvents.estimatedCostMicros} as estimated_cost_micros,
      ${aiUsageEvents.metadataJson} as metadata_json,
      ${aiUsageEvents.createdAt} as created_at
    from ${aiUsageEvents}
    ${whereClause}
    order by ${aiUsageEvents.createdAt} desc
    limit 50
  `)

  const totalsRow = totalsResult.rows[0] ?? {
    event_count: 0,
    total_inr_micros: 0,
    total_usd_micros: 0,
  }
  const totalInrMicros = toNumber(totalsRow.total_inr_micros)
  const totalUsdMicros = toNumber(totalsRow.total_usd_micros)
  const usdToInrRate = env.AI_ANALYTICS_USD_TO_INR_RATE

  res.json({
    success: true,
    data: {
      range,
      since: since?.toISOString() ?? null,
      usdToInrRate: usdToInrRate ?? null,
      totals: {
        eventCount: toNumber(totalsRow.event_count),
        totalInrMicros,
        totalUsdMicros,
        convertedTotalInrMicros: toConvertedInrMicros(
          totalInrMicros,
          totalUsdMicros,
          usdToInrRate,
        ),
      },
      queues: queueSummaryResult.rows.map((row) => {
        const queueInrMicros = toNumber(row.total_inr_micros)
        const queueUsdMicros = toNumber(row.total_usd_micros)

        return {
          queueName: row.queue_name,
          eventCount: toNumber(row.event_count),
          totalInrMicros: queueInrMicros,
          totalUsdMicros: queueUsdMicros,
          convertedTotalInrMicros: toConvertedInrMicros(
            queueInrMicros,
            queueUsdMicros,
            usdToInrRate,
          ),
          lastEventAt: toIsoString(row.last_event_at),
        }
      }),
      breakdown: providerBreakdownResult.rows.map((row) => {
        const breakdownInrMicros = toNumber(row.total_inr_micros)
        const breakdownUsdMicros = toNumber(row.total_usd_micros)

        return {
          queueName: row.queue_name,
          provider: row.provider,
          operation: row.operation,
          model: row.model,
          eventCount: toNumber(row.event_count),
          totalBillableQuantity: toNumber(row.total_billable_quantity),
          totalInrMicros: breakdownInrMicros,
          totalUsdMicros: breakdownUsdMicros,
          convertedTotalInrMicros: toConvertedInrMicros(
            breakdownInrMicros,
            breakdownUsdMicros,
            usdToInrRate,
          ),
          lastEventAt: toIsoString(row.last_event_at),
        }
      }),
      recentEvents: recentEventsResult.rows.map((row) => ({
        id: row.id,
        queueName: row.queue_name,
        jobId: row.job_id,
        provider: row.provider,
        operation: row.operation,
        model: row.model,
        billableUnit: row.billable_unit,
        billableQuantity: toNumber(row.billable_quantity),
        currency: row.currency,
        rateMicros: toNullableNumber(row.rate_micros),
        estimatedCostMicros: toNullableNumber(row.estimated_cost_micros),
        metadata: parseMetadata(row.metadata_json),
        createdAt: toIsoString(row.created_at),
      })),
    },
  })
}
