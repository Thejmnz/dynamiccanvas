ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "auto_renew" boolean DEFAULT false NOT NULL;
