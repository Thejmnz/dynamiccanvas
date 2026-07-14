"use client";

import { useState } from "react";
import { BadgeCheck, Loader2 } from "lucide-react";

import { useCheckout } from "@/features/subscriptions/api/use-checkout";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const PLANS = [
  {
    slug: "creator" as const,
    name: "Creator",
    popular: false,
    monthly: 29,
    annualMonthly: 23,
    annualTotal: 276,
    features: {
      en: ["1,000 renders / month", "JPG, PNG or WebP", "Up to 15 templates", "2 team members", "Folders & tags", "Custom + Google fonts", "API access", "Email + chat support"],
      es: ["1.000 renders por mes", "JPG, PNG o WebP", "Hasta 15 plantillas", "2 miembros de equipo", "Carpetas y etiquetas", "Fuentes propias y de Google", "Acceso a la API", "Soporte por email y chat"],
    },
  },
  {
    slug: "agency" as const,
    name: "Agency",
    popular: true,
    monthly: 79,
    annualMonthly: 63,
    annualTotal: 756,
    features: {
      en: ["5,000 renders / month", "Everything in Creator", "Up to 100 templates", "5 team members", "Folders to organize templates", "Higher API limits", "Embedded editor", "Priority email + chat support"],
      es: ["5.000 renders por mes", "Todo lo incluido en Creator", "Hasta 100 plantillas", "5 miembros de equipo", "Carpetas para organizar plantillas", "Límites de API superiores", "Editor integrado", "Soporte prioritario por email y chat"],
    },
  },
  {
    slug: "business" as const,
    name: "Business",
    popular: false,
    monthly: 179,
    annualMonthly: 143,
    annualTotal: 1716,
    features: {
      en: ["25,000 renders / month", "Everything in Agency", "Unlimited templates", "20 team members", "Folders to organize templates", "Advanced API access", "Custom integrations", "Dedicated email + chat support"],
      es: ["25.000 renders por mes", "Todo lo incluido en Agency", "Plantillas ilimitadas", "20 miembros de equipo", "Carpetas para organizar plantillas", "Acceso avanzado a la API", "Integraciones personalizadas", "Soporte dedicado por email y chat"],
    },
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const checkout = useCheckout();
  const { language } = useLanguage();
  const isSpanish = language === "es";
  const copy = isSpanish
    ? {
        title: "Planes y precios",
        subtitle: "Mejora tu plan para obtener más renders, plantillas y funciones.",
        monthly: "Mensual",
        annual: "Anual",
        save: "Ahorra 20%",
        popular: "Popular",
        perMonth: "/mes",
        billedAnnually: "facturados anualmente",
        choose: "Elegir plan",
      }
    : {
        title: "Plans & pricing",
        subtitle: "Upgrade to unlock more renders, templates and features.",
        monthly: "Monthly",
        annual: "Annual",
        save: "Save 20%",
        popular: "Popular",
        perMonth: "/mo",
        billedAnnually: "billed annually",
        choose: "Choose plan",
      };

  const handleCheckout = (slug: "creator" | "agency" | "business") => {
    checkout.mutate({ plan: slug, billing: yearly ? "yearly" : "monthly" });
  };

  return (
    <div>
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-[#101426]/55">{copy.subtitle}</p>
      </div>

      <div className="mx-auto mt-6 flex w-fit items-center rounded-xl border border-[#101426]/10 bg-white p-1 shadow-sm">
        <button
          onClick={() => setYearly(false)}
          className={`rounded-lg px-5 py-2 text-sm font-black transition ${!yearly ? "bg-[#5b35d5] text-white" : "text-[#596174] hover:bg-[#f6f5fb] hover:text-[#101426]"}`}
        >
          {copy.monthly}
        </button>
        <button
          onClick={() => setYearly(true)}
          className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-black transition ${yearly ? "bg-[#5b35d5] text-white" : "text-[#596174] hover:bg-[#f6f5fb] hover:text-[#101426]"}`}
        >
          {copy.annual}
          <span className={`rounded-full px-2 py-0.5 text-[9px] ${yearly ? "bg-white/15 text-white" : "bg-[#eeeaff] text-[#5b35d5]"}`}>
            {copy.save}
          </span>
        </button>
      </div>

      <div className="mx-auto mt-8 grid max-w-4xl items-stretch gap-5 md:grid-cols-3">
        {PLANS.map((plan) => {
          const featured = plan.slug === "agency";
          return (
            <article
              key={plan.slug}
              className={`relative flex flex-col rounded-[22px] border border-[#101426]/10 p-6 shadow-[0_14px_38px_rgba(16,20,38,.055)] ${featured ? "bg-[#5b35d5] text-white" : "bg-white"}`}
            >
              {plan.popular && (
                <span className={`w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${featured ? "bg-white/15 text-white" : "bg-[#eeeaff] text-[#5b35d5]"}`}>
                  {copy.popular}
                </span>
              )}
              <h3 className="mt-4 text-2xl font-black">{plan.name}</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="pb-1 text-lg font-black">$</span>
                <strong className="text-4xl font-black tracking-tight">
                  {yearly ? plan.annualMonthly : plan.monthly}
                </strong>
                <span className={`pb-1 text-xs ${featured ? "text-white/45" : "text-[#101426]/45"}`}>{copy.perMonth}</span>
              </div>
              {yearly && (
                <p className={`mt-1 text-[11px] font-semibold ${featured ? "text-white/45" : "text-[#101426]/45"}`}>
                  USD {plan.annualTotal.toLocaleString(isSpanish ? "es-CO" : "en-US")} {copy.billedAnnually}
                </p>
              )}
              <div className={`my-4 border-t ${featured ? "border-white/15" : "border-[#101426]/10"}`} />
              <ul className="flex-1 space-y-2.5">
                {plan.features[isSpanish ? "es" : "en"].map((f) => (
                  <li key={f} className="flex gap-2 text-[13px] font-semibold leading-snug">
                    <BadgeCheck className={`size-4 shrink-0 ${featured ? "text-white" : "text-[#5b35d5]"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(plan.slug)}
                disabled={checkout.isPending}
                className={`mt-5 flex h-11 items-center justify-center rounded-xl font-black transition ${featured ? "bg-white text-[#5b35d5] hover:bg-[#eeeaff]" : "bg-[#5b35d5] text-white hover:bg-[#4f2bc5]"}`}
              >
                {checkout.isPending ? <Loader2 className="size-4 animate-spin" /> : copy.choose}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
