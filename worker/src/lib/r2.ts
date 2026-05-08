import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { env } from '../config/env.js'

const endpoint = env.R2_ENDPOINT ?? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

export const r2Client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
})

export const createAudioObjectKey = (jobId: string) => {
  return `audio/${jobId}.mp3`
}

export const downloadObjectToFile = async (key: string, outputPath: string) => {
  const response = await r2Client.send(
    new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    }),
  )

  if (!response.Body) {
    throw new Error(`Missing object body for ${key}`)
  }

  await mkdir(dirname(outputPath), { recursive: true })

  const body = response.Body as Readable

  await pipeline(body, createWriteStream(outputPath))
}

export const uploadAudioToR2 = async (key: string, file: Buffer) => {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: 'audio/mpeg',
    }),
  )
}
