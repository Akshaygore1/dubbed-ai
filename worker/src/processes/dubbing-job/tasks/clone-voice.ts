import path from "node:path";
import { trimAudioSample } from "../../../lib/audio.js";
import { createSmallestVoiceCloneUsageEvent } from "../../../lib/ai-analytics.js";
import { createVoiceClone } from "../../../lib/providers/smallest.js";
import type { TranscriptSegment } from "../types.js";
import { insertAiUsageEvent } from "../repository.js";
import { DUBBING_JOB_QUEUE } from "../types.js";
import { selectVoiceSampleWindow } from "./select-voice-sample.js";

type CloneVoiceTaskInput = {
  jobId: string;
  sourceAudioPath: string;
  sourceLanguage: string;
  segments: TranscriptSegment[];
  tempDir: string;
};

type CloneVoiceTaskResult = {
  voiceId: string;
};

export const cloneVoice = async ({
  jobId,
  sourceAudioPath,
  sourceLanguage,
  segments,
  tempDir,
}: CloneVoiceTaskInput): Promise<CloneVoiceTaskResult> => {
  const samplePath = path.join(tempDir, `${jobId}.voice-sample.wav`);
  const sampleWindow = selectVoiceSampleWindow(segments);

  await trimAudioSample(
    sourceAudioPath,
    samplePath,
    sampleWindow.durationSeconds,
    sampleWindow.startTimeSeconds,
  );

  const voiceId = await createVoiceClone({
    jobId,
    samplePath,
    languageCode: sourceLanguage,
  });

  await insertAiUsageEvent(
    createSmallestVoiceCloneUsageEvent({
      queueName: DUBBING_JOB_QUEUE,
      jobId,
      languageCode: sourceLanguage,
      sampleDurationSeconds: sampleWindow.durationSeconds,
    }),
  );

  return { voiceId };
};
