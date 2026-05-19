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

  it('rejects unsupported language codes', () => {
    const result = createDubbingSchema.safeParse({
      sourceLanguage: 'klingon',
      targetLanguage: 'hi-IN',
    })

    expect(result.success).toBe(false)
  })

  it('rejects missing language fields', () => {
    const result = createDubbingSchema.safeParse({
      sourceLanguage: 'en-IN',
    })

    expect(result.success).toBe(false)
  })
})
