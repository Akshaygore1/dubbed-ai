import { readFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

const runProcess = async (command: string, args: string[]) => {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args)

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(stderr || stdout || `${command} exited with code ${code}`))
    })
  })
}

export const extractAudioFromVideo = async (inputPath: string, outputPath: string) => {
  await runProcess('ffmpeg', [
      '-y',
      '-i',
      inputPath,
      '-vn',
      '-acodec',
      'libmp3lame',
      outputPath,
  ])

  return readFile(outputPath)
}

export const trimAudioSample = async (
  inputPath: string,
  outputPath: string,
  durationSeconds = 12,
) => {
  await runProcess('ffmpeg', [
    '-y',
    '-i',
    inputPath,
    '-t',
    `${durationSeconds}`,
    '-ac',
    '1',
    '-ar',
    '16000',
    '-c:a',
    'pcm_s16le',
    outputPath,
  ])
}

export const getMediaDuration = async (inputPath: string) => {
  let stdout = ''

  await new Promise<void>((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      inputPath,
    ])

    let stderr = ''

    ffprobe.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    ffprobe.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    ffprobe.on('error', reject)
    ffprobe.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(stderr || `ffprobe exited with code ${code}`))
    })
  })

  const duration = Number.parseFloat(stdout.trim())

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Unable to determine media duration for ${inputPath}`)
  }

  return duration
}

export const mixDubbedSegments = async (input: {
  outputPath: string
  totalDurationSeconds: number
  segments: Array<{
    audioPath: string
    startTimeSeconds: number
  }>
}) => {
  if (input.segments.length === 0) {
    throw new Error('Cannot mix dubbed audio without synthesized segments')
  }

  const args = [
    '-y',
    '-f',
    'lavfi',
    '-i',
    'anullsrc=channel_layout=stereo:sample_rate=44100',
  ]

  for (const segment of input.segments) {
    args.push('-i', segment.audioPath)
  }

  const filters = [
    `[0:a]atrim=0:${input.totalDurationSeconds},asetpts=N/SR/TB[base]`,
  ]

  for (const [index, segment] of input.segments.entries()) {
    const delay = Math.max(0, Math.round(segment.startTimeSeconds * 1000))
    const inputIndex = index + 1
    filters.push(`[${inputIndex}:a]adelay=${delay}|${delay}[seg${inputIndex}]`)
  }

  const mixInputs = [
    '[base]',
    ...input.segments.map((_segment, index) => `[seg${index + 1}]`),
  ].join('')

  filters.push(
    `${mixInputs}amix=inputs=${input.segments.length + 1}:duration=longest:normalize=0,atrim=0:${input.totalDurationSeconds}[out]`,
  )

  args.push(
    '-filter_complex',
    filters.join(';'),
    '-map',
    '[out]',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-t',
    `${input.totalDurationSeconds}`,
    input.outputPath,
  )

  await runProcess('ffmpeg', args)
}

export const normalizeAudioForMix = async (inputPath: string, outputPath: string) => {
  try {
    await runProcess('ffmpeg', [
      '-y',
      '-i',
      inputPath,
      '-ac',
      '2',
      '-ar',
      '44100',
      '-c:a',
      'pcm_s16le',
      outputPath,
    ])
  } catch (error) {
    throw new Error(
      `Unable to normalize synthesized audio ${inputPath}: ${getErrorMessage(error)}`,
    )
  }
}

export const muxAudioIntoVideo = async (input: {
  videoPath: string
  audioPath: string
  outputPath: string
}) => {
  await runProcess('ffmpeg', [
    '-y',
    '-i',
    input.videoPath,
    '-i',
    input.audioPath,
    '-map',
    '0:v:0',
    '-map',
    '1:a:0',
    '-c:v',
    'copy',
    '-c:a',
    'aac',
    '-shortest',
    input.outputPath,
  ])
}
