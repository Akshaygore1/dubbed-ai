import { extractAudio } from "./tasks/extract-audio.js";
import { getDubbingJobById, updateDubbingJob } from "./repository.js";
export const processDubbingJob = async ({ jobId }) => {
    const job = await getDubbingJobById(jobId);
    if (!job) {
        throw new Error(`Job ${jobId} not found`);
    }
    if (!job.videoKey) {
        throw new Error(`Job ${jobId} is missing a source video key`);
    }
    await updateDubbingJob(jobId, {
        status: "processing",
        errorMessage: null,
    });
    try {
        const { audioKey } = await extractAudio({
            jobId,
            videoKey: job.videoKey,
        });
        await updateDubbingJob(jobId, {
            audioKey,
            status: "completed",
            errorMessage: null,
        });
        console.info(`Processed dubbing job ${jobId}`);
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Worker failed to process dubbing job";
        await updateDubbingJob(jobId, {
            status: "failed",
            errorMessage: message,
        });
        throw error;
    }
};
