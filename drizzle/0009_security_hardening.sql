-- Block direct PostgREST access to server-only tables and replace the old
-- permissive USING (true) policies with ownership checks where the browser
-- still talks directly to Supabase.

ALTER TABLE public."account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."authenticator" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."dynamic_canvas_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."news" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."render" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."stripe_event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."template_folder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user_api_keys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."verificationToken" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

DO $security$
DECLARE
  policy_record record;
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  END LOOP;
END
$security$;
--> statement-breakpoint

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
--> statement-breakpoint

-- The editor and dashboard currently use the authenticated Supabase client
-- for templates. Every operation is restricted to auth.uid().
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."dynamic_canvas_templates" TO authenticated;

CREATE POLICY "templates_select_own"
  ON public."dynamic_canvas_templates"
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "templates_insert_own"
  ON public."dynamic_canvas_templates"
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "templates_update_own"
  ON public."dynamic_canvas_templates"
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "templates_delete_own"
  ON public."dynamic_canvas_templates"
  FOR DELETE TO authenticated
  USING (user_id = auth.uid()::text);
--> statement-breakpoint

-- API keys are also read and regenerated from the authenticated dashboard.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."user_api_keys" TO authenticated;

CREATE POLICY "api_keys_select_own"
  ON public."user_api_keys"
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "api_keys_insert_own"
  ON public."user_api_keys"
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "api_keys_update_own"
  ON public."user_api_keys"
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "api_keys_delete_own"
  ON public."user_api_keys"
  FOR DELETE TO authenticated
  USING (user_id = auth.uid()::text);
--> statement-breakpoint

-- Prevent future Drizzle tables from automatically receiving public CRUD.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;
--> statement-breakpoint

-- The signup trigger is invoked by Supabase Auth, not by API clients.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin, service_role;
--> statement-breakpoint

NOTIFY pgrst, 'reload schema';
