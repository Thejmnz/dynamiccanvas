import { z } from "zod";
import { Hono } from "hono";
import { eq, desc, asc, and } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/db/drizzle";
import { templates, templatesInsertSchema } from "@/db/schema";

const app = new Hono()
  // Obtener todos los templates (públicos, sin auth temporalmente para debug)
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        category: z.string().optional(),
      }),
    ),
    async (c) => {
      const { page, limit, category } = c.req.valid("query");

      console.log("🔍 Fetching from dynamic_canvas_templates table");

      const data = await db
        .select()
        .from(templates)
        .where(category ? eq(templates.category, category) : undefined)
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(
          asc(templates.isPro),
          desc(templates.updatedAt),
        );

      console.log("✅ Templates data:", data.length, "items");

      return c.json({ data });
    },
  )
  // Obtener un template específico por ID
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const { id } = c.req.valid("param");

      const data = await db
        .select()
        .from(templates)
        .where(eq(templates.id, id));

      if (data.length === 0) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data: data[0] });
    },
  )
  // Crear un nuevo template (requiere autenticación)
  .post(
    "/",
    verifyAuth(),
    zValidator(
      "json",
      templatesInsertSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");
      const values = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .insert(templates)
        .values({
          ...values,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!data[0]) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      return c.json({ data: data[0] });
    },
  )
  // Actualizar un template (requiere autenticación)
  .patch(
    "/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      templatesInsertSchema
        .omit({
          id: true,
          createdAt: true,
          updatedAt: true,
        })
        .partial(),
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Verify ownership: user must own the template or be superadmin
      const [existing] = await db
        .select({ userId: templates.user_id })
        .from(templates)
        .where(eq(templates.id, id));

      if (!existing) {
        return c.json({ error: "Not found" }, 404);
      }

      const isOwner = existing.userId === auth.token.id;
      const isSuperadmin = auth.token.role === "superadmin";
      if (!isOwner && !isSuperadmin) {
        return c.json({ error: "Forbidden: you do not own this template" }, 403);
      }

      const data = await db
        .update(templates)
        .set({
          ...values,
          updatedAt: new Date(),
        })
        .where(eq(templates.id, id))
        .returning();

      if (data.length === 0) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data: data[0] });
    },
  )
  // Eliminar un template (requiere autenticación)
  .delete(
    "/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Verify ownership: user must own the template or be superadmin
      const [existing] = await db
        .select({ userId: templates.user_id })
        .from(templates)
        .where(eq(templates.id, id));

      if (!existing) {
        return c.json({ error: "Not found" }, 404);
      }

      const isOwner = existing.userId === auth.token.id;
      const isSuperadmin = auth.token.role === "superadmin";
      if (!isOwner && !isSuperadmin) {
        return c.json({ error: "Forbidden: you do not own this template" }, 403);
      }

      const data = await db
        .delete(templates)
        .where(eq(templates.id, id))
        .returning();

      if (data.length === 0) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data: { id } });
    },
  )
  // Duplicar un template como proyecto del usuario
  .post(
    "/:id/duplicate",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Obtener el template
      const templateData = await db
        .select()
        .from(templates)
        .where(eq(templates.id, id));

      if (templateData.length === 0) {
        return c.json({ error: "Template not found" }, 404);
      }

      const template = templateData[0];

      // Importar projects aquí para evitar dependencia circular
      const { projects } = await import("@/db/schema");

      // Crear un nuevo proyecto basado en el template
      const projectData = await db
        .insert(projects)
        .values({
          name: `Copy of ${template.name}`,
          json: template.json,
          width: template.width,
          height: template.height,
          thumbnailUrl: template.thumbnailUrl,
          userId: auth.token.id as string,
          isTemplate: false,
          isPro: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return c.json({ data: projectData[0] });
    },
  );

export default app;
