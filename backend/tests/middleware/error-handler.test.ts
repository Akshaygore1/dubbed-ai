import type { Response } from 'express'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { HttpError } from '../../src/lib/http-error.js'
import { errorHandler } from '../../src/middleware/error-handler.js'

const createResponse = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  }

  res.status.mockReturnValue(res)

  return res as unknown as Response & {
    status: ReturnType<typeof vi.fn>
    json: ReturnType<typeof vi.fn>
  }
}

describe('errorHandler', () => {
  it('returns a validation response for Zod errors', () => {
    const res = createResponse()
    const schema = z.object({ email: z.email() })

    const result = schema.safeParse({ email: 'not-an-email' })
    expect(result.success).toBe(false)

    if (!result.success) {
      errorHandler(result.error, {} as never, res, undefined)
    }

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation failed',
      errors: expect.objectContaining({
        fieldErrors: expect.objectContaining({
          email: expect.any(Array),
        }),
      }),
    })
  })

  it('returns the status, message, and details from HttpError', () => {
    const res = createResponse()
    const details = { reason: 'missing-session' }

    errorHandler(new HttpError(401, 'Authentication required', details), {} as never, res, undefined)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Authentication required',
      details,
    })
  })

  it('logs unknown errors and returns a generic 500 response', () => {
    const res = createResponse()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const error = new Error('database exploded')

    errorHandler(error, {} as never, res, undefined)

    expect(consoleError).toHaveBeenCalledWith(error)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal server error',
    })
  })
})
