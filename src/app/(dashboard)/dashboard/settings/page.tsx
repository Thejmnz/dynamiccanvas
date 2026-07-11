"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Lock, CreditCard, Sparkles, Loader2, Check,
  Crown, Rocket, Star, Zap, Infinity as InfinityIcon, KeyRound,
  AlertTriangle, RefreshCw,
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
  const { t, language } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

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
        setAvatarUrl(user.user_metadata?.avatar_url || "");
      }
      if (creditsRes) setCredits(creditsRes);
      if (subRes?.data?.active) setHasSubscription(true);
    } catch { } finally { setLoading(false); }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name, avatar_url: avatarUrl },
      });
      if (error) throw error;
      toast.success(language === "es" ? "Perfil actualizado" : "Profile updated");
    } catch (e: any) {
      toast.error(e.message || "Error");
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error(language === "es" ? "Mínimo 6 caracteres" : "Minimum 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(language === "es" ? "Las contraseñas no coinciden" : "Passwords don't match");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success(language === "es" ? "Contraseña actualizada" : "Password updated");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast.error(e.message || "Error");
    } finally { setSaving(false); }
  };

  const handleCancelPlan = async () => {
    try {
      const res = await fetch("/api/subscriptions/billing", { method: "POST" });
      const data = await res.json();
      if (data?.data) window.location.href = data.data;
    } catch {
      toast.error("Error");
    }
  };

  const c = language === "es" ? {
    title: "Ajustes", profile: "Perfil", name: "Nombre", email: "Correo",
    avatar: "URL de foto", save: "Guardar", password: "Contraseña",
    newPassword: "Nueva contraseña", confirmPassword: "Confirmar contraseña",
    change: "Cambiar", plan: "Plan y créditos", currentPlan: "Plan actual",
    credits: "Créditos", templates: "Plantillas", autoRenew: "Auto-renovar",
    autoRenewDesc: "Recarga créditos automáticamente cuando se agoten",
    cancelPlan: "Cancelar plan", upgrade: "Mejorar plan",
    manageBilling: "Gestionar facturación", apiKey: "API Key",
    billingCycle: "Ciclo de facturación", dangerZone: "Zona de peligro",
    noActiveSub: "Sin suscripción activa",
  } : {
    title: "Settings", profile: "Profile", name: "Name", email: "Email",
    avatar: "Avatar URL", save: "Save", password: "Password",
    newPassword: "New password", confirmPassword: "Confirm password",
    change: "Change", plan: "Plan & Credits", currentPlan: "Current plan",
    credits: "Credits", templates: "Templates", autoRenew: "Auto-renew",
    autoRenewDesc: "Automatically reload credits when they run out",
    cancelPlan: "Cancel plan", upgrade: "Upgrade plan",
    manageBilling: "Manage billing", apiKey: "API Key",
    billingCycle: "Billing cycle", dangerZone: "Danger zone",
    noActiveSub: "No active subscription",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-7 animate-spin text-[#5b35d5]" />
      </div>
    );
  }

  const planInfo = credits ? PLAN_INFO[credits.plan] || PLAN_INFO.free : PLAN_INFO.free;
  const PlanIcon = planInfo.icon;
  const isUnlimited = credits?.plan === "unlimited" || (credits?.creditsPerMonth ?? 0) >= 999999999;

  return (
    <div className="mx-auto max-w-3xl pb-10 pt-6 space-y-6">
      <div>
        <h1 className="text-4xl font-black tracking-tight">{c.title}</h1>
      </div>

      {/* Profile */}
      <section className="rounded-[22px] border-2 border-[#101426] bg-white p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="size-5 text-[#5b35d5]" />
          <h2 className="text-lg font-black">{c.profile}</h2>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div className="size-16 rounded-full bg-gradient-to-br from-[#5b35d5] to-[#c9ff5a] flex items-center justify-center text-white font-black text-2xl shrink-0">
            {name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="text-lg font-black">{name || "—"}</div>
            <div className="text-sm text-[#101426]/50">{email}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-[#101426]/50 block mb-1">{c.name}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-[#101426]/15 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#5b35d5] focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#101426]/50 block mb-1">{c.email}</label>
            <input
              value={email} disabled
              className="w-full border-2 border-[#101426]/10 rounded-xl px-3 py-2.5 text-sm font-medium bg-[#101426]/3 text-[#101426]/40"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-[#101426] text-white px-5 py-2.5 text-sm font-black transition hover:bg-[#5b35d5] disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            {c.save}
          </button>
        </div>
      </section>

      {/* Password */}
      <section className="rounded-[22px] border-2 border-[#101426] bg-white p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="size-5 text-[#5b35d5]" />
          <h2 className="text-lg font-black">{c.password}</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-[#101426]/50 block mb-1">{c.newPassword}</label>
            <input
              type="password" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border-2 border-[#101426]/15 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#5b35d5]"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#101426]/50 block mb-1">{c.confirmPassword}</label>
            <input
              type="password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border-2 border-[#101426]/15 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#5b35d5]"
            />
          </div>
        </div>
        {newPassword && (
          <button
            onClick={handleChangePassword}
            disabled={saving}
            className="mt-4 flex items-center gap-2 rounded-full bg-[#101426] text-white px-5 py-2.5 text-sm font-black transition hover:bg-[#5b35d5] disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
            {c.change}
          </button>
        )}
      </section>

      {/* Plan & Credits */}
      <section className="rounded-[22px] border-2 border-[#101426] bg-white p-6">
        <div className="flex items-center gap-2 mb-5">
          <CreditCard className="size-5 text-[#5b35d5]" />
          <h2 className="text-lg font-black">{c.plan}</h2>
        </div>

        {credits && (
          <div className="flex items-center justify-between rounded-xl border-2 border-[#101426]/10 bg-[#101426]/3 p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-[#101426] flex items-center justify-center">
                <PlanIcon className={`size-5 ${planInfo.color}`} />
              </div>
              <div>
                <div className="font-black">{planInfo.label}</div>
                <div className="text-xs text-[#101426]/50">
                  {isUnlimited ? "∞" : `${credits.creditsBalance.toLocaleString()} ${c.credits}`} · {credits.templateCount}/{credits.templateLimit === Infinity ? "∞" : credits.templateLimit} {c.templates}
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard/pricing")}
              className="flex items-center gap-1.5 rounded-full bg-[#c9ff5a] border-2 border-[#101426] px-4 py-2 text-xs font-black hover:bg-white transition"
            >
              <Sparkles className="size-3.5" />{c.upgrade}
            </button>
          </div>
        )}

        {/* Auto-renew toggle */}
        {hasSubscription && (
          <label className="flex items-center justify-between rounded-xl border-2 border-[#101426]/10 p-4 cursor-pointer hover:bg-[#101426]/3 transition">
            <div>
              <div className="text-sm font-black flex items-center gap-2">
                <RefreshCw className="size-4 text-[#5b35d5]" />
                {c.autoRenew}
              </div>
              <div className="text-xs text-[#101426]/50 mt-0.5">{c.autoRenewDesc}</div>
            </div>
            <div className="relative">
              <input type="checkbox" className="sr-only peer" defaultChecked={false} />
              <div className="w-11 h-6 bg-[#101426]/15 rounded-full peer-checked:bg-[#5b35d5] transition" />
              <div className="absolute left-1 top-1 size-4 bg-white rounded-full transition peer-checked:translate-x-5" />
            </div>
          </label>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-3">
          {hasSubscription && (
            <>
              <button
                onClick={handleCancelPlan}
                className="flex items-center gap-1.5 rounded-full bg-[#ffb7aa] border-2 border-[#101426] px-4 py-2 text-xs font-black text-[#101426] hover:bg-[#ff6b57] hover:text-white transition"
              >
                <AlertTriangle className="size-3.5" />{c.cancelPlan}
              </button>
            </>
          )}
          <button
            onClick={() => router.push("/api-key")}
            className="flex items-center gap-1.5 rounded-full bg-white border-2 border-[#101426]/20 px-4 py-2 text-xs font-black hover:bg-[#101426]/5 transition"
          >
            <KeyRound className="size-3.5" />{c.apiKey}
          </button>
        </div>
      </section>
    </div>
  );
}
