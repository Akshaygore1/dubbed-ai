import type { Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '../../src/lib/http-error.js'
import { dubbingJobs } from '../../src/db/schema.js'
import {
  createDubbingJob,
  downloadDubbingJobVideo,
  getDubbingJob,
  listDubbingJobs,
} from '../../src/modules/dubbing/dubbing.controller.js'

const mocks = vi.hoisted(() => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
  },
  and: vi.fn((...conditions: unknown[]) => ({ op: 'and', conditions })),
  desc: vi.fn((column: unknown) => ({ op: 'desc', column })),
  eq: vi.fn((column: unknown, value: unknown) => ({ op: 'eq', column, value })),
  createVideoObjectKey: vi.fn(),
  getSignedObjectDownloadUrl: vi.fn(),
  getSignedObjectUrl: vi.fn(),
  getSignedVideoUrl: vi.fn(),
  getStoredVideoUrl: vi.fn(),
  uploadVideoToR2: vi.fn(),
  publishDubbingJob: vi.fn(),
}))

vi.mock('../../src/db/client.js', () => ({
  db: mocks.db,
}))

vi.mock('drizzle-orm', () => ({
  and: mocks.and,
  desc: mocks.desc,
  eq: mocks.eq,
}))

vi.mock('../../src/lib/r2.js', () => ({
  createVideoObjectKey: mocks.createVideoObjectKey,
  getSignedObjectDownloadUrl: mocks.getSignedObjectDownloadUrl,
  getSignedObjectUrl: mocks.getSignedObjectUrl,
  getSignedVideoUrl: mocks.getSignedVideoUrl,
  getStoredVideoUrl: mocks.getStoredVideoUrl,
  uploadVideoToR2: mocks.uploadVideoToR2,
}))

vi.mock('../../src/lib/queue.js', () => ({
  publishDubbingJob: mocks.publishDubbingJob,
}))

type MockResponse = Response & {
  status: ReturnType<typeof vi.fn>
  json: ReturnType<typeof vi.fn>
  redirect: ReturnType<typeof vi.fn>
}

const createdAt = new Date('2026-05-18T10:00:00.000Z')
const updatedAt = new Date('2026-05-18T10:01:00.000Z')

const baseJob = {
  id: '1b27a0eb-5a81-49f1-945d-13eb78cfc8c7',
  videoUrl: 'r2://videos/input.mp4',
  videoKey: 'videos/input.mp4',
  audioKey: null,
  dubbedAudioKey: null,
  dubbedVideoKey: null,
  sourceLanguage: 'en-IN',
  targetLanguage: 'hi-IN',
  transcriptionLanguage: null,
  voiceCloneId: null,
  transcriptJson: null,
  translationJson: null,
  status: 'pending' as const,
  dubbedVideoUrl: null,
  errorMessage: null,
  createdAt,
  updatedAt,
}

const createResponse = (userId: string | undefined = 'user_123') => {
  const res = {
    locals: userId ? { userId } : {},
    status: vi.fn(),
    json: vi.fn(),
    redirect: vi.fn(),
  }

  res.status.mockReturnValue(res)

  return res as unknown as MockResponse
}

const createVideoRequest = () =>
  ({
    body: {
      sourceLanguage: 'en-IN',
      targetLanguage: 'hi-IN',
    },
    file: {
      originalname: 'input.mp4',
      mimetype: 'video/mp4',
      buffer: Buffer.from('video-bytes'),
    },
  }) as Request

const mockInsertReturning = (rows: unknown[]) => {
  const returning = vi.fn().mockResolvedValue(rows)
  const values = vi.fn(() => ({ returning }))
  mocks.db.insert.mockReturnValue({ values })

  return { returning, values }
}

const mockUpdateWhere = () => {
  const where = vi.fn().mockResolvedValue(undefined)
  const set = vi.fn(() => ({ where }))
  mocks.db.update.mockReturnValue({ set })

  return { set, where }
}

const mockSelectWhere = (rows: unknown[]) => {
  const where = vi.fn().mockResolvedValue(rows)
  const from = vi.fn(() => ({ where }))
  mocks.db.select.mockReturnValue({ from })

  return { from, where }
}

const mockSelectList = (rows: unknown[]) => {
  const orderBy = vi.fn().mockResolvedValue(rows)
  const where = vi.fn(() => ({ orderBy }))
  const from = vi.fn(() => ({ where }))
  mocks.db.select.mockReturnValue({ from })

  return { from, orderBy, where }
}

describe('dubbing controller', () => {
  beforeEach(() => {
    mocks.createVideoObjectKey.mockReturnValue('videos/generated-input.mp4')
    mocks.getStoredVideoUrl.mockReturnValue('r2://videos/generated-input.mp4')
    mocks.getSignedObjectDownloadUrl.mockResolvedValue('https://cdn.test/dubbed/output.mp4?download=1')
    mocks.getSignedVideoUrl.mockResolvedValue('https://cdn.test/videos/input.mp4')
    mocks.getSignedObjectUrl.mockImplementation(async (key: string) => `https://cdn.test/${key}`)
    mocks.uploadVideoToR2.mockResolvedValue(undefined)
    mocks.publishDubbingJob.mockResolvedValue(undefined)
  })

  describe('createDubbingJob', () => {
    it('uploads the video, creates a user-owned job, enqueues work, and responds with the job', async () => {
      const req = createVideoRequest()
      const res = createResponse()
      const { values } = mockInsertReturning([baseJob])

      await createDubbingJob(req, res)

      expect(mocks.uploadVideoToR2).toHaveBeenCalledWith({
        key: 'videos/generated-input.mp4',
        body: Buffer.from('video-bytes'),
        contentType: 'video/mp4',
      })
      expect(values).toHaveBeenCalledWith({
        userId: 'user_123',
        videoUrl: 'r2://videos/generated-input.mp4',
        videoKey: 'videos/generated-input.mp4',
        sourceLanguage: 'en-IN',
        targetLanguage: 'hi-IN',
        status: 'pending',
      })
      expect(mocks.publishDubbingJob).toHaveBeenCalledWith({ jobId: baseJob.id })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Dubbing job created',
        data: expect.objectContaining({
          id: baseJob.id,
          videoUrl: 'https://cdn.test/videos/input.mp4',
          sourceLanguage: 'en-IN',
          targetLanguage: 'hi-IN',
          status: 'pending',
        }),
      })
    })

    it('throws a 401 when the authenticated user id is missing', async () => {
      await expect(createDubbingJob(createVideoRequest(), createResponse(''))).rejects.toMatchObject<HttpError>({
        statusCode: 401,
        message: 'Authentication required',
      })
    })

    it('throws a 400 when no video file is attached', async () => {
      const req = {
        body: {
          sourceLanguage: 'en-IN',
          targetLanguage: 'hi-IN',
        },
      } as Request

      await expect(createDubbingJob(req, createResponse())).rejects.toMatchObject<HttpError>({
        statusCode: 400,
        message: 'Video file is required',
      })
    })

    it('marks the job failed and throws when queue publishing fails', async () => {
      const update = mockUpdateWhere()
      mockInsertReturning([baseJob])
      mocks.publishDubbingJob.mockRejectedValue(new Error('queue unavailable'))

      await expect(createDubbingJob(createVideoRequest(), createResponse())).rejects.toMatchObject<HttpError>({
        statusCode: 500,
        message: 'Failed to enqueue dubbing job',
      })

      expect(update.set).toHaveBeenCalledWith({
        status: 'failed',
        errorMessage: 'queue unavailable',
        updatedAt: expect.any(Date),
      })
      expect(mocks.eq).toHaveBeenCalledWith(dubbingJobs.id, baseJob.id)
      expect(update.where).toHaveBeenCalled()
    })
  })

  describe('listDubbingJobs', () => {
    it('returns only jobs scoped to the authenticated user', async () => {
      const transcriptSegments = [{ index: 0, sourceText: 'Hello' }]
      const job = {
        ...baseJob,
        audioKey: 'audio/source.wav',
        dubbedAudioKey: 'audio/dubbed.wav',
        transcriptJson: JSON.stringify(transcriptSegments),
        translationJson: 'not json',
      }
      const query = mockSelectList([job])
      const res = createResponse()

      await listDubbingJobs({} as Request, res)

      expect(mocks.eq).toHaveBeenCalledWith(dubbingJobs.userId, 'user_123')
      expect(query.where).toHaveBeenCalledWith({ op: 'eq', column: dubbingJobs.userId, value: 'user_123' })
      expect(query.orderBy).toHaveBeenCalledWith({ op: 'desc', column: dubbingJobs.createdAt })
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [
          expect.objectContaining({
            id: baseJob.id,
            audioUrl: 'https://cdn.test/audio/source.wav',
            dubbedAudioUrl: 'https://cdn.test/audio/dubbed.wav',
            transcriptSegments,
            translatedSegments: null,
          }),
        ],
      })
    })
  })

  describe('getDubbingJob', () => {
    it('returns a user-scoped job by id', async () => {
      const query = mockSelectWhere([baseJob])
      const res = createResponse()

      await getDubbingJob({ params: { id: baseJob.id } } as unknown as Request, res)

      expect(mocks.eq).toHaveBeenCalledWith(dubbingJobs.id, baseJob.id)
      expect(mocks.eq).toHaveBeenCalledWith(dubbingJobs.userId, 'user_123')
      expect(query.where).toHaveBeenCalledWith({
        op: 'and',
        conditions: [
          { op: 'eq', column: dubbingJobs.id, value: baseJob.id },
          { op: 'eq', column: dubbingJobs.userId, value: 'user_123' },
        ],
      })
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: baseJob.id,
          videoUrl: 'https://cdn.test/videos/input.mp4',
        }),
      })
    })

    it('throws a 400 when the job id param is missing', async () => {
      await expect(getDubbingJob({ params: {} } as Request, createResponse())).rejects.toMatchObject<HttpError>({
        statusCode: 400,
        message: 'Job id is required',
      })
    })

    it('throws a 404 when no scoped job is found', async () => {
      mockSelectWhere([])

      await expect(
        getDubbingJob({ params: { id: baseJob.id } } as unknown as Request, createResponse()),
      ).rejects.toMatchObject<HttpError>({
        statusCode: 404,
        message: 'Job not found',
      })
    })
  })

  describe('downloadDubbingJobVideo', () => {
    it('throws a 401 when the authenticated user id is missing', async () => {
      await expect(
        downloadDubbingJobVideo({ params: { id: baseJob.id } } as unknown as Request, createResponse('')),
      ).rejects.toMatchObject<HttpError>({
        statusCode: 401,
        message: 'Authentication required',
      })
    })

    it('redirects a completed scoped job to a signed attachment URL', async () => {
      const completedJob = {
        ...baseJob,
        status: 'completed' as const,
        dubbedVideoKey: 'dubbed/output.mp4',
      }
      const res = createResponse()
      mockSelectWhere([completedJob])

      await downloadDubbingJobVideo({ params: { id: baseJob.id } } as unknown as Request, res)

      expect(mocks.eq).toHaveBeenCalledWith(dubbingJobs.id, baseJob.id)
      expect(mocks.eq).toHaveBeenCalledWith(dubbingJobs.userId, 'user_123')
      expect(mocks.getSignedObjectDownloadUrl).toHaveBeenCalledWith(
        'dubbed/output.mp4',
        `dubbed-video-${baseJob.id}.mp4`,
      )
      expect(res.redirect).toHaveBeenCalledWith('https://cdn.test/dubbed/output.mp4?download=1')
    })

    it('throws a 404 when no scoped job is found for download', async () => {
      mockSelectWhere([])

      await expect(
        downloadDubbingJobVideo({ params: { id: baseJob.id } } as unknown as Request, createResponse()),
      ).rejects.toMatchObject<HttpError>({
        statusCode: 404,
        message: 'Job not found',
      })
    })

    it('throws a 409 when the processed video is not ready', async () => {
      mockSelectWhere([baseJob])

      await expect(
        downloadDubbingJobVideo({ params: { id: baseJob.id } } as unknown as Request, createResponse()),
      ).rejects.toMatchObject<HttpError>({
        statusCode: 409,
        message: 'Dubbed video is not ready for download',
      })
    })
  })
})
