import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Use Service Role Key if available, otherwise fallback to Anon Key (which might fail RLS)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Import fabric.js for server-side rendering
// @ts-ignore
// @ts-ignore
import { fabric } from "fabric";

export const dynamic = 'force-dynamic';

let fontsRegistered = false;

function registerServerFonts() {
    if (fontsRegistered) return;

    try {
        const canvasModule = require('canvas');
        const rootDir = process.cwd();
        const fontsDir = path.join(rootDir, "public", "fonts");

        if (process.env.DEBUG === "true") {
            console.log(`[API Render] Initializing fonts from: ${fontsDir} (CWD: ${rootDir})`);
        }

        if (fs.existsSync(fontsDir)) {
            const files = fs.readdirSync(fontsDir);
            if (process.env.DEBUG === "true") {
                console.log(`[API Render] Found ${files.length} files in fonts directory.`);
            }
            files.forEach(file => {
                if (/\.(ttf|otf|woff|woff2)$/i.test(file)) {
                    const fontFamily = path.parse(file).name;
                    const fontPath = path.join(fontsDir, file);

                    // Register the original name
                    canvasModule.registerFont(fontPath, { family: fontFamily });
                    if (process.env.DEBUG === "true") {
                        console.log(`[API Render] Registered font family: "${fontFamily}"`);
                    }

                    // Register aliases (without spaces, with underscores) to be more robust
                    if (fontFamily.includes(" ")) {
                        const noSpace = fontFamily.replace(/\s+/g, "");
                        const underscore = fontFamily.replace(/\s+/g, "_");
                        canvasModule.registerFont(fontPath, { family: noSpace });
                        canvasModule.registerFont(fontPath, { family: underscore });
                        if (process.env.DEBUG === "true") {
                            console.log(`[API Render] Registered aliases: "${noSpace}", "${underscore}"`);
                        }
                    }
                }
            });
        } else {
            if (process.env.DEBUG === "true") {
                console.warn(`[API Render] Fonts directory NOT FOUND at ${fontsDir}`);
            }
        }
        fontsRegistered = true;
    } catch (err) {
        if (process.env.DEBUG === "true") {
            console.error("[API Render] Failed to register fonts:", err);
        }
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

    // Ensure custom fonts are registered for node-canvas
    registerServerFonts();

    try {
        // 1. Validate API Key
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Missing/Invalid Authorization header", ...(isDebug && { logs: debugLogs }) }, { status: 401 });
        }

        const apiKey = authHeader.replace("Bearer ", "");
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data: apiKeyData, error: apiKeyError } = await supabase
            .from("user_api_keys")
            .select("user_id")
            .eq("api_key", apiKey)
            .single();

        if (apiKeyError || !apiKeyData) {
            return NextResponse.json({ error: "Invalid API key", ...(isDebug && { logs: debugLogs }) }, { status: 401 });
        }

        const userId = apiKeyData.user_id;

        // 2. Parse request
        const body = await req.json();
        const { templateId, layers } = body;

        log(`Received request for Template: ${templateId}`);

        if (!templateId) return NextResponse.json({ error: "Missing templateId", ...(isDebug && { logs: debugLogs }) }, { status: 400 });

        // 3. Fetch template
        const { data: template, error: templateError } = await supabase
            .from("templates")
            .select("*")
            .eq("id", templateId)
            .eq("user_id", userId)
            .single();

        if (templateError || !template) return NextResponse.json({ error: "Template not found", ...(isDebug && { logs: debugLogs }) }, { status: 404 });

        // 4. Pre-process Elements JSON with Layer Updates
        // This is more reliable than modifying Fabric objects after creation
        let elements = template.elements || [];

        if (layers && elements.length > 0) {
            log(`Applying dynamic updates to ${elements.length} elements`);

            // Use Promise.all to handle async image fetching
            elements = await Promise.all(elements.map(async (element: any) => {
                const layerId = element.id || element.name;

                // LOG THE FONT IN USE
                if (element.fontFamily) {
                    log(`Element ${layerId} uses font: "${element.fontFamily}"`);
                }

                log(`Processing element: ${layerId || 'unknown'} (${element.type})`);

                const update = layers[layerId];

                if (update) {
                    log(`MATCH: Updating layer ${layerId}. Keys received: [${Object.keys(update).join(', ')}]`);

                    const newElement = { ...element };

                    // Text Updates
                    if (["text", "i-text", "textbox"].includes(element.type)) {
                        if (update.text) {
                            newElement.text = update.text;
                            delete newElement.path;
                        }
                        if (update.color) newElement.fill = update.color;
                        if (update.fontFamily) {
                            newElement.fontFamily = update.fontFamily;
                            log(`Updated font for ${layerId} to: "${update.fontFamily}"`);
                        }
                    }

                    // Image Updates
                    // Check for various common keys for image URL
                    const targetImageUrl = update.image_url || update.src || update.url || update.image;

                    if (element.type === "image" && targetImageUrl) {
                        log(`MATCH: Image update for ${layerId}. Target URL: ${targetImageUrl}`);
                        try {
                            // Add timeout to prevent hanging on slow images
                            const controller = new AbortController();
                            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout

                            log(`Downloading image from: ${targetImageUrl}`);
                            const imgRes = await fetch(targetImageUrl, {
                                cache: 'no-store',
                                headers: { 'User-Agent': 'Mozilla/5.0' },
                                signal: controller.signal
                            });

                            clearTimeout(timeoutId);

                            if (!imgRes.ok) throw new Error(`Fetch failed: ${imgRes.status} ${imgRes.statusText}`);

                            const arrayBuffer = await imgRes.arrayBuffer();
                            const buffer = Buffer.from(arrayBuffer);
                            const base64 = buffer.toString('base64');
                            const contentType = imgRes.headers.get("content-type") || "image/png";
                            const dataUri = `data:${contentType};base64,${base64}`;

                            log(`Image converted to Base64 (Length: ${base64.length}). Starts with: ${base64.substring(0, 20)}...`);

                            try {
                                // Dynamically require canvas only when needed to verify installation on runtime
                                let Image;
                                try {
                                    // @ts-ignore
                                    const canvasModule = require('canvas');
                                    Image = canvasModule.Image;
                                } catch (err) {
                                    if (process.env.DEBUG === "true") {
                                        console.error("Optional dependency 'canvas' failed to load:", err);
                                    }
                                }

                                if (Image) {
                                    const img = new Image();
                                    img.src = buffer;

                                    const newWidth = img.width;
                                    const newHeight = img.height;

                                    if (newWidth && newHeight) {
                                        const originalWidth = element.width || 100;
                                        const originalHeight = element.height || 100;
                                        const originalScaleX = element.scaleX || 1;
                                        const originalScaleY = element.scaleY || 1;

                                        const visualWidth = originalWidth * originalScaleX;
                                        const visualHeight = originalHeight * originalScaleY;

                                        // Calculate scale to maintain aspect ratio (cover mode)
                                        const scaleX = visualWidth / newWidth;
                                        const scaleY = visualHeight / newHeight;
                                        const scale = Math.max(scaleX, scaleY); // Use max to cover (fill) the area

                                        // Calculate scaled dimensions
                                        const scaledWidth = newWidth * scale;
                                        const scaledHeight = newHeight * scale;

                                        // Calculate crop offsets to center the image
                                        const cropX = scaledWidth > visualWidth ? ((scaledWidth - visualWidth) / 2) / scale : 0;
                                        const cropY = scaledHeight > visualHeight ? ((scaledHeight - visualHeight) / 2) / scale : 0;

                                        newElement.width = newWidth;
                                        newElement.height = newHeight;
                                        newElement.scaleX = scale;
                                        newElement.scaleY = scale;
                                        newElement.cropX = cropX;
                                        newElement.cropY = cropY;

                                        log(`Geometry Adjust (cover): ${newWidth}x${newHeight} -> Scale ${scale.toFixed(2)}, Crop (${cropX.toFixed(2)}, ${cropY.toFixed(2)})`);
                                    }
                                } else {
                                    log("Skipping geometry adjustment because 'canvas' package is missing or failed to load.");
                                }
                            } catch (geomError: any) {
                                log(`Geometry calculation failed: ${geomError.message}. Proceeding without scale adjustment.`);
                            }

                            // Aggressively overwrite source properties
                            newElement.src = dataUri;
                            newElement.type = "image";
                            delete newElement.crossOrigin;
                            delete newElement.srcSet;
                            delete newElement.originalSrc;

                        } catch (e: any) {
                            log(`ERROR downloading image: ${e.message}. Using URL directly.`);
                            newElement.src = targetImageUrl;
                            delete newElement.crossOrigin;
                        }
                    } else if (element.type === "image" && !targetImageUrl) {
                        log(`SKIPPING image update for ${layerId}: No image URL found in update object.`);
                    }

                    return newElement;
                }
                return element;
            }));
        }

        // Debug: Log elements being loaded
        log(`About to load ${elements.length} elements into canvas`);
        elements.forEach((el: any, idx: number) => {
            if (el.type === 'image') {
                const srcPreview = el.src ? el.src.substring(0, 50) : 'NO SRC';
                log(`Element ${idx} (${el.id || el.name}): type=image, src starts with: ${srcPreview}...`);
            }
        });

        // 5. Setup Canvas and Load Modified JSON
        const canvas = new fabric.StaticCanvas(null, {
            width: template.width || 800,
            height: template.height || 600,
            backgroundColor: template.backgroundColor || "#ffffff"
        });

        // We wrap loadFromJSON to ensure it completes before we proceed
        await new Promise<void>((resolve, reject) => {
            canvas.loadFromJSON({ objects: elements }, () => {
                resolve();
            }, (o: any, object: any) => {
                // Reviver: This runs for every object after it's created but before callback
                // Good place to ensure specific settings
                if (object.type === 'image') {
                    // Ensure generic settings
                }
            });
        });

        const objects = canvas.getObjects();

        // Debug: Log what src the images have after loading into canvas
        objects.forEach((obj: any, idx: number) => {
            if (obj.type === 'image') {
                const srcPreview = obj._element?.src ? obj._element.src.substring(0, 50) : 'NO SRC';
                log(`Canvas loaded - Image ${idx}: src preview = ${srcPreview}...`);
            }
        });

        const workspace = objects.find((obj: any) => obj.name === "clip");
        let offsetX = 0;
        let offsetY = 0;

        if (workspace) {
            offsetX = workspace.left || 0;
            offsetY = workspace.top || 0;
            workspace.set({ left: 0, top: 0 });
        }

        // Fix Offsets
        for (const obj of objects) {
            if (obj !== workspace) {
                obj.set({
                    left: (obj.left || 0) - offsetX,
                    top: (obj.top || 0) - offsetY
                });
                obj.setCoords();
            }
        }

        log(`Rendered ${objects.length} objects`);

        // Render to Data URL
        const dataUrl = canvas.toDataURL({
            format: "png",
            multiplier: 1,
            enableRetinaScaling: false
        });

        // 6. Upload to Supabase
        const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `renders/${templateId}-${Date.now()}.png`;

        const { error: uploadError } = await supabase
            .storage
            .from('media')
            .upload(fileName, buffer, {
                contentType: 'image/png',
                upsert: false
            });

        let publicUrl = "";
        if (!uploadError) {
            const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName);
            publicUrl = publicUrlData.publicUrl;
        } else {
            log(`Upload error: ${uploadError?.message}`);
        }

        return NextResponse.json({
            status: "success",
            imageUrl: publicUrl,
            ...(isDebug && { logs: debugLogs }),
            data: { templateId, elementsCount: objects.length }
        }, { status: 200 });

    } catch (error: any) {
        log(`Fatal Error: ${error.message}`);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error.message,
                ...(isDebug && { logs: debugLogs })
            },
            { status: 500 }
        );
    }
}

// GET method for documentation/testing
export async function GET() {
    return NextResponse.json({
        endpoint: "/api/render",
        method: "POST",
        description: "Generate images from templates with dynamic data",
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
        note: "Image rendering is currently in development. The endpoint returns processed template data."
    });
}
