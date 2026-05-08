import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
const endpoint = env.R2_ENDPOINT ?? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
export const r2Client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
});
export const createAudioObjectKey = (jobId) => {
    return `audio/${jobId}.mp3`;
};
export const downloadObjectToFile = async (key, outputPath) => {
    const response = await r2Client.send(new GetObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
    }));
    if (!response.Body) {
        throw new Error(`Missing object body for ${key}`);
    }
    await mkdir(dirname(outputPath), { recursive: true });
    const body = response.Body;
    await pipeline(body, createWriteStream(outputPath));
};
export const uploadAudioToR2 = async (key, file) => {
    await r2Client.send(new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: 'audio/mpeg',
    }));
};
