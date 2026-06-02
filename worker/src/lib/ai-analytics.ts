import { env } from '../config/env.js'
import type { aiUsageEvents } from '../db/schema.js'

const SARVAM_STT_WITH_DIARIZATION_RATE_MICROS_PER_SECOND = 12_500
const SARVAM_TRANSLATE_RATE_MICROS_PER_CHARACTER = 2_000
const SMALLEST_TTS_RATE_MICROS_PER_CHARACTER = 25

type AiUsageEventInsert = typeof aiUsageEvents.$inferInsert

type CreateBaseEventInput = {
  queueName: string
  jobId: string
  metadata?: Record<string, unknown>
}

const withMetadata = (
  event: Omit<AiUsageEventInsert, 'metadataJson'>,
  metadata?: Record<string, unknown>,
): AiUsageEventInsert => ({
  ...event,
  metadataJson: metadata ? JSON.stringify(metadata) : null,
})

export const createSarvamTranscriptionUsageEvent = (
  input: CreateBaseEventInput & {
    audioDurationSeconds: number
    withDiarization: boolean
  },
): AiUsageEventInsert => {
  const billableQuantity = Math.max(1, Math.ceil(input.audioDurationSeconds))
  const rateMicros = input.withDiarization
    ? SARVAM_STT_WITH_DIARIZATION_RATE_MICROS_PER_SECOND
    : 0

  return withMetadata(
    {
      queueName: input.queueName,
      jobId: input.jobId,
      provider: 'sarvam',
      operation: 'transcription',
      model: 'saaras:v3',
      billableUnit: 'audio_second',
      billableQuantity,
      currency: 'INR',
      rateMicros,
      estimatedCostMicros: billableQuantity * rateMicros,
    },
    {
      withDiarization: input.withDiarization,
      ...input.metadata,
    },
  )
}

export const createSarvamTranslationUsageEvent = (
  input: CreateBaseEventInput & {
    text: string
    sourceLanguageCode: string
    targetLanguageCode: string
  },
): AiUsageEventInsert => {
  const billableQuantity = input.text.length

  return withMetadata(
    {
      queueName: input.queueName,
      jobId: input.jobId,
      provider: 'sarvam',
      operation: 'translation',
      model: 'mayura:v1',
      billableUnit: 'character',
      billableQuantity,
      currency: 'INR',
      rateMicros: SARVAM_TRANSLATE_RATE_MICROS_PER_CHARACTER,
      estimatedCostMicros:
        billableQuantity * SARVAM_TRANSLATE_RATE_MICROS_PER_CHARACTER,
    },
    {
      sourceLanguageCode: input.sourceLanguageCode,
      targetLanguageCode: input.targetLanguageCode,
      ...input.metadata,
    },
  )
}

export const createSmallestTtsUsageEvent = (
  input: CreateBaseEventInput & {
    text: string
    voiceId: string
    languageCode: string
    speed: number
  },
): AiUsageEventInsert => {
  const billableQuantity = input.text.length

  return withMetadata(
    {
      queueName: input.queueName,
      jobId: input.jobId,
      provider: 'smallest',
      operation: 'tts',
      model: env.SMALLEST_TTS_MODEL,
      billableUnit: 'character',
      billableQuantity,
      currency: 'USD',
      rateMicros: SMALLEST_TTS_RATE_MICROS_PER_CHARACTER,
      estimatedCostMicros: billableQuantity * SMALLEST_TTS_RATE_MICROS_PER_CHARACTER,
    },
    {
      voiceId: input.voiceId,
      languageCode: input.languageCode,
      speed: input.speed,
      ...input.metadata,
    },
  )
}

export const createSmallestVoiceCloneUsageEvent = (
  input: CreateBaseEventInput & {
    languageCode: string
    sampleDurationSeconds: number
  },
): AiUsageEventInsert =>
  withMetadata(
    {
      queueName: input.queueName,
      jobId: input.jobId,
      provider: 'smallest',
      operation: 'voice_clone',
      model: 'voice-cloning',
      billableUnit: 'request',
      billableQuantity: 1,
      currency: null,
      rateMicros: null,
      estimatedCostMicros: null,
    },
    {
      languageCode: input.languageCode,
      sampleDurationSeconds: input.sampleDurationSeconds,
      ...input.metadata,
    },
  )
