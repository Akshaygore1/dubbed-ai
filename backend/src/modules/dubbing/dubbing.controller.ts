import type { Request, Response } from 'express'
import { and, desc, eq } from 'drizzle-orm'
import multer from 'multer'
import { db } from '../../db/client.js'
import { dubbingJobs, sourceVideos } from '../../db/schema.js'
import { createDubbingSchema } from './dubbing.schema.js'
import { HttpError } from '../../lib/http-error.js'
import {
  createVideoObjectKey,
  deleteObjectsFromR2,
  getSignedObjectDownloadUrl,
  getSignedObjectUrl,
  getStoredVideoUrl,
  uploadVideoToR2,
} from '../../lib/r2.js'
import { publishDubbingJob } from '../../lib/queue.js'

const allowedMimeTypePrefix = 'video/'
export const maxVideoFileSizeBytes = 50 * 1024 * 1024

const versionFields = {
  id: dubbingJobs.id,
  sourceId: dubbingJobs.sourceId,
  audioKey: dubbingJobs.audioKey,
  dubbedAudioKey: dubbingJobs.dubbedAudioKey,
  dubbedVideoKey: dubbingJobs.dubbedVideoKey,
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

const sourceFields = {
  id: sourceVideos.id,
  originalFilename: sourceVideos.originalFilename,
  displayTitle: sourceVideos.displayTitle,
  sourceLanguage: sourceVideos.sourceLanguage,
  videoKey: sourceVideos.videoKey,
  videoUrl: sourceVideos.videoUrl,
  createdAt: sourceVideos.createdAt,
  updatedAt: sourceVideos.updatedAt,
}

type VersionRow = Pick<
  typeof dubbingJobs.$inferSelect,
  | 'id'
  | 'sourceId'
  | 'audioKey'
  | 'dubbedAudioKey'
  | 'dubbedVideoKey'
  | 'targetLanguage'
  | 'transcriptionLanguage'
  | 'voiceCloneId'
  | 'transcriptJson'
  | 'translationJson'
  | 'status'
  | 'dubbedVideoUrl'
  | 'errorMessage'
  | 'createdAt'
  | 'updatedAt'
>
type SourceRow = Pick<
  typeof sourceVideos.$inferSelect,
  | 'id'
  | 'originalFilename'
  | 'displayTitle'
  | 'sourceLanguage'
  | 'videoKey'
  | 'videoUrl'
  | 'createdAt'
  | 'updatedAt'
>

const parseSegments = (value: string | null) => {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

const toVersionResponse = async (job: VersionRow) => ({
  id: job.id,
  sourceId: job.sourceId,
  audioKey: job.audioKey,
  audioUrl: job.audioKey ? await getSignedObjectUrl(job.audioKey) : null,
  dubbedAudioKey: job.dubbedAudioKey,
  dubbedAudioUrl: job.dubbedAudioKey
    ? await getSignedObjectUrl(job.dubbedAudioKey)
    : null,
  dubbedVideoKey: job.dubbedVideoKey,
  targetLanguage: job.targetLanguage,
  transcriptionLanguage: job.transcriptionLanguage,
  voiceCloneId: job.voiceCloneId,
  transcriptSegments: parseSegments(job.transcriptJson),
  translatedSegments: parseSegments(job.translationJson),
  status: job.status,
  dubbedVideoUrl: job.dubbedVideoKey
    ? await getSignedObjectUrl(job.dubbedVideoKey)
    : job.dubbedVideoUrl,
  errorMessage: job.errorMessage,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
})

const toSourceResponse = async (source: SourceRow, versions: VersionRow[]) => ({
  id: source.id,
  originalFilename: source.originalFilename,
  displayTitle: source.displayTitle,
  sourceLanguage: source.sourceLanguage,
  videoKey: source.videoKey,
  videoUrl: source.videoKey ? await getSignedObjectUrl(source.videoKey) : source.videoUrl,
  createdAt: source.createdAt,
  updatedAt: source.updatedAt,
  versions: await Promise.all(versions.map(toVersionResponse)),
})

const getAuthenticatedUserId = (res: Response) => {
  const userId = res.locals.userId
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new HttpError(401, 'Authentication required')
  }
  return userId
}

const getVersionIdParam = (req: Request) => {
  const id = req.params.id
  if (typeof id !== 'string') throw new HttpError(400, 'Language version id is required')
  return id
}

const getScopedVersion = async (id: string, userId: string) => {
  const [row] = await db
    .select({ version: versionFields })
    .from(dubbingJobs)
    .where(and(eq(dubbingJobs.id, id), eq(dubbingJobs.userId, userId)))
  return row
}

const deriveDisplayTitle = (originalFilename: string) => {
  const basename = originalFilename.trim().replace(/^.*[\\/]/, '')
  return basename || 'Untitled source video'
}

export const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxVideoFileSizeBytes },
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
  if (!file) throw new HttpError(400, 'Video file is required')

  const videoKey = createVideoObjectKey(file.originalname)
  await uploadVideoToR2({ key: videoKey, body: file.buffer, contentType: file.mimetype })

  let source: SourceRow
  let job: VersionRow
  try {
    ;({ source, job } = await db.transaction(async (tx) => {
      const [createdSource] = await tx
        .insert(sourceVideos)
        .values({
          userId,
          originalFilename: file.originalname,
          displayTitle: deriveDisplayTitle(file.originalname),
          sourceLanguage: payload.sourceLanguage,
          videoKey,
          videoUrl: getStoredVideoUrl(videoKey),
        })
        .returning(sourceFields)
      if (!createdSource) throw new Error('Failed to create source video')

      const [createdJob] = await tx
        .insert(dubbingJobs)
        .values({ sourceId: createdSource.id, userId, sourceLanguage: payload.sourceLanguage, targetLanguage: payload.targetLanguage, status: 'pending' })
        .returning(versionFields)
      if (!createdJob) throw new Error('Failed to create language version')
      return { source: createdSource, job: createdJob }
    }))
  } catch {
    await deleteObjectsFromR2([videoKey])
    throw new HttpError(500, 'Failed to create source video and language version')
  }

  try {
    await publishDubbingJob({ jobId: job.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to enqueue dubbing job'
    await db.update(dubbingJobs).set({ status: 'failed', errorMessage: message, updatedAt: new Date() }).where(eq(dubbingJobs.id, job.id))
    throw new HttpError(500, 'Failed to enqueue dubbing job')
  }

  res.status(201).json({
    success: true,
    message: 'Source video and language version created',
    data: await toSourceResponse(source, [job]),
  })
}

export const listDubbingJobs = async (_req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(res)
  const rows = await db
    .select({ source: sourceFields, version: versionFields })
    .from(sourceVideos)
    .leftJoin(dubbingJobs, eq(dubbingJobs.sourceId, sourceVideos.id))
    .where(eq(sourceVideos.userId, userId))
    .orderBy(desc(sourceVideos.updatedAt), desc(dubbingJobs.updatedAt))

  const grouped = new Map<string, { source: SourceRow; versions: VersionRow[] }>()
  for (const row of rows) {
    const group = grouped.get(row.source.id) ?? { source: row.source, versions: [] }
    if (row.version) group.versions.push(row.version)
    grouped.set(row.source.id, group)
  }
  res.json({ success: true, data: await Promise.all([...grouped.values()].map(({ source, versions }) => toSourceResponse(source, versions))) })
}

export const getDubbingJob = async (req: Request, res: Response) => {
  const row = await getScopedVersion(getVersionIdParam(req), getAuthenticatedUserId(res))
  if (!row) throw new HttpError(404, 'Language version not found')
  res.json({ success: true, data: await toVersionResponse(row.version) })
}

export const downloadDubbingJobVideo = async (req: Request, res: Response) => {
  const row = await getScopedVersion(getVersionIdParam(req), getAuthenticatedUserId(res))
  if (!row) throw new HttpError(404, 'Language version not found')
  if (row.version.status !== 'completed' || !row.version.dubbedVideoKey) throw new HttpError(409, 'Dubbed video is not ready for download')
  const url = await getSignedObjectDownloadUrl(row.version.dubbedVideoKey, `dubbed-video-${row.version.id}.mp4`)
  res.redirect(url)
}

// Kept as a backwards-compatible endpoint. It removes only version-owned artifacts;
// the reusable source media is intentionally retained.
export const deleteDubbingJob = async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(res)
  const row = await getScopedVersion(getVersionIdParam(req), userId)
  if (!row) throw new HttpError(404, 'Language version not found')
  if (row.version.status === 'pending' || row.version.status === 'processing') throw new HttpError(409, 'Active language versions cannot be deleted')
  await deleteObjectsFromR2([row.version.audioKey, row.version.dubbedAudioKey, row.version.dubbedVideoKey].filter((key): key is string => Boolean(key)))
  await db.delete(dubbingJobs).where(and(eq(dubbingJobs.id, row.version.id), eq(dubbingJobs.userId, userId)))
  res.status(204).send()
}
