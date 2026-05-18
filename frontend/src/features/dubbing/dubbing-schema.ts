import { z } from 'zod'
import { DUBBING_LANGUAGE_CODES, DUBBING_LANGUAGES } from './dubbing-languages'

export const LANGUAGES = DUBBING_LANGUAGES

const isSupportedLanguageCode = (value: string) => {
  return DUBBING_LANGUAGE_CODES.includes(
    value as (typeof DUBBING_LANGUAGE_CODES)[number],
  )
}

export const dubbingSchema = z.object({
  sourceLanguage: z
    .string()
    .min(1, 'Please select a source language')
    .refine(isSupportedLanguageCode, 'Please select a supported source language'),
  targetLanguage: z
    .string()
    .min(1, 'Please select a target language')
    .refine(isSupportedLanguageCode, 'Please select a supported target language'),
})

export type DubbingFormData = z.infer<typeof dubbingSchema>
