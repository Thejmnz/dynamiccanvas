import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Read Supabase auth token from cookies
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? "";
    const tokenCookie =
      req.cookies.get(`sb-${projectRef}-auth-token`)?.value ||
      req.cookies.get(`sb-${projectRef}-auth-token.0`)?.value;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: {
        headers: tokenCookie ? { Cookie: `sb-${projectRef}-auth-token=${tokenCookie}` } : {},
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(tokenCookie);

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [dbUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, user.id));

    return NextResponse.json({ role: dbUser?.role || "user" });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
