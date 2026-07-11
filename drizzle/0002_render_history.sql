CREATE TABLE IF NOT EXISTS "render" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"template_id" text,
	"status" text NOT NULL,
	"error_message" text,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "render" ADD COLUMN IF NOT EXISTS "image_url" text;
--> statement-breakpoint
ALTER TABLE "render" ADD COLUMN IF NOT EXISTS "template_name" text;
--> statement-breakpoint
ALTER TABLE "render" ADD COLUMN IF NOT EXISTS "width" integer;
--> statement-breakpoint
ALTER TABLE "render" ADD COLUMN IF NOT EXISTS "height" integer;
--> statement-breakpoint
ALTER TABLE "render" ADD COLUMN IF NOT EXISTS "format" text;
--> statement-breakpoint
ALTER TABLE "render" ADD COLUMN IF NOT EXISTS "render_time_ms" integer;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "render" ADD CONSTRAINT "render_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
