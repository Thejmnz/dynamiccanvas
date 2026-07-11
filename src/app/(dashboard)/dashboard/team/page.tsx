"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Crown, Sparkles, Loader2, UserPlus, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const PLAN_MEMBER_LIMITS: Record<string, number> = {
  free: 1,
  creator: 2,
  agency: 5,
  business: 20,
  unlimited: 999,
};

export default function TeamPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("free");
  const [joinedDate, setJoinedDate] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [{ data: { user } }, creditsRes] = await Promise.all([
        supabase.auth.getUser(),
        fetch("/api/user-credits").then((r) => r.ok ? r.json() : null),
      ]);
      if (user) {
        setName(user.user_metadata?.name || user.email?.split("@")[0] || "User");
        setEmail(user.email || "");
        const created = user.created_at || user.user_metadata?.created_at;
        if (created) {
          setJoinedDate(new Date(created).toLocaleDateString(language === "es" ? "es-CO" : "en-US", { year: "numeric", month: "short", day: "numeric" }));
        }
      }
      if (creditsRes) setPlan(creditsRes.plan || "free");
    } catch { } finally { setLoading(false); }
  };

  const c = language === "es" ? {
    title: "Gestión de equipo",
    overview: "Resumen",
    freeMsg: "Estás en el plan Free. Invita a tu equipo suscribiéndote a uno de nuestros planes.",
    teamName: "Nombre del equipo",
    members: "Miembros",
    memberLimit: "límite alcanzado",
    invite: "Invitar y gestionar miembros del equipo",
    name: "Nombre", email: "Correo", role: "Rol", joined: "Se unió", actions: "Acciones",
    you: "Tú", owner: "Propietario",
    seePlans: "Ver planes",
    inviteBtn: "Invitar miembro",
  } : {
    title: "Team Management",
    overview: "Overview",
    freeMsg: "You're on the Free plan. You can invite your team by subscribing to one of our plans.",
    teamName: "Team Name",
    members: "Members",
    memberLimit: "limit reached",
    invite: "Invite and manage team members",
    name: "Name", email: "Email", role: "Role", joined: "Joined", actions: "Actions",
    you: "You", owner: "Owner",
    seePlans: "See plans",
    inviteBtn: "Invite member",
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="size-7 animate-spin text-[#5b35d5]" /></div>;
  }

  const memberLimit = PLAN_MEMBER_LIMITS[plan] ?? 1;
  const isFree = plan === "free";
  const teamName = `${name}'s Team`;

  return (
    <div className="mx-auto max-w-3xl pb-10 pt-6 space-y-5">
      <h1 className="text-3xl font-black tracking-tight">{c.title}</h1>

      {/* Overview */}
      <section className="rounded-[22px] border-2 border-[#101426] bg-white p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-[#101426]/40">{c.overview}</span>
        </div>

        {isFree && (
          <div className="flex items-center justify-between rounded-xl bg-[#c9ff5a]/20 border-2 border-[#101426]/10 p-4 mb-4">
            <p className="text-sm font-medium text-[#101426]/70 flex-1">{c.freeMsg}</p>
            <button
              onClick={() => router.push("/dashboard/pricing")}
              className="flex items-center gap-1.5 rounded-full bg-[#c9ff5a] border-2 border-[#101426] px-4 py-2 text-xs font-black hover:bg-white transition shrink-0 ml-4"
            >
              <Sparkles className="size-3.5" />{c.seePlans}
            </button>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-[#101426]/40 block mb-1">{c.teamName}</label>
            <div className="border-2 border-[#101426]/10 rounded-xl px-3 py-2.5 text-sm font-bold bg-[#101426]/3">
              {teamName}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#101426]/40 block mb-1">{c.members}</label>
            <div className="flex items-center justify-between border-2 border-[#101426]/10 rounded-xl px-3 py-2.5 text-sm bg-[#101426]/3">
              <span className="font-bold">1 / {memberLimit === 999 ? "∞" : memberLimit}</span>
              {memberLimit <= 1 && <span className="text-[10px] font-black text-[#ff6b57] uppercase">{c.memberLimit}</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Members */}
      <section className="rounded-[22px] border-2 border-[#101426] bg-white overflow-hidden">
        <div className="p-5 border-b border-[#101426]/8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black">{c.members}</h2>
              <p className="text-xs text-[#101426]/45 mt-0.5">{c.invite}</p>
            </div>
            <button
              disabled={isFree || memberLimit <= 1}
              onClick={() => toast.info(language === "es" ? "Próximamente" : "Coming soon")}
              className="flex items-center gap-1.5 rounded-full bg-[#101426] text-white px-4 py-2 text-xs font-black hover:bg-[#5b35d5] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <UserPlus className="size-3.5" />{c.inviteBtn}
            </button>
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-[#101426]/3 border-b border-[#101426]/8">
            <tr>
              <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-[#101426]/40">{c.name}</th>
              <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-[#101426]/40">{c.email}</th>
              <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-[#101426]/40">{c.role}</th>
              <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-[#101426]/40">{c.joined}</th>
              <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-[#101426]/40"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#101426]/5">
            <tr className="hover:bg-[#101426]/2 transition">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-gradient-to-br from-[#5b35d5] to-[#c9ff5a] flex items-center justify-center text-white font-black text-sm shrink-0">
                    {name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{name}</div>
                    <div className="text-[10px] font-black uppercase text-[#5b35d5]">{c.you}</div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1 text-xs text-[#101426]/50">
                  <Mail className="size-3" />{email}
                </div>
              </td>
              <td className="px-5 py-4">
                <span className="flex items-center gap-1 text-xs font-black text-[#101426]/60">
                  <Crown className="size-3 text-[#5b35d5]" />{c.owner}
                </span>
              </td>
              <td className="px-5 py-4 text-xs text-[#101426]/50">{joinedDate || "—"}</td>
              <td className="px-5 py-4 text-xs text-[#101426]/30">—</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
