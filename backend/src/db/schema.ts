import { pgTable, text, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core'

export const jobStatusEnum = pgEnum('job_status', ['pending', 'processing', 'completed', 'failed'])

export const contacts = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const dubbingJobs = pgTable('dubbing_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  videoUrl: text('video_url'),
  videoKey: text('video_key'),
  audioKey: text('audio_key'),
  sourceLanguage: text('source_language').notNull(),
  targetLanguage: text('target_language').notNull(),
  status: jobStatusEnum('status').notNull().default('pending'),
  dubbedVideoUrl: text('dubbed_video_url'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
