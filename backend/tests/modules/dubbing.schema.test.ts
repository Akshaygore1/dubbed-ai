import { describe, expect, it } from 'vitest'
import { createDubbingSchema } from '../../src/modules/dubbing/dubbing.schema.js'

describe('createDubbingSchema', () => {
  it('accepts supported source and target language codes', () => {
    const result = createDubbingSchema.safeParse({
      sourceLanguage: 'en-IN',
      targetLanguage: 'hi-IN',
    })

    expect(result.success).toBe(true)
  })

  it('accepts auto-detected source language', () => {
    const result = createDubbingSchema.safeParse({
      sourceLanguage: 'auto',
      targetLanguage: 'hi-IN',
    })

    expect(result.success).toBe(true)
  })

  it('defaults missing source language to auto', () => {
    const result = createDubbingSchema.safeParse({
      targetLanguage: 'hi-IN',
    })

    expect(result).toMatchObject({
      success: true,
      data: {
        sourceLanguage: 'auto',
        targetLanguage: 'hi-IN',
      },
    })
  })

  it('rejects unsupported language codes', () => {
    const result = createDubbingSchema.safeParse({
      sourceLanguage: 'klingon',
      targetLanguage: 'hi-IN',
    })

    expect(result.success).toBe(false)
  })

  it('rejects removed language codes', () => {
    const result = createDubbingSchema.safeParse({
      sourceLanguage: 'en-IN',
      targetLanguage: 'ur-IN',
    })

    expect(result.success).toBe(false)
  })

  it('rejects matching manual source and target language codes', () => {
    const result = createDubbingSchema.safeParse({
      sourceLanguage: 'hi-IN',
      targetLanguage: 'hi-IN',
    })

    expect(result.success).toBe(false)
  })

  it('rejects missing target language fields', () => {
    const result = createDubbingSchema.safeParse({
      sourceLanguage: 'en-IN',
    })

    expect(result.success).toBe(false)
  })
})
