CREATE TABLE IF NOT EXISTS "feedback_subscription" (
  "feedback_id" text NOT NULL,
  "user_id" text NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "feedback_subscription_feedback_id_user_id_pk"
    PRIMARY KEY ("feedback_id", "user_id"),
  CONSTRAINT "feedback_subscription_feedback_id_feedback_post_id_fk"
    FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback_post"("id")
    ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "feedback_subscription_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."user"("id")
    ON DELETE cascade ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "feedback_subscription_user_idx"
ON "feedback_subscription" ("user_id");
