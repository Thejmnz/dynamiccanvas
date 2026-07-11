import "dotenv/config";
import crypto from "node:crypto";
import Stripe from "stripe";
import pg from "pg";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const baseUrl = process.env.STRIPE_E2E_BASE_URL || "http://localhost:3000";
if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is required");

const catalog = [
  ["creator_monthly", process.env.STRIPE_CREATOR_MONTHLY_PRICE_ID, 2900, "month"],
  ["creator_yearly", process.env.STRIPE_CREATOR_YEARLY_PRICE_ID, 27600, "year"],
  ["agency_monthly", process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID, 7900, "month"],
  ["agency_yearly", process.env.STRIPE_AGENCY_YEARLY_PRICE_ID, 75600, "year"],
  ["business_monthly", process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID, 17900, "month"],
  ["business_yearly", process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID, 171600, "year"],
];

const id = `e2e_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
const email = `${id}@example.test`;
const eventIds = {
  checkout: `evt_${id}_checkout`,
  cancel: `evt_${id}_cancel`,
};
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
let customer;
let subscription;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function sendEvent(event) {
  const payload = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret });
  const response = await fetch(`${baseUrl}/api/subscriptions/webhook`, {
    method: "POST",
    headers: { "content-type": "application/json", "stripe-signature": signature },
    body: payload,
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Webhook ${event.type} failed (${response.status}): ${text}`);
}

async function accountState() {
  const result = await pool.query(
    'select plan, credits_balance, bonus_credits, credits_per_month from "user" where id = $1',
    [id],
  );
  return result.rows[0];
}

try {
  const prices = await Promise.all(catalog.map(async ([name, priceId, amount, interval]) => {
    const price = await stripe.prices.retrieve(priceId);
    assert(price.livemode === false, `${name} is not a test price`);
    assert(price.active, `${name} is inactive`);
    assert(price.unit_amount === amount, `${name} amount mismatch`);
    assert((price.recurring?.interval ?? null) === interval, `${name} interval mismatch`);
    return name;
  }));

  await pool.query(
    'insert into "user" (id, email, name, plan, credits_balance, bonus_credits, credits_per_month, auto_renew) values ($1,$2,$3,$4,$5,$6,$7,$8)',
    [id, email, "Stripe E2E Test", "free", 50, 0, 0, false],
  );

  customer = await stripe.customers.create({ email, metadata: { test_run: id } });
  const paymentMethod = await stripe.paymentMethods.attach("pm_card_visa", { customer: customer.id });
  await stripe.customers.update(customer.id, {
    invoice_settings: { default_payment_method: paymentMethod.id },
  });
  subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: process.env.STRIPE_CREATOR_MONTHLY_PRICE_ID }],
    default_payment_method: paymentMethod.id,
    metadata: { userId: id, plan: "creator", billing: "monthly", credits: "1000" },
    payment_behavior: "error_if_incomplete",
  });
  assert(["active", "trialing"].includes(subscription.status), `Subscription status is ${subscription.status}`);

  const checkoutEvent = {
    id: eventIds.checkout,
    object: "event",
    api_version: "2024-06-20",
    created: Math.floor(Date.now() / 1000),
    data: { object: {
      id: `cs_${id}`,
      object: "checkout.session",
      customer: customer.id,
      subscription: subscription.id,
      mode: "subscription",
      payment_status: "paid",
      metadata: { userId: id, plan: "creator", billing: "monthly" },
    } },
    livemode: false,
    pending_webhooks: 1,
    request: null,
    type: "checkout.session.completed",
  };
  await sendEvent(checkoutEvent);
  let state = await accountState();
  assert(state.plan === "creator", "Creator plan was not activated");
  assert(state.credits_balance === 1000 && state.credits_per_month === 1000, "Creator credits were not granted");

  await sendEvent(checkoutEvent);
  state = await accountState();
  assert(state.credits_balance === 1000, "Repeated subscription webhook changed credits");

  const cancelEvent = {
    ...checkoutEvent,
    id: eventIds.cancel,
    data: { object: { ...subscription, status: "canceled" } },
    type: "customer.subscription.deleted",
  };
  await sendEvent(cancelEvent);
  state = await accountState();
  assert(state.plan === "free", "Cancellation did not return the account to free");
  assert(state.credits_balance === 0, "Cancellation kept monthly plan credits");
  assert(state.bonus_credits === 0, "Cancellation changed the dormant bonus credit field");

  console.log(JSON.stringify({
    ok: true,
    livemode: false,
    pricesValidated: prices,
    subscriptionActivated: true,
    monthlyCreditsGranted: 1000,
    duplicateWebhookPrevented: true,
  }, null, 2));
} finally {
  if (subscription?.id) {
    await stripe.subscriptions.cancel(subscription.id).catch(() => undefined);
  }
  if (customer?.id) {
    await stripe.customers.del(customer.id).catch(() => undefined);
  }
  await pool.query('delete from "stripe_event" where id = any($1)', [Object.values(eventIds)]).catch(() => undefined);
  await pool.query('delete from "user" where id = $1', [id]).catch(() => undefined);
  await pool.end();
}
