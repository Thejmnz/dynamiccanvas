import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { createCanvas, loadImage } from "canvas";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error("Supabase storage is not configured");
}

const assets = [
  { file: "interior-living-room.jpg", photoId: "jw_Y7R3NabQ", author: "Luis Redondo", source: "https://unsplash.com/photos/jw_Y7R3NabQ" },
  { file: "fresh-vegetables.jpg", photoId: "nbZLAzK1yWU", author: "Fatane Rahimi", source: "https://unsplash.com/photos/nbZLAzK1yWU" },
  { file: "podcast-studio.jpg", photoId: "R6Xvxkvhd34", author: "Flipsnack", source: "https://unsplash.com/photos/R6Xvxkvhd34" },
  { file: "tropical-beach.jpg", photoId: "kSj-DkvMduw", author: "Nattu Adnan", source: "https://unsplash.com/photos/kSj-DkvMduw" },
  { file: "football-stadium.jpg", photoId: "dZ7mE_oA8Yc", author: "Michael Lee", source: "https://unsplash.com/photos/dZ7mE_oA8Yc" },
  { file: "skincare-product.jpg", photoId: "GyFNa1C69HM", author: "Ela De Pure", source: "https://unsplash.com/photos/GyFNa1C69HM" },
  { file: "cafe-lifestyle.jpg", photoId: "DB1sPXX07Zs", author: "Lin", source: "https://unsplash.com/photos/DB1sPXX07Zs" },
  {
    file: "halloween-pumpkin.jpg",
    downloadUrl: "https://images.unsplash.com/photo-1509557965875-b88c97052f0e?auto=format&fit=crop&w=1800&q=88",
    author: "Unsplash contributor",
    source: "https://images.unsplash.com/photo-1509557965875-b88c97052f0e",
  },
  {
    file: "christmas-gifts.jpg",
    downloadUrl: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1800&q=88",
    author: "Unsplash contributor",
    source: "https://images.unsplash.com/photo-1512389142860-9c449e58a543",
  },
  {
    file: "new-year-fireworks.jpg",
    downloadUrl: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=1800&q=88",
    author: "Unsplash contributor",
    source: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9",
  },
  {
    file: "valentine-flowers.jpg",
    downloadUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1800&q=88",
    author: "Unsplash contributor",
    source: "https://images.unsplash.com/photo-1518199266791-5375a83190b7",
  },
  {
    file: "street-fashion.jpg",
    downloadUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=88",
    author: "Unsplash contributor",
    source: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b",
  },
  {
    file: "fitness-training.jpg",
    downloadUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1800&q=88",
    author: "Unsplash contributor",
    source: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c",
  },
  {
    file: "celebration-cake.jpg",
    downloadUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1800&q=88",
    author: "Unsplash contributor",
    source: "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
  },
];

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
const output = [];

for (const asset of assets) {
  const downloadUrl = asset.downloadUrl || `https://unsplash.com/photos/${asset.photoId}/download?force=true`;
  const response = await fetch(downloadUrl, {
    redirect: "follow",
    headers: {
      Accept: "image/jpeg,image/*;q=0.8",
      "User-Agent": "DynamicCanvasDesignLibrary/1.0",
    },
  });

  if (!response.ok) throw new Error(`Could not download ${asset.photoId || asset.file}: ${response.status}`);
  const contentType = response.headers.get("content-type") || "image/jpeg";
  if (!contentType.startsWith("image/")) throw new Error(`Unexpected content type for ${asset.photoId || asset.file}: ${contentType}`);

  const originalBytes = Buffer.from(await response.arrayBuffer());
  const image = await loadImage(originalBytes);
  const maxDimension = 1800;
  const ratio = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));
  const canvas = createCanvas(width, height);
  canvas.getContext("2d").drawImage(image, 0, 0, width, height);
  const bytes = canvas.toBuffer("image/jpeg", { quality: 0.86, progressive: true });
  const path = `design-assets/${asset.file}`;
  const { error } = await supabase.storage.from("media").upload(path, bytes, {
    contentType: "image/jpeg",
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  output.push({ ...asset, width, height, bytes: bytes.byteLength, url: data.publicUrl });
}

const sourceManifest = new TextEncoder().encode(JSON.stringify({ provider: "Unsplash", license: "https://unsplash.com/license", assets }, null, 2));
const { error: manifestError } = await supabase.storage.from("media").upload("design-assets/sources.json", sourceManifest, {
  contentType: "application/json",
  cacheControl: "3600",
  upsert: true,
});
if (manifestError) throw manifestError;

console.log(JSON.stringify(output, null, 2));
