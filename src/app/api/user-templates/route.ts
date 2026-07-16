import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { templates } from "@/db/schema";
import { getRequestUser } from "@/lib/server/request-user";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestedLimit = Number(request.nextUrl.searchParams.get("limit") || 9);
    const requestedOffset = Number(request.nextUrl.searchParams.get("offset") || 0);
    const limit = Math.max(1, Math.min(101, requestedLimit));
    const offset = Math.max(0, requestedOffset);

    const data = await db
      .select()
      .from(templates)
      .where(eq(templates.user_id, user.id))
      .orderBy(desc(templates.lastModified))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[User templates] Failed to list templates:", error);
    return NextResponse.json({ error: "Failed to load templates" }, { status: 500 });
  }
}
