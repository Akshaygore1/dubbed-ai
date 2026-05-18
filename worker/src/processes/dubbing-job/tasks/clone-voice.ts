import path from "node:path";
import { trimAudioSample } from "../../../lib/audio.js";
import { createVoiceClone } from "../../../lib/providers/smallest.js";

type CloneVoiceTaskInput = {
  jobId: string;
  sourceAudioPath: string;
  sourceLanguage: string;
  tempDir: string;
};

type CloneVoiceTaskResult = {
  voiceId: string;
};

export const cloneVoice = async ({
  jobId,
  sourceAudioPath,
  sourceLanguage,
  tempDir,
}: CloneVoiceTaskInput): Promise<CloneVoiceTaskResult> => {
  const samplePath = path.join(tempDir, `${jobId}.voice-sample.wav`);

  await trimAudioSample(sourceAudioPath, samplePath);

  const voiceId = await createVoiceClone({
    jobId,
    samplePath,
    languageCode: sourceLanguage,
  });

  return { voiceId };
};
