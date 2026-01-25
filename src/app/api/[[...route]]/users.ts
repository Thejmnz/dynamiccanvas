import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { supabase } from "@/lib/supabaseClient";

const app = new Hono()
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(3).max(20),
      })
    ),
    async (c) => {
      try {
        const { name, email, password } = c.req.valid("json");
        console.log(`[Registration] Attempting to register user: ${email}`);

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error("[Registration] CRITICAL: Supabase environment variables are missing!");
          throw new Error("Supabase environment variables are missing on the server.");
        }

        // Create user in Supabase Auth (this automatically creates entry in auth.users table)
        const origin = c.req.header("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${origin}`,
            data: {
              name, // Store name in user metadata
            }
          }
        });

        if (authError) {
          console.error(`[Registration] Supabase Auth Error: ${authError.message}`);
          return c.json({ error: authError.message }, 400);
        }

        if (!data.user) {
          console.error("[Registration] Supabase returned success but no user data.");
          return c.json({ error: "Failed to create user in Supabase" }, 500);
        }

        console.log(`[Registration] User created successfully: ${data.user.id}`);

        // No need to sync to separate table - Supabase Auth handles everything
        return c.json({ success: true }, 200);
      } catch (error: any) {
        console.error("[Registration] Unexpected Error Stack:", error.stack);
        return c.json({ error: error.message || "Internal server error" }, 500);
      }
    },
  );

export default app;
