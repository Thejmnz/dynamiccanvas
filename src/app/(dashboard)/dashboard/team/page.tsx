"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Crown, Sparkles, UserPlus, Mail, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { BrandLoading } from "@/components/brand-loading";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TeamMember = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: "active" | "pending";
  invitedAt: string;
};

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
  const [teamName, setTeamName] = useState("");
  const [savedTeamName, setSavedTeamName] = useState("");
  const [savingTeamName, setSavingTeamName] = useState(false);
  const [plan, setPlan] = useState("free");
  const [joinedDate, setJoinedDate] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [{ data: { user } }, creditsRes, teamRes] = await Promise.all([
        supabase.auth.getUser(),
        fetch("/api/user-credits").then((r) => r.ok ? r.json() : null),
        fetch("/api/team").then((r) => r.ok ? r.json() : null),
      ]);
      if (user) {
        const displayName = user.user_metadata?.name || user.email?.split("@")[0] || "User";
        const initialTeamName = user.user_metadata?.team_name
          || (language === "es" ? `Equipo de ${displayName}` : `${displayName}'s Team`);
        setName(displayName);
        setEmail(user.email || "");
        setTeamName(initialTeamName);
        setSavedTeamName(initialTeamName);
        const created = user.created_at || user.user_metadata?.created_at;
        if (created) {
          setJoinedDate(new Date(created).toLocaleDateString(language === "es" ? "es-CO" : "en-US", { year: "numeric", month: "short", day: "numeric" }));
        }
      }
      if (creditsRes) setPlan(creditsRes.plan || "free");
      if (teamRes?.members) setMembers(teamRes.members);
    } catch { } finally { setLoading(false); }
  };

  const saveTeamName = async () => {
    const nextTeamName = teamName.trim();
    if (!nextTeamName || nextTeamName === savedTeamName) return;

    setSavingTeamName(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { team_name: nextTeamName },
      });
      if (error) throw error;
      setTeamName(nextTeamName);
      setSavedTeamName(nextTeamName);
      toast.success(language === "es" ? "Nombre del equipo actualizado" : "Team name updated");
    } catch (saveError: any) {
      toast.error(saveError.message || (language === "es" ? "No se pudo actualizar el equipo" : "Could not update the team"));
    } finally {
      setSavingTeamName(false);
    }
  };

  const sendInvitation = async () => {
    const nextEmail = inviteEmail.trim().toLowerCase();
    if (!nextEmail) return;

    setInviting(true);
    try {
      const response = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nextEmail, teamName }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not send invitation");

      setMembers((current) => current.some((member) => member.id === result.member.id)
        ? current
        : [...current, result.member]);
      setInviteEmail("");
      setInviteOpen(false);
      toast.success(language === "es" ? "Invitación enviada" : "Invitation sent");
    } catch (inviteError: any) {
      toast.error(inviteError.message || (language === "es" ? "No se pudo enviar la invitación" : "Could not send invitation"));
    } finally {
      setInviting(false);
    }
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
    inviteTitle: "Invitar miembro",
    inviteDesc: "Enviaremos un correo para que esta persona se una a tu equipo.",
    invitePlaceholder: "correo@empresa.com",
    cancel: "Cancelar",
    send: "Enviar invitación",
    member: "Miembro",
    pending: "Pendiente",
    active: "Activo",
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
    inviteTitle: "Invite team member",
    inviteDesc: "We'll email this person an invitation to join your team.",
    invitePlaceholder: "name@company.com",
    cancel: "Cancel",
    send: "Send invitation",
    member: "Member",
    pending: "Pending",
    active: "Active",
  };

  if (loading) {
    return <BrandLoading label="" className="min-h-[70vh] border-0 bg-transparent" />;
  }

  const memberLimit = PLAN_MEMBER_LIMITS[plan] ?? 1;
  const isFree = plan === "free";
  const currentMemberCount = 1 + members.length;
  const memberLimitReached = currentMemberCount >= memberLimit;

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
            <div className="flex items-center gap-2">
              <Input
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") void saveTeamName(); }}
                maxLength={60}
                aria-label={c.teamName}
                className="h-11 border-2 border-[#101426]/10 bg-[#101426]/3 text-sm font-bold focus-visible:border-[#5b35d5] focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => void saveTeamName()}
                disabled={savingTeamName || !teamName.trim() || teamName.trim() === savedTeamName}
                className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#101426] bg-[#c9ff5a] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                aria-label={language === "es" ? "Guardar nombre del equipo" : "Save team name"}
              >
                {savingTeamName ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#101426]/40 block mb-1">{c.members}</label>
            <div className="flex items-center justify-between border-2 border-[#101426]/10 rounded-xl px-3 py-2.5 text-sm bg-[#101426]/3">
              <span className="font-bold">{currentMemberCount} / {memberLimit === 999 ? "∞" : memberLimit}</span>
              {memberLimitReached && <span className="text-[10px] font-black text-[#ff6b57] uppercase">{c.memberLimit}</span>}
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
              disabled={isFree || memberLimitReached}
              onClick={() => setInviteOpen(true)}
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
            {members.map((member) => (
              <tr key={member.id} className="transition hover:bg-[#101426]/2">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eeeaff] text-sm font-black text-[#5b35d5]">
                      {member.name?.[0]?.toUpperCase() || "M"}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{member.name}</div>
                      <div className={`text-[10px] font-black uppercase ${member.status === "active" ? "text-emerald-600" : "text-amber-600"}`}>
                        {member.status === "active" ? c.active : c.pending}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4"><div className="flex items-center gap-1 text-xs text-[#101426]/50"><Mail className="size-3" />{member.email}</div></td>
                <td className="px-5 py-4 text-xs font-bold text-[#101426]/60">{c.member}</td>
                <td className="px-5 py-4 text-xs text-[#101426]/50">{new Date(member.invitedAt).toLocaleDateString(language === "es" ? "es-CO" : "en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
                <td className="px-5 py-4 text-xs text-[#101426]/30">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Dialog open={inviteOpen} onOpenChange={(open) => !inviting && setInviteOpen(open)}>
        <DialogContent className="max-w-md rounded-[24px] border border-[#dfe2ec] bg-white p-6 shadow-[0_24px_70px_rgba(16,20,38,.18)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black tracking-tight"><UserPlus className="size-5 text-[#5b35d5]" />{c.inviteTitle}</DialogTitle>
            <DialogDescription>{c.inviteDesc}</DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#101426]/45">{c.email}</label>
            <Input
              autoFocus
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") void sendInvitation(); }}
              placeholder={c.invitePlaceholder}
              disabled={inviting}
              className="h-12 rounded-xl border border-[#dfe2ec] bg-[#f8f9fc] px-4 focus-visible:border-[#5b35d5] focus-visible:ring-0"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <button type="button" onClick={() => setInviteOpen(false)} disabled={inviting} className="h-11 rounded-xl border border-[#dfe2ec] px-5 text-sm font-black text-[#596174] transition hover:bg-[#f8f9fc]">{c.cancel}</button>
            <button type="button" onClick={() => void sendInvitation()} disabled={inviting || !inviteEmail.trim()} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#5b35d5] px-5 text-sm font-black text-white transition hover:bg-[#4825bd] disabled:cursor-not-allowed disabled:opacity-50">
              {inviting ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}{c.send}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
