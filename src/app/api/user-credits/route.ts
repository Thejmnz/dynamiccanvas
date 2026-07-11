import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { count, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { users, templates } from "@/db/schema";

export const dynamic = "force-dynamic";

const PLAN_TEMPLATE_LIMITS: Record<string, number> = {
  free: 3,
  creator: 15,
  agency: 100,
  business: Infinity,
};

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

    const { data: { user }, error } = await supabase.auth.getUser(tokenCookie);

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [dbUser] = await db
      .select({
        plan: users.plan,
        creditsBalance: users.creditsBalance,
        creditsPerMonth: users.creditsPerMonth,
      })
      .from(users)
      .where(eq(users.id, user.id));

    const [{ value: templateCount }] = await db
      .select({ value: count() })
      .from(templates)
      .where(eq(templates.user_id, user.id));

    const plan = dbUser?.plan || "free";
    const creditsPerMonth = dbUser?.creditsPerMonth || 0;
    const creditsBalance = dbUser?.creditsBalance ?? 50;
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
