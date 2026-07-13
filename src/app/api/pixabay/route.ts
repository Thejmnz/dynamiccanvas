import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PIXABAY_API_URL = "https://pixabay.com/api/";
const MAX_IMPORT_SIZE = 12 * 1024 * 1024;
const MAX_PREVIEW_SIZE = 5 * 1024 * 1024;
const PIXABAY_IMAGE_HEADERS = {
  Accept: "image/avif,image/webp,image/jpeg,image/*",
  Referer: "https://pixabay.com/",
  "User-Agent": "DynamicCanvas/1.0 (+https://dynamiccanvas.app)",
};
const VALID_CATEGORIES = new Set([
  "backgrounds",
  "fashion",
  "nature",
  "science",
  "education",
  "feelings",
  "health",
  "people",
  "religion",
  "places",
  "animals",
  "industry",
  "computer",
  "food",
  "sports",
  "transportation",
  "travel",
  "buildings",
  "business",
  "music",
]);

type PixabayHit = {
  id: number;
  pageURL: string;
  tags: string;
  previewURL: string;
  webformatURL: string;
  largeImageURL: string;
  webformatWidth: number;
  webformatHeight: number;
  user: string;
  user_id: number;
};

const getPixabayKey = () => (
  process.env.PIXABAY_API_KEY || process.env.NEXT_PUBLIC_PIXABAY_API_KEY
);

const isPixabayImageUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (
      url.hostname === "pixabay.com" ||
      url.hostname.endsWith(".pixabay.com")
    );
  } catch {
    return false;
  }
};

const getExtension = (contentType: string) => {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  return "jpg";
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const previewUrl = searchParams.get("imageUrl") || "";

  if (previewUrl) {
    if (!isPixabayImageUrl(previewUrl)) {
      return NextResponse.json({ error: "Invalid Pixabay image" }, { status: 400 });
    }

    try {
      const imageResponse = await fetch(previewUrl, {
        cache: "force-cache",
        headers: PIXABAY_IMAGE_HEADERS,
      });
      if (!imageResponse.ok) {
        return NextResponse.json({ error: "Could not load image" }, { status: 502 });
      }

      const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
      const contentLength = Number(imageResponse.headers.get("content-length")) || 0;
      if (!contentType.startsWith("image/") || contentLength > MAX_PREVIEW_SIZE) {
        return NextResponse.json({ error: "Unsupported image" }, { status: 400 });
      }

      const bytes = await imageResponse.arrayBuffer();
      if (bytes.byteLength > MAX_PREVIEW_SIZE) {
        return NextResponse.json({ error: "Image is too large" }, { status: 413 });
      }

      return new NextResponse(bytes, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          "Content-Length": String(bytes.byteLength),
        },
      });
    } catch (error) {
      console.error("[Pixabay] Preview proxy failed:", error);
      return NextResponse.json({ error: "Could not load image" }, { status: 502 });
    }
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = getPixabayKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Pixabay API key is not configured" },
      { status: 503 },
    );
  }

  const query = (searchParams.get("q") || "").trim().slice(0, 100);
  const categoryValue = searchParams.get("category") || "";
  const category = VALID_CATEGORIES.has(categoryValue) ? categoryValue : "";
  const language = searchParams.get("lang") === "es" ? "es" : "en";
  const page = Math.max(1, Math.min(25, Number(searchParams.get("page")) || 1));

  const pixabayParams = new URLSearchParams({
    key: apiKey,
    image_type: "photo",
    safesearch: "true",
    order: "popular",
    per_page: "24",
    page: String(page),
    lang: language,
  });

  if (query) pixabayParams.set("q", query);
  if (category) pixabayParams.set("category", category);

  try {
    const response = await fetch(`${PIXABAY_API_URL}?${pixabayParams}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      const message = await response.text();
      return NextResponse.json(
        { error: message || "Pixabay request failed" },
        { status: response.status },
      );
    }

    const data = await response.json() as {
      total: number;
      totalHits: number;
      hits: PixabayHit[];
    };

    return NextResponse.json(
      {
        total: data.total,
        totalHits: data.totalHits,
        hits: (data.hits || []).map((image) => ({
          id: image.id,
          pageURL: image.pageURL,
          tags: image.tags,
          previewURL: image.previewURL,
          webformatURL: image.webformatURL,
          largeImageURL: image.largeImageURL,
          webformatWidth: image.webformatWidth,
          webformatHeight: image.webformatHeight,
          user: image.user,
          userId: image.user_id,
        })),
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("[Pixabay] Search failed:", error);
    return NextResponse.json({ error: "Could not search Pixabay" }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  }

  try {
    const body = await request.json() as {
      id?: number;
      imageUrl?: string;
    };
    const imageId = Number(body.id);
    const imageUrl = body.imageUrl || "";

    if (!Number.isInteger(imageId) || !isPixabayImageUrl(imageUrl)) {
      return NextResponse.json({ error: "Invalid Pixabay image" }, { status: 400 });
    }

    const imageResponse = await fetch(imageUrl, {
      cache: "force-cache",
      headers: PIXABAY_IMAGE_HEADERS,
    });
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Could not download image" }, { status: 502 });
    }

    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    const contentLength = Number(imageResponse.headers.get("content-length")) || 0;
    if (!contentType.startsWith("image/") || contentLength > MAX_IMPORT_SIZE) {
      return NextResponse.json({ error: "Unsupported image" }, { status: 400 });
    }

    const bytes = Buffer.from(await imageResponse.arrayBuffer());
    if (bytes.byteLength > MAX_IMPORT_SIZE) {
      return NextResponse.json({ error: "Image is too large" }, { status: 413 });
    }

    const extension = getExtension(contentType);
    const safeUserId = session.user.id.replace(/[^a-zA-Z0-9_-]/g, "");
    const storagePath = `pixabay/${safeUserId}/${Date.now()}-${imageId}.${extension}`;
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(storagePath, bytes, {
        contentType,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.error("[Pixabay] Storage upload failed:", uploadError);
      return NextResponse.json({ error: "Could not store image" }, { status: 502 });
    }

    const { data: publicData } = supabase.storage
      .from("media")
      .getPublicUrl(storagePath);

    return NextResponse.json({ url: publicData.publicUrl });
  } catch (error) {
    console.error("[Pixabay] Import failed:", error);
    return NextResponse.json({ error: "Could not import image" }, { status: 500 });
  }
}
