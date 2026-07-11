ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "plan" text DEFAULT 'free' NOT NULL;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "credits_balance" integer DEFAULT 50 NOT NULL;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "credits_per_month" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "credits_reset_at" timestamp;
