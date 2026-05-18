const SARVAM_LANGUAGE_CODES = [
  'as-IN',
  'bn-IN',
  'brx-IN',
  'doi-IN',
  'en-IN',
  'gu-IN',
  'hi-IN',
  'kn-IN',
  'kok-IN',
  'ks-IN',
  'mai-IN',
  'ml-IN',
  'mni-IN',
  'mr-IN',
  'ne-IN',
  'od-IN',
  'pa-IN',
  'sa-IN',
  'sat-IN',
  'sd-IN',
  'ta-IN',
  'te-IN',
  'ur-IN',
] as const

const SARVAM_LANGUAGE_ALIASES: Record<string, (typeof SARVAM_LANGUAGE_CODES)[number]> = {
  as: 'as-IN',
  'as-in': 'as-IN',
  bn: 'bn-IN',
  'bn-in': 'bn-IN',
  brx: 'brx-IN',
  'brx-in': 'brx-IN',
  doi: 'doi-IN',
  'doi-in': 'doi-IN',
  en: 'en-IN',
  'en-in': 'en-IN',
  gu: 'gu-IN',
  'gu-in': 'gu-IN',
  hi: 'hi-IN',
  'hi-in': 'hi-IN',
  kn: 'kn-IN',
  'kn-in': 'kn-IN',
  kok: 'kok-IN',
  'kok-in': 'kok-IN',
  ks: 'ks-IN',
  'ks-in': 'ks-IN',
  mai: 'mai-IN',
  'mai-in': 'mai-IN',
  ml: 'ml-IN',
  'ml-in': 'ml-IN',
  mni: 'mni-IN',
  'mni-in': 'mni-IN',
  mr: 'mr-IN',
  'mr-in': 'mr-IN',
  ne: 'ne-IN',
  'ne-in': 'ne-IN',
  od: 'od-IN',
  or: 'od-IN',
  'od-in': 'od-IN',
  'or-in': 'od-IN',
  pa: 'pa-IN',
  'pa-in': 'pa-IN',
  sa: 'sa-IN',
  'sa-in': 'sa-IN',
  sat: 'sat-IN',
  'sat-in': 'sat-IN',
  sd: 'sd-IN',
  'sd-in': 'sd-IN',
  ta: 'ta-IN',
  'ta-in': 'ta-IN',
  te: 'te-IN',
  'te-in': 'te-IN',
  ur: 'ur-IN',
  'ur-in': 'ur-IN',
} as const

export type SarvamLanguageCode = (typeof SARVAM_LANGUAGE_CODES)[number]

export const sarvamLanguageCodes = [...SARVAM_LANGUAGE_CODES]

export const normalizeSarvamLanguageCode = (languageCode: string) => {
  const normalizedCode = languageCode.trim().toLowerCase()
  return SARVAM_LANGUAGE_ALIASES[normalizedCode] ?? null
}

export const assertSarvamLanguageCode = (languageCode: string, label: string) => {
  const normalizedCode = normalizeSarvamLanguageCode(languageCode)

  if (normalizedCode) {
    return normalizedCode
  }

  throw new Error(
    `${label} "${languageCode}" is not supported. Expected one of: ${sarvamLanguageCodes.join(', ')}`,
  )
}
