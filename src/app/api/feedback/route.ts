import { NextRequest, NextResponse } from "next/server";
import { desc, eq, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { feedbackActivities, feedbackComments, feedbackPosts, feedbackSubscriptions, feedbackVotes, users } from "@/db/schema";
import { ensureRequestUser, getRequestUser } from "@/lib/server/request-user";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const createFeedbackSchema = z.object({
  title: z.string().trim().min(5).max(140),
  description: z.string().trim().min(15).max(3000),
  category: z.enum(["feature", "editor", "api", "integration", "billing", "other"]).default("feature"),
});

export async function GET(request: NextRequest) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const isAdmin = requestUser.role === "admin" || requestUser.role === "superadmin";

    const [postRows, voteRows, commentRows, activityRows, subscriptionRows] = await Promise.all([
      db
        .select({
          id: feedbackPosts.id,
          userId: feedbackPosts.userId,
          title: feedbackPosts.title,
          description: feedbackPosts.description,
          category: feedbackPosts.category,
          status: feedbackPosts.status,
          moderationStatus: feedbackPosts.moderationStatus,
          createdAt: feedbackPosts.createdAt,
          updatedAt: feedbackPosts.updatedAt,
          authorName: users.name,
          authorImage: users.image,
        })
        .from(feedbackPosts)
        .innerJoin(users, eq(feedbackPosts.userId, users.id))
        .where(isAdmin ? undefined : or(
          eq(feedbackPosts.moderationStatus, "approved"),
          eq(feedbackPosts.userId, requestUser.id),
        ))
        .orderBy(desc(feedbackPosts.createdAt))
        .limit(200),
      db.select().from(feedbackVotes),
      db
        .select({
          id: feedbackComments.id,
          parentCommentId: feedbackComments.parentCommentId,
          feedbackId: feedbackComments.feedbackId,
          userId: feedbackComments.userId,
          body: feedbackComments.body,
          isAdmin: feedbackComments.isAdmin,
          createdAt: feedbackComments.createdAt,
          authorName: users.name,
          authorImage: users.image,
        })
        .from(feedbackComments)
        .innerJoin(users, eq(feedbackComments.userId, users.id))
        .orderBy(feedbackComments.createdAt),
      db
        .select({
          id: feedbackActivities.id,
          feedbackId: feedbackActivities.feedbackId,
          actorId: feedbackActivities.actorId,
          action: feedbackActivities.action,
          fromValue: feedbackActivities.fromValue,
          toValue: feedbackActivities.toValue,
          createdAt: feedbackActivities.createdAt,
          actorName: users.name,
          actorImage: users.image,
        })
        .from(feedbackActivities)
        .innerJoin(users, eq(feedbackActivities.actorId, users.id))
        .orderBy(feedbackActivities.createdAt),
      db
        .select({ feedbackId: feedbackSubscriptions.feedbackId })
        .from(feedbackSubscriptions)
        .where(eq(feedbackSubscriptions.userId, requestUser.id)),
    ]);

    const votesByPost = new Map<string, { score: number; upvotes: number; currentUserVote: number }>();
    for (const vote of voteRows) {
      const current = votesByPost.get(vote.feedbackId) || { score: 0, upvotes: 0, currentUserVote: 0 };
      if (vote.value > 0) {
        current.score += 1;
        current.upvotes += 1;
      }
      if (vote.userId === requestUser.id) current.currentUserVote = vote.value;
      votesByPost.set(vote.feedbackId, current);
    }

    const commentsByPost = new Map<string, typeof commentRows>();
    for (const comment of commentRows) {
      const current = commentsByPost.get(comment.feedbackId) || [];
      current.push(comment);
      commentsByPost.set(comment.feedbackId, current);
    }

    const activitiesByPost = new Map<string, typeof activityRows>();
    for (const activity of activityRows) {
      const current = activitiesByPost.get(activity.feedbackId) || [];
      current.push(activity);
      activitiesByPost.set(activity.feedbackId, current);
    }

    const subscribedPostIds = new Set(subscriptionRows.map((subscription) => subscription.feedbackId));
    const items = postRows.map((post) => {
      const storedActivities = activitiesByPost.get(post.id) || [];
      const activities = storedActivities.some((activity) => activity.action === "created")
        ? storedActivities
        : [{
            id: `created-${post.id}`,
            feedbackId: post.id,
            actorId: post.userId,
            action: "created",
            fromValue: null,
            toValue: post.moderationStatus,
            createdAt: post.createdAt,
            actorName: post.authorName,
            actorImage: post.authorImage,
          }, ...storedActivities];

      return {
        ...post,
        authorName: post.authorName || "Dynamic Canvas user",
        ...(votesByPost.get(post.id) || { score: 0, upvotes: 0, currentUserVote: 0 }),
        comments: commentsByPost.get(post.id) || [],
        activities,
        isSubscribed: subscribedPostIds.has(post.id),
      };
    });

    return NextResponse.json({
      data: items,
      currentUserId: requestUser.id,
      isAdmin,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[Feedback] Failed to load board:", error);
    return NextResponse.json({ error: "Could not load feedback" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const isAdmin = requestUser.role === "admin" || requestUser.role === "superadmin";
    const parsed = createFeedbackSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Check the title and description", details: parsed.error.flatten() }, { status: 400 });
    }

    await ensureRequestUser(requestUser);
    const now = new Date();
    const [created] = await db.insert(feedbackPosts).values({
      userId: requestUser.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      status: "open",
      moderationStatus: isAdmin ? "approved" : "pending",
      createdAt: now,
      updatedAt: now,
    }).returning();

    await db.insert(feedbackActivities).values({
      feedbackId: created.id,
      actorId: requestUser.id,
      action: "created",
      toValue: created.moderationStatus,
      createdAt: now,
    });
    await db.insert(feedbackSubscriptions).values({
      feedbackId: created.id,
      userId: requestUser.id,
      createdAt: now,
    }).onConflictDoNothing();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("[Feedback] Failed to create post:", error);
    return NextResponse.json({ error: "Could not publish feedback" }, { status: 500 });
  }
}
