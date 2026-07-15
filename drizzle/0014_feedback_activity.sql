CREATE TABLE IF NOT EXISTS "feedback_activity" (
  "id" text PRIMARY KEY NOT NULL,
  "feedback_id" text NOT NULL,
  "actor_id" text NOT NULL,
  "action" text NOT NULL,
  "from_value" text,
  "to_value" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "feedback_activity_feedback_id_feedback_post_id_fk"
    FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback_post"("id")
    ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "feedback_activity_actor_id_user_id_fk"
    FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id")
    ON DELETE cascade ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "feedback_activity_feedback_created_idx"
ON "feedback_activity" ("feedback_id", "createdAt");
