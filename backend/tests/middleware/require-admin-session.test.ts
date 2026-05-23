import type { NextFunction, Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '../../src/lib/http-error.js'
import { requireAdminSession } from '../../src/middleware/require-admin-session.js'

const mocks = vi.hoisted(() => ({
  readAdminSessionFromRequest: vi.fn(),
}))

vi.mock('../../src/lib/admin-session.js', () => ({
  readAdminSessionFromRequest: mocks.readAdminSessionFromRequest,
}))

const createResponse = () =>
  ({
    locals: {},
  }) as Response

describe('requireAdminSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('stores admin session data and calls next', () => {
    const req = { headers: { cookie: 'admin_session=value' } } as Request
    const res = createResponse()
    const next = vi.fn() as NextFunction
    const expiresAt = new Date('2026-05-22T10:00:00.000Z')

    mocks.readAdminSessionFromRequest.mockReturnValue({
      email: 'admin@example.com',
      expiresAt,
    })

    requireAdminSession(req, res, next)

    expect(res.locals.adminEmail).toBe('admin@example.com')
    expect(res.locals.adminSessionExpiresAt).toBe(expiresAt)
    expect(next).toHaveBeenCalledOnce()
  })

  it('throws a 401 when no valid admin cookie exists', async () => {
    const req = { headers: {} } as Request
    const res = createResponse()
    const next = vi.fn() as NextFunction

    mocks.readAdminSessionFromRequest.mockReturnValue(null)

    await expect(requireAdminSession(req, res, next)).rejects.toMatchObject<HttpError>({
      statusCode: 401,
      message: 'Admin authentication required',
    })
    expect(next).not.toHaveBeenCalled()
  })
})
