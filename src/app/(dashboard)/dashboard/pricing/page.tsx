"use client";

import { useState } from "react";
import { BadgeCheck, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useCheckout } from "@/features/subscriptions/api/use-checkout";

const CREDIT_PACKS = [
  { pack: "1000" as const, credits: "1,000", price: 15 },
  { pack: "5000" as const, credits: "5,000", price: 59 },
  { pack: "10000" as const, credits: "10,000", price: 99 },
  { pack: "25000" as const, credits: "25,000", price: 199 },
];

const PLANS = [
  {
    slug: "creator" as const,
    name: "Starter",
    badge: "",
    monthly: 29,
    annualMonthly: 23,
    annualTotal: 276,
    features: [
      "1,000 renders / month",
      "JPG, PNG or WebP",
      "Up to 15 templates",
      "2 team members",
      "Folders & tags",
      "Custom + Google fonts",
      "API access",
      "Email + chat support",
    ],
  },
  {
    slug: "agency" as const,
    name: "Scale",
    badge: "Popular",
    monthly: 79,
    annualMonthly: 63,
    annualTotal: 756,
    features: [
      "5,000 renders / month",
      "Everything in Starter",
      "Up to 100 templates",
      "5 team members",
      "Higher API limits",
      "Embedded editor",
      "Priority support",
    ],
  },
  {
    slug: "business" as const,
    name: "Enterprise",
    badge: "",
    monthly: 179,
    annualMonthly: 143,
    annualTotal: 1716,
    features: [
      "25,000 renders / month",
      "Everything in Scale",
      "Unlimited templates",
      "20 team members",
      "Advanced API access",
      "Custom integrations",
      "Dedicated support",
    ],
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const checkout = useCheckout();
  const [buyingPack, setBuyingPack] = useState<string | null>(null);

  const handleCheckout = (slug: "creator" | "agency" | "business") => {
    checkout.mutate({ plan: slug, billing: yearly ? "yearly" : "monthly" });
  };

  const handleBuyCredits = async (pack: "1000" | "5000" | "10000" | "25000") => {
    setBuyingPack(pack);
    try {
      const res = await fetch("/api/subscriptions/credits-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack }),
      });
      const data = await res.json();
      if (data.data) window.location.href = data.data;
    } catch {
      toast.error("Failed to start checkout");
    } finally {
      setBuyingPack(null);
    }
  };

  return (
    <div>
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-tight">Pricing</h1>
        <p className="mt-2 text-sm text-[#101426]/55">Upgrade to unlock more renders, templates and features.</p>
      </div>

      <div className="mx-auto mt-6 flex w-fit items-center rounded-full border-2 border-[#101426] bg-white p-1 shadow-[4px_4px_0_#101426]">
        <button
          onClick={() => setYearly(false)}
          className={`rounded-full px-5 py-2 text-sm font-black transition ${!yearly ? "bg-[#101426] text-white" : "text-[#101426]/55"}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setYearly(true)}
          className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black transition ${yearly ? "bg-[#5b35d5] text-white" : "text-[#101426]/55"}`}
        >
          Annual
          <span className={`rounded-full px-2 py-0.5 text-[9px] ${yearly ? "bg-[#c9ff5a] text-[#101426]" : "bg-[#e9e5ff] text-[#5b35d5]"}`}>
            Save 20%
          </span>
        </button>
      </div>

      <div className="mx-auto mt-8 grid max-w-4xl items-stretch gap-5 md:grid-cols-3">
        {PLANS.map((plan) => {
          const featured = plan.slug === "agency";
          return (
            <article
              key={plan.slug}
              className={`relative flex flex-col rounded-[22px] border-2 border-[#101426] p-6 ${featured ? "bg-[#101426] text-white shadow-[7px_7px_0_#c9ff5a]" : "bg-white"}`}
            >
              {plan.badge && (
                <span className={`w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${featured ? "bg-[#c9ff5a] text-[#101426]" : "bg-[#e9e5ff] text-[#5b35d5]"}`}>
                  {plan.badge}
                </span>
              )}
              <h3 className="mt-4 text-2xl font-black">{plan.name}</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="pb-1 text-lg font-black">$</span>
                <strong className="text-4xl font-black tracking-tight">
                  {yearly ? plan.annualMonthly : plan.monthly}
                </strong>
                <span className={`pb-1 text-xs ${featured ? "text-white/45" : "text-[#101426]/45"}`}>/mo</span>
              </div>
              {yearly && (
                <p className={`mt-1 text-[11px] font-semibold ${featured ? "text-white/45" : "text-[#101426]/45"}`}>
                  USD {plan.annualTotal.toLocaleString()} billed annually
                </p>
              )}
              <div className={`my-4 border-t ${featured ? "border-white/15" : "border-[#101426]/10"}`} />
              <ul className="flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-[13px] font-semibold leading-snug">
                    <BadgeCheck className={`size-4 shrink-0 ${featured ? "text-[#c9ff5a]" : "text-[#5b35d5]"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(plan.slug)}
                disabled={checkout.isPending}
                className={`mt-5 flex h-11 items-center justify-center rounded-full font-black transition ${featured ? "bg-[#c9ff5a] text-[#101426] hover:bg-white" : "bg-[#101426] text-white hover:bg-[#5b35d5]"}`}
              >
                {checkout.isPending ? <Loader2 className="size-4 animate-spin" /> : "Choose pricing"}
              </button>
            </article>
          );
        })}
      </div>

      <div className="mx-auto mt-12 max-w-4xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#c9ff5a] px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#101426]">
            <Sparkles className="size-3.5" />
            Credit Packs
          </div>
          <p className="mt-3 text-sm text-[#101426]/55">Need more renders? Top up your credits anytime.</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CREDIT_PACKS.map((cp) => (
            <div key={cp.pack} className="flex flex-col rounded-[18px] border-2 border-[#101426] bg-white p-5 text-center transition hover:-translate-y-1 hover:shadow-[5px_5px_0_#101426]">
              <div className="text-3xl font-black">{cp.credits}</div>
              <div className="text-xs font-bold text-[#101426]/50">credits</div>
              <div className="mt-3 text-2xl font-black text-[#5b35d5]">${cp.price}</div>
              <button
                onClick={() => handleBuyCredits(cp.pack)}
                disabled={buyingPack !== null}
                className="mt-4 flex h-10 items-center justify-center rounded-full bg-[#101426] text-xs font-black text-white transition hover:bg-[#5b35d5] disabled:opacity-50"
              >
                {buyingPack === cp.pack ? <Loader2 className="size-4 animate-spin" /> : "Buy now"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
