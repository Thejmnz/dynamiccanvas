ALTER TABLE "feedback_post"
ADD COLUMN IF NOT EXISTS "moderation_status" text DEFAULT 'pending' NOT NULL;

UPDATE "feedback_post"
SET "moderation_status" = 'approved';

CREATE INDEX IF NOT EXISTS "feedback_post_moderation_status_idx"
ON "feedback_post" ("moderation_status");
