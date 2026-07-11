import { NextRequest, NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { users, templates, projects, userApiKeys } from "@/db/schema";

const PLAN_CREDITS: Record<string, number> = {
  free: 0,
  creator: 1000,
  agency: 5000,
  business: 25000,
};

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (session.user.role !== "superadmin") {
      return NextResponse.json(
        { error: "Acceso denegado. Se requiere rol de superadmin." },
        { status: 403 }
      );
    }

    const allUsers = await db.select().from(users);

    const templateCounts = await db
      .select({ userId: templates.user_id, count: count() })
      .from(templates)
      .groupBy(templates.user_id);

    const projectCounts = await db
      .select({ userId: projects.userId, count: count() })
      .from(projects)
      .groupBy(projects.userId);

    const apiKeys = await db.select().from(userApiKeys);

    const templateCountMap = new Map(templateCounts.map((item) => [item.userId, item.count]));
    const projectCountMap = new Map(projectCounts.map((item) => [item.userId, item.count]));
    const apiKeySet = new Set(apiKeys.map((item) => item.userId));

    const usersWithStats = allUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
      image: user.image,
      createdAt: user.emailVerified,
      plan: user.plan || "free",
      creditsBalance: user.creditsBalance ?? 0,
      creditsPerMonth: user.creditsPerMonth ?? 0,
      renderCount: user.renderCount ?? 0,
      templatesCount: templateCountMap.get(user.id) || 0,
      projectsCount: projectCountMap.get(user.id) || 0,
      hasApiKey: apiKeySet.has(user.id),
    }));

    usersWithStats.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json(usersWithStats);
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, plan, creditsBalance, creditsPerMonth } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const updates: Record<string, any> = {};

    if (plan !== undefined) {
      updates.plan = plan;
      const nextReset = new Date();
      nextReset.setMonth(nextReset.getMonth() + 1);
      updates.creditsResetAt = plan === "free" ? null : nextReset;
    }

    if (creditsBalance !== undefined) {
      updates.creditsBalance = Number(creditsBalance);
    }

    if (creditsPerMonth !== undefined) {
      updates.creditsPerMonth = Number(creditsPerMonth);
    }

    await db.update(users).set(updates).where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin] Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
