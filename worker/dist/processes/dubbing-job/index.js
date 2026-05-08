import { processDubbingJob } from "./process.js";
import { DUBBING_JOB_QUEUE } from "./types.js";
export const registerDubbingJobWorker = async (boss) => {
    await boss.createQueue(DUBBING_JOB_QUEUE);
    await boss.work(DUBBING_JOB_QUEUE, async (jobs) => {
        const [job] = jobs;
        if (!job) {
            return;
        }
        await processDubbingJob(job.data);
    });
};
