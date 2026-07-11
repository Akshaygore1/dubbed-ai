CREATE UNIQUE INDEX "dubbing_jobs_one_active_version_per_source_idx"
ON "dubbing_jobs" USING btree ("source_id")
WHERE "status" IN ('pending', 'processing');
--> statement-breakpoint
CREATE UNIQUE INDEX "dubbing_jobs_one_current_target_per_source_idx"
ON "dubbing_jobs" USING btree ("source_id", "target_language")
WHERE "status" IN ('pending', 'processing', 'completed');
