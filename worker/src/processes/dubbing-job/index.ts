import type PgBoss from "pg-boss";
import { processDubbingJob } from "./process.js";
import { DUBBING_JOB_QUEUE, type DubbingJobMessage } from "./types.js";

export const registerDubbingJobWorker = async (boss: PgBoss) => {
  await boss.createQueue(DUBBING_JOB_QUEUE);

  await boss.work<DubbingJobMessage>(DUBBING_JOB_QUEUE, async (jobs) => {
    const [job] = jobs;

    if (!job) {
      return;
    }

    await processDubbingJob(job.data);
  });
};
