import { NextRequest, NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PLAN_MEMBER_LIMITS: Record<string, number> = {
  free: 1,
  creator: 2,
  agency: 5,
  business: 20,
  unlimited: 999,
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getTeamUsers(admin: NonNullable<ReturnType<typeof getAdminClient>>, ownerId: string) {
  const teamUsers: User[] = [];
  let page = 1;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const usersOnPage = data.users || [];
    teamUsers.push(...usersOnPage.filter((user) => user.user_metadata?.team_owner_id === ownerId));
    if (usersOnPage.length < 200) break;
    page += 1;
  }

  return teamUsers;
}

function serializeMember(user: User) {
  return {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Member",
    role: user.user_metadata?.team_role || "member",
    status: user.email_confirmed_at ? "active" : "pending",
    invitedAt: user.invited_at || user.created_at,
  };
}

export async function GET() {
  try {
    const session = await auth();
    const ownerId = session?.user?.id;
    if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = getAdminClient();
    if (!admin) return NextResponse.json({ error: "Team invitations are not configured" }, { status: 503 });

    const [account] = await db
      .select({ plan: users.plan })
      .from(users)
      .where(eq(users.id, ownerId));
    const plan = account?.plan || "free";
    const members = (await getTeamUsers(admin, ownerId)).map(serializeMember);

    return NextResponse.json({
      members,
      plan,
      limit: PLAN_MEMBER_LIMITS[plan] ?? PLAN_MEMBER_LIMITS.free,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[Team] Failed to load members:", error);
    return NextResponse.json({ error: "Could not load team members" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const ownerId = session?.user?.id;
    const ownerEmail = session?.user?.email?.toLowerCase();
    if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = getAdminClient();
    if (!admin) return NextResponse.json({ error: "Team invitations are not configured" }, { status: 503 });

    const body = await request.json() as { email?: string; teamName?: string };
    const email = body.email?.trim().toLowerCase() || "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    if (email === ownerEmail) {
      return NextResponse.json({ error: "You are already the owner of this team" }, { status: 400 });
    }

    const [account] = await db
      .select({ plan: users.plan })
      .from(users)
      .where(eq(users.id, ownerId));
    const plan = account?.plan || "free";
    const limit = PLAN_MEMBER_LIMITS[plan] ?? PLAN_MEMBER_LIMITS.free;
    if (limit <= 1) {
      return NextResponse.json({ error: "Upgrade your plan to invite team members" }, { status: 403 });
    }

    const existingTeamUsers = await getTeamUsers(admin, ownerId);
    if (existingTeamUsers.length + 1 >= limit) {
      return NextResponse.json({ error: `Your ${plan} plan allows ${limit} team members` }, { status: 403 });
    }
    if (existingTeamUsers.some((user) => user.email?.toLowerCase() === email)) {
      return NextResponse.json({ error: "This email has already been invited" }, { status: 409 });
    }

    const origin = request.nextUrl.origin;
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/dashboard/team`,
      data: {
        team_owner_id: ownerId,
        team_name: String(body.teamName || "Team").slice(0, 60),
        team_role: "member",
        invited_by: session.user?.name || ownerEmail || "Team owner",
      },
    });
    if (error) {
      const message = error.message.toLowerCase().includes("already")
        ? "This email already belongs to an account"
        : error.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ member: serializeMember(data.user) }, { status: 201 });
  } catch (error) {
    console.error("[Team] Failed to invite member:", error);
    return NextResponse.json({ error: "Could not send the invitation" }, { status: 500 });
  }
}
