import { z } from "zod";
import { Hono } from "hono";
import { eq, and, desc, asc } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/db/drizzle";
import { projects, projectsInsertSchema } from "@/db/schema";

type Project = typeof projects.$inferSelect;
const MOCK_PROJECTS: Project[] = [];
const app = new Hono()
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

      if (auth.token.id === "temp-user-id") {
        const index = MOCK_PROJECTS.findIndex((p) => p.id === id && p.userId === auth.token!.id);
        if (index === -1) {
          return c.json({ error: "Not found" }, 404);
        }
        MOCK_PROJECTS.splice(index, 1);
        return c.json({ data: { id } });
      }

      const data = await db
        .delete(projects)
        .where(
          and(
            eq(projects.id, id),
            eq(projects.userId, auth.token.id as string),
          ),
        )
        .returning();

      if (data.length === 0) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data: { id } });
    },
  )
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

      if (auth.token.id === "temp-user-id") {
        const project = MOCK_PROJECTS.find((p) => p.id === id && p.userId === auth.token!.id);
        if (!project) {
          return c.json({ error: "Not found" }, 404);
        }

        const duplicate = {
          ...project,
          id: `mock-project-${Date.now()}-${Math.random()}`,
          name: `Copy of ${project.name}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        MOCK_PROJECTS.push(duplicate);
        return c.json({ data: duplicate });
      }

      const data = await db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.id, id),
            eq(projects.userId, auth.token.id as string),
          ),
        );

      if (data.length === 0) {
        return c.json({ error: " Not found" }, 404);
      }

      const project = data[0];

      const duplicateData = await db
        .insert(projects)
        .values({
          name: `Copy of ${project.name}`,
          json: project.json,
          width: project.width,
          height: project.height,
          userId: auth.token.id as string,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return c.json({ data: duplicateData[0] });
    },
  )
  .get(
    "/",
    verifyAuth(),
    zValidator(
      "query",
      z.object({
        page: z.coerce.number(),
        limit: z.coerce.number(),
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { page, limit } = c.req.valid("query");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (auth.token.id === "temp-user-id") {
        const userProjects = MOCK_PROJECTS.filter((p) => p.userId === auth.token!.id)
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        const data = userProjects.slice((page - 1) * limit, page * limit);
        return c.json({
          data,
          nextPage: userProjects.length > page * limit ? page + 1 : null,
        });
      }

      const data = await db
        .select()
        .from(projects)
        .where(eq(projects.userId, auth.token.id as string))
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(desc(projects.updatedAt))

      return c.json({
        data,
        nextPage: data.length === limit ? page + 1 : null,
      });
    },
  )
  .patch(
    "/:id",
    verifyAuth(),
    zValidator(
      "param",
      z.object({ id: z.string() }),
    ),
    zValidator(
      "json",
      projectsInsertSchema
        .omit({
          id: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        })
        .partial()
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      console.log("💾 PATCH /projects/:id");
      console.log("  - Project ID:", id);
      console.log("  - User ID:", auth.token?.id);
      console.log("  - Values:", JSON.stringify(values).substring(0, 200));

      if (!auth.token?.id) {
        console.log("❌ No auth token");
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (auth.token.id === "temp-user-id") {
        const index = MOCK_PROJECTS.findIndex((p) => p.id === id && p.userId === auth.token!.id);
        if (index === -1) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        MOCK_PROJECTS[index] = {
          ...MOCK_PROJECTS[index],
          ...values,
          updatedAt: new Date(),
        };

        return c.json({ data: MOCK_PROJECTS[index] });
      }

      const data = await db
        .update(projects)
        .set({
          ...values,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(projects.id, id),
            eq(projects.userId, auth.token.id as string),
          ),
        )
        .returning();

      console.log("  - Updated:", data.length, "rows");
      if (data.length > 0) {
        console.log("  - Result:", data[0]);
      }

      if (data.length === 0) {
        console.log("❌ No rows updated - project not found or wrong user");
        return c.json({ error: "Unauthorized" }, 401);
      }

      return c.json({ data: data[0] });
    },
  )
  .get(
    "/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (auth.token.id === "temp-user-id") {
        const project = MOCK_PROJECTS.find((p) => p.id === id && p.userId === auth.token!.id);
        if (!project) {
          return c.json({ error: "Not found" }, 404);
        }
        return c.json({ data: project });
      }

      const data = await db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.id, id),
            eq(projects.userId, auth.token.id as string)
          )
        );

      if (data.length === 0) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data: data[0] });
    },
  )
  .post(
    "/",
    verifyAuth(),
    zValidator(
      "json",
      projectsInsertSchema.pick({
        name: true,
        json: true,
        width: true,
        height: true,
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { name, json, height, width } = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (auth.token.id === "temp-user-id") {
        const newProject = {
          id: `mock-project-${Date.now()}-${Math.random()}`,
          name,
          json,
          width,
          height,
          userId: auth.token.id,
          isTemplate: false,
          isPro: false,
          thumbnailUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        MOCK_PROJECTS.push(newProject);
        return c.json({ data: newProject });
      }

      const data = await db
        .insert(projects)
        .values({
          name,
          json,
          width,
          height,
          userId: auth.token.id as string,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!data[0]) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      return c.json({ data: data[0] });
    },
  );

export default app;
