import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { feedbackComments, feedbackPosts } from "@/db/schema";
import { sendFeedbackNotification } from "@/lib/server/feedback-notifications";
import { ensureRequestUser, getRequestUser } from "@/lib/server/request-user";

const commentSchema = z.object({
  body: z.string().trim().min(2).max(1500),
  parentCommentId: z.string().trim().min(1).max(100).nullable().optional(),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const parsed = commentSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Comment is too short or too long" }, { status: 400 });

    const [post] = await db.select({
      id: feedbackPosts.id,
      userId: feedbackPosts.userId,
      moderationStatus: feedbackPosts.moderationStatus,
    }).from(feedbackPosts).where(eq(feedbackPosts.id, params.id));
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (post.moderationStatus !== "approved" && post.userId !== requestUser.id && requestUser.role !== "admin" && requestUser.role !== "superadmin") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (parsed.data.parentCommentId) {
      const [parentComment] = await db
        .select({ id: feedbackComments.id })
        .from(feedbackComments)
        .where(and(
          eq(feedbackComments.id, parsed.data.parentCommentId),
          eq(feedbackComments.feedbackId, params.id),
          isNull(feedbackComments.parentCommentId),
        ));
      if (!parentComment) return NextResponse.json({ error: "Reply target not found" }, { status: 404 });
    }
    await ensureRequestUser(requestUser);

    const [created] = await db.insert(feedbackComments).values({
      parentCommentId: parsed.data.parentCommentId || null,
      feedbackId: params.id,
      userId: requestUser.id,
      body: parsed.data.body,
      isAdmin: requestUser.role === "admin" || requestUser.role === "superadmin",
      createdAt: new Date(),
    }).returning();

    await sendFeedbackNotification(params.id, requestUser.id, requestUser.name, {
      type: "comment",
      message: parsed.data.body,
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("[Feedback] Failed to add comment:", error);
    return NextResponse.json({ error: "Could not publish comment" }, { status: 500 });
  }
}
