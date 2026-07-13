import { z } from "zod";
import { Hono } from "hono";
import { and, asc, eq } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/db/drizzle";
import { templateFolders, templates, users } from "@/db/schema";

const paidPlans = new Set(["creator", "agency", "business", "unlimited"]);

async function getPaidUser(userId: string) {
  const [user] = await db
    .select({ plan: users.plan })
    .from(users)
    .where(eq(users.id, userId));

  return { user, paid: Boolean(user && paidPlans.has(user.plan)) };
}

const app = new Hono()
  .get("/", verifyAuth(), async (c) => {
    const userId = c.get("authUser").token?.id as string | undefined;
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const [{ paid }, folders] = await Promise.all([
      getPaidUser(userId),
      db.select().from(templateFolders)
        .where(eq(templateFolders.userId, userId))
        .orderBy(asc(templateFolders.name)),
    ]);

    return c.json({ data: folders, paid });
  })
  .post(
    "/",
    verifyAuth(),
    zValidator("json", z.object({ name: z.string().trim().min(1).max(60) })),
    async (c) => {
      const userId = c.get("authUser").token?.id as string | undefined;
      if (!userId) return c.json({ error: "Unauthorized" }, 401);

      const { paid } = await getPaidUser(userId);
      if (!paid) return c.json({ error: "Folders require a paid plan", code: "PAID_PLAN_REQUIRED" }, 403);

      const { name } = c.req.valid("json");
      const [folder] = await db.insert(templateFolders).values({
        name,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      return c.json({ data: folder }, 201);
    },
  )
  .patch(
    "/:folderId/templates/:templateId",
    verifyAuth(),
    zValidator("param", z.object({ folderId: z.string(), templateId: z.string() })),
    async (c) => {
      const userId = c.get("authUser").token?.id as string | undefined;
      if (!userId) return c.json({ error: "Unauthorized" }, 401);

      const { paid } = await getPaidUser(userId);
      if (!paid) return c.json({ error: "Folders require a paid plan", code: "PAID_PLAN_REQUIRED" }, 403);

      const { folderId, templateId } = c.req.valid("param");
      const nextFolderId = folderId === "root" ? null : folderId;

      if (nextFolderId) {
        const [folder] = await db.select({ id: templateFolders.id })
          .from(templateFolders)
          .where(and(eq(templateFolders.id, nextFolderId), eq(templateFolders.userId, userId)));
        if (!folder) return c.json({ error: "Folder not found" }, 404);
      }

      const [template] = await db.update(templates)
        .set({ folderId: nextFolderId, updatedAt: new Date(), lastModified: new Date() })
        .where(and(eq(templates.id, templateId), eq(templates.user_id, userId)))
        .returning({ id: templates.id, folderId: templates.folderId });

      if (!template) return c.json({ error: "Template not found" }, 404);
      return c.json({ data: template });
    },
  )
  .delete(
    "/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const userId = c.get("authUser").token?.id as string | undefined;
      if (!userId) return c.json({ error: "Unauthorized" }, 401);

      const { paid } = await getPaidUser(userId);
      if (!paid) return c.json({ error: "Folders require a paid plan", code: "PAID_PLAN_REQUIRED" }, 403);

      const { id } = c.req.valid("param");
      const [folder] = await db.delete(templateFolders)
        .where(and(eq(templateFolders.id, id), eq(templateFolders.userId, userId)))
        .returning({ id: templateFolders.id });

      if (!folder) return c.json({ error: "Folder not found" }, 404);
      return c.json({ data: folder });
    },
  );

export default app;
