import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;

    // 1. Try NextAuth session
    const session = await auth();
    if (session?.user?.id) {
      userId = session.user.id;
    }

    // 2. Fall back to Supabase cookie
    if (!userId) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? "";
      const tokenCookie =
        req.cookies.get(`sb-${projectRef}-auth-token`)?.value ||
        req.cookies.get(`sb-${projectRef}-auth-token.0`)?.value;

      if (tokenCookie) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: false },
          global: { headers: { Cookie: `sb-${projectRef}-auth-token=${tokenCookie}` } },
        });
        const { data: { user } } = await supabase.auth.getUser(tokenCookie);
        userId = user?.id ?? null;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [dbUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId));

    return NextResponse.json({ role: dbUser?.role || "user" });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
