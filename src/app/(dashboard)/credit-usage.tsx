"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Infinity as InfinityIcon, Crown, Rocket, Star, Zap } from "lucide-react";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useUserCredits } from "@/hooks/use-user-credits";

const PLAN_INFO: Record<string, { label: string; labelEs: string; icon: any; gradient: string; badge: string; accent: string }> = {
  free: { label: "Free", labelEs: "Free", icon: Zap, gradient: "from-[#f7f7fb] to-white", badge: "bg-[#eef0f6] text-[#596174]", accent: "text-[#596174]" },
  creator: { label: "Creator", labelEs: "Creator", icon: Star, gradient: "from-blue-50 to-white", badge: "bg-blue-100 text-blue-700", accent: "text-blue-600" },
  agency: { label: "Agency", labelEs: "Agency", icon: Rocket, gradient: "from-[#f1edff] to-white", badge: "bg-[#e9e5ff] text-[#5b35d5]", accent: "text-[#5b35d5]" },
  business: { label: "Business", labelEs: "Business", icon: Crown, gradient: "from-amber-50 to-white", badge: "bg-amber-100 text-amber-700", accent: "text-amber-600" },
  unlimited: { label: "Unlimited", labelEs: "Ilimitado", icon: InfinityIcon, gradient: "from-[#f0edff] to-white", badge: "bg-[#e9e5ff] text-[#5b35d5]", accent: "text-[#5b35d5]" },
};

export const CreditUsage = () => {
  const { language } = useLanguage();
  const { data, isPending: loading } = useUserCredits();
  const router = useRouter();

  const c = language === "es" ? {
    title: "Uso de créditos", of: "de", used: "usado", left: "restantes",
    upgrade: "Mejora ahora para desbloquear más plantillas, carpetas, etiquetas, fuentes personalizadas y más créditos.",
    seePricing: "Ver precios",
    unlimitedDesc: "Sin límites. Crea sin restricciones.",
    templates: "plantillas", unlimitedTemplates: "Plantillas ilimitadas", managePlan: "Gestionar plan",
  } : {
    title: "Credit usage", of: "of", used: "used", left: "left",
    upgrade: "Upgrade now to unlock more templates, folders, tags, custom fonts and more credits.",
    seePricing: "See pricing",
    unlimitedDesc: "No limits. Create without restrictions.",
    templates: "templates", unlimitedTemplates: "Unlimited templates", managePlan: "Manage plan",
  };

  if (loading) {
    return (
      <div className="mx-4 mb-4 animate-pulse rounded-2xl border border-[#5b35d5]/10 bg-[#f5f3ff] p-4">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 rounded bg-[#5b35d5]/10" />
          <div className="h-4 w-12 rounded-full bg-[#5b35d5]/10" />
        </div>
        <div className="mt-3 h-6 w-28 rounded bg-[#5b35d5]/10" />
        <div className="mt-2 h-2 w-full rounded-full bg-[#5b35d5]/10" />
        <div className="mt-2 h-3 w-full rounded bg-[#5b35d5]/10" />
      </div>
    );
  }

  if (!data) return null;

  const planKey = data.plan || "free";
  const info = PLAN_INFO[planKey] || PLAN_INFO.free;
  const PlanIcon = info.icon;
  const planLabel = language === "es" ? info.labelEs : info.label;
  const isUnlimited = planKey === "unlimited" || data.creditsPerMonth >= 999999999;
  const isFree = planKey === "free";

  if (isUnlimited) {
    return (
      <div data-onboarding="credits" className={`mx-4 mb-4 rounded-2xl border border-[#5b35d5]/15 bg-gradient-to-br ${info.gradient} p-4 shadow-[0_12px_32px_rgba(91,53,213,.07)]`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#5b35d5]">{language === "es" ? "Plan" : "Plan"}</span>
          <span className={`flex items-center gap-1 text-[10px] font-black uppercase rounded-full px-2.5 py-0.5 ${info.badge}`}>
            <PlanIcon className="size-3" />
            {planLabel}
          </span>
        </div>
        <div className="mt-3">
          <div className="text-xl font-black text-[#101426]">
            {language === "es" ? "Sin límites" : "No limits"}
          </div>
          <div className="whitespace-nowrap text-[11px] text-[#101426]/45">{c.unlimitedDesc}</div>
        </div>
        <div className="mt-3 whitespace-nowrap text-[11px] text-[#101426]/40">
          {data.templateCount} {c.templates} · {c.unlimitedTemplates}
        </div>
        <button
          onClick={() => router.push("/dashboard/settings")}
          className="mt-3 flex h-9 w-full items-center justify-center rounded-xl border border-[#5b35d5]/20 bg-white/70 text-[11px] font-black text-[#5b35d5] transition hover:border-[#5b35d5] hover:bg-white"
        >
          {c.managePlan}
        </button>
      </div>
    );
  }

  const percent = data.totalCredits > 0
    ? Math.round((data.usedCredits / data.totalCredits) * 100)
    : 100;
  const barColor = percent >= 90 ? "bg-[#ff6b57]" : percent >= 70 ? "bg-[#ffd166]" : "bg-[#c9ff5a]";

  return (
    <div data-onboarding="credits" className={`mx-4 mb-4 rounded-2xl border border-[#5b35d5]/15 bg-gradient-to-br ${info.gradient} p-4 shadow-[0_12px_32px_rgba(91,53,213,.07)]`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#5b35d5]">{c.title}</span>
        <span className={`flex items-center gap-1 text-[10px] font-black uppercase rounded-full px-2.5 py-0.5 ${info.badge}`}>
          <PlanIcon className="size-3" />
          {planLabel}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-black text-[#101426]">{data.usedCredits.toLocaleString()}</span>
        <span className="text-sm font-semibold text-[#101426]/40">{c.of} {data.totalCredits === Infinity ? "∞" : data.totalCredits.toLocaleString()}</span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#5b35d5]/10">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-[#101426]/40">
        <span>{percent}% {c.used}</span>
        <span>{data.creditsBalance.toLocaleString()} {c.left}</span>
      </div>

      {isFree && (
        <>
          <p className="mt-3 text-[11px] leading-snug text-[#101426]/50">{c.upgrade}</p>
          <button
            onClick={() => router.push("/dashboard/pricing")}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#5b35d5] px-3 py-2 text-xs font-black text-white transition hover:bg-[#101426]"
          >
            <Sparkles className="size-3.5" />
            {c.seePricing}
          </button>
        </>
      )}
    </div>
  );
};
