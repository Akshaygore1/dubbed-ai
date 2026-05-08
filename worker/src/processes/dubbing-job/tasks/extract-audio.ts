import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { extractAudioFromVideo } from "../../../lib/audio.js";
import {
  createAudioObjectKey,
  downloadObjectToFile,
  uploadAudioToR2,
} from "../../../lib/r2.js";

type ExtractAudioTaskInput = {
  jobId: string;
  videoKey: string;
};

type ExtractAudioTaskResult = {
  audioKey: string;
};

export const extractAudio = async ({
  jobId,
  videoKey,
}: ExtractAudioTaskInput): Promise<ExtractAudioTaskResult> => {
  const tempDir = await mkdtemp(path.join(tmpdir(), "dubbing-worker-"));
  const inputPath = path.join(tempDir, `${jobId}.input`);
  const outputPath = path.join(tempDir, `${jobId}.mp3`);
  const audioKey = createAudioObjectKey(jobId);

  try {
    await downloadObjectToFile(videoKey, inputPath);
    const audioBuffer = await extractAudioFromVideo(inputPath, outputPath);
    await uploadAudioToR2(audioKey, audioBuffer);

    return { audioKey };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
};
