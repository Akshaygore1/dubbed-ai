CREATE TABLE "source_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"original_filename" text,
	"display_title" text NOT NULL,
	"source_language" text NOT NULL,
	"video_url" text,
	"video_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "source_videos" ADD CONSTRAINT "source_videos_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dubbing_jobs" ADD COLUMN "source_id" uuid;
--> statement-breakpoint
CREATE INDEX "source_videos_user_id_idx" ON "source_videos" USING btree ("user_id");
--> statement-breakpoint
DO $$
DECLARE
	legacy_job record;
	new_source_id uuid;
	derived_filename text;
BEGIN
	FOR legacy_job IN SELECT * FROM dubbing_jobs WHERE source_id IS NULL LOOP
		derived_filename := NULLIF(regexp_replace(COALESCE(legacy_job.video_key, legacy_job.video_url, ''), '^.*/', ''), '');
		INSERT INTO source_videos (user_id, original_filename, display_title, source_language, video_url, video_key, created_at, updated_at)
		VALUES (
			legacy_job.user_id,
			derived_filename,
			COALESCE(derived_filename, 'Untitled source video'),
			legacy_job.source_language,
			legacy_job.video_url,
			legacy_job.video_key,
			legacy_job.created_at,
			legacy_job.updated_at
		)
		RETURNING id INTO new_source_id;

		UPDATE dubbing_jobs SET source_id = new_source_id WHERE id = legacy_job.id;
	END LOOP;
END $$;
--> statement-breakpoint
ALTER TABLE "dubbing_jobs" ADD CONSTRAINT "dubbing_jobs_source_id_source_videos_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."source_videos"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "dubbing_jobs_source_id_idx" ON "dubbing_jobs" USING btree ("source_id");
