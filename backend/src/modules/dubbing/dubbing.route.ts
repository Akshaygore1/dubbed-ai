import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler.js'
import { requireApprovedUser } from '../../middleware/require-approved-user.js'
import {
  createDubbingJob,
  createDubbingUpload,
  createSourceVersion,
  deleteDubbingJob,
  downloadDubbingJobVideo,
  getDubbingJob,
  listDubbingJobs,
} from './dubbing.controller.js'

export const dubbingRouter = Router()

dubbingRouter.use(asyncHandler(requireApprovedUser))
dubbingRouter.post('/uploads', asyncHandler(createDubbingUpload))
dubbingRouter.post('/', asyncHandler(createDubbingJob))
dubbingRouter.get('/', asyncHandler(listDubbingJobs))
dubbingRouter.post('/sources/:sourceId/versions', asyncHandler(createSourceVersion))
dubbingRouter.get('/:id/download', asyncHandler(downloadDubbingJobVideo))
dubbingRouter.delete('/:id', asyncHandler(deleteDubbingJob))
dubbingRouter.get('/:id', asyncHandler(getDubbingJob))
