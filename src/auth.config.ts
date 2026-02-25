import { z } from "zod";
import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { supabase } from "@/lib/supabaseClient";

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// @ts-ignore
declare module "next-auth/jwt" {
  interface JWT {
    id: string | undefined;
    role: string | undefined;
  }
}

// @ts-ignore
declare module "@auth/core/jwt" {
  interface JWT {
    id: string | undefined;
    role: string | undefined;
  }
}

export default {
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = CredentialsSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        // Verify with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data.user) {
          console.error("Supabase Auth Login Failed:", error?.message);
          return null;
        }

        // Return user from Supabase Auth (no need for local DB)
        return {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || data.user.email,
          image: data.user.user_metadata?.avatar_url || null,
        };
      },
    }),
    GitHub,
    Google,
  ],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }: any) {
      if (token.id) {
        session.user.id = token.id;
      }
      if (token.role) {
        session.user.role = token.role;
      }

      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        // Fetch user role from database
        const dbUser = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, user.id),
        });
        if (dbUser) {
          token.role = dbUser.role || "user";
        }
      }

      return token;
    },
  },
} as any;
