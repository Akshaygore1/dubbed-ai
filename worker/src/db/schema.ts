import {
  bigint,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const jobStatusEnum = pgEnum('job_status', ['pending', 'processing', 'completed', 'failed'])
export const aiProviderEnum = pgEnum('ai_provider', ['sarvam', 'smallest'])
export const aiOperationEnum = pgEnum('ai_operation', [
  'transcription',
  'translation',
  'voice_clone',
  'tts',
])
export const aiBillableUnitEnum = pgEnum('ai_billable_unit', [
  'audio_second',
  'character',
  'request',
])
export const aiCurrencyEnum = pgEnum('ai_currency', ['INR', 'USD'])

export const dubbingJobs = pgTable('dubbing_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id'),
  videoUrl: text('video_url'),
  videoKey: text('video_key'),
  audioKey: text('audio_key'),
  dubbedAudioKey: text('dubbed_audio_key'),
  dubbedVideoKey: text('dubbed_video_key'),
  sourceLanguage: text('source_language').notNull(),
  targetLanguage: text('target_language').notNull(),
  transcriptionLanguage: text('transcription_language'),
  voiceCloneId: text('voice_clone_id'),
  transcriptJson: text('transcript_json'),
  translationJson: text('translation_json'),
  status: jobStatusEnum('status').notNull().default('pending'),
  dubbedVideoUrl: text('dubbed_video_url'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const aiUsageEvents = pgTable('ai_usage_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  queueName: text('queue_name').notNull(),
  jobId: uuid('job_id').references(() => dubbingJobs.id, {
    onDelete: 'set null',
  }),
  provider: aiProviderEnum('provider').notNull(),
  operation: aiOperationEnum('operation').notNull(),
  model: text('model'),
  billableUnit: aiBillableUnitEnum('billable_unit').notNull(),
  billableQuantity: integer('billable_quantity').notNull(),
  currency: aiCurrencyEnum('currency'),
  rateMicros: bigint('rate_micros', { mode: 'number' }),
  estimatedCostMicros: bigint('estimated_cost_micros', { mode: 'number' }),
  metadataJson: text('metadata_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
