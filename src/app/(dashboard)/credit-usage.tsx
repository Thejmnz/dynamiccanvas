"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

interface CreditData {
  plan: string;
  creditsBalance: number;
  totalCredits: number;
  usedCredits: number;
  templateCount: number;
  templateLimit: number;
}

export const CreditUsage = () => {
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

  const percent = data.totalCredits > 0
    ? Math.round((data.usedCredits / data.totalCredits) * 100)
    : 100;
  const isFree = data.plan === "free";
  const barColor = percent >= 90 ? "bg-[#ff6b57]" : percent >= 70 ? "bg-[#ffd166]" : "bg-[#c9ff5a]";

  return (
    <div className="mx-3 mb-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-white/40">Credit usage</span>
        <span className="text-[10px] font-black uppercase rounded-full bg-white/10 px-2 py-0.5 text-white/60">
          {data.plan}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-black text-white">{data.usedCredits}</span>
        <span className="text-sm font-semibold text-white/40">of {data.totalCredits === Infinity ? "∞" : data.totalCredits}</span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-white/35">
        <span>{percent}% used</span>
        <span>{data.creditsBalance} left</span>
      </div>

      {isFree && (
        <>
          <p className="mt-3 text-[11px] leading-snug text-white/50">
            Upgrade now to unlock more templates, folders, tags, custom fonts and more credits.
          </p>
          <button
            onClick={() => router.push("/dashboard/pricing")}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#c9ff5a] px-3 py-2 text-xs font-black text-[#101426] transition hover:bg-white"
          >
            <Sparkles className="size-3.5" />
            See pricing
          </button>
        </>
      )}
    </div>
  );
};
