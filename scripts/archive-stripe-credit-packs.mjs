import "dotenv/config";
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key?.startsWith("rk_test_") && !key?.startsWith("sk_test_")) {
  throw new Error("A Stripe Test Mode secret or restricted key is required.");
}

const stripe = new Stripe(key, { apiVersion: "2024-06-20" });
const products = await stripe.products
  .list({ active: true, limit: 100 })
  .autoPagingToArray({ limit: 1000 });

const creditPackProducts = products.filter((product) => {
  const slug = product.metadata?.catalog_slug || "";
  return product.metadata?.kind === "credit_pack"
    || slug.startsWith("credits_")
    || /extra credits/i.test(product.name);
});

const archivedProducts = [];
const archivedPrices = [];

for (const product of creditPackProducts) {
  if (product.default_price) {
    await stripe.products.update(product.id, { default_price: "" });
  }

  const prices = await stripe.prices
    .list({ product: product.id, active: true, limit: 100 })
    .autoPagingToArray({ limit: 1000 });

  for (const price of prices) {
    await stripe.prices.update(price.id, { active: false });
    archivedPrices.push(price.id);
  }

  await stripe.products.update(product.id, { active: false });
  archivedProducts.push({ id: product.id, name: product.name });
}

console.log(JSON.stringify({
  livemode: false,
  archivedProducts,
  archivedPrices,
}, null, 2));
