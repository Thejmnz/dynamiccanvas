import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const PAID_PLANS = new Set(["creator", "agency", "business", "unlimited"]);
const FONT_EXTENSIONS = new Set(["ttf", "otf", "woff", "woff2"]);

function hasValidFontSignature(bytes: Uint8Array) {
  if (bytes.length < 4) return false;
  const signature = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  return (
    (bytes[0] === 0x00 && bytes[1] === 0x01 && bytes[2] === 0x00 && bytes[3] === 0x00) ||
    signature === "OTTO" ||
    signature === "wOFF" ||
    signature === "wOF2" ||
    signature === "ttcf"
  );
}

async function getUserId(req: NextRequest) {
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? "";
  const tokenCookie =
    req.cookies.get(`sb-${projectRef}-auth-token`)?.value ||
    req.cookies.get(`sb-${projectRef}-auth-token.0`)?.value;
  if (!tokenCookie) return null;

  const authClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const { data } = await authClient.auth.getUser(tokenCookie);
  return data.user?.id ?? null;
}

async function hasPaidPlan(userId: string) {
  const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId));
  return PAID_PLANS.has(user?.plan ?? "free");
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await hasPaidPlan(userId))) {
      return NextResponse.json({ error: "Custom fonts require a paid plan" }, { status: 403 });
    }

    const supabase = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
      {
      auth: { persistSession: false },
      },
    );

    const { data, error } = await supabase.storage
      .from("media")
      .list("fonts", { limit: 100, offset: 0 });

    if (error) {
      return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
    }

    const fonts = (data ?? [])
      .filter((file) =>
        file.name !== ".emptyFolderPlaceholder" && file.name.startsWith(`${userId}-`),
      )
      .map((file) => {
        const withoutOwner = file.name.startsWith(`${userId}-`)
          ? file.name.slice(userId.length + 1)
          : file.name;
        return {
          name: file.name,
          displayName: withoutOwner.replace(/^\d+-/, "").replace(/\.[^/.]+$/, ""),
          publicUrl: `${supabaseUrl}/storage/v1/object/public/media/fonts/${file.name}`,
        };
      });

    return NextResponse.json(fonts, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await hasPaidPlan(userId))) {
      return NextResponse.json({ error: "Custom fonts require a paid plan" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("font");
    if (!(file instanceof File)) return NextResponse.json({ error: "Font file is required" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Font must be smaller than 10 MB" }, { status: 400 });

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!FONT_EXTENSIONS.has(extension)) {
      return NextResponse.json({ error: "Unsupported font format" }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasValidFontSignature(bytes)) {
      return NextResponse.json(
        { error: "The selected file is not a valid font" },
        { status: 400 },
      );
    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `fonts/${userId}-${Date.now()}-${safeFileName}`;
    const storage = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
      { auth: { persistSession: false } },
    );
    const { error } = await storage.storage.from("media").upload(storagePath, bytes, {
      contentType: file.type || "application/octet-stream",
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) throw error;

    const { data } = storage.storage.from("media").getPublicUrl(storagePath);
    return NextResponse.json({
      displayName: file.name.replace(/\.[^/.]+$/, ""),
      publicUrl: data.publicUrl,
    });
  } catch (error) {
    console.error("Font upload failed:", error);
    return NextResponse.json({ error: "Could not upload font" }, { status: 500 });
  }
}
