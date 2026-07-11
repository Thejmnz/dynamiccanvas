import "dotenv/config";
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key?.startsWith("rk_test_") && !key?.startsWith("sk_test_")) {
  throw new Error("A Stripe Test Mode secret or restricted key is required.");
}

const stripe = new Stripe(key, { apiVersion: "2024-06-20" });
const catalogVersion = "dynamic_canvas_v1";

const plans = [
  { slug: "creator", name: "Dynamic Canvas — Starter", credits: 1000, monthly: 2900, yearly: 27600 },
  { slug: "agency", name: "Dynamic Canvas — Scale", credits: 5000, monthly: 7900, yearly: 75600 },
  { slug: "business", name: "Dynamic Canvas — Enterprise", credits: 25000, monthly: 17900, yearly: 171600 },
];

const existingProducts = {
  data: await stripe.products.list({ active: true, limit: 100 }).autoPagingToArray({ limit: 1000 }),
};

async function ensureProduct({ slug, name, description, metadata }) {
  const found = existingProducts.data.find(
    (product) => product.metadata?.catalog_version === catalogVersion && product.metadata?.catalog_slug === slug,
  );
  if (found) {
    if (found.name !== name || found.description !== description) {
      return stripe.products.update(found.id, { name, description, metadata: { ...found.metadata, ...metadata } });
    }
    return found;
  }

  const created = await stripe.products.create({
    name,
    description,
    metadata: {
      catalog_version: catalogVersion,
      catalog_slug: slug,
      ...metadata,
    },
  });
  existingProducts.data.push(created);
  return created;
}

async function ensurePrice({ product, lookupKey, amount, nickname, recurring, metadata }) {
  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
  const found = prices.data.find((price) => price.lookup_key === lookupKey);
  if (found) {
    if (found.unit_amount !== amount || found.currency !== "usd") {
      throw new Error(`Existing price ${lookupKey} does not match the catalog amount.`);
    }
    return found;
  }

  return stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: amount,
    nickname,
    lookup_key: lookupKey,
    ...(recurring ? { recurring } : {}),
    metadata: {
      catalog_version: catalogVersion,
      ...metadata,
    },
  });
}

const result = { livemode: null, plans: {} };

for (const plan of plans) {
  const product = await ensureProduct({
    slug: plan.slug,
    name: plan.name,
    description: `${plan.credits.toLocaleString("en-US")} render credits per month.`,
    metadata: {
      kind: "subscription",
      plan: plan.slug,
      credits: String(plan.credits),
    },
  });
  const monthly = await ensurePrice({
    product,
    lookupKey: `dc_${plan.slug}_monthly_v1`,
    amount: plan.monthly,
    nickname: `${plan.name} — Monthly`,
    recurring: { interval: "month" },
    metadata: { kind: "subscription", plan: plan.slug, billing_period: "monthly", credits: String(plan.credits) },
  });
  const yearly = await ensurePrice({
    product,
    lookupKey: `dc_${plan.slug}_yearly_v1`,
    amount: plan.yearly,
    nickname: `${plan.name} — Annual`,
    recurring: { interval: "year" },
    metadata: { kind: "subscription", plan: plan.slug, billing_period: "yearly", credits: String(plan.credits) },
  });

  if (!product.default_price) {
    await stripe.products.update(product.id, { default_price: monthly.id });
  }
  result.livemode ??= product.livemode;
  result.plans[plan.slug] = { productId: product.id, monthlyPriceId: monthly.id, yearlyPriceId: yearly.id };
}

console.log(JSON.stringify(result, null, 2));
