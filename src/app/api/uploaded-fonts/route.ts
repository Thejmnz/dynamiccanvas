import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { auth } from "@/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;

    // 1. Try NextAuth session
    const session = await auth();
    if (session?.user?.id) {
      userId = session.user.id;
    }

    // 2. Fall back to Supabase cookie
    if (!userId) {
      const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? "";
      const tokenCookie =
        req.cookies.get(`sb-${projectRef}-auth-token`)?.value ||
        req.cookies.get(`sb-${projectRef}-auth-token.0`)?.value;
      if (tokenCookie) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: false },
        });
        const { data: userData } = await supabase.auth.getUser(tokenCookie);
        userId = userData.user?.id ?? null;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase.storage
      .from("media")
      .list("fonts", { limit: 100, offset: 0 });

    if (error) {
      return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
    }

    const fonts = (data ?? [])
      .filter((file) => file.name !== ".emptyFolderPlaceholder")
      .map((file) => ({
        name: file.name,
        displayName: file.name.replace(/^\d+-/, "").replace(/\.[^/.]+$/, ""),
        publicUrl: `${supabaseUrl}/storage/v1/object/public/media/fonts/${file.name}`,
      }));

    return NextResponse.json(fonts, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
