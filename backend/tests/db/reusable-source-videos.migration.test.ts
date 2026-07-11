import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('reusable source-videos migration', () => {
  it('creates one source per historical job and retains version processing data', async () => {
    const migration = await readFile(
      resolve(import.meta.dirname, '../../drizzle/0002_reusable_source_videos.sql'),
      'utf8',
    )

    expect(migration).toContain('FOR legacy_job IN SELECT * FROM dubbing_jobs WHERE source_id IS NULL LOOP')
    expect(migration).toContain('UPDATE dubbing_jobs SET source_id = new_source_id WHERE id = legacy_job.id;')
    expect(migration).not.toContain('DELETE FROM dubbing_jobs')
    expect(migration).not.toContain('video_key = NULL')
  })
})
