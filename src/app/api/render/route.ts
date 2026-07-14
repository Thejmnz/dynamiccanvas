import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createCanvas, registerFont } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

import { db } from "@/db/drizzle";
import { and, gt, sql, eq } from "drizzle-orm";
import { users, renders } from "@/db/schema";
// Type for canvas elements
interface CanvasElement {
  id: string;
  type: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  text?: string;
  fill?: string;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  src?: string;
  [key: string]: any;
}

const setFiniteNumber = (
  target: Record<string, any>,
  source: Record<string, any>,
  key: string,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
) => {
  if (source[key] === undefined) return;
  const value = Number(source[key]);
  if (Number.isFinite(value)) target[key] = Math.min(max, Math.max(min, value));
};

const setString = (target: Record<string, any>, source: Record<string, any>, key: string) => {
  if (typeof source[key] === "string") target[key] = source[key];
};

const setBoolean = (target: Record<string, any>, source: Record<string, any>, key: string) => {
  if (typeof source[key] === "boolean") target[key] = source[key];
};

function applyCommonLayerOverrides(element: Record<string, any>, update: Record<string, any>) {
  const next = { ...element };

  setFiniteNumber(next, update, "x");
  setFiniteNumber(next, update, "y");
  setFiniteNumber(next, update, "width", 1);
  setFiniteNumber(next, update, "height", 1);
  setFiniteNumber(next, update, "rotation", -3600, 3600);
  setFiniteNumber(next, update, "scaleX", -100, 100);
  setFiniteNumber(next, update, "scaleY", -100, 100);
  setFiniteNumber(next, update, "opacity", 0, 1);
  setFiniteNumber(next, update, "zIndex", -100000, 100000);
  setFiniteNumber(next, update, "strokeWidth", 0);
  setFiniteNumber(next, update, "shadowBlur", 0);
  setFiniteNumber(next, update, "shadowOpacity", 0, 1);
  setFiniteNumber(next, update, "shadowOffsetX");
  setFiniteNumber(next, update, "shadowOffsetY");

  setString(next, update, "fill");
  setString(next, update, "stroke");
  setString(next, update, "shadowColor");
  setBoolean(next, update, "visible");

  if (typeof update.color === "string") next.fill = update.color;
  if (update.angle !== undefined && update.rotation === undefined) {
    const angle = Number(update.angle);
    if (Number.isFinite(angle)) next.rotation = angle;
  }

  return next;
}

function traceImageMaskPath(
  ctx: any,
  width: number,
  height: number,
  shape: string,
  radius: number,
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const polygon = (sides: number, innerRatio?: number) => {
    const count = innerRatio ? sides * 2 : sides;
    for (let index = 0; index < count; index += 1) {
      const outer = !innerRatio || index % 2 === 0;
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / count;
      const ratio = outer ? 1 : innerRatio!;
      const x = centerX + Math.cos(angle) * centerX * ratio;
      const y = centerY + Math.sin(angle) * centerY * ratio;
      index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
  };

  ctx.beginPath();
  if (shape === "circle") {
    ctx.ellipse(centerX, centerY, centerX, centerY, 0, 0, Math.PI * 2);
  } else if (shape === "star") {
    polygon(5, 0.45);
  } else if (shape === "triangle") {
    polygon(3);
  } else if (shape === "diamond") {
    polygon(4);
  } else if (shape === "pentagon") {
    polygon(5);
  } else if (shape === "hexagon") {
    polygon(6);
  } else if (shape === "octagon") {
    polygon(8);
  } else if (shape === "quarter-circle") {
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.ellipse(0, 0, width, height, 0, 0, Math.PI / 2);
    ctx.closePath();
  } else if (radius > 0 || shape === "rounded-rectangle") {
    const r = Math.min(width / 2, height / 2, Math.max(radius, shape === "rounded-rectangle" ? Math.min(width, height) * 0.12 : 0));
    ctx.moveTo(r, 0);
    ctx.lineTo(width - r, 0);
    ctx.quadraticCurveTo(width, 0, width, r);
    ctx.lineTo(width, height - r);
    ctx.quadraticCurveTo(width, height, width - r, height);
    ctx.lineTo(r, height);
    ctx.quadraticCurveTo(0, height, 0, height - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
  } else {
    ctx.rect(0, 0, width, height);
  }
}

// All fonts are loaded from public/fonts folder or Supabase storage
// Font names match the filenames in public/fonts (without extension)
const DEFAULT_FONTS = [
  // Fonts in public/fonts
  'Arial', 'Arial Black', 'Verdana', 'Tahoma', 'Trebuchet MS',
  'Times New Roman', 'Georgia', 'Garamond', 'Courier New',
  'Palatino', 'Bookman', 'Comic Sans MS', 'Impact', 'Lucida Console',
  'Playfair Display',
  // Google Fonts in public/fonts
  'Lato', 'Open Sans', 'Oswald', 'Raleway', 'Ubuntu',
  'Merriweather', 'Roboto', 'Roboto Slab', 'Noto Sans', 'Noto Serif',
];

// Helper function to get the best available font
// Since we load all fonts from public/fonts, just return the font name
function getBestFont(fontFamily: string | undefined): string {
  if (!fontFamily) return 'Liberation Sans';
  return fontFamily;
}

interface CanvasData {
  version: string;
  workspace: {
    width: number;
    height: number;
    background: string;
  };
  elements: CanvasElement[];
}

function convertFabricCanvasData(parsed: any, template: any): CanvasData | null {
  if (!Array.isArray(parsed?.objects)) return null;

  const workspaceObject = parsed.objects.find((object: any) => object?.name === "clip");
  const workspaceWidth = Number(workspaceObject?.width || template?.width || 800);
  const workspaceHeight = Number(workspaceObject?.height || template?.height || 600);
  const workspaceLeft = Number(workspaceObject?.left || 0);
  const workspaceTop = Number(workspaceObject?.top || 0);

  const elements = parsed.objects
    .filter((object: any) => object?.name !== "clip" && object?.visible !== false)
    .map((object: any, index: number) => {
      const originalType = String(object.type || "").toLowerCase();
      let type = originalType;

      if (["textbox", "i-text"].includes(originalType)) type = "text";
      if (["ellipse"].includes(originalType)) type = "circle";
      if (originalType === "polygon") {
        type = object.points?.length === 3
          ? "triangle"
          : object.points?.length === 4
            ? "diamond"
            : "rect";
      }

      if (!["rect", "circle", "triangle", "diamond", "text", "image"].includes(type)) {
        return null;
      }

      const scaleX = Number(object.scaleX || 1);
      const scaleY = Number(object.scaleY || 1);
      const width = Number(
        object.width || (originalType === "ellipse" ? Number(object.rx || 0) * 2 : 100),
      );
      const height = Number(
        object.fixedHeight || object.height || (originalType === "ellipse" ? Number(object.ry || 0) * 2 : 100),
      );
      let x = Number(object.left || 0) - workspaceLeft;
      let y = Number(object.top || 0) - workspaceTop;

      if (object.originX === "center") x -= (width * scaleX) / 2;
      if (object.originX === "right") x -= width * scaleX;
      if (object.originY === "center") y -= (height * scaleY) / 2;
      if (object.originY === "bottom") y -= height * scaleY;

      return {
        ...object,
        id: object.konvaId || object.name || `fabric-element-${index + 1}`,
        name: object.name,
        type,
        x,
        y,
        width,
        height,
        rotation: Number(object.angle || 0),
        scaleX,
        scaleY,
        src: object.src,
        fill: object.fill,
        text: object.text,
        fontFamily: object.fontFamily,
        fontSize: object.fontSize,
        fontWeight: object.fontWeight,
        fontStyle: object.fontStyle,
        textAlign: object.textAlign,
        textVerticalAlign: object.textVerticalAlign,
        lineHeight: object.lineHeight,
        opacity: object.opacity,
      } as CanvasElement;
    })
    .filter((element: CanvasElement | null): element is CanvasElement => element !== null);

  return {
    version: "2.0",
    workspace: {
      width: workspaceWidth,
      height: workspaceHeight,
      background: workspaceObject?.fill || template?.backgroundColor || "#ffffff",
    },
    elements,
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const dynamic = 'force-dynamic';

// SSRF protection: block internal/private IPs and metadata endpoints
const ALLOWED_IMAGE_HOSTS = [
  'qhfbwqijhefoeebxnota.supabase.co',
];

function isSafeImageUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    // Only allow https (or data: URIs handled elsewhere)
    if (url.protocol !== 'https:') return false;

    const host = url.hostname.toLowerCase();

    // Block cloud metadata endpoints
    if (host === '169.254.169.254' || host === '169.254.170.2') return false;

    // Block localhost and loopback
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '::1') return false;

    // Block private/internal IP ranges
    const parts = host.split('.').map(Number);
    if (parts.length === 4) {
      if (parts[0] === 10) return false;                        // 10.0.0.0/8
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false; // 172.16.0.0/12
      if (parts[0] === 192 && parts[1] === 168) return false;   // 192.168.0.0/16
      if (parts[0] === 169 && parts[1] === 254) return false;   // 169.254.0.0/16 (link-local)
      if (parts[0] === 127) return false;                        // 127.0.0.0/8
    }

    // Block .local domains
    if (host.endsWith('.local') || host.endsWith('.internal')) return false;

    return true;
  } catch {
    return false;
  }
}

// Cache for already registered fonts to avoid re-registering
const registeredFonts = new Set<string>();

// --- Konva singleton: import once per cold start, not per request ---
let _konvaModule: any = null;
async function getKonva() {
  if (!_konvaModule) {
    await import('konva/canvas-backend');
    _konvaModule = await import('konva');
  }
  return _konvaModule;
}

// --- Pre-register all local fonts at first use (once per cold start) ---
let _localFontsScanned = false;
function scanLocalFonts() {
  if (_localFontsScanned) return;
  _localFontsScanned = true;
  try {
    const basePath = process.cwd();
    const fontsDir = path.join(basePath, 'public', 'fonts');
    if (fs.existsSync(fontsDir)) {
      const files = fs.readdirSync(fontsDir);
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (ext === '.ttf' || ext === '.otf' || ext === '.woff') {
          const family = path.basename(file, ext);
          const fontPath = path.join(fontsDir, file);
          try {
            registerFont(fontPath, { family });
            registeredFonts.add(family);
          } catch {}
        }
      }
      console.log(`[API Render] Pre-registered ${registeredFonts.size} local fonts`);
    }
  } catch (e) {
    console.error('[API Render] Error scanning local fonts:', e);
  }
}

// Type for uploaded_fonts table
interface UploadedFont {
  id: string;
  display_name: string;
  public_url: string;
  created_at?: string;
}

// Helper function to download and register a custom font
async function registerCustomFont(
  fontName: string,
  supabase: any,
  log: (msg: string) => void
): Promise<boolean> {
  // Skip if already registered
  if (registeredFonts.has(fontName)) {
    log(`Font "${fontName}" already registered, skipping`);
    return true;
  }

  // Skip default fonts check removed to allow overriding with uploads
  // if (DEFAULT_FONTS.some(df => fontName.toLowerCase() === df.toLowerCase())) {
  //   return true;
  // }

  try {
    // FIRST: Try to load from local public/fonts folder
    // In standalone mode, public is at ./public relative to server.js
    const basePath = process.cwd();
    const possibleFontPaths = [
      path.join(basePath, 'public', 'fonts', `${fontName}.ttf`),
      path.join(basePath, 'public', 'fonts', `${fontName}.otf`),
      path.join(basePath, 'public', 'fonts', `${fontName}.woff`),
      path.join(basePath, 'public', 'fonts', `${fontName}.woff2`),
      // Also try without space replacement
      path.join(basePath, 'public', 'fonts', `${fontName.replace(/\s+/g, '-')}.ttf`),
      path.join(basePath, 'public', 'fonts', `${fontName.replace(/\s+/g, '_')}.ttf`),
    ];

    log(`Looking for font "${fontName}" in paths:`);
    for (const fontPath of possibleFontPaths) {
      log(`  Checking: ${fontPath}`);
      if (fs.existsSync(fontPath)) {
        log(`  FOUND! Registering font from ${fontPath}`);
        registerFont(fontPath, { family: fontName });
        registeredFonts.add(fontName);
        console.log(`[API Render] Successfully registered local font "${fontName}" from ${fontPath}`);
        return true;
      }
    }

    // SECOND: Try to find the font in Supabase storage
    // First check uploaded-fonts table
    const { data: uploadedFont, error: fontError } = await supabase
      .from('uploaded_fonts')
      .select('*')
      .ilike('display_name', fontName)
      .single();

    const font = uploadedFont as UploadedFont | null;
    if (font && font.public_url) {
      log(`Found uploaded font "${fontName}" in database, downloading...`);

      // Download font file
      const fontResponse = await fetch(font.public_url);
      if (!fontResponse.ok) {
        log(`Failed to download font from ${font.public_url}`);
        return false;
      }

      const fontBuffer = await fontResponse.arrayBuffer();

      // Save to temp file
      const tempDir = os.tmpdir();
      const fontExt = font.public_url.split('.').pop()?.split('?')[0] || 'ttf';
      const tempFontPath = path.join(tempDir, `${fontName.replace(/\s+/g, '_')}_${Date.now()}.${fontExt}`);

      fs.writeFileSync(tempFontPath, new Uint8Array(fontBuffer));

      // Register the font with node-canvas
      registerFont(tempFontPath, { family: fontName });
      registeredFonts.add(fontName);

      log(`Successfully registered font "${fontName}" from ${tempFontPath}`);
      return true;
    }

    // If not in database, try to find in storage folder
    const { data: files, error: listError } = await supabase.storage
      .from('media')
      .list('fonts', {
        search: fontName
      });

    if (files && files.length > 0) {
      // Find exact match (with or without extension)
      const fontFile = files.find((f: { name: string }) =>
        f.name.replace(/\.[^/.]+$/, '').toLowerCase() === fontName.toLowerCase()
      );

      if (fontFile) {
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(`fonts/${fontFile.name}`);

        log(`Found font "${fontName}" in storage, downloading from ${publicUrl}...`);

        // Download font file
        const fontResponse = await fetch(publicUrl);
        if (!fontResponse.ok) {
          log(`Failed to download font from ${publicUrl}`);
          return false;
        }

        const fontBuffer = await fontResponse.arrayBuffer();

        // Save to temp file
        const tempDir = os.tmpdir();
        const fontExt = fontFile.name.split('.').pop()?.split('?')[0] || 'ttf';
        const tempFontPath = path.join(tempDir, `${fontName.replace(/\s+/g, '_')}_${Date.now()}.${fontExt}`);

        fs.writeFileSync(tempFontPath, new Uint8Array(fontBuffer));

        // Register the font with node-canvas
        registerFont(tempFontPath, { family: fontName });
        registeredFonts.add(fontName);

        // Clean up temp file after process exit
        try { fs.unlinkSync(tempFontPath); } catch {}

        log(`Successfully registered font "${fontName}" from ${tempFontPath}`);
        return true;
      }
    }

    log(`Font "${fontName}" not found in storage or database, will use fallback`);
    return false;
  } catch (error: any) {
    log(`Error registering font "${fontName}": ${error.message}`);
    return false;
  }
}

export async function POST(req: NextRequest) {
  const _t0 = Date.now();
  const log = (msg: string) => {
    const elapsed = Date.now() - _t0;
    const line = `[${elapsed}ms] ${msg}`;
    console.log(`[API Render] ${line}`);
  };

  let apiKeyData: { user_id: string } | null = null;
  let templateId: string | undefined;
  let creditReserved = false;
  let creditsRemaining: number | null = null;

  try {
    // Pre-register local fonts (scans public/fonts once per cold start)
    scanLocalFonts();

    // 1. Parse auth header + body in parallel with data fetching
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing/Invalid Authorization header" }, { status: 401 });
    }

    const apiKey = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse body first so we have templateId
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
    }
    templateId = body.templateId;
    const layers = body.layers;
    if (layers !== undefined && (!layers || typeof layers !== "object" || Array.isArray(layers))) {
      return NextResponse.json({ error: "layers must be an object keyed by layer ID" }, { status: 400 });
    }
    const requestedScale = Number(body.scale ?? body.pixelRatio ?? 2);
    const requestedFormat = String(body.format ?? "jpeg").toLowerCase();
    const outputFormat = requestedFormat === "jpg" ? "jpeg" : requestedFormat;
    if (!["jpeg", "png", "webp"].includes(outputFormat)) {
      return NextResponse.json({ error: "format must be jpeg, jpg, png, or webp" }, { status: 400 });
    }

    log(`Received request for Template: ${templateId}`);

    if (!templateId) return NextResponse.json({ error: "Missing templateId" }, { status: 400 });

    // 2. Run API key check + template fetch IN PARALLEL
    const [keyResult, templateResult] = await Promise.all([
      supabase
        .from("user_api_keys")
        .select("user_id")
        .eq("api_key", apiKey)
        .single(),
      supabase
        .from("dynamic_canvas_templates")
        .select("*")
        .eq("id", templateId)
        .single(),
    ]);

    apiKeyData = keyResult.data;

    if (keyResult.error || !apiKeyData) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const template = templateResult.data;
    const templateError = templateResult.error;

    if (templateError || !template || template.user_id !== apiKeyData.user_id) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Paid allowances renew monthly, including annual subscriptions. Free
    // credits never renew: once their initial 50 are used an upgrade is
    // required.
    const [account] = await db
      .select({
        plan: users.plan,
        creditsBalance: users.creditsBalance,
        creditsPerMonth: users.creditsPerMonth,
        creditsResetAt: users.creditsResetAt,
      })
      .from(users)
      .where(eq(users.id, apiKeyData.user_id));

    if (!account) {
      return NextResponse.json({ error: "User account not found" }, { status: 403 });
    }

    if (
      account.plan !== "free" &&
      account.creditsResetAt &&
      account.creditsResetAt.getTime() <= Date.now()
    ) {
      const nextReset = new Date();
      nextReset.setMonth(nextReset.getMonth() + 1);
      await db.update(users).set({
        creditsBalance: account.creditsPerMonth,
        creditsResetAt: nextReset,
      }).where(eq(users.id, apiKeyData.user_id));
    }

    // Reserve exactly one credit atomically, preventing simultaneous n8n
    // requests from spending the same final credit.
    const [reservedPlanCredit] = await db
      .update(users)
      .set({ creditsBalance: sql`${users.creditsBalance} - 1` })
      .where(and(
        eq(users.id, apiKeyData.user_id),
        gt(users.creditsBalance, 0),
      ))
      .returning({ creditsBalance: users.creditsBalance });

    if (reservedPlanCredit) {
      creditReserved = true;
      creditsRemaining = reservedPlanCredit.creditsBalance;
    }

    if (!creditReserved) {
      return NextResponse.json({
        error: "No credits remaining. A paid plan is required to continue rendering.",
        code: "CREDITS_EXHAUSTED",
        creditsRemaining: 0,
      }, { status: 402 });
    }

    log(`Template found: ${template.name}`);

    // 4. Parse template JSON (Konva 2.0 format)
    let canvasData: CanvasData = { version: "2.0", workspace: { width: 800, height: 600, background: "#ffffff" }, elements: [] };

    if (template.json) {
      try {
        const parsed = JSON.parse(template.json);
        if (parsed.version === "2.0") {
          canvasData = parsed;
        } else {
          const converted = convertFabricCanvasData(parsed, template);
          if (converted) {
            canvasData = converted;
            log(`Converted Fabric JSON to render model (${converted.elements.length} elements)`);
          }
        }
      } catch (e) {
        console.error("[API Render] Error parsing JSON field:", e);
      }
    }

    log(`Canvas: ${canvasData.workspace.width}x${canvasData.workspace.height}, Elements: ${canvasData.elements.length}`);

    // 5. Apply layer updates
    if (layers && canvasData.elements.length > 0) {
      log(`Applying dynamic updates to ${canvasData.elements.length} elements`);

      canvasData.elements = canvasData.elements.map((element: any) => {
        const layerId = element.id;
        const update = layers[layerId];

        if (update && typeof update === "object") {
          const newElement = applyCommonLayerOverrides(element, update);

          // Text updates
          if (element.type === 'text') {
            const oldText = element.text || '';
            const newText = update.text !== undefined ? update.text : oldText;

            if (update.text !== undefined) newElement.text = String(newText);
            setString(newElement, update, "fontFamily");
            if (typeof update.fontWeight === "string" || typeof update.fontWeight === "number") {
              newElement.fontWeight = update.fontWeight;
            }
            setString(newElement, update, "fontStyle");
            setString(newElement, update, "textAlign");
            setString(newElement, update, "textDecoration");
            setString(newElement, update, "wrap");
            setFiniteNumber(newElement, update, "fontSize", 1, 10000);
            setFiniteNumber(newElement, update, "lineHeight", 0.1, 20);
            setFiniteNumber(newElement, update, "letterSpacing", -10000, 10000);
            setFiniteNumber(newElement, update, "charSpacing", -10000, 10000);
            setBoolean(newElement, update, "ellipsis");

            const verticalAlign = update.textVerticalAlign ?? update.verticalAlign;
            if (["top", "middle", "bottom"].includes(verticalAlign)) {
              newElement.textVerticalAlign = verticalAlign;
            }

            // Konva must measure the final wrapped text with the registered
            // font. Store the original visual center here and apply the real
            // measured height when the node is created below.
            if (
              update.y === undefined &&
              (update.text !== undefined || update.fontSize !== undefined || update.lineHeight !== undefined || update.width !== undefined)
            ) {
              const originalHeight = Number(update.height ?? element.height ?? 100);
              const scaleY = Number(newElement.scaleY || 1);
              newElement._minimumTextHeight = originalHeight;
              newElement._preserveTextCenterY = Number(element.y || 0) + (Number(element.height || originalHeight) * Number(element.scaleY || 1)) / 2;
            }
          }

          // Image updates
          const targetImageUrl = update.image_url || update.src || update.url || update.image;
          if (element.type === 'image') {
            if (targetImageUrl) {
              if (!isSafeImageUrl(targetImageUrl)) {
                log(`Blocked unsafe image URL in layer update (SSRF): ${targetImageUrl}`);
              } else {
                newElement.src = targetImageUrl;
                newElement._isDynamicImage = true;
              }
            }

            [
              "imageMaskShape", "imageCornerMode", "imageBorderColor",
              "imageShadowColor", "imageBlendMode", "imagePreset", "imageFit",
            ].forEach((key) => setString(newElement, update, key));
            [
              "imageCornerRadius", "imageBorderWidth", "imageShadowBlur",
              "imageShadowOpacity", "imageShadowOffsetX", "imageShadowOffsetY",
              "imageBlur", "imageBrightness", "imageTemperature", "imageContrast",
              "imageSaturation", "imageVibrance", "imageWhites", "imageBlacks",
            ].forEach((key) => setFiniteNumber(newElement, update, key));
            setBoolean(newElement, update, "flipX");
            setBoolean(newElement, update, "flipY");
          }

          if (["rect", "circle", "triangle", "diamond"].includes(element.type)) {
            setFiniteNumber(newElement, update, "rx", 0);
            if (update.cornerRadius !== undefined) {
              const cornerRadius = Number(update.cornerRadius);
              if (Number.isFinite(cornerRadius)) newElement.rx = Math.max(0, cornerRadius);
            }
          }

          return newElement;
        }
        return element;
      });

      if (canvasData.elements.some((element: any) => Number.isFinite(Number(element.zIndex)))) {
        canvasData.elements = canvasData.elements
          .map((element: any, index: number) => ({ ...element, _originalOrder: index }))
          .sort((a: any, b: any) => {
            const aIndex = Number.isFinite(Number(a.zIndex)) ? Number(a.zIndex) : a._originalOrder;
            const bIndex = Number.isFinite(Number(b.zIndex)) ? Number(b.zIndex) : b._originalOrder;
            return aIndex - bIndex || a._originalOrder - b._originalOrder;
          });
      }
    }

    // 6. Register all fonts needed before rendering
    log("Registering fonts...");
    const fontsToRegister = new Set<string>();
    for (const el of canvasData.elements) {
      if (el.type === 'text' && el.fontFamily) {
        fontsToRegister.add(el.fontFamily);
      }
    }

    // Register all fonts in parallel (local fonts hit the cache instantly)
    await Promise.all(Array.from(fontsToRegister).map(async (fontName) => {
      log(`Registering font: ${fontName}`);
      await registerCustomFont(fontName, supabase, log);

      const normalized = getBestFont(fontName);
      if (normalized !== fontName) {
        log(`Also checking normalized font: ${normalized}`);
        await registerCustomFont(normalized, supabase, log);
      }
    }));

    log("Fonts registered.");

    // 7. Render using Konva with canvas-backend (official Node.js support)
    log("Loading Konva...");

    // Use cached Konva module (imported once per cold start)
    const Konva = await getKonva();

    log("Creating canvas...");

    // Create canvas using node-canvas
    const canvas = createCanvas(canvasData.workspace.width, canvasData.workspace.height);

    const stage = new Konva.default.Stage({
      width: canvasData.workspace.width,
      height: canvasData.workspace.height,
      canvas: canvas as any,
    });

    const layer = new Konva.default.Layer();
    stage.add(layer);

    // Background (skip if transparent requested and PNG/WebP format)
    const wantsTransparent = body.transparent === true && outputFormat !== "jpeg";
    if (!wantsTransparent) {
      const background = new Konva.default.Rect({
        x: 0,
        y: 0,
        width: canvasData.workspace.width,
        height: canvasData.workspace.height,
        fill: canvasData.workspace.background || '#ffffff',
      });
      layer.add(background);
    }

    // Pre-load all images in parallel before rendering
    const imageElements = canvasData.elements.filter((el: any) => el.type === 'image' && el.src && el.visible !== false);
    const imageCache = new Map<string, any>();
    if (imageElements.length > 0) {
      log(`Pre-loading ${imageElements.length} image(s) in parallel...`);
      await Promise.all(imageElements.map(async (el: any) => {
        try {
          const img = await loadImage(el.src);
          imageCache.set(el.id, img);
          log(`  Loaded image ${el.id}: ${img.width}x${img.height}`);
        } catch (err: any) {
          log(`  Failed to load image ${el.id}: ${err.message}`);
        }
      }));
    }

    log("Rendering elements...");

    // Render elements
    for (const el of canvasData.elements) {
      if (el.visible === false) continue;
      let node;

      switch (el.type) {
        case 'rect':
          node = new Konva.default.Rect({
            x: el.x || 0,
            y: el.y || 0,
            width: el.width || 100,
            height: el.height || 100,
            fill: el.fill || '#000000',
            stroke: el.stroke || null,
            strokeWidth: el.strokeWidth || 0,
            opacity: el.opacity !== undefined ? el.opacity : 1,
            rotation: el.rotation || 0,
            scaleX: el.scaleX || 1,
            scaleY: el.scaleY || 1,
            cornerRadius: el.rx || 0,
            shadowColor: el.shadowColor || undefined,
            shadowBlur: Math.max(0, Number(el.shadowBlur || 0)),
            shadowOpacity: Math.max(0, Math.min(1, Number(el.shadowOpacity ?? 1))),
            shadowOffsetX: Number(el.shadowOffsetX || 0),
            shadowOffsetY: Number(el.shadowOffsetY || 0),
          });
          break;

        case 'circle':
          node = new Konva.default.Circle({
            x: (el.x || 0) + (el.width || 100) / 2,
            y: (el.y || 0) + (el.height || 100) / 2,
            radius: (el.width || 100) / 2,
            fill: el.fill || '#000000',
            stroke: el.stroke || null,
            strokeWidth: el.strokeWidth || 0,
            opacity: el.opacity !== undefined ? el.opacity : 1,
            rotation: el.rotation || 0,
            scaleX: el.scaleX || 1,
            scaleY: el.scaleY || 1,
            shadowColor: el.shadowColor || undefined,
            shadowBlur: Math.max(0, Number(el.shadowBlur || 0)),
            shadowOpacity: Math.max(0, Math.min(1, Number(el.shadowOpacity ?? 1))),
            shadowOffsetX: Number(el.shadowOffsetX || 0),
            shadowOffsetY: Number(el.shadowOffsetY || 0),
          });
          break;

        case 'triangle':
          node = new Konva.default.Line({
            points: [
              (el.width || 100) / 2, 0,
              el.width || 100, el.height || 100,
              0, el.height || 100
            ],
            x: el.x || 0,
            y: el.y || 0,
            fill: el.fill || '#000000',
            stroke: el.stroke || null,
            strokeWidth: el.strokeWidth || 0,
            opacity: el.opacity !== undefined ? el.opacity : 1,
            rotation: el.rotation || 0,
            scaleX: el.scaleX || 1,
            scaleY: el.scaleY || 1,
            closed: true,
            shadowColor: el.shadowColor || undefined,
            shadowBlur: Math.max(0, Number(el.shadowBlur || 0)),
            shadowOpacity: Math.max(0, Math.min(1, Number(el.shadowOpacity ?? 1))),
            shadowOffsetX: Number(el.shadowOffsetX || 0),
            shadowOffsetY: Number(el.shadowOffsetY || 0),
          });
          break;

        case 'diamond':
          node = new Konva.default.Line({
            points: [
              (el.width || 100) / 2, 0,
              el.width || 100, (el.height || 100) / 2,
              (el.width || 100) / 2, el.height || 100,
              0, (el.height || 100) / 2
            ],
            x: el.x || 0,
            y: el.y || 0,
            fill: el.fill || '#000000',
            stroke: el.stroke || null,
            strokeWidth: el.strokeWidth || 0,
            opacity: el.opacity !== undefined ? el.opacity : 1,
            rotation: el.rotation || 0,
            scaleX: el.scaleX || 1,
            scaleY: el.scaleY || 1,
            closed: true,
            shadowColor: el.shadowColor || undefined,
            shadowBlur: Math.max(0, Number(el.shadowBlur || 0)),
            shadowOpacity: Math.max(0, Math.min(1, Number(el.shadowOpacity ?? 1))),
            shadowOffsetX: Number(el.shadowOffsetX || 0),
            shadowOffsetY: Number(el.shadowOffsetY || 0),
          });
          break;

        case 'text':
          // Determine font to use
          let fontToUse = el.fontFamily;

          // Logic:
          // 1. If we successfully registered the exact font family (e.g. uploaded custom font), use it.
          // 2. If not, try the normalized/fallback version (e.g. "PlayfairDisplay" -> "Playfair Display").
          if (el.fontFamily && !registeredFonts.has(el.fontFamily)) {
            fontToUse = getBestFont(el.fontFamily);
          }

          // Provide default if missing
          if (!fontToUse) fontToUse = 'Liberation Sans';

          // Log if normalized/mapped
          if (el.fontFamily && fontToUse !== el.fontFamily) {
            console.log(`[API Render] Text element "${el.id}": font "${el.fontFamily}" -> "${fontToUse}"`);
            log(`Text element "${el.id}": font "${el.fontFamily}" -> "${fontToUse}"`);
          }

          const textConfig: any = {
            x: el.x || 0,
            y: el.y || 0,
            text: el.text || 'Text',
            fontSize: el.fontSize || 32,
            fontFamily: fontToUse,
            fill: el.fill || '#000000',
            opacity: el.opacity !== undefined ? el.opacity : 1,
            rotation: el.rotation || 0,
            scaleX: el.scaleX || 1,
            scaleY: el.scaleY || 1,
            stroke: el.stroke || undefined,
            strokeWidth: Math.max(0, Number(el.strokeWidth || 0)),
            shadowColor: el.shadowColor || undefined,
            shadowBlur: Math.max(0, Number(el.shadowBlur || 0)),
            shadowOpacity: Math.max(0, Math.min(1, Number(el.shadowOpacity ?? 1))),
            shadowOffsetX: Number(el.shadowOffsetX || 0),
            shadowOffsetY: Number(el.shadowOffsetY || 0),
          };

          // Width es necesario para wrapping
          if (el.width && el.width > 0) {
            textConfig.width = el.width;
          } else {
            textConfig.width = 500;
          }

          // Alineación por defecto: centrado horizontalmente
          textConfig.align = el.textAlign || 'center';
          textConfig.verticalAlign = el.textVerticalAlign || 'top';

          // Fabric textboxes do not add an implicit inner padding.
          textConfig.padding = 0;

          if (el.lineHeight) textConfig.lineHeight = el.lineHeight;
          if (Number.isFinite(Number(el.charSpacing))) {
            textConfig.letterSpacing = (Number(el.charSpacing) / 1000) * textConfig.fontSize;
          } else if (Number.isFinite(Number(el.letterSpacing))) {
            textConfig.letterSpacing = Number(el.letterSpacing);
          }
          const fontWeight = String(el.fontWeight ?? "").toLowerCase();
          const isBold = fontWeight === "bold" || Number(fontWeight) >= 600;
          const isItalic = String(el.fontStyle || "").toLowerCase().includes("italic");
          textConfig.fontStyle = [isBold ? "bold" : "", isItalic ? "italic" : ""].filter(Boolean).join(" ") || "normal";
          if (el.textDecoration) textConfig.textDecoration = el.textDecoration;
          if (["word", "char", "none"].includes(el.wrap)) textConfig.wrap = el.wrap;
          if (typeof el.ellipsis === "boolean") textConfig.ellipsis = el.ellipsis;

          node = new Konva.default.Text(textConfig);

          // Measure after width, font and line-height are applied so wrapped
          // lines are included. A textbox keeps its saved height as a minimum;
          // if dynamic content needs more room it expands equally upward and
          // downward around the original visual center.
          const measuredTextHeight = node.height();
          const minimumTextHeight = Number(el._minimumTextHeight ?? el.height ?? 0);
          const finalTextHeight = Math.max(minimumTextHeight, measuredTextHeight);
          if (finalTextHeight > 0) {
            node.height(finalTextHeight);
          }
          if (Number.isFinite(Number(el._preserveTextCenterY))) {
            const scaleY = Number(el.scaleY || 1);
            node.y(Number(el._preserveTextCenterY) - (finalTextHeight * scaleY) / 2);
          }
          break;

        case 'image':
          if (el.src) {
            try {
              const imageObj = imageCache.get(el.id);
              if (!imageObj) {
                log(`Image ${el.id} not in cache, skipping`);
                break;
              }

              // Get stored dimensions and scale (should be 1 after transformer ends)
              const scaleX = el.scaleX || 1;
              const scaleY = el.scaleY || 1;
              const storedWidth = el.width || imageObj.width;
              const storedHeight = el.height || imageObj.height;

              // Calculate final dimensions exactly as the editor shows them
              const finalWidth = storedWidth * scaleX;
              const finalHeight = storedHeight * scaleY;

              // Debug: log image dimensions
              log(`Image ${el.id}:`);
              log(`  - Original image: ${imageObj.width}x${imageObj.height}`);
              log(`  - Stored in element: ${el.width}x${el.height}`);
              log(`  - Scale: ${scaleX}x${scaleY}`);
              log(`  - Final render: ${finalWidth}x${finalHeight}`);

              let imageWidth: number;
              let imageHeight: number;
              let innerX = 0;
              let innerY = 0;

              if (el._isDynamicImage === true) {
                // Dynamically replaced images use cover by default, and can
                // opt into contain or fill through imageFit.
                // Use FINAL dimensions (stored × scale) as the container
                const containerWidth = finalWidth;
                const containerHeight = finalHeight;
                const imageFit = ["cover", "contain", "fill"].includes(el.imageFit) ? el.imageFit : "cover";

                if (imageFit === "fill") {
                  imageWidth = containerWidth;
                  imageHeight = containerHeight;
                } else {
                  const scaleByWidth = containerWidth / imageObj.width;
                  const scaleByHeight = containerHeight / imageObj.height;
                  const fitScale = imageFit === "contain"
                    ? Math.min(scaleByWidth, scaleByHeight)
                    : Math.max(scaleByWidth, scaleByHeight);
                  imageWidth = imageObj.width * fitScale;
                  imageHeight = imageObj.height * fitScale;
                  innerX = (containerWidth - imageWidth) / 2;
                  innerY = (containerHeight - imageHeight) / 2;
                }

                log(`  - Dynamic image mode: ${imageFit} ${containerWidth}x${containerHeight}, scaled to ${imageWidth}x${imageHeight}`);
              } else {
                // For template images, use the exact dimensions from the editor
                imageWidth = finalWidth;
                imageHeight = finalHeight;
              }

              const maskShape = String(el.imageMaskShape || "none");
              const cornerValue = Math.max(0, Number(el.imageCornerRadius || 0));
              const cornerRadius = el.imageCornerMode === "%"
                ? Math.min(finalWidth, finalHeight) * Math.min(50, cornerValue) / 100
                : cornerValue;
              const borderWidth = Math.max(0, Number(el.imageBorderWidth ?? el.strokeWidth ?? 0));
              const borderColor = el.imageBorderColor || el.stroke || "#000000";
              const shadowBlur = Math.max(0, Number(el.imageShadowBlur || 0));
              const shadowOpacity = Math.max(0, Math.min(1, Number(el.imageShadowOpacity ?? 0.35)));

              const group = new Konva.default.Group({
                x: el.x || 0,
                y: el.y || 0,
                width: finalWidth,
                height: finalHeight,
                clipFunc: (ctx: any) => traceImageMaskPath(ctx, finalWidth, finalHeight, maskShape, cornerRadius),
                opacity: el.opacity !== undefined ? el.opacity : 1,
                rotation: el.rotation || 0,
                scaleX: 1,
                scaleY: 1,
                globalCompositeOperation: el.imageBlendMode || el.globalCompositeOperation || "source-over",
                shadowColor: el.imageShadowColor || "#000000",
                shadowBlur,
                shadowOpacity: shadowBlur > 0 ? shadowOpacity : 0,
                shadowOffsetX: Number(el.imageShadowOffsetX || 0),
                shadowOffsetY: Number(el.imageShadowOffsetY || 0),
              });

              const imageNode = new Konva.default.Image({
                x: el.flipX ? innerX + imageWidth : innerX,
                y: el.flipY ? innerY + imageHeight : innerY,
                image: imageObj,
                width: imageWidth,
                height: imageHeight,
                scaleX: el.flipX ? -1 : 1,
                scaleY: el.flipY ? -1 : 1,
                crop: el._isDynamicImage === true ? undefined : {
                  x: Math.max(0, Number(el.cropX || 0)),
                  y: Math.max(0, Number(el.cropY || 0)),
                  width: Math.max(1, Number(el.width || imageObj.width)),
                  height: Math.max(1, Number(el.height || imageObj.height)),
                },
              });

              const imageFilters: any[] = [];
              const preset = String(el.imagePreset || "none");
              if (preset === "grayscale") imageFilters.push(Konva.default.Filters.Grayscale);
              if (preset === "sepia") imageFilters.push(Konva.default.Filters.Sepia);
              if (preset === "natural") {
                imageFilters.push(Konva.default.Filters.Contrast);
                imageNode.contrast(5);
              }
              if (preset === "cold" || preset === "warm") {
                imageFilters.push(Konva.default.Filters.RGB);
                imageNode.red(preset === "warm" ? 255 : 225);
                imageNode.green(preset === "warm" ? 238 : 240);
                imageNode.blue(preset === "warm" ? 220 : 255);
              }
              if (Number(el.imageBlur || 0) !== 0) {
                imageFilters.push(Konva.default.Filters.Blur);
                imageNode.blurRadius(Math.abs(Number(el.imageBlur || 0)) / 4);
              }
              const brightness = Number(el.imageBrightness || 0) + Number(el.imageWhites || 0) * 0.4;
              if (brightness !== 0) {
                imageFilters.push(Konva.default.Filters.Brighten);
                imageNode.brightness(brightness / 100);
              }
              const contrast = Number(el.imageContrast || 0) + Number(el.imageBlacks || 0) * 0.4;
              if (contrast !== 0) {
                imageFilters.push(Konva.default.Filters.Contrast);
                imageNode.contrast(contrast);
              }
              const saturation = Number(el.imageSaturation || 0) + Number(el.imageVibrance || 0) * 0.5;
              const temperature = Number(el.imageTemperature || 0);
              if (saturation !== 0 || temperature !== 0) {
                imageFilters.push(Konva.default.Filters.HSL);
                imageNode.saturation(saturation / 100);
                imageNode.hue(temperature * 0.25);
              }
              if (imageFilters.length > 0) {
                imageNode.cache();
                imageNode.filters(Array.from(new Set(imageFilters)));
              }

              group.add(imageNode);
              if (borderWidth > 0) {
                group.add(new Konva.default.Shape({
                  width: finalWidth,
                  height: finalHeight,
                  stroke: borderColor,
                  strokeWidth: borderWidth,
                  listening: false,
                  sceneFunc: (ctx: any, shape: any) => {
                    traceImageMaskPath(ctx, finalWidth, finalHeight, maskShape, cornerRadius);
                    ctx.fillStrokeShape(shape);
                  },
                }));
              }
              node = group;
            } catch (imgError) {
              log(`Failed to load image: ${el.src} - ${imgError}`);
            }
          }
          break;
      }

      if (node) {
        layer.add(node);
      }
    }

    // Draw the layer
    log("Drawing layer...");
    layer.draw();

    // Render in HD by default, matching the editor export quality.
    // Keep the multiplier bounded so ordinary social templates stay below 4K.
    const maxLogicalDimension = Math.max(
      canvasData.workspace.width,
      canvasData.workspace.height,
    );
    const safeRequestedScale = Number.isFinite(requestedScale)
      ? Math.min(3, Math.max(1, requestedScale))
      : 3;
    const pixelRatio = Math.max(
      1,
      Math.min(safeRequestedScale, 4096 / maxLogicalDimension),
    );
    const outputWidth = Math.round(canvasData.workspace.width * pixelRatio);
    const outputHeight = Math.round(canvasData.workspace.height * pixelRatio);

    const mimeType = outputFormat === 'png' ? 'image/png' : outputFormat === 'webp' ? 'image/webp' : 'image/jpeg';
    const fileExt = outputFormat === 'png' ? 'png' : outputFormat === 'webp' ? 'webp' : 'jpg';

    log(`Converting to HD buffer at ${pixelRatio.toFixed(2)}x (${outputWidth}x${outputHeight}) as ${outputFormat}...`);
    const dataURL = stage.toDataURL({
      mimeType,
      pixelRatio,
      quality: outputFormat === 'png' ? 1 : 0.92,
    });
    const base64Data = dataURL.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    log(`Render complete: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

    // 7. Upload to Supabase
    log("Uploading to Supabase...");
    const templateName = (template.name || templateId).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const timestamp = Date.now();
    const fileName = `renders/${templateId}-${templateName}-${timestamp}.${fileExt}`;

    const { error: uploadError } = await supabase
      .storage
      .from('media')
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    let publicUrl = "";
    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName);
      publicUrl = publicUrlData.publicUrl;
      log(`Image uploaded: ${publicUrl}`);
    } else {
      log(`Upload error: ${uploadError?.message}`);
      throw new Error(uploadError?.message || "Failed to upload rendered image");
    }

    // Increment render count (fire-and-forget, don't block response)
    db.update(users)
      .set({ renderCount: sql `${users.renderCount} + 1` })
      .where(eq(users.id, apiKeyData.user_id))
      .catch((logError) => console.error("Error updating render count:", logError));

    log(`✅ TOTAL: ${Date.now() - _t0}ms`);

    // Save successful renders for the user's private render history. History
    // failures must never make an otherwise successful image request fail.
    try {
      await db.insert(renders).values({
        id: crypto.randomUUID(),
        userId: apiKeyData.user_id,
        templateId: templateId || null,
        templateName: template.name || null,
        status: "success",
        imageUrl: publicUrl || null,
        width: outputWidth,
        height: outputHeight,
        format: outputFormat,
        renderTimeMs: Date.now() - _t0,
        createdAt: new Date(),
      });
      log("Render history saved.");
    } catch (historyError: any) {
      console.error("[API Render] Failed to save render history:", historyError?.message || historyError);
      log(`Failed to save render history: ${historyError?.message || historyError}`);
    }

    return NextResponse.json({
      status: "success",
      imageUrl: publicUrl,
      width: outputWidth,
      height: outputHeight,
      pixelRatio,
      totalTimeMs: Date.now() - _t0,
      creditsRemaining,
    }, { status: 200 });

  } catch (error: any) {
    if (creditReserved && apiKeyData) {
      await db.update(users)
        .set({ creditsBalance: sql`${users.creditsBalance} + 1` })
        .where(eq(users.id, apiKeyData.user_id))
        .catch((refundError) => console.error("Error refunding render credit:", refundError));
    }
    // Register failed render in database
    try {
      if (apiKeyData) {
        await db.insert(renders).values({
          userId: apiKeyData.user_id,
          templateId: templateId || null,
          status: "failed",
          errorMessage: error.message,
          createdAt: new Date(),
        });
      }
    } catch (logError) {
      console.error("Error logging render:", logError);
    }

    log(`Fatal Error: ${error.message}`);
    console.error("[API Render] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message,
          stack: error.stack,
        }),
      },
      { status: 500 }
    );
  }
}

// Helper function to load images from URLs
async function loadImage(src: string): Promise<any> {
  const { Image } = await import('canvas');
  const image = new Image();

  return new Promise((resolve, reject) => {
    image.onload = () => resolve(image);
    image.onerror = (err: any) => reject(err);

    // Handle different URL formats
    if (src.startsWith('http://') || src.startsWith('https://')) {
      if (!isSafeImageUrl(src)) {
        reject(new Error(`Blocked unsafe image URL (SSRF protection): ${src}`));
        return;
      }
      // Fetch the image data
      fetch(src)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
          return res.arrayBuffer();
        })
        .then(buffer => {
          const array = new Uint8Array(buffer);
          image.src = Buffer.from(array);
        })
        .catch(reject);
    } else if (src.startsWith('data:')) {
      // Data URL
      image.src = src;
    } else {
      reject(new Error(`Unsupported image source: ${src}`));
    }
  });
}

// GET method for documentation/testing
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/render",
    method: "POST",
    description: "Generate images from templates with dynamic data using Konva (server-side rendering)",
    authentication: "Bearer token in Authorization header",
    requestBody: {
      templateId: "string (required) - ID of the template to render",
      layers: "object (optional) - Dynamic data to merge with template elements",
      format: "jpeg | jpg | png | webp (optional) - defaults to jpeg",
      scale: "number (optional, 1-3) - Output resolution multiplier; defaults to 2",
      transparent: "boolean (optional) - transparent canvas for PNG/WebP"
    },
    exampleRequest: {
      templateId: "your-template-id",
      layers: {
        "element-id-1": {
          text: "Custom text",
          color: "#FF0000"
        },
        "element-id-2": {
          image_url: "https://example.com/image.png"
        }
      }
    },
    status: "active",
  });
}
