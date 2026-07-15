import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { feedbackPosts, feedbackSubscriptions } from "@/db/schema";
import { ensureRequestUser, getRequestUser } from "@/lib/server/request-user";

const subscriptionSchema = z.object({ subscribed: z.boolean() });

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const parsed = subscriptionSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });

    const [post] = await db.select({
      id: feedbackPosts.id,
      userId: feedbackPosts.userId,
      moderationStatus: feedbackPosts.moderationStatus,
    }).from(feedbackPosts).where(eq(feedbackPosts.id, params.id));
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const isAdmin = requestUser.role === "admin" || requestUser.role === "superadmin";
    if (post.moderationStatus !== "approved" && post.userId !== requestUser.id && !isAdmin) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await ensureRequestUser(requestUser);
    if (parsed.data.subscribed) {
      await db.insert(feedbackSubscriptions).values({
        feedbackId: params.id,
        userId: requestUser.id,
        createdAt: new Date(),
      }).onConflictDoNothing();
    } else {
      await db.delete(feedbackSubscriptions).where(and(
        eq(feedbackSubscriptions.feedbackId, params.id),
        eq(feedbackSubscriptions.userId, requestUser.id),
      ));
    }

    return NextResponse.json({ subscribed: parsed.data.subscribed });
  } catch (error) {
    console.error("[Feedback] Failed to update subscription:", error);
    return NextResponse.json({ error: "Could not update subscription" }, { status: 500 });
  }
}
