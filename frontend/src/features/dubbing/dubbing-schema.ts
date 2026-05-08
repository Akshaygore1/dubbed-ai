import { z } from 'zod'

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
] as const

export const dubbingSchema = z.object({
  sourceLanguage: z.string().min(1, 'Please select a source language'),
  targetLanguage: z.string().min(1, 'Please select a target language'),
})

export type DubbingFormData = z.infer<typeof dubbingSchema>
