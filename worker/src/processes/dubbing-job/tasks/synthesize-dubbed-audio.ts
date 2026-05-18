import path from "node:path";
import { readFile } from "node:fs/promises";
import {
  getMediaDuration,
  mixDubbedSegments,
  normalizeAudioForMix,
} from "../../../lib/audio.js";
import { logger } from "../../../lib/logger.js";
import { synthesizeVoiceCloneSpeech } from "../../../lib/providers/smallest.js";
import {
  createDubbedAudioObjectKey,
  uploadAudioToR2,
} from "../../../lib/r2.js";
import type { TranscriptSegment } from "../types.js";

type SynthesizeDubbedAudioTaskInput = {
  jobId: string;
  sourceAudioPath: string;
  voiceId: string;
  segments: TranscriptSegment[];
  tempDir: string;
};

type SynthesizeDubbedAudioTaskResult = {
  dubbedAudioPath: string;
  dubbedAudioKey: string;
};

export const synthesizeDubbedAudio = async ({
  jobId,
  sourceAudioPath,
  voiceId,
  segments,
  tempDir,
}: SynthesizeDubbedAudioTaskInput): Promise<SynthesizeDubbedAudioTaskResult> => {
  const activeSegments = segments.filter(
    (segment) =>
      typeof segment.translatedText === "string" &&
      segment.translatedText.trim().length > 0,
  );

  if (activeSegments.length === 0) {
    throw new Error("No translated segments were available for dubbing synthesis");
  }

  const synthesizedSegments: Array<{
    audioPath: string;
    startTimeSeconds: number;
  }> = [];

  for (const segment of activeSegments) {
    const rawAudioPathStem = path.join(
      tempDir,
      `${jobId}.segment-${segment.index}.provider`,
    );
    const normalizedAudioPath = path.join(
      tempDir,
      `${jobId}.segment-${segment.index}.wav`,
    );

    const synthesizedAudio = await synthesizeVoiceCloneSpeech({
      text: segment.translatedText!,
      voiceId,
      outputPathStem: rawAudioPathStem,
    });

    logger.info("dubbing_job.segment_synthesized", {
      jobId,
      segmentIndex: segment.index,
      contentType: synthesizedAudio.contentType,
      sizeBytes: synthesizedAudio.sizeBytes,
    });

    try {
      await normalizeAudioForMix(
        synthesizedAudio.outputPath,
        normalizedAudioPath,
      );
    } catch (error) {
      logger.error("dubbing_job.segment_audio_invalid", error, {
        jobId,
        segmentIndex: segment.index,
        rawAudioPath: synthesizedAudio.outputPath,
        contentType: synthesizedAudio.contentType,
        sizeBytes: synthesizedAudio.sizeBytes,
      });
      throw error;
    }

    synthesizedSegments.push({
      audioPath: normalizedAudioPath,
      startTimeSeconds: segment.startTimeSeconds,
    });
  }

  const dubbedAudioPath = path.join(tempDir, `${jobId}.dubbed.m4a`);
  const dubbedAudioKey = createDubbedAudioObjectKey(jobId);
  const totalDurationSeconds = await getMediaDuration(sourceAudioPath);

  await mixDubbedSegments({
    outputPath: dubbedAudioPath,
    totalDurationSeconds,
    segments: synthesizedSegments,
  });

  const dubbedAudioBuffer = await readFile(dubbedAudioPath);

  await uploadAudioToR2(dubbedAudioKey, dubbedAudioBuffer, "audio/mp4");

  return {
    dubbedAudioPath,
    dubbedAudioKey,
  };
};
