"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, ExternalLink, Images, Loader2 } from "lucide-react";

import { useLanguage } from "@/lib/contexts/LanguageContext";

type RenderRecord = {
  id: string;
  templateId: string | null;
  templateName: string | null;
  status: string;
  errorMessage: string | null;
  imageUrl: string | null;
  width: number | null;
  height: number | null;
  format: string | null;
  renderTimeMs: number | null;
  createdAt: string;
};

export default function RendersPage() {
  const { language } = useLanguage();
  const [items, setItems] = useState<RenderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/renders", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load renders");
        return response.json();
      })
      .then((result) => {
        if (!cancelled) setItems(result.data || []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => ({
    total: items.length,
    successful: items.filter((item) => item.status === "success").length,
    failed: items.filter((item) => item.status === "failed").length,
  }), [items]);

  const locale = language === "es" ? "es-CO" : "en-US";
  const copy = language === "es"
    ? {
        eyebrow: "Historial de generación",
        title: "Renders",
        description: "Tus últimas imágenes generadas mediante la API y Playground.",
        total: "Últimos renders",
        successful: "Completados",
        failed: "Fallidos",
        emptyTitle: "Aún no hay renders",
        emptyText: "Cuando generes una imagen mediante la API aparecerá aquí.",
        error: "No pudimos cargar el historial de renders.",
        open: "Abrir imagen",
        template: "Plantilla",
      }
    : {
        eyebrow: "Generation history",
        title: "Renders",
        description: "Your latest images generated through the API and Playground.",
        total: "Recent renders",
        successful: "Completed",
        failed: "Failed",
        emptyTitle: "No renders yet",
        emptyText: "Images generated through the API will appear here.",
        error: "We could not load your render history.",
        open: "Open image",
        template: "Template",
      };

  return (
    <div className="mx-auto max-w-screen-xl pb-10 pt-6">
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5b35d5]">{copy.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{copy.title}</h1>
        <p className="mt-2 text-sm font-medium text-[#101426]/50">{copy.description}</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          [copy.total, stats.total, Images, "bg-[#e9e5ff]"],
          [copy.successful, stats.successful, CheckCircle2, "bg-[#c9ff5a]"],
          [copy.failed, stats.failed, AlertCircle, "bg-[#ffb7aa]"],
        ].map(([label, value, Icon, color]) => {
          const StatIcon = Icon as typeof Images;
          return (
            <div key={String(label)} className={`rounded-[22px] border-2 border-[#101426] p-5 ${String(color)}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black">{String(label)}</span>
                <StatIcon className="size-5" />
              </div>
              <div className="mt-5 text-4xl font-black">{String(value)}</div>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="flex min-h-64 items-center justify-center rounded-[24px] border-2 border-dashed border-[#101426]/20 bg-white/70">
          <Loader2 className="size-7 animate-spin text-[#5b35d5]" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-[22px] border-2 border-[#101426] bg-[#ffb7aa] p-6 font-bold">{copy.error}</div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#101426]/25 bg-white/70 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#e9e5ff]"><Images className="size-6 text-[#5b35d5]" /></div>
          <h2 className="mt-5 text-xl font-black">{copy.emptyTitle}</h2>
          <p className="mt-2 text-sm text-[#101426]/50">{copy.emptyText}</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-[22px] border-2 border-[#101426] bg-white transition hover:-translate-y-1 hover:shadow-[6px_6px_0_#101426]">
              <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-[#101426] bg-[#e9e5ff]">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.templateName || "Render"} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center"><AlertCircle className="size-8 text-[#101426]/30" /></div>
                )}
                <span className={`absolute left-3 top-3 rounded-full border border-[#101426] px-2.5 py-1 text-[10px] font-black uppercase ${item.status === "success" ? "bg-[#c9ff5a]" : "bg-[#ffb7aa]"}`}>
                  {item.status}
                </span>
              </div>
              <div className="p-4">
                <h2 className="truncate font-black">{item.templateName || `${copy.template} ${item.templateId?.slice(0, 8) || "—"}`}</h2>
                <div className="mt-2 flex items-center gap-2 text-xs font-medium text-[#101426]/50">
                  <Clock3 className="size-3.5" />
                  {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-bold text-[#101426]/55">
                  <span>{item.width && item.height ? `${item.width} × ${item.height}` : "—"}</span>
                  <span>{item.renderTimeMs ? `${(item.renderTimeMs / 1000).toFixed(1)}s` : ""}</span>
                </div>
                {item.imageUrl && (
                  <a href={item.imageUrl} target="_blank" rel="noreferrer" className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl border-2 border-[#101426] bg-[#101426] text-xs font-black text-white transition hover:bg-[#5b35d5]">
                    {copy.open}<ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
