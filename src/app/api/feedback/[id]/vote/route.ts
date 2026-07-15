import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { feedbackPosts, feedbackVotes } from "@/db/schema";
import { ensureRequestUser, getRequestUser } from "@/lib/server/request-user";

const voteSchema = z.object({ value: z.union([z.literal(0), z.literal(1)]) });

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const parsed = voteSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid vote" }, { status: 400 });

    const [post] = await db.select({
      id: feedbackPosts.id,
      userId: feedbackPosts.userId,
      moderationStatus: feedbackPosts.moderationStatus,
    }).from(feedbackPosts).where(eq(feedbackPosts.id, params.id));
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (post.moderationStatus !== "approved" && post.userId !== requestUser.id && requestUser.role !== "admin" && requestUser.role !== "superadmin") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await ensureRequestUser(requestUser);

    if (parsed.data.value === 0) {
      await db.delete(feedbackVotes).where(and(
        eq(feedbackVotes.feedbackId, params.id),
        eq(feedbackVotes.userId, requestUser.id),
      ));
    } else {
      const now = new Date();
      await db.insert(feedbackVotes).values({
        feedbackId: params.id,
        userId: requestUser.id,
        value: parsed.data.value,
        createdAt: now,
        updatedAt: now,
      }).onConflictDoUpdate({
        target: [feedbackVotes.feedbackId, feedbackVotes.userId],
        set: { value: parsed.data.value, updatedAt: now },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Feedback] Failed to save vote:", error);
    return NextResponse.json({ error: "Could not save vote" }, { status: 500 });
  }
}
