"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive, ArrowLeft, ArrowUp, Bell, CheckCircle2, FastForward, GitBranch,
  LayoutList, Map, MessageCircle, Search, Tag, Zap,
} from "lucide-react";
import { toast } from "sonner";

import { BrandLoading } from "@/components/brand-loading";
import { useLanguage } from "@/lib/contexts/LanguageContext";

type RoadmapPost = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "open" | "planned" | "in_progress" | "completed" | "declined";
  moderationStatus: "pending" | "approved" | "rejected";
  score: number;
  upvotes: number;
  currentUserVote: number;
  comments: Array<{ id: string }>;
};

type FeedbackResponse = { data: RoadmapPost[] };

const COLUMN_CONFIG = [
  { status: "open", color: "#596174", bg: "#f3f4f8", border: "#dfe1e8" },
  { status: "planned", color: "#7a3fe0", bg: "#f3edff", border: "#e4d7ff" },
  { status: "in_progress", color: "#2874d0", bg: "#ebf4ff", border: "#cfe4ff" },
  { status: "completed", color: "#16855a", bg: "#e9f9f1", border: "#c9f0dc" },
] as const;

export default function RoadmapPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const es = language === "es";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, isPending, refetch } = useQuery<FeedbackResponse>({
    queryKey: ["feedback-board"],
    queryFn: async () => {
      const response = await fetch("/api/feedback", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load roadmap");
      return response.json();
    },
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });

  const copy = es ? {
    title: "Hoja de ruta",
    subtitle: "Descubre qué estamos construyendo. Vota por las funciones que más te interesan y ayúdanos a definir el futuro de Dynamic Canvas.",
    search: "Buscar en la hoja de ruta...",
    all: "Todas las categorías",
    backlog: "Pendientes",
    next: "Próximamente",
    progress: "En progreso",
    done: "Completado",
    empty: "No hay ideas en esta etapa.",
    feedback: "Feedback",
    back: "Volver al sitio",
  } : {
    title: "Roadmap",
    subtitle: "See what we’re building next. Vote for the features you care about and help shape the future of Dynamic Canvas.",
    search: "Search the roadmap...",
    all: "All categories",
    backlog: "Backlog",
    next: "Next up",
    progress: "In progress",
    done: "Done",
    empty: "No ideas in this stage yet.",
    feedback: "Feedback",
    back: "Back to site",
  };

  const categoryLabels: Record<string, string> = es ? {
    feature: "Función", editor: "Editor", api: "API", integration: "Integración", billing: "Planes", other: "Otro",
  } : {
    feature: "Feature", editor: "Editor", api: "API", integration: "Integration", billing: "Billing", other: "Other",
  };
  const columnLabels: Record<string, string> = {
    open: copy.backlog,
    planned: copy.next,
    in_progress: copy.progress,
    completed: copy.done,
  };

  const posts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data?.data || [])
      .filter((post) => post.moderationStatus === "approved" && post.status !== "declined")
      .filter((post) => category === "all" || post.category === category)
      .filter((post) => !query || `${post.title} ${post.description}`.toLowerCase().includes(query));
  }, [category, data?.data, search]);

  const vote = async (post: RoadmapPost) => {
    setBusyId(post.id);
    try {
      const response = await fetch(`/api/feedback/${post.id}/vote`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: post.currentUserVote === 1 ? 0 : 1 }),
      });
      if (!response.ok) throw new Error("Could not save vote");
      await refetch();
    } catch {
      toast.error(es ? "No se pudo guardar tu voto" : "Could not save your vote");
    } finally {
      setBusyId(null);
    }
  };

  if (isPending) return <BrandLoading fullScreen label="" />;

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#101426]">
      <header className="sticky top-0 z-40 border-b border-[#101426]/8 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1540px] items-center justify-between px-5 sm:px-8">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <Image src="/dynamic-canvas-logo.png" alt="Dynamic Canvas" width={178} height={66} className="h-11 w-auto object-contain" priority />
          </Link>
          <div className="flex items-center gap-2">
            <button aria-label={es ? "Notificaciones" : "Notifications"} className="flex size-10 items-center justify-center rounded-xl border border-[#101426]/10 bg-white text-[#596174] transition hover:border-[#5b35d5]/25 hover:text-[#5b35d5]"><Bell className="size-4" /></button>
            <Link href="/dashboard" className="flex h-10 items-center gap-2 rounded-xl bg-[#101426] px-4 text-xs font-black text-white transition hover:bg-[#5b35d5]"><ArrowLeft className="size-3.5" /><span className="hidden sm:inline">{es ? "Volver al dashboard" : "Back to dashboard"}</span></Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1540px] items-center overflow-x-auto px-5 sm:px-8">
          <Link href="/dashboard" className="flex h-14 shrink-0 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-black text-[#596174] transition hover:text-[#5b35d5]"><ArrowLeft className="size-4" />{copy.back}</Link>
          <Link href="/feedback" className="flex h-14 shrink-0 items-center gap-2 border-b-2 border-transparent px-5 text-sm font-black text-[#596174] transition hover:bg-[#fafafe] hover:text-[#5b35d5]"><LayoutList className="size-4" />{copy.feedback}</Link>
          <span className="flex h-14 shrink-0 items-center gap-2 border-b-2 border-[#5b35d5] bg-[#f5f2ff] px-5 text-sm font-black text-[#5b35d5]"><Map className="size-4" />Roadmap</span>
          <Link href="/changelog" className="flex h-14 shrink-0 items-center gap-2 border-b-2 border-transparent px-5 text-sm font-black text-[#596174] transition hover:bg-[#fafafe] hover:text-[#5b35d5]"><GitBranch className="size-4" />Changelog</Link>
        </nav>
      </header>

      <main className="mx-auto max-w-[1540px] px-4 pb-12 pt-8 sm:px-8 sm:pt-12">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-black tracking-[-.04em] sm:text-5xl">{copy.title}</h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-[#101426]/55">{copy.subtitle}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[280px_190px]">
            <label className="relative"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#101426]/30" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={copy.search} className="h-11 w-full rounded-xl border border-[#101426]/10 bg-white pl-10 pr-3 text-xs font-semibold shadow-sm outline-none focus:border-[#5b35d5]/35 focus:ring-4 focus:ring-[#5b35d5]/8" /></label>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-xl border border-[#101426]/10 bg-white px-3 text-xs font-black text-[#596174] shadow-sm outline-none focus:border-[#5b35d5]/35"><option value="all">{copy.all}</option>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          </div>
        </div>

        <div className="mt-9 overflow-x-auto pb-4">
          <div className="grid min-w-[1180px] grid-cols-4 gap-4">
            {COLUMN_CONFIG.map((column) => {
              const columnPosts = posts.filter((post) => post.status === column.status).sort((a, b) => b.score - a.score);
              return (
                <section key={column.status} className="min-h-[560px] rounded-[22px] border border-[#101426]/7 bg-[#f1f3f8] p-3.5">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <span className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black" style={{ color: column.color, backgroundColor: column.bg, borderColor: column.border }}>
                      {column.status === "open" ? <Archive className="size-3.5" /> : column.status === "planned" ? <FastForward className="size-3.5" /> : column.status === "in_progress" ? <Zap className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                      {columnLabels[column.status]}
                    </span>
                    <span className="flex size-7 items-center justify-center rounded-full bg-white text-[11px] font-black text-[#596174] shadow-sm">{columnPosts.length}</span>
                  </div>

                  <div className="space-y-3">
                    {columnPosts.map((post) => (
                      <article key={post.id} onClick={() => router.push(`/feedback?post=${post.id}`)} className="cursor-pointer rounded-2xl border border-[#101426]/9 bg-white p-4 shadow-[0_5px_18px_rgba(16,20,38,.035)] transition hover:-translate-y-0.5 hover:border-[#5b35d5]/30 hover:shadow-[0_12px_28px_rgba(91,53,213,.10)]">
                        <h2 className="line-clamp-3 text-[15px] font-black leading-snug tracking-[-.015em] text-[#343a50]">{post.title}</h2>
                        <div className="mt-4 flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-1.5 rounded-full border border-[#101426]/8 bg-[#fafafe] px-2.5 py-1.5 text-[10px] font-black text-[#596174]"><Tag className="size-3 shrink-0 text-[#5b35d5]" /><span className="truncate">{categoryLabels[post.category] || post.category}</span></span>
                          <div className="flex items-center gap-1.5">
                            {post.comments.length > 0 && <span className="flex items-center gap-1 text-[10px] font-black text-[#101426]/35"><MessageCircle className="size-3" />{post.comments.length}</span>}
                            <button disabled={busyId === post.id} onClick={(event) => { event.stopPropagation(); void vote(post); }} className={`flex h-8 min-w-12 items-center justify-center gap-1 rounded-lg border px-2 text-[11px] font-black transition ${post.currentUserVote === 1 ? "border-[#5b35d5] bg-[#5b35d5] text-white" : "border-[#101426]/9 bg-white text-[#596174] hover:border-[#5b35d5]/30 hover:text-[#5b35d5]"}`}><ArrowUp className="size-3.5" />{post.score}</button>
                          </div>
                        </div>
                      </article>
                    ))}
                    {columnPosts.length === 0 && <div className="rounded-2xl border border-dashed border-[#101426]/10 bg-white/55 px-4 py-10 text-center text-xs font-bold text-[#101426]/30">{copy.empty}</div>}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
