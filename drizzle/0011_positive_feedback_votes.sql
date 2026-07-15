DELETE FROM public."feedback_vote" WHERE "value" < 0;
--> statement-breakpoint
ALTER TABLE public."feedback_vote" DROP CONSTRAINT IF EXISTS "feedback_vote_value_check";
--> statement-breakpoint
ALTER TABLE public."feedback_vote"
  ADD CONSTRAINT "feedback_vote_value_check" CHECK ("value" = 1);
