"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, TriangleAlert } from "lucide-react";

import { useSignUp } from "@/features/auth/hooks/use-sign-up";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/language-switcher";

export const SignUpCard = () => {
  const [loading, setLoading] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { t } = useLanguage();

  const mutation = useSignUp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onProviderSignUp = (provider: "github" | "google") => {
    setLoading(true);
    setLoadingGithub(provider === "github");
    setLoadingGoogle(provider === "google");

    signIn(provider, { callbackUrl: "/" });
  };

  const onCredentialSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    mutation.mutate(
      {
        name,
        email,
        password,
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center gap-2 mb-8 cursor-pointer">
        <div className="w-10 h-10 bg-[#135bec] rounded-lg flex items-center justify-center text-white font-bold text-base">
          DC
        </div>
        <span className="text-2xl font-extrabold tracking-tight text-white">Dynamic Canvas</span>
      </Link>

      {/* Card */}
      <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-8">
        {/* Header with Language Switcher */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">
              {showSuccess ? t("registration_successful") : t("signup_title")}
            </h1>
            <p className="text-slate-400 text-sm">
              {showSuccess ? t("check_email_confirm") : t("signup_subtitle")}
            </p>
          </div>
          <LanguageSwitcher />
        </div>

        {showSuccess ? (
          <>
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg mb-6">
              <p className="text-sm text-green-400">
                {t("confirmation_email_sent")} <strong className="text-white">{email}</strong>. {t("check_inbox_activate")}
              </p>
            </div>
            <Link href="/sign-in" className="block">
              <Button
                size="lg"
                className="w-full bg-[#135bec] hover:bg-[#135bec]/90 text-white font-bold shadow-lg shadow-[#135bec]/20"
              >
                {t("go_to_signin")}
              </Button>
            </Link>
          </>
        ) : (
          <>
            {/* Error Message */}
            {!!mutation.error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-x-2 text-sm text-red-400 mb-6">
                <TriangleAlert className="size-4" />
                <p>{mutation.error.message}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={onCredentialSignUp} className="space-y-4">
              <div>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("fullname_placeholder")}
                  type="text"
                  disabled={loading || mutation.isPending}
                  required
                  className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-[#135bec]"
                />
              </div>
              <div>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("email_placeholder")}
                  type="email"
                  disabled={loading || mutation.isPending}
                  required
                  className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-[#135bec]"
                />
              </div>
              <div>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("password_placeholder")}
                  type="password"
                  disabled={loading || mutation.isPending}
                  required
                  minLength={3}
                  maxLength={20}
                  className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-[#135bec]"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={loading || mutation.isPending}
                className="w-full bg-[#135bec] hover:bg-[#135bec]/90 text-white font-bold shadow-lg shadow-[#135bec]/20"
              >
                {mutation.isPending ? (
                  <Loader2 className="mr-2 size-5 animate-spin" />
                ) : (
                  t("continue")
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <p className="text-sm text-slate-400 mt-6 text-center">
              {t("already_have_account")}{" "}
              <Link href="/sign-in" onClick={() => setLoading(true)}>
                <span className="text-[#135bec] hover:underline font-semibold">{t("sign_in")}</span>
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
