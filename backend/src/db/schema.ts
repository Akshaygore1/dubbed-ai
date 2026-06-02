import {
  bigint,
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved'])

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  approvalStatus: approvalStatusEnum('approval_status').notNull().default('pending'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  approvedBy: text('approved_by'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_user_id_idx').on(table.userId)],
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
      withTimezone: true,
    }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('account_user_id_idx').on(table.userId)],
)

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
)

export const jobStatusEnum = pgEnum('job_status', [
  'pending',
  'processing',
  'completed',
  'failed',
])

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
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
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
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const aiUsageEvents = pgTable(
  'ai_usage_events',
  {
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
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('ai_usage_events_queue_created_idx').on(table.queueName, table.createdAt),
    index('ai_usage_events_job_idx').on(table.jobId),
    index('ai_usage_events_provider_created_idx').on(table.provider, table.createdAt),
  ],
)
