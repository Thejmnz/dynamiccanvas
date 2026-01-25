import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createClient } from "@supabase/supabase-js";

const app = new Hono();

const uploadUrlSchema = z.object({
    fileName: z.string(),
    expiresIn: z.number().optional().default(3600)
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

app.post(
    '/',
    zValidator('json', uploadUrlSchema),
    async (c) => {
        try {
            // Validate API Key
            const authHeader = c.req.header("authorization");
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return c.json({ error: "Missing/Invalid Authorization header" }, 401);
            }

            const apiKey = authHeader.replace("Bearer ", "");
            const supabase = createClient(supabaseUrl, supabaseServiceKey);

            const { data: apiKeyData, error: apiKeyError } = await supabase
                .from("user_api_keys")
                .select("user_id")
                .eq("api_key", apiKey)
                .single();

            if (apiKeyError || !apiKeyData) {
                return c.json({ error: "Invalid API key" }, 401);
            }

            const userId = apiKeyData.user_id;
            const { fileName, expiresIn } = c.req.valid('json');

            // Generar path único con timestamp y user ID
            const timestamp = Date.now();
            const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
            const filePath = `uploads/${userId}/${timestamp}-${sanitizedFileName}`;

            // Crear URL firmada para upload
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("media")
                .createSignedUploadUrl(filePath, {
                    upsert: false
                });

            if (uploadError) {
                console.error("Error creating signed upload URL:", uploadError);
                return c.json(
                    { error: "Failed to create upload URL", details: uploadError.message },
                    500
                );
            }

            // Obtener URL pública
            const { data: publicUrlData } = supabase.storage
                .from("media")
                .getPublicUrl(filePath);

            const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

            return c.json({
                uploadUrl: uploadData.signedUrl,
                token: uploadData.token,
                publicUrl: publicUrlData.publicUrl,
                filePath,
                expiresAt,
                instructions: {
                    step1: "Use a PUT request to upload the file to uploadUrl",
                    step2: "Include the token in the request headers or query params",
                    step3: "After successful upload, use publicUrl in the /api/render endpoint",
                    example: "PUT request with binary/form-data body to uploadUrl"
                }
            });
        } catch (error: any) {
            console.error("Upload URL generation error:", error);
            return c.json(
                { error: "Internal server error", details: error.message },
                500
            );
        }
    }
);

// GET method for documentation
app.get('/', (c) => {
    return c.json({
        endpoint: "/api/upload-url",
        method: "POST",
        description: "Genera URLs firmadas para subir imágenes directamente a Supabase Storage",
        benefits: [
            "✓ Sin conversión a base64 - MÁS RÁPIDO",
            "✓ Reduce el tamaño del payload JSON en n8n",
            "✓ Ideal para imágenes grandes (>1MB)",
            "✓ Upload directo desde n8n a Supabase"
        ],
        authentication: "Bearer token in Authorization header",
        workflow: {
            step1: "POST /api/upload-url para obtener uploadUrl",
            step2: "PUT {binary_data} a uploadUrl desde n8n",
            step3: "Usar publicUrl en POST /api/render"
        },
        requestBody: {
            fileName: "string (required) - Nombre del archivo a subir",
            expiresIn: "number (optional) - Segundos hasta expiración (default: 3600)"
        },
        exampleRequest: {
            fileName: "product-image.jpg",
            expiresIn: 3600
        }
    });
});

export default app;
