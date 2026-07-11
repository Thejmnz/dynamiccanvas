"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Lock, CreditCard, Sparkles, Loader2, Check,
  Crown, Rocket, Star, Zap, Infinity as InfinityIcon, KeyRound,
  AlertTriangle, RefreshCw, Shield, Users, TrendingUp, FileText, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const PLAN_INFO: Record<string, { label: string; icon: any; color: string }> = {
  free: { label: "Free", icon: Zap, color: "text-white/60" },
  creator: { label: "Starter", icon: Star, color: "text-blue-400" },
  agency: { label: "Scale", icon: Rocket, color: "text-purple-400" },
  business: { label: "Enterprise", icon: Crown, color: "text-amber-400" },
  unlimited: { label: "Unlimited", icon: InfinityIcon, color: "text-[#c9ff5a]" },
};

interface UserCredits {
  plan: string;
  creditsBalance: number;
  creditsPerMonth: number;
  totalCredits: number;
  usedCredits: number;
  templateCount: number;
  templateLimit: number;
}

export default function SettingsPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [{ data: { user } }, creditsRes, subRes] = await Promise.all([
        supabase.auth.getUser(),
        fetch("/api/user-credits").then((r) => r.ok ? r.json() : null),
        fetch("/api/subscriptions/current").then((r) => r.ok ? r.json() : null).catch(() => null),
      ]);
      if (user) {
        setName(user.user_metadata?.name || user.email?.split("@")[0] || "");
        setEmail(user.email || "");
      }
      if (creditsRes) setCredits(creditsRes);
      if (subRes?.data?.active) setHasSubscription(true);
    } catch { } finally { setLoading(false); }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { name } });
      if (error) throw error;
      toast.success(language === "es" ? "Perfil actualizado" : "Profile updated");
    } catch (e: any) { toast.error(e.message || "Error"); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast.error(language === "es" ? "Mínimo 6 caracteres" : "Minimum 6 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error(language === "es" ? "No coinciden" : "Passwords don't match"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success(language === "es" ? "Contraseña actualizada" : "Password updated");
      setNewPassword(""); setConfirmPassword("");
    } catch (e: any) { toast.error(e.message || "Error"); }
    finally { setSaving(false); }
  };

  const handleManageBilling = async () => {
    try {
      const res = await fetch("/api/subscriptions/billing", { method: "POST" });
      const data = await res.json();
      if (data?.data) window.location.href = data.data;
    } catch { toast.error("Error"); }
  };

  const c = language === "es" ? {
    title: "Ajustes de cuenta", subscription: "Suscripción",
    subDesc: "Administra tu plan y facturación",
    profile: "Información del perfil", profileDesc: "Administra los detalles de tu cuenta",
    name: "Nombre", email: "Correo", teamRole: "Rol", owner: "Propietario",
    save: "Guardar", password: "Contraseña", newPassword: "Nueva contraseña",
    confirmPassword: "Confirmar contraseña", change: "Cambiar contraseña",
    credits: "Créditos y límites", creditsDesc: "Seguimiento de créditos y límites de plantillas",
    creditsUsed: "créditos usados", of: "de", templatesCreated: "plantillas creadas",
    upgradePrompt: "Mejora a un plan pago para obtener más créditos.",
    upgrade: "Mejorar plan", manageBilling: "Gestionar facturación", cancelPlan: "Cancelar plan",
    billing: "Historial de facturación", billingDesc: "Consulta facturas y recibos de pago",
    noInvoices: "No hay facturas todavía.", apiKey: "API Key",
    autoRenew: "Auto-renovar", autoRenewDesc: "Recarga créditos automáticamente cuando se agoten",
  } : {
    title: "Account Settings", subscription: "Subscription",
    subDesc: "Manage your plan and billing",
    profile: "Profile Information", profileDesc: "Manage your account details",
    name: "Name", email: "Email", teamRole: "Team Role", owner: "Owner",
    save: "Save", password: "Password", newPassword: "New password",
    confirmPassword: "Confirm password", change: "Change password",
    credits: "Credits & Limits", creditsDesc: "Track your credits usage and template limits for your plan",
    creditsUsed: "credits used", of: "of", templatesCreated: "templates created",
    upgradePrompt: "Upgrade to a paid plan to get more credits.",
    upgrade: "Upgrade plan", manageBilling: "Manage billing", cancelPlan: "Cancel plan",
    billing: "Billing History", billingDesc: "View your past invoices and payment receipts",
    noInvoices: "No invoices yet.", apiKey: "API Key",
    autoRenew: "Auto-renew", autoRenewDesc: "Automatically reload credits when they run out",
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="size-7 animate-spin text-[#5b35d5]" /></div>;
  }

  const planInfo = credits ? PLAN_INFO[credits.plan] || PLAN_INFO.free : PLAN_INFO.free;
  const PlanIcon = planInfo.icon;
  const isUnlimited = credits?.plan === "unlimited" || (credits?.creditsPerMonth ?? 0) >= 999999999;
  const creditsPct = credits && credits.totalCredits > 0 ? Math.round((credits.usedCredits / credits.totalCredits) * 100) : 0;
  const templatesPct = credits && credits.templateLimit !== Infinity ? Math.round((credits.templateCount / credits.templateLimit) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl pb-10 pt-6 space-y-5">
      <h1 className="text-3xl font-black tracking-tight">{c.title}</h1>

      {/* Subscription */}
      <Card icon={CreditCard} title={c.subscription} desc={c.subDesc}>
        <div className="flex items-center justify-between rounded-xl border-2 border-[#101426]/10 bg-[#101426]/3 p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-[#101426] flex items-center justify-center">
              <PlanIcon className={`size-5 ${planInfo.color}`} />
            </div>
            <div>
              <div className="font-black">{planInfo.label}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push("/dashboard/pricing")} className="flex items-center gap-1.5 rounded-full bg-[#c9ff5a] border-2 border-[#101426] px-4 py-2 text-xs font-black hover:bg-white transition">
              <Sparkles className="size-3.5" />{c.upgrade}
            </button>
            {hasSubscription && (
              <button onClick={handleManageBilling} className="flex items-center gap-1.5 rounded-full bg-white border-2 border-[#101426]/15 px-4 py-2 text-xs font-black hover:bg-[#101426]/5 transition">
                <FileText className="size-3.5" />{c.manageBilling}
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Profile */}
      <Card icon={User} title={c.profile} desc={c.profileDesc}>
        <div className="flex items-center gap-4 mb-5">
          <div className="size-14 rounded-full bg-gradient-to-br from-[#5b35d5] to-[#c9ff5a] flex items-center justify-center text-white font-black text-xl shrink-0">
            {name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase()}
          </div>
          <button className="text-xs font-bold text-[#5b35d5] hover:underline">
            {language === "es" ? "Cambiar foto" : "Change photo"}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-[#101426]/50 block mb-1">{c.name}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border-2 border-[#101426]/15 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#5b35d5] focus:border-transparent" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#101426]/50 block mb-1">{c.email}</label>
            <input value={email} disabled className="w-full border-2 border-[#101426]/10 rounded-xl px-3 py-2.5 text-sm bg-[#101426]/3 text-[#101426]/40" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#101426]/50 block mb-1">{c.teamRole}</label>
            <div className="flex items-center gap-2 border-2 border-[#101426]/10 rounded-xl px-3 py-2.5 text-sm bg-[#101426]/3">
              <Shield className="size-4 text-[#5b35d5]" /><span className="font-bold">{c.owner}</span>
            </div>
          </div>
        </div>

        <button onClick={handleSaveProfile} disabled={saving} className="mt-4 flex items-center gap-2 rounded-full bg-[#101426] text-white px-5 py-2.5 text-sm font-black hover:bg-[#5b35d5] disabled:opacity-50">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}{c.save}
        </button>

        {/* Password */}
        <div className="mt-6 pt-5 border-t border-[#101426]/8">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="size-4 text-[#5b35d5]" />
            <span className="text-sm font-black">{c.password}</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <input type="password" placeholder={c.newPassword} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="border-2 border-[#101426]/15 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5b35d5]" />
            <input type="password" placeholder={c.confirmPassword} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="border-2 border-[#101426]/15 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5b35d5]" />
          </div>
          {newPassword && (
            <button onClick={handleChangePassword} disabled={saving} className="mt-3 flex items-center gap-2 rounded-full bg-[#101426] text-white px-5 py-2.5 text-sm font-black hover:bg-[#5b35d5] disabled:opacity-50">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}{c.change}
            </button>
          )}
        </div>
      </Card>

      {/* Credits & Limits */}
      <Card icon={TrendingUp} title={c.credits} desc={c.creditsDesc}>
        {credits && (
          <div className="space-y-4">
            {!isUnlimited && (
              <UsageBar
                label={`${credits.usedCredits.toLocaleString()} ${c.of} ${credits.totalCredits.toLocaleString()} ${c.creditsUsed}`}
                pct={creditsPct}
              />
            )}
            {isUnlimited && (
              <div className="flex items-center gap-2 rounded-xl bg-[#5b35d5]/10 border-2 border-[#5b35d5]/20 p-3">
                <InfinityIcon className="size-5 text-[#5b35d5]" />
                <span className="text-sm font-black">{language === "es" ? "Créditos ilimitados" : "Unlimited credits"}</span>
              </div>
            )}
            <UsageBar
              label={`${credits.templateCount} ${c.of} ${credits.templateLimit === Infinity ? "∞" : credits.templateLimit} ${c.templatesCreated}`}
              pct={templatesPct}
            />
            {credits.plan === "free" && <p className="text-xs text-[#101426]/50">{c.upgradePrompt}</p>}
          </div>
        )}

        {/* Auto-renew */}
        {hasSubscription && (
          <label className="mt-4 flex items-center justify-between rounded-xl border-2 border-[#101426]/10 p-3 cursor-pointer hover:bg-[#101426]/3 transition">
            <div className="flex items-center gap-2">
              <RefreshCw className="size-4 text-[#5b35d5]" />
              <div>
                <div className="text-sm font-bold">{c.autoRenew}</div>
                <div className="text-[11px] text-[#101426]/50">{c.autoRenewDesc}</div>
              </div>
            </div>
            <div className="relative">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-[#101426]/15 rounded-full peer-checked:bg-[#5b35d5] transition" />
              <div className="absolute left-1 top-1 size-4 bg-white rounded-full transition peer-checked:translate-x-5" />
            </div>
          </label>
        )}
      </Card>

      {/* Billing History */}
      <Card icon={FileText} title={c.billing} desc={c.billingDesc}>
        {hasSubscription ? (
          <button onClick={handleManageBilling} className="flex items-center gap-2 text-sm font-bold text-[#5b35d5] hover:underline">
            <ExternalLink className="size-4" />{c.manageBilling}
          </button>
        ) : (
          <p className="text-sm text-[#101426]/40">{c.noInvoices}</p>
        )}
      </Card>
    </div>
  );
}

function Card({ icon: Icon, title, desc, children }: { icon: any; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[22px] border-2 border-[#101426] bg-white p-5 sm:p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-[#5b35d5]" />
          <h2 className="text-base font-black">{title}</h2>
        </div>
        <p className="text-xs text-[#101426]/45 mt-0.5 ml-6">{desc}</p>
      </div>
      {children}
    </section>
  );
}

function UsageBar({ label, pct }: { label: string; pct: number }) {
  const color = pct >= 100 ? "bg-[#ff6b57]" : pct >= 80 ? "bg-[#ffd166]" : "bg-[#c9ff5a]";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-[#101426]/60">{label}</span>
        <span className="text-xs font-black text-[#101426]/40">{Math.min(pct, 999)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#101426]/8">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}
