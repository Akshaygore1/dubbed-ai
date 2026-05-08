import type { Request, Response } from 'express'
import { eq } from 'drizzle-orm'
import multer from 'multer'
import { db } from '../../db/client.js'
import { dubbingJobs } from '../../db/schema.js'
import { createDubbingSchema } from './dubbing.schema.js'
import { HttpError } from '../../lib/http-error.js'
import { createVideoObjectKey, getSignedVideoUrl, getStoredVideoUrl, uploadVideoToR2 } from '../../lib/r2.js'
import { publishDubbingJob } from '../../lib/queue.js'

const allowedMimeTypePrefix = 'video/'

export const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith(allowedMimeTypePrefix)) {
      callback(new HttpError(400, 'Only video uploads are allowed'))
      return
    }

    callback(null, true)
  },
})

export const createDubbingJob = async (req: Request, res: Response) => {
  const payload = createDubbingSchema.parse(req.body)
  const file = req.file

  if (!file) {
    throw new HttpError(400, 'Video file is required')
  }

  const videoKey = createVideoObjectKey(file.originalname)

  await uploadVideoToR2({
    key: videoKey,
    body: file.buffer,
    contentType: file.mimetype,
  })

  const videoUrl = getStoredVideoUrl(videoKey)
  const signedVideoUrl = await getSignedVideoUrl(videoKey)

  const [job] = await db.insert(dubbingJobs).values({
    videoUrl,
    videoKey,
    sourceLanguage: payload.sourceLanguage,
    targetLanguage: payload.targetLanguage,
    status: 'pending',
  }).returning({
    id: dubbingJobs.id,
    videoUrl: dubbingJobs.videoUrl,
    videoKey: dubbingJobs.videoKey,
    audioKey: dubbingJobs.audioKey,
    sourceLanguage: dubbingJobs.sourceLanguage,
    targetLanguage: dubbingJobs.targetLanguage,
    status: dubbingJobs.status,
    dubbedVideoUrl: dubbingJobs.dubbedVideoUrl,
    errorMessage: dubbingJobs.errorMessage,
    createdAt: dubbingJobs.createdAt,
    updatedAt: dubbingJobs.updatedAt,
  })

  if (!job) {
    throw new HttpError(500, 'Failed to create dubbing job')
  }

  try {
    await publishDubbingJob({ jobId: job.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to enqueue dubbing job'

    await db
      .update(dubbingJobs)
      .set({
        status: 'failed',
        errorMessage: message,
        updatedAt: new Date(),
      })
      .where(eq(dubbingJobs.id, job.id))

    throw new HttpError(500, 'Failed to enqueue dubbing job')
  }

  const responseVideoUrl = job.videoKey ? signedVideoUrl : job.videoUrl

  res.status(201).json({
    success: true,
    message: 'Dubbing job created',
    data: {
      ...job,
      audioUrl: null,
      videoUrl: responseVideoUrl,
    },
  })
}

export const getDubbingJob = async (req: Request, res: Response) => {
  const idParam = req.params.id

  if (typeof idParam !== 'string') {
    throw new HttpError(400, 'Job id is required')
  }

  const id = idParam

  const [job] = await db.select({
    id: dubbingJobs.id,
    videoUrl: dubbingJobs.videoUrl,
    videoKey: dubbingJobs.videoKey,
    audioKey: dubbingJobs.audioKey,
    sourceLanguage: dubbingJobs.sourceLanguage,
    targetLanguage: dubbingJobs.targetLanguage,
    status: dubbingJobs.status,
    dubbedVideoUrl: dubbingJobs.dubbedVideoUrl,
    errorMessage: dubbingJobs.errorMessage,
    createdAt: dubbingJobs.createdAt,
    updatedAt: dubbingJobs.updatedAt,
  }).from(dubbingJobs).where(eq(dubbingJobs.id, id))

  if (!job) {
    throw new HttpError(404, 'Job not found')
  }

  const videoUrl = job.videoKey ? await getSignedVideoUrl(job.videoKey) : job.videoUrl
  const audioUrl = job.audioKey ? await getSignedVideoUrl(job.audioKey) : null

  res.json({
    success: true,
    data: {
      ...job,
      audioUrl,
      videoUrl,
    },
  })
}
