import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { templates } from "@/db/schema";
import { getRequestUser } from "@/lib/server/request-user";

type RouteContext = { params: { id: string } };

const allowedFields = [
  "name",
  "json",
  "height",
  "width",
  "thumbnailUrl",
  "description",
  "tags",
  "folderId",
] as const;

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [data] = await db
      .select()
      .from(templates)
      .where(and(eq(templates.id, params.id), eq(templates.user_id, user.id)))
      .limit(1);

    if (!data) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[User templates] Failed to load template:", error);
    return NextResponse.json({ error: "Failed to load template" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const values: Record<string, unknown> = {
      updatedAt: new Date(),
      lastModified: new Date(),
    };

    for (const field of allowedFields) {
      if (body[field] !== undefined) values[field] = body[field];
    }

    const [data] = await db
      .update(templates)
      .set(values)
      .where(and(eq(templates.id, params.id), eq(templates.user_id, user.id)))
      .returning();

    if (!data) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[User templates] Failed to update template:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [deleted] = await db
      .delete(templates)
      .where(and(eq(templates.id, params.id), eq(templates.user_id, user.id)))
      .returning({ id: templates.id });

    if (!deleted) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("[User templates] Failed to delete template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
