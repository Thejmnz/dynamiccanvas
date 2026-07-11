import Stripe from "stripe";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";

import { checkIsActive } from "@/features/subscriptions/lib";

import { stripe } from "@/lib/stripe";
import { db } from "@/db/drizzle";
import { stripeEvents, subscriptions, users } from "@/db/schema";

const PLAN_CREDITS = {
  creator: 1000,
  agency: 5000,
  business: 25000,
} as const;

export const PLAN_TEMPLATE_LIMITS = {
  free: 3,
  creator: 15,
  agency: 100,
  business: Infinity,
} as const;

const app = new Hono()
  .post("/billing", verifyAuth(), async (c) => {
    const auth = c.get("authUser");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, auth.token.id));

    if (!subscription) {
      return c.json({ error: "No subscription found" }, 404);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
    });

    if (!session.url) {
      return c.json({ error: "Failed to create session" }, 400);
    }

    return c.json({ data: session.url });
  })
  .get("/current", verifyAuth(), async (c) => {
    const auth = c.get("authUser");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, auth.token.id));

    const active = checkIsActive(subscription);

    return c.json({
      data: subscription ? {
        ...subscription,
        active,
      } : {
        active: false,
      },
    });
  })
  .post("/checkout", verifyAuth(), async (c) => {
    const auth = c.get("authUser");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [currentSubscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, auth.token.id));
    if (checkIsActive(currentSubscription)) {
      return c.json({
        error: "An active subscription already exists. Use billing settings to change plans.",
      }, 409);
    }

    type CheckoutBody = {
      plan?: "creator" | "agency" | "business";
      billing?: "monthly" | "yearly";
    };
    const body = await c.req.json<CheckoutBody>().catch((): CheckoutBody => ({}));
    const plan = body.plan || "creator";
    const billing = body.billing || "monthly";
    const priceIds = {
      creator: {
        monthly: process.env.STRIPE_CREATOR_MONTHLY_PRICE_ID,
        yearly: process.env.STRIPE_CREATOR_YEARLY_PRICE_ID,
      },
      agency: {
        monthly: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID,
        yearly: process.env.STRIPE_AGENCY_YEARLY_PRICE_ID,
      },
      business: {
        monthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID,
        yearly: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID,
      },
    } as const;
    const priceId = priceIds[plan]?.[billing];

    if (!priceId) {
      return c.json({ error: "Invalid plan or missing Stripe price" }, 400);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      success_url: `${appUrl}/dashboard?success=1`,
      cancel_url: `${appUrl}/dashboard?canceled=1`,
      payment_method_types: ["card", "paypal"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: auth.token.email || "",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: auth.token.id,
        plan,
        billing,
      },
      subscription_data: {
        metadata: {
          userId: auth.token.id,
          plan,
          billing,
          credits: String(PLAN_CREDITS[plan]),
        },
      },
    });

    const url = session.url;
    
    if (!url) {
      return c.json({ error: "Failed to create session" }, 400);
    }

    return c.json({ data: url });
  })
  .post(
    "/webhook",
    async (c) => {
      const body = await c.req.text();
      const signature = c.req.header("Stripe-Signature") as string;

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch (error) {
        return c.json({ error: "Invalid signature" }, 400);
      }

      const [claimedEvent] = await db.insert(stripeEvents).values({
        id: event.id,
        type: event.type,
        createdAt: new Date(),
      }).onConflictDoNothing({ target: stripeEvents.id }).returning({ id: stripeEvents.id });

      // Stripe retries events. A previously claimed event must be a no-op so
      // subscription state and monthly credits can never be applied twice.
      if (!claimedEvent) {
        return c.json(null, 200);
      }

      try {
        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;

          if (!session?.metadata?.userId) {
            return c.json({ error: "Invalid session: missing userId metadata" }, 400);
          }

          // Subscription purchase
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
          );

          const priceItem = subscription.items.data[0];

          const subscriptionValues = {
              status: subscription.status,
              userId: session.metadata.userId,
              subscriptionId: subscription.id,
              customerId: subscription.customer as string,
              priceId: priceItem?.price?.id ?? "",
              currentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          const [existingSubscription] = await db
            .select({ id: subscriptions.id })
            .from(subscriptions)
            .where(eq(subscriptions.userId, session.metadata.userId));

          if (existingSubscription) {
            await db.update(subscriptions).set({
              status: subscriptionValues.status,
              subscriptionId: subscriptionValues.subscriptionId,
              customerId: subscriptionValues.customerId,
              priceId: subscriptionValues.priceId,
              currentPeriodEnd: subscriptionValues.currentPeriodEnd,
              updatedAt: new Date(),
            }).where(eq(subscriptions.id, existingSubscription.id));
          } else {
            await db.insert(subscriptions).values(subscriptionValues);
          }

          const plan = (session.metadata.plan || subscription.metadata.plan || "creator") as keyof typeof PLAN_CREDITS;
          const credits = PLAN_CREDITS[plan] || PLAN_CREDITS.creator;
          const nextReset = new Date();
          nextReset.setMonth(nextReset.getMonth() + 1);
          await db.update(users).set({
            plan,
            creditsBalance: credits,
            creditsPerMonth: credits,
            creditsResetAt: nextReset,
          }).where(eq(users.id, session.metadata.userId));
        }

        if (event.type === "invoice.payment_succeeded") {
          const invoice = event.data.object as Stripe.Invoice;

          // Retrieve the subscription to get fresh status
          if (!invoice.subscription) {
            return c.json({ error: "Invalid invoice: no subscription" }, 400);
          }

          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string,
          );

          await db
            .update(subscriptions)
            .set({
              status: subscription.status,
              currentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.subscriptionId, subscription.id));

          const plan = (subscription.metadata.plan || "creator") as keyof typeof PLAN_CREDITS;
          const credits = PLAN_CREDITS[plan] || PLAN_CREDITS.creator;
          const nextReset = new Date();
          nextReset.setMonth(nextReset.getMonth() + 1);
          if (subscription.metadata.userId) {
            await db.update(users).set({
              plan,
              creditsBalance: credits,
              creditsPerMonth: credits,
              creditsResetAt: nextReset,
            }).where(eq(users.id, subscription.metadata.userId));
          }
        }

        if (event.type === "customer.subscription.deleted") {
          const subscription = event.data.object as Stripe.Subscription;
          await db.update(subscriptions).set({
            status: subscription.status,
            updatedAt: new Date(),
          }).where(eq(subscriptions.subscriptionId, subscription.id));

          if (subscription.metadata.userId) {
            await db.update(users).set({
              plan: "free",
              creditsBalance: 0,
              creditsPerMonth: 0,
              creditsResetAt: null,
            }).where(eq(users.id, subscription.metadata.userId));
          }
        }

        return c.json(null, 200);
      } catch (error: any) {
        // Allow Stripe to retry a failed event.
        await db.delete(stripeEvents).where(eq(stripeEvents.id, event.id)).catch(() => undefined);
        console.error("[Stripe Webhook] Error processing event:", error);
        // Return 500 so Stripe retries
        return c.json({ error: "Webhook processing failed" }, 500);
      }
    },
  );

export default app;
