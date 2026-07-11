import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { count, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { templates, users } from "@/db/schema";

type RequestUser = { id: string; email: string; name: string };

async function getRequestUser(req: NextRequest): Promise<RequestUser | null> {
  const session = await auth();
  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email || "",
      name: session.user.name || session.user.email?.split("@")[0] || "User",
    };
  }

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
  if (!user) return null;
  return {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
  };
}

export async function POST(req: NextRequest) {
  try {
    const requestUser = await getRequestUser(req);
    if (!requestUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.insert(users).values({
      id: requestUser.id,
      email: requestUser.email,
      name: requestUser.name,
    }).onConflictDoNothing({ target: users.id });

    const [account] = await db
      .select({ plan: users.plan })
      .from(users)
      .where(eq(users.id, requestUser.id));
    const [{ value: templateCount }] = await db
      .select({ value: count() })
      .from(templates)
      .where(eq(templates.user_id, requestUser.id));

    const PLAN_TEMPLATE_LIMITS: Record<string, number> = {
      free: 3,
      creator: 15,
      agency: 100,
      business: Infinity,
      unlimited: Infinity,
    };
    const plan = account?.plan || "free";
    const limit = PLAN_TEMPLATE_LIMITS[plan] ?? PLAN_TEMPLATE_LIMITS.free;
    if (templateCount >= limit) {
      return NextResponse.json({
        error: plan === "free"
          ? "Free accounts can create up to 3 templates. Upgrade to create more."
          : `Your ${plan} plan allows up to ${limit} templates.`,
        code: "TEMPLATE_LIMIT_REACHED",
      }, { status: 403 });
    }

    const body = await req.json();
    const width = Math.max(1, Math.min(10000, Number(body.width) || 800));
    const height = Math.max(1, Math.min(10000, Number(body.height) || 600));
    const json = typeof body.json === "string"
      ? body.json
      : JSON.stringify(body.json || { version: "5.3.0", objects: [] });
    let elements: unknown = [];
    try { elements = json ? JSON.parse(json) : []; } catch { elements = []; }
    const now = new Date();

    const [created] = await db.insert(templates).values({
      id: crypto.randomUUID(),
      user_id: requestUser.id,
      name: String(body.name || "Untitled Project").slice(0, 255),
      width,
      height,
      json,
      elements,
      backgroundColor: "#ffffff",
      preset: "",
      isPro: false,
      createdAt: now,
      updatedAt: now,
      lastModified: now,
    }).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[Templates] Failed to create template:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
