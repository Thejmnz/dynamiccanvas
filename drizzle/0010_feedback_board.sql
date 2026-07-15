CREATE TABLE IF NOT EXISTS public."feedback_post" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES public."user"("id") ON DELETE cascade,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "category" text DEFAULT 'feature' NOT NULL,
  "status" text DEFAULT 'open' NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "feedback_post_category_check" CHECK ("category" IN ('feature', 'editor', 'api', 'integration', 'billing', 'other')),
  CONSTRAINT "feedback_post_status_check" CHECK ("status" IN ('open', 'planned', 'in_progress', 'completed', 'declined'))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS public."feedback_vote" (
  "feedback_id" text NOT NULL REFERENCES public."feedback_post"("id") ON DELETE cascade,
  "user_id" text NOT NULL REFERENCES public."user"("id") ON DELETE cascade,
  "value" integer NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "feedback_vote_feedback_id_user_id_pk" PRIMARY KEY("feedback_id", "user_id"),
  CONSTRAINT "feedback_vote_value_check" CHECK ("value" IN (-1, 1))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS public."feedback_comment" (
  "id" text PRIMARY KEY NOT NULL,
  "feedback_id" text NOT NULL REFERENCES public."feedback_post"("id") ON DELETE cascade,
  "user_id" text NOT NULL REFERENCES public."user"("id") ON DELETE cascade,
  "body" text NOT NULL,
  "is_admin" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feedback_post_created_at_idx" ON public."feedback_post" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "feedback_post_status_idx" ON public."feedback_post" ("status");
CREATE INDEX IF NOT EXISTS "feedback_comment_feedback_id_idx" ON public."feedback_comment" ("feedback_id", "createdAt");
--> statement-breakpoint
ALTER TABLE public."feedback_post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."feedback_vote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."feedback_comment" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."feedback_post", public."feedback_vote", public."feedback_comment" FROM anon, authenticated;
--> statement-breakpoint
NOTIFY pgrst, 'reload schema';
