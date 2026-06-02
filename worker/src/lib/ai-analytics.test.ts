import { describe, expect, it } from 'vitest'
import {
  createSarvamTranscriptionUsageEvent,
  createSarvamTranslationUsageEvent,
  createSmallestTtsUsageEvent,
  createSmallestVoiceCloneUsageEvent,
} from './ai-analytics.js'

describe('ai analytics usage events', () => {
  it('rounds sarvam transcription to whole billable seconds', () => {
    const event = createSarvamTranscriptionUsageEvent({
      queueName: 'dubbing-job',
      jobId: '00000000-0000-0000-0000-000000000001',
      audioDurationSeconds: 61.2,
      withDiarization: true,
    })

    expect(event.billableQuantity).toBe(62)
    expect(event.rateMicros).toBe(12_500)
    expect(event.estimatedCostMicros).toBe(775_000)
  })

  it('prices sarvam translation by source characters', () => {
    const event = createSarvamTranslationUsageEvent({
      queueName: 'dubbing-job',
      jobId: '00000000-0000-0000-0000-000000000001',
      text: 'hello',
      sourceLanguageCode: 'en-IN',
      targetLanguageCode: 'hi-IN',
    })

    expect(event.billableQuantity).toBe(5)
    expect(event.currency).toBe('INR')
    expect(event.rateMicros).toBe(2_000)
    expect(event.estimatedCostMicros).toBe(10_000)
  })

  it('prices smallest tts by characters', () => {
    const event = createSmallestTtsUsageEvent({
      queueName: 'dubbing-job',
      jobId: '00000000-0000-0000-0000-000000000001',
      text: 'welcome',
      voiceId: 'voice_123',
      languageCode: 'hi-IN',
      speed: 1,
    })

    expect(event.billableQuantity).toBe(7)
    expect(event.currency).toBe('USD')
    expect(event.rateMicros).toBe(25)
    expect(event.estimatedCostMicros).toBe(175)
  })

  it('marks smallest voice cloning as unpriced usage', () => {
    const event = createSmallestVoiceCloneUsageEvent({
      queueName: 'dubbing-job',
      jobId: '00000000-0000-0000-0000-000000000001',
      languageCode: 'hi-IN',
      sampleDurationSeconds: 9.5,
    })

    expect(event.billableQuantity).toBe(1)
    expect(event.currency).toBeNull()
    expect(event.rateMicros).toBeNull()
    expect(event.estimatedCostMicros).toBeNull()
    expect(event.metadataJson).toContain('sampleDurationSeconds')
  })
})
