import type { NextFunction, Request, Response } from 'express'
import { readAdminSessionFromRequest } from '../lib/admin-session.js'
import { HttpError } from '../lib/http-error.js'

export const requireAdminSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const adminSession = readAdminSessionFromRequest(req)

  if (!adminSession) {
    throw new HttpError(401, 'Admin authentication required')
  }

  res.locals.adminEmail = adminSession.email
  res.locals.adminSessionExpiresAt = adminSession.expiresAt
  next()
}
