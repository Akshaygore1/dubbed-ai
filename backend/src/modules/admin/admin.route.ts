import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler.js'
import { requireAdminSession } from '../../middleware/require-admin-session.js'
import {
  approveAdminUser,
  getAdminAiAnalytics,
  getAdminSession,
  listAdminUsers,
  loginAdmin,
  logoutAdmin,
} from './admin.controller.js'

export const adminRouter = Router()

adminRouter.post('/login', asyncHandler(loginAdmin))
adminRouter.post('/logout', asyncHandler(logoutAdmin))
adminRouter.get('/session', asyncHandler(requireAdminSession), asyncHandler(getAdminSession))
adminRouter.get('/ai-analytics', asyncHandler(requireAdminSession), asyncHandler(getAdminAiAnalytics))
adminRouter.get('/users', asyncHandler(requireAdminSession), asyncHandler(listAdminUsers))
adminRouter.post('/users/:id/approve', asyncHandler(requireAdminSession), asyncHandler(approveAdminUser))
