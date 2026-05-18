import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler.js'
import { createDubbingJob, getDubbingJob, listDubbingJobs, uploadVideo } from './dubbing.controller.js'

export const dubbingRouter = Router()

dubbingRouter.post('/', uploadVideo.single('video'), asyncHandler(createDubbingJob))
dubbingRouter.get('/', asyncHandler(listDubbingJobs))
dubbingRouter.get('/:id', asyncHandler(getDubbingJob))
