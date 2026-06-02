import type { Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '../../src/lib/http-error.js'
import {
  approveAdminUser,
  getAdminAiAnalytics,
  getAdminSession,
  listAdminUsers,
  loginAdmin,
  logoutAdmin,
} from '../../src/modules/admin/admin.controller.js'

const mocks = vi.hoisted(() => ({
  env: {
    ADMIN_EMAIL: 'admin@example.com',
    ADMIN_PASSWORD: 'supersecret-password',
    AI_ANALYTICS_USD_TO_INR_RATE: 86.5,
  },
  db: {
    select: vi.fn(),
    update: vi.fn(),
    execute: vi.fn(),
  },
  eq: vi.fn((column: unknown, value: unknown) => ({ column, value })),
  and: vi.fn((...conditions: unknown[]) => ({ conditions })),
  desc: vi.fn((column: unknown) => ({ column })),
  sql: vi.fn((strings: TemplateStringsArray, ...values: unknown[]) => ({
    strings,
    values,
  })),
  createAdminSessionToken: vi.fn(),
  setAdminSessionCookie: vi.fn(),
  clearAdminSessionCookie: vi.fn(),
}))

vi.mock('../../src/config/env.js', () => ({
  env: mocks.env,
}))

vi.mock('../../src/db/client.js', () => ({
  db: mocks.db,
}))

vi.mock('drizzle-orm', () => ({
  and: mocks.and,
  desc: mocks.desc,
  eq: mocks.eq,
  sql: mocks.sql,
}))

vi.mock('../../src/lib/admin-session.js', () => ({
  createAdminSessionToken: mocks.createAdminSessionToken,
  setAdminSessionCookie: mocks.setAdminSessionCookie,
  clearAdminSessionCookie: mocks.clearAdminSessionCookie,
}))

type MockResponse = Response & {
  status: ReturnType<typeof vi.fn>
  json: ReturnType<typeof vi.fn>
  send: ReturnType<typeof vi.fn>
}

const createResponse = () => {
  const res = {
    locals: {},
    status: vi.fn(),
    json: vi.fn(),
    send: vi.fn(),
  }

  res.status.mockReturnValue(res)

  return res as unknown as MockResponse
}

const mockSelectWhere = (rows: unknown[]) => {
  const where = vi.fn().mockResolvedValue(rows)
  const from = vi.fn(() => ({ where }))
  mocks.db.select.mockReturnValue({ from })
  return { from, where }
}

const mockSelectOrder = (rows: unknown[]) => {
  const orderBy = vi.fn().mockResolvedValue(rows)
  const where = vi.fn(() => ({ orderBy }))
  const from = vi.fn(() => ({ where }))
  mocks.db.select.mockReturnValue({ from })
  return { from, where, orderBy }
}

const mockUpdateReturning = (rows: unknown[]) => {
  const returning = vi.fn().mockResolvedValue(rows)
  const where = vi.fn(() => ({ returning }))
  const set = vi.fn(() => ({ where }))
  mocks.db.update.mockReturnValue({ set })
  return { set, where, returning }
}

const mockExecuteRows = (rowsByCall: unknown[][]) => {
  mocks.db.execute.mockReset()

  for (const rows of rowsByCall) {
    mocks.db.execute.mockResolvedValueOnce({ rows })
  }
}

describe('admin controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createAdminSessionToken.mockReturnValue({
      token: 'signed-token',
      expiresAt: new Date('2026-05-22T18:00:00.000Z'),
    })
  })

  it('logs the admin in with valid env credentials', async () => {
    const res = createResponse()

    await loginAdmin(
      {
        body: {
          email: 'admin@example.com',
          password: 'supersecret-password',
        },
      } as Request,
      res,
    )

    expect(mocks.setAdminSessionCookie).toHaveBeenCalledWith(
      res,
      expect.objectContaining({
        token: 'signed-token',
      }),
    )
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        email: 'admin@example.com',
        expiresAt: new Date('2026-05-22T18:00:00.000Z'),
      },
    })
  })

  it('rejects invalid admin credentials', async () => {
    await expect(
      loginAdmin(
        {
          body: {
            email: 'admin@example.com',
            password: 'wrong-password',
          },
        } as Request,
        createResponse(),
      ),
    ).rejects.toMatchObject<HttpError>({
      statusCode: 401,
      message: 'Invalid admin credentials',
    })
  })

  it('returns the current admin session', async () => {
    const res = createResponse()
    res.locals.adminEmail = 'admin@example.com'
    res.locals.adminSessionExpiresAt = new Date('2026-05-22T18:00:00.000Z')

    await getAdminSession({} as Request, res)

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        email: 'admin@example.com',
        expiresAt: new Date('2026-05-22T18:00:00.000Z'),
      },
    })
  })

  it('clears the admin cookie on logout', async () => {
    const res = createResponse()

    await logoutAdmin({} as Request, res)

    expect(mocks.clearAdminSessionCookie).toHaveBeenCalledWith(res)
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.send).toHaveBeenCalled()
  })

  it('lists users filtered by pending status', async () => {
    const res = createResponse()
    mockSelectOrder([
      {
        id: 'user_1',
        name: 'Pending User',
        email: 'pending@example.com',
        createdAt: new Date('2026-05-22T09:00:00.000Z'),
        approvalStatus: 'pending',
        approvedAt: null,
      },
    ])

    await listAdminUsers(
      {
        query: {
          status: 'pending',
        },
      } as unknown as Request,
      res,
    )

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [
        expect.objectContaining({
          approvalStatus: 'pending',
        }),
      ],
    })
  })

  it('lists users filtered by approved status', async () => {
    const res = createResponse()
    mockSelectOrder([
      {
        id: 'user_2',
        name: 'Approved User',
        email: 'approved@example.com',
        createdAt: new Date('2026-05-20T09:00:00.000Z'),
        approvalStatus: 'approved',
        approvedAt: new Date('2026-05-21T09:00:00.000Z'),
      },
    ])

    await listAdminUsers(
      {
        query: {
          status: 'approved',
        },
      } as unknown as Request,
      res,
    )

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [
        expect.objectContaining({
          approvalStatus: 'approved',
        }),
      ],
    })
  })

  it('approves a pending user and records approval metadata', async () => {
    const res = createResponse()
    const update = mockUpdateReturning([
      {
        id: 'user_123',
        name: 'Pending User',
        email: 'pending@example.com',
        createdAt: new Date('2026-05-20T09:00:00.000Z'),
        approvalStatus: 'approved',
        approvedAt: new Date('2026-05-22T10:00:00.000Z'),
      },
    ])

    await approveAdminUser(
      {
        params: {
          id: 'user_123',
        },
      } as unknown as Request,
      res,
    )

    expect(update.set).toHaveBeenCalledWith({
      approvalStatus: 'approved',
      approvedAt: expect.any(Date),
      approvedBy: 'admin@example.com',
      updatedAt: expect.any(Date),
    })
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        approvalStatus: 'approved',
      }),
    })
  })

  it('throws a 404 when approving an unknown user', async () => {
    mockUpdateReturning([])
    mockSelectWhere([])

    await expect(
      approveAdminUser(
        {
          params: {
            id: 'missing_user',
          },
        } as unknown as Request,
        createResponse(),
      ),
    ).rejects.toMatchObject<HttpError>({
      statusCode: 404,
      message: 'User not found',
    })
  })

  it('returns admin ai analytics with queue totals and recent events', async () => {
    const res = createResponse()

    mockExecuteRows([
      [
        {
          event_count: 3,
          total_inr_micros: 16000000,
          total_usd_micros: 5000,
        },
      ],
      [
        {
          queue_name: 'dubbing-job',
          event_count: 3,
          total_inr_micros: 16000000,
          total_usd_micros: 5000,
          last_event_at: new Date('2026-06-01T08:30:00.000Z'),
        },
      ],
      [
        {
          queue_name: 'dubbing-job',
          provider: 'sarvam',
          operation: 'translation',
          model: 'mayura:v1',
          event_count: 2,
          total_billable_quantity: 800,
          total_inr_micros: 16000000,
          total_usd_micros: 0,
          last_event_at: new Date('2026-06-01T08:30:00.000Z'),
        },
        {
          queue_name: 'dubbing-job',
          provider: 'smallest',
          operation: 'voice_clone',
          model: 'voice-cloning',
          event_count: 1,
          total_billable_quantity: 1,
          total_inr_micros: 0,
          total_usd_micros: 0,
          last_event_at: new Date('2026-06-01T08:40:00.000Z'),
        },
      ],
      [
        {
          id: 'evt_1',
          queue_name: 'dubbing-job',
          job_id: 'job_1',
          provider: 'smallest',
          operation: 'voice_clone',
          model: 'voice-cloning',
          billable_unit: 'request',
          billable_quantity: 1,
          currency: null,
          rate_micros: null,
          estimated_cost_micros: null,
          metadata_json: JSON.stringify({
            sampleDurationSeconds: 12.3,
          }),
          created_at: new Date('2026-06-01T08:40:00.000Z'),
        },
      ],
    ])

    await getAdminAiAnalytics(
      {
        query: {
          range: '30d',
        },
      } as unknown as Request,
      res,
    )

    expect(mocks.db.execute).toHaveBeenCalledTimes(4)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        range: '30d',
        since: expect.any(String),
        usdToInrRate: 86.5,
        totals: {
          eventCount: 3,
          totalInrMicros: 16000000,
          totalUsdMicros: 5000,
          convertedTotalInrMicros: 16432500,
        },
        queues: [
          {
            queueName: 'dubbing-job',
            eventCount: 3,
            totalInrMicros: 16000000,
            totalUsdMicros: 5000,
            convertedTotalInrMicros: 16432500,
            lastEventAt: '2026-06-01T08:30:00.000Z',
          },
        ],
        breakdown: [
          {
            queueName: 'dubbing-job',
            provider: 'sarvam',
            operation: 'translation',
            model: 'mayura:v1',
            eventCount: 2,
            totalBillableQuantity: 800,
            totalInrMicros: 16000000,
            totalUsdMicros: 0,
            convertedTotalInrMicros: 16000000,
            lastEventAt: '2026-06-01T08:30:00.000Z',
          },
          {
            queueName: 'dubbing-job',
            provider: 'smallest',
            operation: 'voice_clone',
            model: 'voice-cloning',
            eventCount: 1,
            totalBillableQuantity: 1,
            totalInrMicros: 0,
            totalUsdMicros: 0,
            convertedTotalInrMicros: 0,
            lastEventAt: '2026-06-01T08:40:00.000Z',
          },
        ],
        recentEvents: [
          {
            id: 'evt_1',
            queueName: 'dubbing-job',
            jobId: 'job_1',
            provider: 'smallest',
            operation: 'voice_clone',
            model: 'voice-cloning',
            billableUnit: 'request',
            billableQuantity: 1,
            currency: null,
            rateMicros: null,
            estimatedCostMicros: null,
            metadata: {
              sampleDurationSeconds: 12.3,
            },
            createdAt: '2026-06-01T08:40:00.000Z',
          },
        ],
      },
    })
  })
})
