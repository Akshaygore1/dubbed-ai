import { randomUUID } from 'node:crypto'
import path from 'node:path'
import {
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '../config/env.js'

const endpoint =
  env.R2_ENDPOINT ?? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

export const r2Client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
})

const normalizeExtension = (originalname: string) => {
  const extension = path.extname(originalname).toLowerCase()
  return extension || '.bin'
}

export const createVideoObjectKey = (originalname: string) => {
  return `videos/${randomUUID()}${normalizeExtension(originalname)}`
}

export const uploadVideoToR2 = async (input: {
  key: string
  body: Buffer
  contentType: string
}) => {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
    }),
  )
}

export const getSignedVideoUrl = async (key: string) => {
  return getSignedUrl(
    r2Client,
    new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    }),
    { expiresIn: env.R2_SIGNED_URL_TTL_SECONDS },
  )
}

export const getSignedObjectUrl = async (key: string) => {
  return getSignedVideoUrl(key)
}

export const getStoredVideoUrl = (key: string) => {
  if (env.R2_VIDEO_URL_BASE) {
    return new URL(
      key,
      `${env.R2_VIDEO_URL_BASE.replace(/\/$/, '')}/`,
    ).toString()
  }

  return `${endpoint}/${env.R2_BUCKET_NAME}/${key}`
}
