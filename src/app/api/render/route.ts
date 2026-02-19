import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createCanvas, registerFont } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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

// Font mapping: Windows/Mac fonts -> Linux equivalents
// These map common web fonts to their Linux alternatives
// IMPORTANT: Font names must match exactly what fontconfig reports
const FONT_FALLBACKS: Record<string, string> = {
  // Arial family -> Liberation Sans (metric-compatible with Arial)
  'Arial': 'Liberation Sans',
  'Arial Black': 'Liberation Sans Narrow',
  'Arial Narrow': 'Liberation Sans Narrow',
  'Helvetica': 'Liberation Sans',

  // Times family -> Liberation Serif (metric-compatible with Times New Roman)
  'Times New Roman': 'Liberation Serif',
  'Times': 'Liberation Serif',
  'Georgia': 'Century Schoolbook L',  // Better match for Georgia
  'Palatino': 'URW Palladio L',
  'Palatino Linotype': 'URW Palladio L',
  'Garamond': 'EB Garamond',
  'Bookman': 'URW Bookman L',
  'Book Antiqua': 'URW Palladio L',

  // Courier family -> Liberation Mono (metric-compatible with Courier New)
  'Courier New': 'Liberation Mono',
  'Courier': 'Liberation Mono',
  'Lucida Console': 'DejaVu Sans Mono',
  'Monaco': 'DejaVu Sans Mono',

  // Other common fonts
  'Verdana': 'DejaVu Sans',
  'Tahoma': 'DejaVu Sans Condensed',
  'Trebuchet MS': 'DejaVu Sans',
  'Lucida Sans Unicode': 'DejaVu Sans',
  'Lucida Grande': 'DejaVu Sans',
  'Geneva': 'DejaVu Sans',
  'Comic Sans MS': 'Comic Sans MS',  // Try to keep if available
  'Impact': 'Impact',  // Try to keep if available
  'Brush Script MT': 'URW Chancery L',
  'Century Gothic': 'Century Gothic',

  // Google Fonts - installed in Docker
  'Playfair Display': 'Playfair Display',
  'PlayfairDisplay': 'Playfair Display',
  'Lato': 'Lato',
  'Open Sans': 'Open Sans',
  'OpenSans': 'Open Sans',
  'Oswald': 'Oswald',
  'Raleway': 'Raleway',
  'Ubuntu': 'Ubuntu',
  'Merriweather': 'Merriweather',
  'Roboto': 'Roboto',
  'Roboto Slab': 'Roboto Slab',
  'Noto Sans': 'Noto Sans',
  'Noto Serif': 'Noto Serif',
};

// Default system fonts - these don't need to be downloaded
const DEFAULT_FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier',
  'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS',
  'Impact', 'Arial Black', 'Tahoma', 'Lucida Console', 'Monaco', 'sans-serif',
  'serif', 'monospace', 'cursive', 'fantasy'
];

// Helper function to get the best available font
function getBestFont(fontFamily: string | undefined): string {
  if (!fontFamily) return 'Liberation Sans';

  // Check if we have an exact fallback for this font
  const fallback = FONT_FALLBACKS[fontFamily];
  if (fallback) {
    return fallback;
  }

  // Case-insensitive search through fallbacks
  const lowerFont = fontFamily.toLowerCase();
  for (const [key, value] of Object.entries(FONT_FALLBACKS)) {
    if (key.toLowerCase() === lowerFont) {
      return value;
    }
  }

  // If the font is in the default list but not in fallbacks, use Liberation Sans
  if (DEFAULT_FONTS.some(df => df.toLowerCase() === lowerFont)) {
    return 'Liberation Sans';
  }

  // If no fallback, return the original font name
  // (it might be a custom font that will be registered separately)
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

// Helper function to calculate text height based on content
function calculateTextHeight(element: any): number {
  if (element.type !== 'text') return element.height || 100;

  const lines = (element.text || '').split('\n').length;
  const fontSize = element.fontSize || 32;
  const lineHeight = element.lineHeight || 1.2;
  const estimatedHeight = fontSize * lineHeight * lines;

  return Math.max(estimatedHeight, fontSize * lineHeight);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const dynamic = 'force-dynamic';

// Cache for already registered fonts to avoid re-registering
const registeredFonts = new Set<string>();

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
  supabase: ReturnType<typeof createClient>,
  log: (msg: string) => void
): Promise<boolean> {
  // Skip if already registered
  if (registeredFonts.has(fontName)) {
    log(`Font "${fontName}" already registered, skipping`);
    return true;
  }

  // Skip default fonts
  if (DEFAULT_FONTS.some(df => fontName.toLowerCase() === df.toLowerCase())) {
    return true;
  }

  try {
    // Try to find the font in Supabase storage
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
      const fontExt = font.public_url.split('.').pop() || 'ttf';
      const tempFontPath = path.join(tempDir, `${fontName.replace(/\s+/g, '_')}_${Date.now()}.${fontExt}`);

      fs.writeFileSync(tempFontPath, Buffer.from(fontBuffer));

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
      const fontFile = files.find(f =>
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
        const fontExt = fontFile.name.split('.').pop() || 'ttf';
        const tempFontPath = path.join(tempDir, `${fontName.replace(/\s+/g, '_')}_${Date.now()}.${fontExt}`);

        fs.writeFileSync(tempFontPath, Buffer.from(fontBuffer));

        // Register the font with node-canvas
        registerFont(tempFontPath, { family: fontName });
        registeredFonts.add(fontName);

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
  const isDebug = process.env.DEBUG === "true";
  const debugLogs: string[] | undefined = isDebug ? [] : undefined;
  const log = (msg: string) => {
    if (isDebug) {
      console.log(`[API Render] ${msg}`);
      debugLogs!.push(msg);
    }
  };

  try {
    // 1. Validate API Key
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing/Invalid Authorization header" }, { status: 401 });
    }

    const apiKey = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("user_api_keys")
      .select("user_id")
      .eq("api_key", apiKey)
      .single();

    if (apiKeyError || !apiKeyData) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // 2. Parse request
    const body = await req.json();
    const { templateId, layers } = body;

    log(`Received request for Template: ${templateId}`);

    if (!templateId) return NextResponse.json({ error: "Missing templateId" }, { status: 400 });

    // 3. Fetch template
    const { data: template, error: templateError } = await supabase
      .from("dynamic_canvas_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (templateError || !template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

    log(`Template found: ${template.name}`);

    // 4. Parse template JSON (Konva 2.0 format)
    let canvasData: CanvasData = { version: "2.0", workspace: { width: 800, height: 600, background: "#ffffff" }, elements: [] };

    if (template.json) {
      try {
        const parsed = JSON.parse(template.json);
        if (parsed.version === "2.0") {
          canvasData = parsed;
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

        if (update) {
          const newElement = { ...element };

          // Text updates
          if (element.type === 'text') {
            const oldHeight = element.height || 100;
            const oldText = element.text || '';
            const newText = update.text !== undefined ? update.text : oldText;

            if (update.text !== undefined) newElement.text = newText;
            if (update.color !== undefined) newElement.fill = update.color;
            if (update.fontFamily !== undefined) newElement.fontFamily = update.fontFamily;

            // Recalculate height if text changed or if fontSize/lineHeight changed
            if (update.text !== undefined || update.fontSize !== undefined || update.lineHeight !== undefined) {
              // The new height should include padding
              const oldHeight = element.height || 100;
              const newHeight = calculateTextHeight(newElement);

              // Calculate the center of the original bounding box
              const boxCenter = element.y + oldHeight / 2;

              // Adjust Y to keep the BOUNDING BOX centered at the same position
              const newY = boxCenter - newHeight / 2;

              newElement.y = newY;
              newElement.height = newHeight;
            }
          }

          // Image updates
          const targetImageUrl = update.image_url || update.src || update.url || update.image;
          if (element.type === 'image' && targetImageUrl) {
            newElement.src = targetImageUrl;
            // Mark that this image was dynamically updated so we use original dimensions
            newElement._isDynamicImage = true;
          }

          return newElement;
        }
        return element;
      });
    }

    // 6. Render using Konva with canvas-backend (official Node.js support)
    log("Starting Konva rendering with canvas-backend...");

    // Import canvas backend for Konva
    await import('konva/canvas-backend');
    const Konva = await import('konva');

    // Create canvas using node-canvas
    const canvas = createCanvas(canvasData.workspace.width, canvasData.workspace.height);

    const stage = new Konva.default.Stage({
      width: canvasData.workspace.width,
      height: canvasData.workspace.height,
      canvas: canvas as any,
    });

    const layer = new Konva.default.Layer();
    stage.add(layer);

    // Background
    const background = new Konva.default.Rect({
      x: 0,
      y: 0,
      width: canvasData.workspace.width,
      height: canvasData.workspace.height,
      fill: canvasData.workspace.background || '#ffffff',
    });
    layer.add(background);

    // Render elements
    for (const el of canvasData.elements) {
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
          });
          break;

        case 'text':
          // Get the best available font for server-side rendering
          const bestFont = getBestFont(el.fontFamily);
          // Always log font mapping for debugging
          console.log(`[API Render] Text element "${el.id}": font "${el.fontFamily}" -> "${bestFont}"`);
          log(`Text element "${el.id}": font "${el.fontFamily}" -> "${bestFont}"`);

          const textConfig: any = {
            x: el.x || 0,
            y: el.y || 0,
            text: el.text || 'Text',
            fontSize: el.fontSize || 32,
            fontFamily: bestFont,
            fill: el.fill || '#000000',
            opacity: el.opacity !== undefined ? el.opacity : 1,
            rotation: el.rotation || 0,
            scaleX: el.scaleX || 1,
            scaleY: el.scaleY || 1,
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

          // NO establecer height - dejar que Konva calcule automáticamente
          // Solo usar padding para espacio extra
          textConfig.padding = 10;

          if (el.lineHeight) textConfig.lineHeight = el.lineHeight;
          if (el.fontStyle) textConfig.fontStyle = el.fontStyle;
          if (el.textDecoration) textConfig.textDecoration = el.textDecoration;

          node = new Konva.default.Text(textConfig);

          // If height was dynamically updated, adjust Y to keep bounding box centered
          // Get the actual rendered height from Konva
          const actualHeight = node.height();
          const storedHeight = el.height || 100;

          // Only adjust if the actual height differs significantly from stored height
          if (Math.abs(actualHeight - storedHeight) > 5) {
            // Calculate the center of the original stored bounding box
            const originalBoxCenter = textConfig.y + storedHeight / 2;
            // Adjust Y to keep that same center point with the new height
            node.y(originalBoxCenter - actualHeight / 2);
          }
          break;

        case 'image':
          if (el.src) {
            try {
              const { Image } = await import('canvas');
              const imageObj = await loadImage(el.src);

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

              let imageWidth, imageHeight, posX, posY;

              if (el._isDynamicImage === true) {
                // For dynamically updated images, fit within template bounds
                // Maintain aspect ratio while fitting to the template height
                const templateWidth = storedWidth;
                const templateHeight = storedHeight;

                // Scale to fit template height while maintaining aspect ratio
                const fitScale = templateHeight / imageObj.height;
                imageWidth = imageObj.width * fitScale;
                imageHeight = templateHeight;

                // Center horizontally within template bounds
                posX = (el.x || 0) + (templateWidth - imageWidth) / 2;
                posY = el.y || 0;
                log(`  - Dynamic image mode: fitting to ${imageWidth}x${imageHeight}`);
              } else {
                // For template images, use the exact dimensions from the editor
                // The editor already applied scale to width/height and reset scale to 1
                // But we still apply scale just in case to match exactly what's rendered
                imageWidth = finalWidth;
                imageHeight = finalHeight;
                posX = el.x || 0;
                posY = el.y || 0;
              }

              node = new Konva.default.Image({
                x: posX,
                y: posY,
                image: imageObj,
                width: imageWidth,
                height: imageHeight,
                opacity: el.opacity !== undefined ? el.opacity : 1,
                rotation: el.rotation || 0,
                // Keep scale at 1 since we already applied it to width/height
                scaleX: 1,
                scaleY: 1,
              });
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
    layer.draw();

    // Convert to buffer using stage.toDataURL
    log("Converting to buffer...");
    const dataURL = stage.toDataURL({ mimeType: 'image/png', pixelRatio: 1 });
    const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    log(`Render complete: ${buffer.length} bytes`);

    // 7. Upload to Supabase
    const templateName = (template.name || templateId).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const timestamp = Date.now();
    const fileName = `renders/${templateId}-${templateName}-${timestamp}.png`;

    const { error: uploadError } = await supabase
      .storage
      .from('media')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: false,
      });

    let publicUrl = "";
    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName);
      publicUrl = publicUrlData.publicUrl;
      log(`Image uploaded: ${publicUrl}`);
    } else {
      log(`Upload error: ${uploadError?.message}`);
    }

    return NextResponse.json({
      status: "success",
      imageUrl: publicUrl,
      ...(isDebug && { logs: debugLogs }),
    }, { status: 200 });

  } catch (error: any) {
    log(`Fatal Error: ${error.message}`);
    console.error("[API Render] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        stack: error.stack,
        ...(isDebug && { logs: debugLogs })
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
      layers: "object (optional) - Dynamic data to merge with template elements"
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
