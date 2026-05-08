import { readFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'

export const extractAudioFromVideo = async (inputPath: string, outputPath: string) => {
  await new Promise<void>((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-i',
      inputPath,
      '-vn',
      '-acodec',
      'libmp3lame',
      outputPath,
    ])

    let stderr = ''

    ffmpeg.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    ffmpeg.on('error', reject)
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(stderr || `ffmpeg exited with code ${code}`))
    })
  })

  return readFile(outputPath)
}
