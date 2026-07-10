import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler.js'
import { requireApprovedUser } from '../../middleware/require-approved-user.js'
import {
  createDubbingJob,
  deleteDubbingJob,
  downloadDubbingJobVideo,
  getDubbingJob,
  listDubbingJobs,
  uploadVideo,
} from './dubbing.controller.js'

export const dubbingRouter = Router()

dubbingRouter.use(asyncHandler(requireApprovedUser))
dubbingRouter.post(
  '/',
  uploadVideo.single('video'),
  asyncHandler(createDubbingJob),
)
dubbingRouter.get('/', asyncHandler(listDubbingJobs))
dubbingRouter.get('/:id/download', asyncHandler(downloadDubbingJobVideo))
dubbingRouter.delete('/:id', asyncHandler(deleteDubbingJob))
dubbingRouter.get('/:id', asyncHandler(getDubbingJob))
