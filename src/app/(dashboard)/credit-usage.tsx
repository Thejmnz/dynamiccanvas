"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Infinity as InfinityIcon } from "lucide-react";

import { useLanguage } from "@/lib/contexts/LanguageContext";

interface CreditData {
  plan: string;
  creditsBalance: number;
  creditsPerMonth: number;
  totalCredits: number;
  usedCredits: number;
  templateCount: number;
  templateLimit: number;
}

export const CreditUsage = () => {
  const { t, language } = useLanguage();
  const [data, setData] = useState<CreditData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/user-credits")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const c = language === "es" ? {
    title: "Uso de créditos",
    of: "de",
    used: "usado",
    left: "restantes",
    upgrade: "Mejora ahora para desbloquear más plantillas, carpetas, etiquetas, fuentes personalizadas y más créditos.",
    seePricing: "Ver precios",
  } : {
    title: "Credit usage",
    of: "of",
    used: "used",
    left: "left",
    upgrade: "Upgrade now to unlock more templates, folders, tags, custom fonts and more credits.",
    seePricing: "See pricing",
  };

  if (loading) {
    return (
      <div className="mx-3 mb-3 rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 rounded bg-white/10" />
          <div className="h-4 w-12 rounded-full bg-white/10" />
        </div>
        <div className="mt-3 h-6 w-28 rounded bg-white/10" />
        <div className="mt-2 h-2 w-full rounded-full bg-white/10" />
        <div className="mt-2 h-3 w-full rounded bg-white/10" />
      </div>
    );
  }

  if (!data) return null;

  const isUnlimited = data.plan === "unlimited" || data.creditsPerMonth >= 999999999;
  const isFree = data.plan === "free";

  if (isUnlimited) {
    return (
      <div className="mx-3 mb-3 rounded-2xl border-2 border-[#c9ff5a]/40 bg-gradient-to-br from-[#5b35d5]/20 to-[#c9ff5a]/10 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-white/40">
            {language === "es" ? "Plan" : "Plan"}
          </span>
          <span className="text-[10px] font-black uppercase rounded-full bg-[#c9ff5a] px-2.5 py-0.5 text-[#101426]">
            {language === "es" ? "Ilimitado" : "Unlimited"}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <InfinityIcon className="size-7 text-[#c9ff5a]" />
          <div>
            <div className="text-xl font-black text-white">
              {language === "es" ? "Créditos ilimitados" : "Unlimited credits"}
            </div>
            <div className="text-[11px] text-white/45">
              {language === "es" ? "Sin límites. Crea sin restricciones." : "No limits. Create without restrictions."}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-white/35">
          <span>{data.templateCount} {language === "es" ? "plantillas" : "templates"}</span>
          <span>·</span>
          <span>{language === "es" ? "Plantillas ilimitadas" : "Unlimited templates"}</span>
        </div>
      </div>
    );
  }

  const percent = data.totalCredits > 0
    ? Math.round((data.usedCredits / data.totalCredits) * 100)
    : 100;
  const barColor = percent >= 90 ? "bg-[#ff6b57]" : percent >= 70 ? "bg-[#ffd166]" : "bg-[#c9ff5a]";

  return (
    <div className="mx-3 mb-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-white/40">{c.title}</span>
        <span className="text-[10px] font-black uppercase rounded-full bg-white/10 px-2 py-0.5 text-white/60">
          {data.plan}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-black text-white">{data.usedCredits}</span>
        <span className="text-sm font-semibold text-white/40">{c.of} {data.totalCredits === Infinity ? "∞" : data.totalCredits}</span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-white/35">
        <span>{percent}% {c.used}</span>
        <span>{data.creditsBalance} {c.left}</span>
      </div>

      {isFree && (
        <>
          <p className="mt-3 text-[11px] leading-snug text-white/50">
            {c.upgrade}
          </p>
          <button
            onClick={() => router.push("/dashboard/pricing")}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#c9ff5a] px-3 py-2 text-xs font-black text-[#101426] transition hover:bg-white"
          >
            <Sparkles className="size-3.5" />
            {c.seePricing}
          </button>
        </>
      )}
    </div>
  );
};
