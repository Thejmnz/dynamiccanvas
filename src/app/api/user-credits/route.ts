import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { count, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { users, templates } from "@/db/schema";

export const dynamic = "force-dynamic";

const PLAN_TEMPLATE_LIMITS: Record<string, number> = {
  free: 3,
  creator: 15,
  agency: 100,
  business: Infinity,
};

async function getUserId(req: NextRequest): Promise<string | null> {
  // 1. Try NextAuth session
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  // 2. Fall back to Supabase cookie
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? "";
  const tokenCookie =
    req.cookies.get(`sb-${projectRef}-auth-token`)?.value ||
    req.cookies.get(`sb-${projectRef}-auth-token.0`)?.value;
  if (!tokenCookie) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: { headers: { Cookie: `sb-${projectRef}-auth-token=${tokenCookie}` } },
  });
  const { data: { user } } = await supabase.auth.getUser(tokenCookie);
  return user?.id ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [dbUser] = await db
      .select({
        plan: users.plan,
        creditsBalance: users.creditsBalance,
        creditsPerMonth: users.creditsPerMonth,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [{ value: templateCount }] = await db
      .select({ value: count() })
      .from(templates)
      .where(eq(templates.user_id, userId));

    const plan = dbUser.plan || "free";
    const creditsPerMonth = dbUser.creditsPerMonth || 0;
    const creditsBalance = dbUser.creditsBalance ?? 50;
    const totalCredits = plan === "free" ? 50 : creditsPerMonth;
    const usedCredits = Math.max(0, totalCredits - creditsBalance);
    const templateLimit = PLAN_TEMPLATE_LIMITS[plan] ?? PLAN_TEMPLATE_LIMITS.free;

    return NextResponse.json({
      plan,
      creditsBalance,
      creditsPerMonth,
      totalCredits,
      usedCredits,
      templateCount,
      templateLimit,
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
