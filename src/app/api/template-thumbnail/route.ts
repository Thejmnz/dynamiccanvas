import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { and, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { templates } from "@/db/schema";

export const runtime = "nodejs";

const MAX_THUMBNAIL_SIZE = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const projectId = formData.get("projectId");
    const thumbnail = formData.get("thumbnail");
    if (typeof projectId !== "string" || !(thumbnail instanceof File)) {
      return NextResponse.json({ error: "Project and thumbnail are required" }, { status: 400 });
    }
    if (thumbnail.type !== "image/jpeg" || thumbnail.size <= 0 || thumbnail.size > MAX_THUMBNAIL_SIZE) {
      return NextResponse.json({ error: "Invalid thumbnail" }, { status: 400 });
    }

    const [ownedTemplate] = await db
      .select({ id: templates.id })
      .from(templates)
      .where(and(eq(templates.id, projectId), eq(templates.user_id, userId)))
      .limit(1);
    if (!ownedTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
    }

    const storage = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const path = `thumbnails/${projectId}/thumbnail.jpg`;
    const bytes = new Uint8Array(await thumbnail.arrayBuffer());
    const { error } = await storage.storage.from("media").upload(path, bytes, {
      contentType: "image/jpeg",
      cacheControl: "no-cache",
      upsert: true,
    });
    if (error) throw error;

    const { data } = storage.storage.from("media").getPublicUrl(path);
    return NextResponse.json({ url: `${data.publicUrl}?t=${Date.now()}` });
  } catch (error) {
    console.error("[Template thumbnail] Upload failed:", error);
    return NextResponse.json({ error: "Could not upload thumbnail" }, { status: 500 });
  }
}
