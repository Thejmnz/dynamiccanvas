import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // List all files in the fonts folder
    const { data, error } = await supabase.storage
      .from("media")
      .list("fonts", {
        limit: 100,
        offset: 0,
      });

    if (error) {
      return NextResponse.json([], { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } });
    }

    // Extract font information
    const fonts = data
      .filter((file) => file.name !== ".emptyFolderPlaceholder")
      .map((file) => ({
        name: file.name,
        // Get the font name without the timestamp prefix (e.g., "1234567890-MyFont.ttf" -> "MyFont")
        displayName: file.name.replace(/^\d+-/, "").replace(/\.[^/.]+$/, ""),
        publicUrl: `${supabaseUrl}/storage/v1/object/public/media/fonts/${file.name}`,
      }));

    return NextResponse.json(fonts, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
