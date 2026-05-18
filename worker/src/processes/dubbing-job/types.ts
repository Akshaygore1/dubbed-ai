export const DUBBING_JOB_QUEUE = "dubbing-job";

export type DubbingJobMessage = {
  jobId: string;
};

export type TranscriptSegment = {
  index: number;
  sourceText: string;
  translatedText?: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  speakerId: string | null;
  emotion: string | null;
  metadata?: Record<string, unknown>;
};

export type TranscriptionResult = {
  transcript: string;
  detectedLanguageCode: string | null;
  languageProbability: number | null;
  segments: TranscriptSegment[];
  raw: Record<string, unknown>;
};
