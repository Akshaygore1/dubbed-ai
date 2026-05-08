import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { dubbingJobs } from "../../db/schema.js";

export const getDubbingJobById = async (jobId: string) => {
  const [job] = await db
    .select({
      id: dubbingJobs.id,
      videoKey: dubbingJobs.videoKey,
    })
    .from(dubbingJobs)
    .where(eq(dubbingJobs.id, jobId));

  return job;
};

export const updateDubbingJob = async (
  jobId: string,
  values: Partial<typeof dubbingJobs.$inferInsert>,
) => {
  await db
    .update(dubbingJobs)
    .set({
      ...values,
      updatedAt: new Date(),
    })
    .where(eq(dubbingJobs.id, jobId));
};
