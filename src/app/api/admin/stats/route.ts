import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { users, templates, projects, userApiKeys } from "@/db/schema";
import { count, gte, sum } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (session.user.role !== "superadmin") {
      return NextResponse.json(
        { error: "Acceso denegado. Se requiere rol de superadmin." },
        { status: 403 },
      );
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsersResult,
      totalTemplatesResult,
      totalRendersResult,
      totalApiKeysResult,
      usersThisMonthResult,
      templatesThisMonthResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(templates),
      db.select({ total: sum(users.renderCount) }).from(users),
      db.select({ count: count() }).from(userApiKeys),
      db
        .select({ count: count() })
        .from(users)
        .where(gte(users.emailVerified, firstDayOfMonth)),
      db
        .select({ count: count() })
        .from(templates)
        .where(gte(templates.createdAt, firstDayOfMonth)),
    ]);

    const stats = {
      totalUsers: totalUsersResult[0]?.count || 0,
      totalTemplates: totalTemplatesResult[0]?.count || 0,
      totalRenders: totalRendersResult[0]?.total || 0,
      totalApiKeys: totalApiKeysResult[0]?.count || 0,
      usersThisMonth: usersThisMonthResult[0]?.count || 0,
      templatesThisMonth: templatesThisMonthResult[0]?.count || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 },
    );
  }
}
