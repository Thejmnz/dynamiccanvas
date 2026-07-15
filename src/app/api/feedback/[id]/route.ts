import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { feedbackActivities, feedbackPosts } from "@/db/schema";
import { sendFeedbackNotification } from "@/lib/server/feedback-notifications";
import { ensureRequestUser, getRequestUser } from "@/lib/server/request-user";

const updateSchema = z.object({
  status: z.enum(["open", "planned", "in_progress", "completed", "declined"]).optional(),
  moderationStatus: z.enum(["pending", "approved", "rejected"]).optional(),
}).refine((value) => value.status || value.moderationStatus, { message: "Nothing to update" });

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser || (requestUser.role !== "admin" && requestUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });

    await ensureRequestUser(requestUser);
    const [current] = await db.select({
      id: feedbackPosts.id,
      status: feedbackPosts.status,
      moderationStatus: feedbackPosts.moderationStatus,
    }).from(feedbackPosts).where(eq(feedbackPosts.id, params.id));
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [updated] = await db.update(feedbackPosts)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(feedbackPosts.id, params.id))
      .returning();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const activityRows = [];
    if (parsed.data.status && parsed.data.status !== current.status) {
      activityRows.push({
        feedbackId: params.id,
        actorId: requestUser.id,
        action: "status_changed",
        fromValue: current.status,
        toValue: parsed.data.status,
        createdAt: new Date(),
      });
    }
    if (parsed.data.moderationStatus && parsed.data.moderationStatus !== current.moderationStatus) {
      activityRows.push({
        feedbackId: params.id,
        actorId: requestUser.id,
        action: "moderation_changed",
        fromValue: current.moderationStatus,
        toValue: parsed.data.moderationStatus,
        createdAt: new Date(),
      });
    }
    if (activityRows.length > 0) await db.insert(feedbackActivities).values(activityRows);
    await Promise.all(activityRows.map((activity) => sendFeedbackNotification(
      params.id,
      requestUser.id,
      requestUser.name,
      activity.action === "status_changed"
        ? { type: "status" as const, value: activity.toValue }
        : { type: "moderation" as const, value: activity.toValue },
    )));
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[Feedback] Failed to update status:", error);
    return NextResponse.json({ error: "Could not update feedback" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [post] = await db
      .select({ id: feedbackPosts.id, userId: feedbackPosts.userId })
      .from(feedbackPosts)
      .where(eq(feedbackPosts.id, params.id));

    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (post.userId !== requestUser.id && requestUser.role !== "admin" && requestUser.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(feedbackPosts).where(eq(feedbackPosts.id, params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Feedback] Failed to delete post:", error);
    return NextResponse.json({ error: "Could not delete feedback" }, { status: 500 });
  }
}
