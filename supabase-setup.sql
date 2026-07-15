-- ===========================================
-- DYNAMIC CANVAS - SUPABASE SETUP SQL
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- IMPORTANTE: Ejecutar todo de una vez
-- ===========================================

-- Eliminar tablas existentes (en orden por foreign keys)
DROP TABLE IF EXISTS "subscription" CASCADE;
DROP TABLE IF EXISTS "user_api_keys" CASCADE;
DROP TABLE IF EXISTS "dynamic_canvas_templates" CASCADE;
DROP TABLE IF EXISTS "project" CASCADE;
DROP TABLE IF EXISTS "authenticator" CASCADE;
DROP TABLE IF EXISTS "verificationToken" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "account" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- ===========================================
-- USER TABLE
-- ===========================================
CREATE TABLE "user" (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text NOT NULL,
  "emailVerified" timestamp,
  image text,
  password text
);

CREATE UNIQUE INDEX user_email_idx ON "user"(email);

-- ===========================================
-- ACCOUNT TABLE (OAuth)
-- ===========================================
CREATE TABLE "account" (
  "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  type text NOT NULL,
  provider text NOT NULL,
  "providerAccountId" text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at integer,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  PRIMARY KEY (provider, "providerAccountId")
);

-- ===========================================
-- SESSION TABLE
-- ===========================================
CREATE TABLE "session" (
  "sessionToken" text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  expires timestamp NOT NULL
);

CREATE INDEX session_userId_idx ON "session"("userId");

-- ===========================================
-- VERIFICATION TOKEN TABLE
-- ===========================================
CREATE TABLE "verificationToken" (
  identifier text NOT NULL,
  token text NOT NULL,
  expires timestamp NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ===========================================
-- AUTHENTICATOR TABLE (WebAuthn)
-- ===========================================
CREATE TABLE "authenticator" (
  "credentialID" text NOT NULL UNIQUE,
  "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "providerAccountId" text NOT NULL,
  "credentialPublicKey" text NOT NULL,
  counter integer NOT NULL,
  "credentialDeviceType" text NOT NULL,
  "credentialBackedUp" boolean NOT NULL,
  transports text,
  PRIMARY KEY ("userId", "credentialID")
);

-- ===========================================
-- PROJECT TABLE
-- ===========================================
CREATE TABLE "project" (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  json text NOT NULL,
  height integer NOT NULL,
  width integer NOT NULL,
  "thumbnailUrl" text,
  "isTemplate" boolean,
  "isPro" boolean,
  "createdAt" timestamp NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX project_userId_idx ON "project"("userId");

-- ===========================================
-- DYNAMIC CANVAS TEMPLATES TABLE
-- ===========================================
CREATE TABLE "dynamic_canvas_templates" (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id text REFERENCES "user"(id) ON DELETE CASCADE,
  json text NOT NULL,
  elements jsonb,
  height integer NOT NULL,
  width integer NOT NULL,
  "backgroundColor" text DEFAULT '#ffffff',
  "thumbnailUrl" text,
  "isPro" boolean NOT NULL DEFAULT false,
  preset text DEFAULT '',
  category text,
  "createdAt" timestamp NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp NOT NULL DEFAULT NOW(),
  "lastModified" timestamp
);

CREATE INDEX templates_user_id_idx ON "dynamic_canvas_templates"(user_id);
CREATE INDEX templates_category_idx ON "dynamic_canvas_templates"(category);

-- ===========================================
-- USER API KEYS TABLE
-- ===========================================
CREATE TABLE "user_api_keys" (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  api_key text NOT NULL UNIQUE,
  "createdAt" timestamp NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX user_api_keys_api_key_idx ON "user_api_keys"(api_key);

-- ===========================================
-- SUBSCRIPTION TABLE
-- ===========================================
CREATE TABLE "subscription" (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "subscriptionId" text NOT NULL,
  "customerId" text NOT NULL,
  "priceId" text NOT NULL,
  status text NOT NULL,
  "currentPeriodEnd" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX subscription_userId_idx ON "subscription"("userId");

-- ===========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "authenticator" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dynamic_canvas_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_api_keys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscription" ENABLE ROW LEVEL SECURITY;

-- Keep NextAuth, billing and verification tables server-only. The browser only
-- receives CRUD grants for the two resources it currently accesses directly.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON "dynamic_canvas_templates" TO authenticated;
CREATE POLICY "templates_select_own" ON "dynamic_canvas_templates"
  FOR SELECT TO authenticated USING (user_id = auth.uid()::text);
CREATE POLICY "templates_insert_own" ON "dynamic_canvas_templates"
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "templates_update_own" ON "dynamic_canvas_templates"
  FOR UPDATE TO authenticated USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "templates_delete_own" ON "dynamic_canvas_templates"
  FOR DELETE TO authenticated USING (user_id = auth.uid()::text);

GRANT SELECT, INSERT, UPDATE, DELETE ON "user_api_keys" TO authenticated;
CREATE POLICY "api_keys_select_own" ON "user_api_keys"
  FOR SELECT TO authenticated USING (user_id = auth.uid()::text);
CREATE POLICY "api_keys_insert_own" ON "user_api_keys"
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "api_keys_update_own" ON "user_api_keys"
  FOR UPDATE TO authenticated USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "api_keys_delete_own" ON "user_api_keys"
  FOR DELETE TO authenticated USING (user_id = auth.uid()::text);

-- ===========================================
-- VERIFICAR TABLAS CREADAS
-- ===========================================
SELECT table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
