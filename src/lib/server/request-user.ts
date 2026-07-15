import "server-only";

import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";

export type RequestUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export async function getRequestUser(request: NextRequest): Promise<RequestUser | null> {
  const session = await auth();
  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email || "",
      name: session.user.name || session.user.email?.split("@")[0] || "User",
      role: session.user.role || "user",
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? "";
  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const cookieToken = request.cookies.get(`sb-${projectRef}-auth-token`)?.value
    || request.cookies.get(`sb-${projectRef}-auth-token.0`)?.value;
  const token = bearerToken || cookieToken;
  if (!token) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user?.id || !user.email) return null;

  const [dbUser] = await db
    .select({ role: users.role, name: users.name })
    .from(users)
    .where(eq(users.id, user.id));

  return {
    id: user.id,
    email: user.email,
    name: dbUser?.name || user.user_metadata?.full_name || user.user_metadata?.name || user.email.split("@")[0],
    role: dbUser?.role || "user",
  };
}

export async function ensureRequestUser(user: RequestUser) {
  await db.insert(users).values({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }).onConflictDoNothing();
}
