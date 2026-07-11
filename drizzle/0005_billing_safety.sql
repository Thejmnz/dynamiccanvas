ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "bonus_credits" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stripe_event" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"createdAt" timestamp NOT NULL
);
