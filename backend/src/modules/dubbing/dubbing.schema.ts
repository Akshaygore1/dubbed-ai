import { z } from 'zod'

export const createDubbingSchema = z.object({
  sourceLanguage: z.string().min(2).max(10),
  targetLanguage: z.string().min(2).max(10),
})

export const dubbingJobResponseSchema = z.object({
  id: z.string().uuid(),
  videoUrl: z.string().url().nullable(),
  videoKey: z.string().nullable(),
  audioKey: z.string().nullable(),
  audioUrl: z.string().url().nullable(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  dubbedVideoUrl: z.string().url().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type CreateDubbingInput = z.infer<typeof createDubbingSchema>
export type DubbingJobResponse = z.infer<typeof dubbingJobResponseSchema>
