import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Request, Response } from 'express'
import { env } from '../config/env.js'

const adminSessionCookieName = 'admin_session'

type AdminSessionPayload = {
  email: string
  expiresAt: string
}

const base64UrlEncode = (value: string) => Buffer.from(value).toString('base64url')

const base64UrlDecode = (value: string) =>
  Buffer.from(value, 'base64url').toString('utf8')

const createSignature = (payload: string) =>
  createHmac('sha256', env.ADMIN_SESSION_SECRET).update(payload).digest('base64url')

const parseCookies = (req: Request) => {
  const cookieHeader = req.headers.cookie

  if (!cookieHeader) {
    return new Map<string, string>()
  }

  return new Map(
    cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .map((cookie) => {
        const separatorIndex = cookie.indexOf('=')
        const key = separatorIndex >= 0 ? cookie.slice(0, separatorIndex) : cookie
        const value = separatorIndex >= 0 ? cookie.slice(separatorIndex + 1) : ''
        return [key, decodeURIComponent(value)] as const
      }),
  )
}

export const createAdminSessionToken = () => {
  const expiresAt = new Date(Date.now() + env.ADMIN_SESSION_TTL_HOURS * 60 * 60 * 1000)
  const payload = base64UrlEncode(
    JSON.stringify({
      email: env.ADMIN_EMAIL,
      expiresAt: expiresAt.toISOString(),
    } satisfies AdminSessionPayload),
  )

  const signature = createSignature(payload)

  return {
    token: `${payload}.${signature}`,
    expiresAt,
  }
}

export const verifyAdminSessionToken = (token: string) => {
  const [payload, signature] = token.split('.')

  if (!payload || !signature) {
    return null
  }

  const expectedSignature = createSignature(payload)
  const provided = Buffer.from(signature)
  const expected = Buffer.from(expectedSignature)

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as AdminSessionPayload

    if (parsed.email !== env.ADMIN_EMAIL) {
      return null
    }

    const expiresAt = new Date(parsed.expiresAt)

    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      return null
    }

    return {
      email: parsed.email,
      expiresAt,
    }
  } catch {
    return null
  }
}

export const readAdminSessionFromRequest = (req: Request) => {
  const token = parseCookies(req).get(adminSessionCookieName)

  if (!token) {
    return null
  }

  return verifyAdminSessionToken(token)
}

export const setAdminSessionCookie = (
  res: Response,
  session: {
    token: string
    expiresAt: Date
  },
) => {
  res.cookie(adminSessionCookieName, session.token, {
    httpOnly: true,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production',
    expires: session.expiresAt,
    path: '/',
  })
}

export const clearAdminSessionCookie = (res: Response) => {
  res.clearCookie(adminSessionCookieName, {
    httpOnly: true,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  })
}

export const adminSessionCookie = {
  name: adminSessionCookieName,
}
