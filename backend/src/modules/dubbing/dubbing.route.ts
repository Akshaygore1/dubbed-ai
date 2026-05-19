import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler.js'
import { requireAuth } from '../../middleware/require-auth.js'
import {
  createDubbingJob,
  downloadDubbingJobVideo,
  getDubbingJob,
  listDubbingJobs,
  uploadVideo,
} from './dubbing.controller.js'

export const dubbingRouter = Router()

dubbingRouter.use(asyncHandler(requireAuth))
dubbingRouter.post('/', uploadVideo.single('video'), asyncHandler(createDubbingJob))
dubbingRouter.get('/', asyncHandler(listDubbingJobs))
dubbingRouter.get('/:id/download', asyncHandler(downloadDubbingJobVideo))
dubbingRouter.get('/:id', asyncHandler(getDubbingJob))
