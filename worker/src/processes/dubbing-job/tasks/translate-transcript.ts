import { translateText } from "../../../lib/providers/sarvam.js";
import { createSarvamTranslationUsageEvent } from "../../../lib/ai-analytics.js";
import type { TranscriptSegment } from "../types.js";
import { insertAiUsageEvent } from "../repository.js";
import { DUBBING_JOB_QUEUE } from "../types.js";

type TranslateTranscriptTaskInput = {
  jobId: string;
  segments: TranscriptSegment[];
  sourceLanguage: string;
  targetLanguage: string;
};

export const translateTranscript = async ({
  jobId,
  segments,
  sourceLanguage,
  targetLanguage,
}: TranslateTranscriptTaskInput): Promise<TranscriptSegment[]> => {
  const translatedSegments: TranscriptSegment[] = [];

  for (const segment of segments) {
    const translatedText = await translateText({
      text: segment.sourceText,
      sourceLanguageCode: sourceLanguage,
      targetLanguageCode: targetLanguage,
    });

    await insertAiUsageEvent(
      createSarvamTranslationUsageEvent({
        queueName: DUBBING_JOB_QUEUE,
        jobId,
        text: segment.sourceText,
        sourceLanguageCode: sourceLanguage,
        targetLanguageCode: targetLanguage,
        metadata: {
          segmentIndex: segment.index,
        },
      }),
    );

    translatedSegments.push({
      ...segment,
      translatedText,
    });
  }

  return translatedSegments;
};
