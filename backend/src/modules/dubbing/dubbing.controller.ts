import type { Request, Response } from 'express'
import { and, desc, eq } from 'drizzle-orm'
import multer from 'multer'
import { db } from '../../db/client.js'
import { dubbingJobs } from '../../db/schema.js'
import { createDubbingSchema } from './dubbing.schema.js'
import { HttpError } from '../../lib/http-error.js'
import {
  createVideoObjectKey,
  getSignedObjectDownloadUrl,
  getSignedObjectUrl,
  getSignedVideoUrl,
  getStoredVideoUrl,
  uploadVideoToR2,
} from '../../lib/r2.js'
import { publishDubbingJob } from '../../lib/queue.js'

const allowedMimeTypePrefix = 'video/'
export const maxVideoFileSizeBytes = 50 * 1024 * 1024

const selectDubbingJobFields = {
  id: dubbingJobs.id,
  videoUrl: dubbingJobs.videoUrl,
  videoKey: dubbingJobs.videoKey,
  audioKey: dubbingJobs.audioKey,
  dubbedAudioKey: dubbingJobs.dubbedAudioKey,
  dubbedVideoKey: dubbingJobs.dubbedVideoKey,
  sourceLanguage: dubbingJobs.sourceLanguage,
  targetLanguage: dubbingJobs.targetLanguage,
  transcriptionLanguage: dubbingJobs.transcriptionLanguage,
  voiceCloneId: dubbingJobs.voiceCloneId,
  transcriptJson: dubbingJobs.transcriptJson,
  translationJson: dubbingJobs.translationJson,
  status: dubbingJobs.status,
  dubbedVideoUrl: dubbingJobs.dubbedVideoUrl,
  errorMessage: dubbingJobs.errorMessage,
  createdAt: dubbingJobs.createdAt,
  updatedAt: dubbingJobs.updatedAt,
}

type DubbingJobRow = {
  id: string
  videoUrl: string | null
  videoKey: string | null
  audioKey: string | null
  dubbedAudioKey: string | null
  dubbedVideoKey: string | null
  sourceLanguage: string
  targetLanguage: string
  transcriptionLanguage: string | null
  voiceCloneId: string | null
  transcriptJson: string | null
  translationJson: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  dubbedVideoUrl: string | null
  errorMessage: string | null
  createdAt: Date
  updatedAt: Date
}

const parseSegments = (value: string | null) => {
  if (!value) {
    return null
  }

  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

const toDubbingJobResponse = async (
  job: DubbingJobRow,
) => {
  const videoUrl = job.videoKey ? await getSignedVideoUrl(job.videoKey) : job.videoUrl
  const audioUrl = job.audioKey ? await getSignedObjectUrl(job.audioKey) : null
  const dubbedAudioUrl = job.dubbedAudioKey
    ? await getSignedObjectUrl(job.dubbedAudioKey)
    : null
  const dubbedVideoUrl = job.dubbedVideoKey
    ? await getSignedObjectUrl(job.dubbedVideoKey)
    : job.dubbedVideoUrl

  return {
    id: job.id,
    videoUrl,
    videoKey: job.videoKey,
    audioKey: job.audioKey,
    audioUrl,
    dubbedAudioKey: job.dubbedAudioKey,
    dubbedAudioUrl,
    dubbedVideoKey: job.dubbedVideoKey,
    sourceLanguage: job.sourceLanguage,
    targetLanguage: job.targetLanguage,
    transcriptionLanguage: job.transcriptionLanguage,
    voiceCloneId: job.voiceCloneId,
    transcriptSegments: parseSegments(job.transcriptJson),
    translatedSegments: parseSegments(job.translationJson),
    status: job.status,
    dubbedVideoUrl,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  }
}

const getAuthenticatedUserId = (res: Response) => {
  const userId = res.locals.userId

  if (typeof userId !== 'string' || userId.length === 0) {
    throw new HttpError(401, 'Authentication required')
  }

  return userId
}

const getScopedDubbingJob = async (id: string, userId: string) => {
  const [job] = await db
    .select(selectDubbingJobFields)
    .from(dubbingJobs)
    .where(and(eq(dubbingJobs.id, id), eq(dubbingJobs.userId, userId)))

  return job
}

const getJobIdParam = (req: Request) => {
  const idParam = req.params.id

  if (typeof idParam !== 'string') {
    throw new HttpError(400, 'Job id is required')
  }

  return idParam
}

export const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxVideoFileSizeBytes,
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
  const userId = getAuthenticatedUserId(res)
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

  const [job] = await db.insert(dubbingJobs).values({
    userId,
    videoUrl,
    videoKey,
    sourceLanguage: payload.sourceLanguage,
    targetLanguage: payload.targetLanguage,
    status: 'pending',
  }).returning(selectDubbingJobFields)

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

  res.status(201).json({
    success: true,
    message: 'Dubbing job created',
    data: await toDubbingJobResponse(job),
  })
}

export const listDubbingJobs = async (_req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(res)
  const jobs = await db
    .select(selectDubbingJobFields)
    .from(dubbingJobs)
    .where(eq(dubbingJobs.userId, userId))
    .orderBy(desc(dubbingJobs.createdAt))

  res.json({
    success: true,
    data: await Promise.all(jobs.map((job) => toDubbingJobResponse(job))),
  })
}

export const getDubbingJob = async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(res)
  const id = getJobIdParam(req)
  const job = await getScopedDubbingJob(id, userId)

  if (!job) {
    throw new HttpError(404, 'Job not found')
  }

  res.json({
    success: true,
    data: await toDubbingJobResponse(job),
  })
}

export const downloadDubbingJobVideo = async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(res)
  const id = getJobIdParam(req)
  const job = await getScopedDubbingJob(id, userId)

  if (!job) {
    throw new HttpError(404, 'Job not found')
  }

  if (job.status !== 'completed' || !job.dubbedVideoKey) {
    throw new HttpError(409, 'Dubbed video is not ready for download')
  }

  const downloadUrl = await getSignedObjectDownloadUrl(
    job.dubbedVideoKey,
    `dubbed-video-${job.id}.mp4`,
  )

  res.redirect(downloadUrl)
}
