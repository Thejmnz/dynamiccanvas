"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Activity, ArrowLeft, ArrowUp, Bell, BellOff, CalendarDays, CheckCircle2, Clock3,
  GitBranch, LayoutList, Lightbulb, Map, MessageCircle, Plus, Search, Send,
  ShieldCheck, Sparkles, Tag, ThumbsUp, Trash2, UserRound, XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { BrandLoading } from "@/components/brand-loading";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/contexts/LanguageContext";

type FeedbackComment = {
  id: string;
  parentCommentId: string | null;
  userId: string;
  body: string;
  isAdmin: boolean;
  createdAt: string;
  authorName: string | null;
  authorImage: string | null;
};

type FeedbackPost = {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  moderationStatus: "pending" | "approved" | "rejected";
  createdAt: string;
  authorName: string;
  authorImage: string | null;
  score: number;
  upvotes: number;
  currentUserVote: number;
  comments: FeedbackComment[];
  activities: FeedbackActivity[];
  isSubscribed: boolean;
};

type FeedbackActivity = {
  id: string;
  actorId: string;
  action: "created" | "status_changed" | "moderation_changed";
  fromValue: string | null;
  toValue: string | null;
  createdAt: string;
  actorName: string | null;
  actorImage: string | null;
};

type FeedbackResponse = {
  data: FeedbackPost[];
  currentUserId: string;
  isAdmin: boolean;
};

const STATUS_STYLES: Record<string, string> = {
  open: "bg-[#f1eff8] text-[#656979]",
  planned: "bg-[#eeeaff] text-[#5b35d5]",
  in_progress: "bg-[#fff4d8] text-[#9a6500]",
  completed: "bg-[#e8f8ef] text-[#177245]",
  declined: "bg-[#fff0ee] text-[#b84436]",
};

export default function FeedbackBoardPage() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const es = language === "es";
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("feature");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"top" | "new" | "discussed">("top");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(searchParams.get("post"));
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [replyTargets, setReplyTargets] = useState<Record<string, { id: string; name: string } | null>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [detailTab, setDetailTab] = useState<"comments" | "activity">("comments");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeedbackPost | null>(null);

  const { data, isPending, refetch } = useQuery<FeedbackResponse>({
    queryKey: ["feedback-board"],
    queryFn: async () => {
      const response = await fetch("/api/feedback", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load feedback");
      return response.json();
    },
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const postId = searchParams.get("post");
    if (postId) setExpandedId(postId);
  }, [searchParams]);

  useEffect(() => {
    setDetailTab("comments");
  }, [expandedId]);

  const copy = es ? {
    eyebrow: "Feedback de producto",
    title: "Construyamos Dynamic Canvas juntos.",
    subtitle: "Comparte ideas, vota las propuestas que más te importan y conversa directamente con nuestro equipo.",
    add: "Publicar una idea",
    search: "Buscar ideas...",
    top: "Más votadas",
    newest: "Nuevas",
    discussed: "Más comentadas",
    all: "Todos los estados",
    empty: "Todavía no hay ideas que coincidan con tu búsqueda.",
    comments: "Comentarios",
    activity: "Actividad",
    commentPlaceholder: "Añade algo útil a la conversación...",
    send: "Comentar",
    admin: "Equipo Dynamic Canvas",
    formTitle: "Comparte una idea",
    formText: "Cuéntanos el problema y cómo te gustaría resolverlo.",
    titleLabel: "Título",
    titlePlaceholder: "Ej. Exportar varias plantillas al mismo tiempo",
    descriptionLabel: "Descripción",
    descriptionPlaceholder: "Explica qué necesitas, en qué situación lo usarías y por qué sería útil.",
    category: "Categoría",
    publish: "Publicar idea",
    published: "Tu idea fue enviada y está pendiente de aprobación",
    awaitingApproval: "Esta idea está esperando la aprobación del equipo. Todavía no es visible para otras personas.",
    rejected: "Esta idea no fue aprobada y no es visible para otras personas.",
    approve: "Aprobar y publicar",
    reject: "Rechazar",
    approved: "Aprobada",
    rejectedAction: "Rechazada",
    approvedToast: "La idea fue aprobada y ya es pública",
    rejectedToast: "La idea fue rechazada y permanece oculta",
    subscribeTitle: "Seguir esta idea",
    subscribeText: "Recibe un correo cuando haya comentarios o cambios importantes.",
    subscribe: "Recibir notificaciones",
    unsubscribe: "Dejar de seguir",
  } : {
    eyebrow: "Product feedback",
    title: "Let’s build Dynamic Canvas together.",
    subtitle: "Share ideas, vote for what matters most, and talk directly with our team.",
    add: "Post an idea",
    search: "Search ideas...",
    top: "Top voted",
    newest: "Newest",
    discussed: "Most discussed",
    all: "All statuses",
    empty: "No ideas match your search yet.",
    comments: "Comments",
    activity: "Activity feed",
    commentPlaceholder: "Add something useful to the conversation...",
    send: "Comment",
    admin: "Dynamic Canvas team",
    formTitle: "Share an idea",
    formText: "Tell us about the problem and how you would like to solve it.",
    titleLabel: "Title",
    titlePlaceholder: "E.g. Export multiple templates at once",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Explain what you need, when you would use it, and why it would help.",
    category: "Category",
    publish: "Publish idea",
    published: "Your idea was submitted and is awaiting approval",
    awaitingApproval: "This idea is awaiting approval from the team. It is not visible to other people yet.",
    rejected: "This idea was not approved and is not visible to other people.",
    approve: "Approve and publish",
    reject: "Reject",
    approved: "Approved",
    rejectedAction: "Rejected",
    approvedToast: "The idea was approved and is now public",
    rejectedToast: "The idea was rejected and remains hidden",
    subscribeTitle: "Subscribe to this idea",
    subscribeText: "Get an email when there are comments or important changes.",
    subscribe: "Get notified",
    unsubscribe: "Unsubscribe",
  };

  const statusLabels: Record<string, string> = es ? {
    open: "Recibida", planned: "Planeada", in_progress: "En progreso", completed: "Completada", declined: "No planeada",
  } : {
    open: "Received", planned: "Planned", in_progress: "In progress", completed: "Completed", declined: "Not planned",
  };
  const categoryLabels: Record<string, string> = es ? {
    feature: "Función", editor: "Editor", api: "API", integration: "Integración", billing: "Planes", other: "Otro",
  } : {
    feature: "Feature", editor: "Editor", api: "API", integration: "Integration", billing: "Billing", other: "Other",
  };
  const moderationLabels: Record<string, string> = es ? {
    pending: "Pendiente", approved: "Aprobada", rejected: "Rechazada",
  } : {
    pending: "Pending", approved: "Approved", rejected: "Rejected",
  };

  const activityText = (activity: FeedbackActivity) => {
    const actor = activity.actorName || (es ? "Un usuario" : "A user");
    if (activity.action === "created") return es ? `${actor} creó esta idea` : `${actor} created this idea`;
    if (activity.action === "status_changed") {
      const next = statusLabels[activity.toValue || ""] || activity.toValue;
      return es ? `${actor} cambió el estado a ${next}` : `${actor} changed status to ${next}`;
    }
    const next = moderationLabels[activity.toValue || ""] || activity.toValue;
    return es ? `${actor} cambió la moderación a ${next}` : `${actor} changed moderation to ${next}`;
  };

  const visiblePosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = (data?.data || []).filter((post) => {
      const matchesSearch = !query || `${post.title} ${post.description}`.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || post.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "new") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "discussed") return b.comments.length - a.comments.length;
      return b.score - a.score || b.upvotes - a.upvotes;
    });
  }, [data?.data, search, sort, statusFilter]);
  const selectedPost = data?.data.find((post) => post.id === expandedId) || null;

  const createPost = async () => {
    if (title.trim().length < 5 || description.trim().length < 15) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not publish feedback");
      setTitle(""); setDescription(""); setCategory("feature"); setCreateOpen(false);
      toast.success(copy.published);
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not publish feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const vote = async (post: FeedbackPost, value: 1) => {
    setBusyId(post.id);
    try {
      const nextValue = post.currentUserVote === value ? 0 : value;
      const response = await fetch(`/api/feedback/${post.id}/vote`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: nextValue }),
      });
      if (!response.ok) throw new Error("Could not save vote");
      await refetch();
    } catch {
      toast.error(es ? "No se pudo guardar tu voto" : "Could not save your vote");
    } finally {
      setBusyId(null);
    }
  };

  const addComment = async (postId: string) => {
    const body = commentDrafts[postId]?.trim();
    if (!body || body.length < 2) return;
    setBusyId(postId);
    try {
      const response = await fetch(`/api/feedback/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, parentCommentId: null }),
      });
      if (!response.ok) throw new Error("Could not publish comment");
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
      await refetch();
    } catch {
      toast.error(es ? "No se pudo publicar el comentario" : "Could not publish comment");
    } finally {
      setBusyId(null);
    }
  };

  const addReply = async (postId: string, parentCommentId: string) => {
    const body = replyDrafts[parentCommentId]?.trim();
    if (!body || body.length < 2) return;
    setBusyId(parentCommentId);
    try {
      const response = await fetch(`/api/feedback/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, parentCommentId }),
      });
      if (!response.ok) throw new Error("Could not publish reply");
      setReplyDrafts((current) => ({ ...current, [parentCommentId]: "" }));
      setReplyTargets((current) => ({ ...current, [postId]: null }));
      await refetch();
    } catch {
      toast.error(es ? "No se pudo publicar la respuesta" : "Could not publish the reply");
    } finally {
      setBusyId(null);
    }
  };

  const updateStatus = async (postId: string, status: string) => {
    setBusyId(postId);
    try {
      const response = await fetch(`/api/feedback/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Could not update status");
      await refetch();
    } catch {
      toast.error(es ? "No se pudo actualizar el estado" : "Could not update status");
    } finally {
      setBusyId(null);
    }
  };

  const updateModeration = async (postId: string, moderationStatus: "approved" | "rejected") => {
    setBusyId(postId);
    try {
      const response = await fetch(`/api/feedback/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moderationStatus }),
      });
      if (!response.ok) throw new Error("Could not update moderation");
      toast.success(moderationStatus === "approved" ? copy.approvedToast : copy.rejectedToast);
      await refetch();
    } catch {
      toast.error(es ? "No se pudo moderar la idea" : "Could not moderate the idea");
    } finally {
      setBusyId(null);
    }
  };

  const toggleSubscription = async (post: FeedbackPost) => {
    setBusyId(post.id);
    try {
      const response = await fetch(`/api/feedback/${post.id}/subscription`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscribed: !post.isSubscribed }),
      });
      if (!response.ok) throw new Error("Could not update subscription");
      toast.success(post.isSubscribed
        ? (es ? "Ya no recibirás notificaciones de esta idea" : "You will no longer receive notifications for this idea")
        : (es ? "Te avisaremos cuando esta idea tenga novedades" : "We will notify you when this idea has updates"));
      await refetch();
    } catch {
      toast.error(es ? "No se pudo actualizar la suscripción" : "Could not update the subscription");
    } finally {
      setBusyId(null);
    }
  };

  const deletePost = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      const response = await fetch(`/api/feedback/${deleteTarget.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete feedback");
      setDeleteTarget(null);
      setExpandedId(null);
      toast.success(es ? "La idea fue eliminada" : "The idea was deleted");
      await refetch();
    } catch {
      toast.error(es ? "No se pudo eliminar la idea" : "Could not delete the idea");
    } finally {
      setBusyId(null);
    }
  };

  if (isPending) return <BrandLoading label="" className="min-h-[70vh] border-0 bg-transparent" />;

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <header className="sticky top-0 z-40 border-b border-[#101426]/8 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <Image src="/dynamic-canvas-logo.png" alt="Dynamic Canvas" width={178} height={66} className="h-11 w-auto object-contain" priority />
          </Link>
          <div className="flex items-center gap-2">
            <button aria-label={es ? "Notificaciones" : "Notifications"} className="flex size-10 items-center justify-center rounded-xl border border-[#101426]/10 bg-white text-[#596174] transition hover:border-[#5b35d5]/25 hover:text-[#5b35d5]"><Bell className="size-4" /></button>
            <Link href="/dashboard" className="flex h-10 items-center gap-2 rounded-xl bg-[#101426] px-4 text-xs font-black text-white transition hover:bg-[#5b35d5]"><ArrowLeft className="size-3.5" /><span className="hidden sm:inline">{es ? "Volver al dashboard" : "Back to dashboard"}</span></Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1440px] items-center overflow-x-auto px-5 sm:px-8">
          <Link href="/dashboard" className="flex h-14 shrink-0 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-black text-[#596174] transition hover:text-[#5b35d5]"><ArrowLeft className="size-4" />{es ? "Volver al sitio" : "Back to site"}</Link>
          <span className="flex h-14 shrink-0 items-center gap-2 border-b-2 border-[#5b35d5] bg-[#f5f2ff] px-5 text-sm font-black text-[#5b35d5]"><LayoutList className="size-4" />Feedback</span>
          <Link href="/roadmap" className="flex h-14 shrink-0 items-center gap-2 border-b-2 border-transparent px-5 text-sm font-black text-[#596174] transition hover:bg-[#fafafe] hover:text-[#5b35d5]"><Map className="size-4" />Roadmap</Link>
          <Link href="/changelog" className="flex h-14 shrink-0 items-center gap-2 border-b-2 border-transparent px-5 text-sm font-black text-[#596174] transition hover:bg-[#fafafe] hover:text-[#5b35d5]"><GitBranch className="size-4" />Changelog</Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-7 sm:px-6 sm:pt-10">
      <section className="relative overflow-hidden rounded-[28px] border border-[#5b35d5]/10 bg-gradient-to-br from-[#eeeaff] via-white to-[#f8f9ff] p-7 shadow-[0_24px_70px_rgba(91,53,213,.08)] sm:p-10">
        <div className="absolute -right-12 -top-16 size-56 rounded-full bg-[#5b35d5]/10 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5b35d5]">{copy.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-black leading-[.98] tracking-[-0.045em] sm:text-5xl">{copy.title}</h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-[#101426]/55">{copy.subtitle}</p>
          </div>
          <button onClick={() => setCreateOpen(true)} className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5b35d5] to-[#6f4bea] px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(91,53,213,.22)] transition hover:-translate-y-0.5 hover:brightness-105">
            <Plus className="size-4" />{copy.add}
          </button>
        </div>
      </section>

      <div className="mt-7 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#101426]/30" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={copy.search} className="h-12 w-full rounded-xl border border-[#101426]/10 bg-white pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-[#5b35d5]/40 focus:ring-4 focus:ring-[#5b35d5]/10" />
        </div>
        <div className="flex rounded-xl border border-[#101426]/10 bg-white p-1 shadow-sm">
          {([["top", copy.top], ["new", copy.newest], ["discussed", copy.discussed]] as const).map(([value, label]) => (
            <button key={value} onClick={() => setSort(value)} className={`rounded-lg px-3 py-2 text-xs font-black transition ${sort === value ? "bg-[#eeeaff] text-[#5b35d5]" : "text-[#596174] hover:bg-[#f7f7fb]"}`}>{label}</button>
          ))}
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-12 rounded-xl border border-[#101426]/10 bg-white px-4 text-xs font-black text-[#596174] shadow-sm outline-none focus:border-[#5b35d5]/40">
          <option value="all">{copy.all}</option>
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      <div className="mt-5 space-y-4">
        {visiblePosts.map((post) => (
            <article
              id={post.id}
              key={post.id}
              onClick={(event) => {
                const target = event.target as HTMLElement;
                if (target.closest("button, select, a, input, textarea, label")) return;
                setExpandedId(post.id);
              }}
              className="cursor-pointer overflow-hidden rounded-[22px] border border-[#101426]/10 bg-white shadow-[0_12px_38px_rgba(16,20,38,.045)] transition hover:-translate-y-0.5 hover:border-[#5b35d5]/25 hover:shadow-[0_18px_48px_rgba(91,53,213,.10)]"
            >
              <div className="grid gap-4 p-5 sm:grid-cols-[70px_1fr] sm:p-6">
                <div className="flex h-fit items-center justify-center gap-1 rounded-2xl border border-[#101426]/10 bg-[#fafafe] p-1.5 sm:flex-col">
                  <button disabled={busyId === post.id} onClick={() => void vote(post, 1)} aria-label="Upvote" className={`flex size-9 items-center justify-center rounded-xl transition ${post.currentUserVote === 1 ? "bg-[#5b35d5] text-white" : "text-[#596174] hover:bg-[#eeeaff] hover:text-[#5b35d5]"}`}><ArrowUp className="size-4" /></button>
                  <strong className="min-w-8 text-center text-base font-black">{post.score}</strong>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {post.moderationStatus !== "approved" && (
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${post.moderationStatus === "pending" ? "bg-[#eaf2ff] text-[#2263c5]" : "bg-red-50 text-red-600"}`}>
                        {post.moderationStatus === "pending" ? <ShieldCheck className="size-3" /> : <XCircle className="size-3" />}
                        {post.moderationStatus === "pending" ? (es ? "Pendiente" : "Pending") : (es ? "Rechazada" : "Rejected")}
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${STATUS_STYLES[post.status] || STATUS_STYLES.open}`}>{statusLabels[post.status]}</span>
                    <span className="rounded-full bg-[#f7f7fa] px-2.5 py-1 text-[10px] font-black text-[#596174]">{categoryLabels[post.category] || post.category}</span>
                    {data?.isAdmin && (
                      <select disabled={busyId === post.id} value={post.status} onChange={(event) => void updateStatus(post.id, event.target.value)} className="ml-auto rounded-lg border border-[#101426]/10 bg-white px-2 py-1 text-[10px] font-black outline-none focus:border-[#5b35d5]/40">
                        {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    )}
                  </div>
                  <button onClick={() => setExpandedId(post.id)} className="mt-3 block text-left text-xl font-black tracking-tight transition hover:text-[#5b35d5] sm:text-2xl">{post.title}</button>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#101426]/60">{post.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-[#101426]/40">
                    <span>{post.authorName}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString(es ? "es-CO" : "en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <button onClick={() => setExpandedId(post.id)} className="flex items-center gap-1.5 font-black text-[#5b35d5] hover:underline"><MessageCircle className="size-3.5" />{post.comments.length} {copy.comments.toLowerCase()}</button>
                    <span className="flex items-center gap-1"><ThumbsUp className="size-3.5" />{post.upvotes}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        {visiblePosts.length === 0 && (
          <div className="rounded-[22px] border border-dashed border-[#101426]/15 bg-white py-16 text-center">
            <Lightbulb className="mx-auto size-9 text-[#5b35d5]/35" />
            <p className="mt-3 text-sm font-bold text-[#101426]/40">{copy.empty}</p>
          </div>
        )}
      </div>
      </main>

      <Dialog open={Boolean(selectedPost)} onOpenChange={(open) => { if (!open) setExpandedId(null); }}>
        <DialogContent className="h-[min(820px,calc(100vh-2rem))] w-[calc(100vw-1.5rem)] overflow-hidden rounded-[26px] border border-[#101426]/10 bg-white p-0 shadow-[0_35px_100px_rgba(16,20,38,.25)] sm:max-w-[1120px]">
          {selectedPost && (
            <div className="grid h-full min-h-0 md:grid-cols-[minmax(0,1fr)_320px]">
              <section className="min-h-0 overflow-y-auto p-6 sm:p-8">
                {selectedPost.moderationStatus !== "approved" && (
                  <div className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm font-bold leading-relaxed ${selectedPost.moderationStatus === "pending" ? "border-[#bcd2ff] bg-[#edf4ff] text-[#153d8a]" : "border-red-200 bg-red-50 text-red-700"}`}>
                    {selectedPost.moderationStatus === "pending" ? <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#3478e5]" /> : <XCircle className="mt-0.5 size-5 shrink-0" />}
                    <span>{selectedPost.moderationStatus === "pending" ? copy.awaitingApproval : copy.rejected}</span>
                  </div>
                )}
                <div className="pr-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${STATUS_STYLES[selectedPost.status] || STATUS_STYLES.open}`}>{statusLabels[selectedPost.status]}</span>
                    <span className="rounded-full bg-[#f4f2fa] px-2.5 py-1 text-[10px] font-black text-[#5b35d5]">{categoryLabels[selectedPost.category] || selectedPost.category}</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-black leading-tight tracking-[-0.03em] sm:text-3xl">{selectedPost.title}</h2>
                  <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-[#101426]/65">{selectedPost.description}</p>
                </div>

                <div className="mt-7 rounded-2xl border border-[#101426]/8 bg-[#fafafe] p-4">
                  <p className="flex items-center gap-2 text-sm font-black text-[#343a50]"><Sparkles className="size-4 text-[#5b35d5]" />{es ? "¿Qué tan importante es esta idea para ti?" : "How important is this idea to you?"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button disabled={busyId === selectedPost.id} onClick={() => void vote(selectedPost, 1)} className={`rounded-xl border px-3 py-2 text-xs font-black transition ${selectedPost.currentUserVote === 1 ? "border-[#5b35d5] bg-[#5b35d5] text-white" : "border-[#101426]/10 bg-white text-[#596174] hover:border-[#5b35d5]/30 hover:text-[#5b35d5]"}`}>😍 {es ? "La necesito" : "I need this"}</button>
                  </div>
                </div>

                <div className="mt-7 flex items-center gap-6 border-b border-[#101426]/10">
                  <button onClick={() => setDetailTab("comments")} className={`flex h-11 items-center gap-2 border-b-2 px-1 text-sm font-black transition ${detailTab === "comments" ? "border-[#5b35d5] text-[#343a50]" : "border-transparent text-[#101426]/45 hover:text-[#5b35d5]"}`}><MessageCircle className="size-4" />{copy.comments}<span className="rounded-full bg-[#f0f1f6] px-2 py-0.5 text-[10px]">{selectedPost.comments.length}</span></button>
                  <button onClick={() => setDetailTab("activity")} className={`flex h-11 items-center gap-2 border-b-2 px-1 text-sm font-black transition ${detailTab === "activity" ? "border-[#5b35d5] text-[#343a50]" : "border-transparent text-[#101426]/45 hover:text-[#5b35d5]"}`}><Activity className="size-4" />{copy.activity}</button>
                </div>

                {detailTab === "comments" ? <>
                <div className="mt-6 rounded-2xl border border-[#101426]/10 bg-white p-4 shadow-sm">
                  <Textarea id={`feedback-comment-${selectedPost.id}`} value={commentDrafts[selectedPost.id] || ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [selectedPost.id]: event.target.value }))} placeholder={data?.isAdmin ? (es ? "Comentar como equipo de Dynamic Canvas..." : "Comment as the Dynamic Canvas team...") : copy.commentPlaceholder} maxLength={1500} className="min-h-24 resize-y border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" />
                  <div className="mt-3 flex items-center justify-between border-t border-[#101426]/8 pt-3">
                    <span className="text-[10px] font-bold text-[#101426]/30">{(commentDrafts[selectedPost.id] || "").length}/1500</span>
                    <button disabled={busyId === selectedPost.id || (commentDrafts[selectedPost.id]?.trim().length || 0) < 2} onClick={() => void addComment(selectedPost.id)} className="flex h-10 items-center gap-2 rounded-xl bg-[#5b35d5] px-4 text-xs font-black text-white transition hover:bg-[#4826bd] disabled:opacity-40"><Send className="size-3.5" />{copy.send}</button>
                  </div>
                </div>

                <div className="mt-7">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black">{copy.comments}</h3>
                    <span className="rounded-full bg-[#eeeaff] px-2.5 py-1 text-[10px] font-black text-[#5b35d5]">{selectedPost.comments.length}</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {selectedPost.comments.filter((comment) => !comment.parentCommentId).map((comment) => (
                      <div key={comment.id} className={`rounded-2xl border p-4 ${comment.isAdmin ? "border-[#5b35d5]/20 bg-[#f3f0ff]" : "border-[#101426]/8 bg-white"}`}>
                        <div className="flex items-center gap-2">
                          <span className={`flex size-8 items-center justify-center rounded-full text-[11px] font-black ${comment.isAdmin ? "bg-[#5b35d5] text-white" : "bg-[#101426] text-white"}`}>{(comment.authorName || "U").charAt(0).toUpperCase()}</span>
                          <div>
                            <div className="flex items-center gap-1.5"><strong className="text-xs">{comment.isAdmin ? copy.admin : (comment.authorName || "User")}</strong>{comment.isAdmin && <CheckCircle2 className="size-3.5 fill-[#5b35d5] text-white" />}</div>
                            <span className="text-[10px] text-[#101426]/35">{new Date(comment.createdAt).toLocaleDateString(es ? "es-CO" : "en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </div>
                        </div>
                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#101426]/65">{comment.body}</p>
                        <button
                          onClick={() => {
                            const isOpen = replyTargets[selectedPost.id]?.id === comment.id;
                            setReplyTargets((current) => ({ ...current, [selectedPost.id]: isOpen ? null : { id: comment.id, name: comment.isAdmin ? copy.admin : (comment.authorName || "User") } }));
                            if (!isOpen) requestAnimationFrame(() => document.getElementById(`feedback-reply-${comment.id}`)?.focus());
                          }}
                          className="mt-3 flex items-center gap-1.5 text-[11px] font-black text-[#5b35d5] transition hover:underline"
                        >
                          <MessageCircle className="size-3.5" />{es ? "Responder" : "Reply"}
                        </button>

                        {replyTargets[selectedPost.id]?.id === comment.id && (
                          <div className="mt-3 rounded-xl border border-[#5b35d5]/20 bg-white p-3 shadow-sm">
                            <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-[#5b35d5]">
                              <span>{es ? "Respondiendo a" : "Replying to"} {replyTargets[selectedPost.id]?.name}</span>
                              <button onClick={() => setReplyTargets((current) => ({ ...current, [selectedPost.id]: null }))} className="rounded-md px-2 py-1 font-black transition hover:bg-[#eeeaff]">{es ? "Cancelar" : "Cancel"}</button>
                            </div>
                            <Textarea id={`feedback-reply-${comment.id}`} value={replyDrafts[comment.id] || ""} onChange={(event) => setReplyDrafts((current) => ({ ...current, [comment.id]: event.target.value }))} placeholder={es ? "Escribe tu respuesta..." : "Write your reply..."} maxLength={1500} className="min-h-20 resize-y border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0" />
                            <div className="mt-2 flex items-center justify-between border-t border-[#101426]/8 pt-2">
                              <span className="text-[9px] font-bold text-[#101426]/30">{(replyDrafts[comment.id] || "").length}/1500</span>
                              <button disabled={busyId === comment.id || (replyDrafts[comment.id]?.trim().length || 0) < 2} onClick={() => void addReply(selectedPost.id, comment.id)} className="flex h-9 items-center gap-2 rounded-lg bg-[#5b35d5] px-3 text-[11px] font-black text-white transition hover:bg-[#4826bd] disabled:opacity-40"><Send className="size-3" />{es ? "Responder" : "Reply"}</button>
                            </div>
                          </div>
                        )}

                        {selectedPost.comments.filter((reply) => reply.parentCommentId === comment.id).length > 0 && (
                          <div className="mt-4 space-y-2 border-l-2 border-[#5b35d5]/15 pl-4">
                            {selectedPost.comments.filter((reply) => reply.parentCommentId === comment.id).map((reply) => (
                              <div key={reply.id} className={`rounded-xl border p-3 ${reply.isAdmin ? "border-[#5b35d5]/15 bg-white/70" : "border-[#101426]/8 bg-[#fafafe]"}`}>
                                <div className="flex items-center gap-2">
                                  <span className={`flex size-7 items-center justify-center rounded-full text-[10px] font-black ${reply.isAdmin ? "bg-[#5b35d5] text-white" : "bg-[#101426] text-white"}`}>{(reply.authorName || "U").charAt(0).toUpperCase()}</span>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5"><strong className="truncate text-[11px]">{reply.isAdmin ? copy.admin : (reply.authorName || "User")}</strong>{reply.isAdmin && <CheckCircle2 className="size-3 fill-[#5b35d5] text-white" />}</div>
                                    <span className="text-[9px] text-[#101426]/35">{new Date(reply.createdAt).toLocaleDateString(es ? "es-CO" : "en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                                  </div>
                                </div>
                                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#101426]/65">{reply.body}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {selectedPost.comments.length === 0 && <div className="rounded-2xl border border-dashed border-[#101426]/12 px-5 py-8 text-center text-sm font-semibold text-[#101426]/35">{es ? "Sé la primera persona en comentar." : "Be the first to comment."}</div>}
                  </div>
                </div>
                </> : (
                  <div className="relative mt-6 space-y-3 before:absolute before:bottom-6 before:left-5 before:top-6 before:w-px before:bg-[#5b35d5]/15">
                    {[...selectedPost.activities].reverse().map((activity) => (
                      <div key={activity.id} className="relative flex items-center gap-3 rounded-2xl border border-[#101426]/8 bg-white p-4 shadow-sm">
                        <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-4 border-white bg-[#eeeaff] text-[#5b35d5]"><Activity className="size-4" /></span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold leading-relaxed text-[#343a50]">{activityText(activity)}</p>
                          <p className="mt-0.5 text-[10px] font-semibold text-[#101426]/35">{new Date(activity.createdAt).toLocaleString(es ? "es-CO" : "en-US", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                        </div>
                      </div>
                    ))}
                    {selectedPost.activities.length === 0 && <div className="rounded-2xl border border-dashed border-[#101426]/12 px-5 py-10 text-center text-sm font-semibold text-[#101426]/35">{es ? "Aún no hay actividad registrada." : "No activity has been recorded yet."}</div>}
                  </div>
                )}
              </section>

              <aside className="min-h-0 overflow-y-auto border-t border-[#101426]/8 bg-[#fafafe] p-6 md:border-l md:border-t-0 md:p-7">
                {data?.isAdmin && (
                  <div className="mb-5 rounded-2xl border border-[#5b35d5]/15 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex items-center gap-2 text-xs font-black text-[#343a50]"><ShieldCheck className="size-4 text-[#5b35d5]" />{es ? "Moderación" : "Moderation"}</p>
                      <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${selectedPost.moderationStatus === "approved" ? "bg-emerald-50 text-emerald-700" : selectedPost.moderationStatus === "rejected" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-700"}`}>{moderationLabels[selectedPost.moderationStatus]}</span>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-[#101426]/45">{selectedPost.moderationStatus === "approved" ? (es ? "Esta idea está publicada y visible para la comunidad." : "This idea is published and visible to the community.") : (es ? "Revisa el contenido antes de hacerlo visible para toda la comunidad." : "Review the content before making it visible to the community.")}</p>
                    <div className="mt-4 grid gap-2">
                      <button disabled={busyId === selectedPost.id || selectedPost.moderationStatus === "approved"} onClick={() => void updateModeration(selectedPost.id, "approved")} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#5b35d5] px-3 text-xs font-black text-white transition hover:bg-[#4826bd] disabled:cursor-default disabled:bg-emerald-50 disabled:text-emerald-700 disabled:opacity-100"><CheckCircle2 className="size-4" />{selectedPost.moderationStatus === "approved" ? copy.approved : copy.approve}</button>
                      <button disabled={busyId === selectedPost.id || selectedPost.moderationStatus === "rejected"} onClick={() => void updateModeration(selectedPost.id, "rejected")} className="flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-xs font-black text-red-600 transition hover:bg-red-50 disabled:cursor-default disabled:border-red-100 disabled:bg-red-50 disabled:opacity-60"><XCircle className="size-4" />{selectedPost.moderationStatus === "rejected" ? copy.rejectedAction : copy.reject}</button>
                    </div>
                  </div>
                )}
                <div className="rounded-2xl border border-[#101426]/8 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#101426]/35">{es ? "Votación" : "Voting"}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button disabled={busyId === selectedPost.id} onClick={() => void vote(selectedPost, 1)} aria-label="Upvote" className={`flex size-11 items-center justify-center rounded-xl transition ${selectedPost.currentUserVote === 1 ? "bg-[#5b35d5] text-white" : "bg-[#eeeaff] text-[#5b35d5] hover:bg-[#ddd5ff]"}`}><ArrowUp className="size-5" /></button>
                    <div><strong className="block text-2xl font-black">{selectedPost.score}</strong><span className="text-[10px] font-bold text-[#101426]/35">{selectedPost.upvotes} upvotes</span></div>
                  </div>
                </div>

                <dl className="mt-5 divide-y divide-[#101426]/8 rounded-2xl border border-[#101426]/8 bg-white px-4">
                  <div className="grid grid-cols-[88px_1fr] gap-3 py-4"><dt className="text-xs font-black text-[#101426]/45">Status</dt><dd>{data?.isAdmin ? <select disabled={busyId === selectedPost.id} value={selectedPost.status} onChange={(event) => void updateStatus(selectedPost.id, event.target.value)} className="w-full rounded-lg border border-[#101426]/10 bg-white px-2 py-1.5 text-xs font-black outline-none focus:border-[#5b35d5]/40">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select> : <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${STATUS_STYLES[selectedPost.status] || STATUS_STYLES.open}`}>{statusLabels[selectedPost.status]}</span>}</dd></div>
                  <div className="grid grid-cols-[88px_1fr] gap-3 py-4"><dt className="flex items-center gap-1.5 text-xs font-black text-[#101426]/45"><Tag className="size-3.5" />{es ? "Tablero" : "Board"}</dt><dd className="text-xs font-black text-[#343a50]">{categoryLabels[selectedPost.category] || selectedPost.category}</dd></div>
                  <div className="grid grid-cols-[88px_1fr] gap-3 py-4"><dt className="flex items-center gap-1.5 text-xs font-black text-[#101426]/45"><CalendarDays className="size-3.5" />{es ? "Fecha" : "Date"}</dt><dd className="text-xs font-bold text-[#596174]">{new Date(selectedPost.createdAt).toLocaleDateString(es ? "es-CO" : "en-US", { day: "numeric", month: "long", year: "numeric" })}</dd></div>
                  <div className="grid grid-cols-[88px_1fr] gap-3 py-4"><dt className="flex items-center gap-1.5 text-xs font-black text-[#101426]/45"><UserRound className="size-3.5" />{es ? "Autor" : "Author"}</dt><dd className="min-w-0 truncate text-xs font-black text-[#343a50]">{selectedPost.authorName}</dd></div>
                </dl>

                <div className="mt-5 rounded-2xl border border-[#101426]/8 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-base font-black text-[#343a50]">{copy.subscribeTitle}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-[#101426]/50">{copy.subscribeText}</p>
                    </div>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#eeeaff] text-[#5b35d5]"><Bell className="size-4" /></span>
                  </div>
                  <button disabled={busyId === selectedPost.id} onClick={() => void toggleSubscription(selectedPost)} className={`mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-black transition disabled:opacity-50 ${selectedPost.isSubscribed ? "border border-[#101426]/10 bg-white text-[#596174] hover:bg-[#f7f7fb]" : "bg-[#5b35d5] text-white shadow-[0_10px_24px_rgba(91,53,213,.18)] hover:bg-[#4826bd]"}`}>
                    {selectedPost.isSubscribed ? <BellOff className="size-4" /> : <Bell className="size-4" />}
                    {selectedPost.isSubscribed ? copy.unsubscribe : copy.subscribe}
                  </button>
                </div>

                {(data?.isAdmin || data?.currentUserId === selectedPost.userId) && (
                  <button
                    onClick={() => setDeleteTarget(selectedPost)}
                    className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-xs font-black text-red-600 transition hover:border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />{es ? "Eliminar idea" : "Delete idea"}
                  </button>
                )}
              </aside>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open && busyId !== deleteTarget?.id) setDeleteTarget(null); }}>
        <DialogContent className="max-w-md rounded-[24px] border border-[#101426]/10 bg-white p-0 shadow-[0_30px_90px_rgba(16,20,38,.25)]">
          <div className="p-6 pr-12">
            <div className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-600"><Trash2 className="size-5" /></div>
            <DialogHeader className="mt-4 text-left">
              <DialogTitle className="text-2xl font-black tracking-tight">{es ? "¿Eliminar esta idea?" : "Delete this idea?"}</DialogTitle>
              <DialogDescription className="pt-1 leading-relaxed text-[#101426]/55">
                {es ? "Esta acción eliminará permanentemente la propuesta, sus votos y todos sus comentarios. No se puede deshacer." : "This permanently deletes the idea, its votes, and every comment. This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 flex justify-end gap-2">
              <button disabled={busyId === deleteTarget?.id} onClick={() => setDeleteTarget(null)} className="h-11 rounded-xl border border-[#101426]/10 px-4 text-xs font-black text-[#596174] transition hover:bg-[#f7f7fb]">{es ? "Cancelar" : "Cancel"}</button>
              <button disabled={busyId === deleteTarget?.id} onClick={() => void deletePost()} className="flex h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-black text-white transition hover:bg-red-700 disabled:opacity-50">{busyId === deleteTarget?.id ? <Clock3 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}{es ? "Sí, eliminar" : "Yes, delete"}</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl rounded-[24px] border border-[#101426]/10 bg-white p-0 shadow-[0_30px_90px_rgba(16,20,38,.2)]">
          <div className="rounded-t-[24px] bg-gradient-to-br from-[#eeeaff] to-white p-6 pr-12">
            <DialogHeader>
              <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-[#5b35d5] text-white"><Lightbulb className="size-5" /></div>
              <DialogTitle className="text-2xl font-black tracking-tight">{copy.formTitle}</DialogTitle>
              <DialogDescription className="text-[#101426]/50">{copy.formText}</DialogDescription>
            </DialogHeader>
          </div>
          <div className="space-y-4 p-6 pt-2">
            <label className="block"><span className="mb-1.5 block text-xs font-black text-[#101426]/55">{copy.titleLabel}</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={140} placeholder={copy.titlePlaceholder} className="h-12 w-full rounded-xl border border-[#101426]/10 bg-[#f8f9fc] px-4 text-sm outline-none focus:border-[#5b35d5]/40 focus:ring-4 focus:ring-[#5b35d5]/10" /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-black text-[#101426]/55">{copy.descriptionLabel}</span><Textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={3000} placeholder={copy.descriptionPlaceholder} className="min-h-36 rounded-xl border-[#101426]/10 bg-[#f8f9fc] p-4 focus-visible:ring-[#5b35d5]/15" /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-black text-[#101426]/55">{copy.category}</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 w-full rounded-xl border border-[#101426]/10 bg-white px-3 text-sm font-bold outline-none focus:border-[#5b35d5]/40">{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <button onClick={() => void createPost()} disabled={submitting || title.trim().length < 5 || description.trim().length < 15} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5b35d5] to-[#6f4bea] text-sm font-black text-white shadow-[0_12px_28px_rgba(91,53,213,.2)] transition hover:brightness-105 disabled:opacity-40">{submitting ? <Clock3 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}{copy.publish}</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
