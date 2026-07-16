import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { templates } from "@/db/schema";
import { getRequestUser } from "@/lib/server/request-user";

type RouteContext = { params: { id: string } };

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [source] = await db
      .select()
      .from(templates)
      .where(and(eq(templates.id, params.id), eq(templates.user_id, user.id)))
      .limit(1);

    if (!source) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const now = new Date();
    const [data] = await db
      .insert(templates)
      .values({
        ...source,
        id: crypto.randomUUID(),
        user_id: user.id,
        name: `${source.name} (Copy)`,
        createdAt: now,
        updatedAt: now,
        lastModified: now,
      })
      .returning();

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("[User templates] Failed to duplicate template:", error);
    return NextResponse.json({ error: "Failed to duplicate template" }, { status: 500 });
  }
}
