CREATE TABLE IF NOT EXISTS "template_folder" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dynamic_canvas_templates" ADD COLUMN IF NOT EXISTS "folder_id" text;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "template_folder" ADD CONSTRAINT "template_folder_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dynamic_canvas_templates" ADD CONSTRAINT "dynamic_canvas_templates_folder_id_template_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."template_folder"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_folder_user_id_idx" ON "template_folder" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dynamic_canvas_templates_folder_id_idx" ON "dynamic_canvas_templates" ("folder_id");
