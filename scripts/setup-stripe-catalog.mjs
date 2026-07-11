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

const packs = [
  { slug: "credits_1000", name: "Dynamic Canvas — 1,000 extra credits", credits: 1000, amount: 1500 },
  { slug: "credits_5000", name: "Dynamic Canvas — 5,000 extra credits", credits: 5000, amount: 5900 },
  { slug: "credits_10000", name: "Dynamic Canvas — 10,000 extra credits", credits: 10000, amount: 9900 },
  { slug: "credits_25000", name: "Dynamic Canvas — 25,000 extra credits", credits: 25000, amount: 19900 },
];

const existingProducts = await stripe.products.list({ active: true, limit: 100 });

async function ensureProduct({ slug, name, description, metadata }) {
  const found = existingProducts.data.find(
    (product) => product.metadata?.catalog_version === catalogVersion && product.metadata?.catalog_slug === slug,
  );
  if (found) return found;

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

const result = { livemode: null, plans: {}, creditPacks: {} };

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

for (const pack of packs) {
  const product = await ensureProduct({
    slug: pack.slug,
    name: pack.name,
    description: `${pack.credits.toLocaleString("en-US")} additional render credits, one-time purchase.`,
    metadata: { kind: "credit_pack", credits: String(pack.credits) },
  });
  const price = await ensurePrice({
    product,
    lookupKey: `dc_${pack.slug}_v1`,
    amount: pack.amount,
    nickname: pack.name,
    metadata: { kind: "credit_pack", credits: String(pack.credits) },
  });

  if (!product.default_price) {
    await stripe.products.update(product.id, { default_price: price.id });
  }
  result.livemode ??= product.livemode;
  result.creditPacks[pack.slug] = { productId: product.id, priceId: price.id };
}

console.log(JSON.stringify(result, null, 2));
