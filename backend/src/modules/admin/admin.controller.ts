import type { Request, Response } from 'express'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { env } from '../../config/env.js'
import { db } from '../../db/client.js'
import { user } from '../../db/schema.js'
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

const selectAdminUserFields = {
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  approvalStatus: user.approvalStatus,
  approvedAt: user.approvedAt,
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
