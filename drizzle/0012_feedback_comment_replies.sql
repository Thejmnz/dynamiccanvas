ALTER TABLE public."feedback_comment"
  ADD COLUMN IF NOT EXISTS "parent_comment_id" text;
--> statement-breakpoint
ALTER TABLE public."feedback_comment"
  DROP CONSTRAINT IF EXISTS "feedback_comment_parent_comment_id_fkey";
--> statement-breakpoint
ALTER TABLE public."feedback_comment"
  ADD CONSTRAINT "feedback_comment_parent_comment_id_fkey"
  FOREIGN KEY ("parent_comment_id") REFERENCES public."feedback_comment"("id") ON DELETE cascade;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feedback_comment_parent_comment_id_idx"
  ON public."feedback_comment" ("parent_comment_id");
