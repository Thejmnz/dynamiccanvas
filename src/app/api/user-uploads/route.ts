import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { auth } from "@/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BUCKET = "media";
const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function getStorageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getUserFolder(userId: string) {
  return `uploads/${userId}`;
}

function sanitizeFileName(fileName: string) {
  const sanitized = fileName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");

  return sanitized || "image";
}

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storage = getStorageClient();
    if (!storage) {
      return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
    }

    const folder = getUserFolder(userId);
    const { data, error } = await storage.storage.from(BUCKET).list(folder, {
      limit: 1000,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) throw error;

    const images = (data ?? [])
      .filter((file) => file.id && file.name !== ".emptyFolderPlaceholder")
      .map((file) => {
        const path = `${folder}/${file.name}`;
        const { data: publicData } = storage.storage.from(BUCKET).getPublicUrl(path);

        return {
          id: file.id || path,
          name: file.name,
          path,
          url: publicData.publicUrl,
          createdAt: file.created_at ?? null,
        };
      });

    return NextResponse.json(
      { data: images },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[User uploads] Failed to list images:", error);
    return NextResponse.json({ error: "Could not load uploads" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storage = getStorageClient();
    if (!storage) {
      return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Unsupported image format" }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ error: "Image must be smaller than 20 MB" }, { status: 413 });
    }

    const path = `${getUserFolder(userId)}/${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await storage.storage.from(BUCKET).upload(path, bytes, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) throw error;

    const { data: publicData } = storage.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({
      id: path,
      name: file.name,
      path,
      url: publicData.publicUrl,
    }, { status: 201 });
  } catch (error) {
    console.error("[User uploads] Failed to upload image:", error);
    return NextResponse.json({ error: "Could not upload image" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storage = getStorageClient();
    if (!storage) {
      return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
    }

    const body = await request.json() as { path?: string };
    const prefix = `${getUserFolder(userId)}/`;
    const relativePath = typeof body.path === "string" && body.path.startsWith(prefix)
      ? body.path.slice(prefix.length)
      : "";

    if (!relativePath || relativePath.includes("/") || relativePath.includes("..")) {
      return NextResponse.json({ error: "Invalid upload path" }, { status: 400 });
    }

    const path = `${prefix}${relativePath}`;
    const { error } = await storage.storage.from(BUCKET).remove([path]);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[User uploads] Failed to delete image:", error);
    return NextResponse.json({ error: "Could not delete image" }, { status: 500 });
  }
}
