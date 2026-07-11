import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { desc, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { renders } from "@/db/schema";

export const dynamic = "force-dynamic";

async function getRequestUserId(req: NextRequest) {
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? "";
  const tokenCookie =
    req.cookies.get(`sb-${projectRef}-auth-token`)?.value ||
    req.cookies.get(`sb-${projectRef}-auth-token.0`)?.value;

  if (!tokenCookie) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: {
      headers: { Cookie: `sb-${projectRef}-auth-token=${tokenCookie}` },
    },
  });
  const { data: { user } } = await supabase.auth.getUser(tokenCookie);
  return user?.id ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getRequestUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await db
      .select()
      .from(renders)
      .where(eq(renders.userId, userId))
      .orderBy(desc(renders.createdAt))
      .limit(100);

    return NextResponse.json({ data: history });
  } catch (error) {
    console.error("[Renders] Failed to load render history:", error);
    return NextResponse.json({ error: "Failed to load renders" }, { status: 500 });
  }
}
