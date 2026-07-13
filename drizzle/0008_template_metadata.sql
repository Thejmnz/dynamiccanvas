ALTER TABLE "dynamic_canvas_templates"
  ADD COLUMN IF NOT EXISTS "description" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "dynamic_canvas_templates"
  ADD COLUMN IF NOT EXISTS "tags" text[] DEFAULT ARRAY[]::text[] NOT NULL;
--> statement-breakpoint
NOTIFY pgrst, 'reload schema';
