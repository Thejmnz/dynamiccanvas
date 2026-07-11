"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, TriangleAlert, Eye, EyeOff } from "lucide-react";

import { useSignUp } from "@/features/auth/hooks/use-sign-up";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/language-switcher";
import { BrandMark } from "@/components/brand-mark";

export const SignUpCard = () => {
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { t } = useLanguage();
  const { signInWithGoogle } = useAuth();

  const mutation = useSignUp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onGoogleSignUp = () => {
    setLoadingGoogle(true);
    signInWithGoogle();
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
      <Link href="/" aria-label="Dynamic Canvas" className="mx-auto mb-7 flex w-fit">
        <BrandMark className="size-14 text-lg shadow-[5px_5px_0_#c9ff5a]" />
      </Link>

      {/* Card */}
      <div className="rounded-[28px] border-2 border-[#101426] bg-white p-7 shadow-[9px_9px_0_#101426] sm:p-8">
        {/* Header with Language Switcher */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="mb-1 text-2xl font-black text-[#101426]">
              {showSuccess ? t("registration_successful") : t("signup_title")}
            </h1>
            <p className="text-sm text-[#101426]/50">
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
                className="w-full bg-[#5b35d5] font-bold text-white hover:bg-[#101426]"
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

            {/* Social Sign Up */}
            <div className="space-y-3 mb-4">
              <button
                type="button"
                onClick={onGoogleSignUp}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-[#101426]/15 bg-white px-4 py-2.5 text-sm font-bold text-[#101426] transition hover:border-[#101426]/30 hover:bg-[#f6f5ef] disabled:opacity-50"
              >
                {loadingGoogle ? <Loader2 className="size-4 animate-spin" /> : (
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-[#101426]/10" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#101426]/30">or</span>
              <div className="h-px flex-1 bg-[#101426]/10" />
            </div>

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
                  className="border-[#101426]/20 bg-[#f6f5ef] text-[#101426]"
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
                  className="border-[#101426]/20 bg-[#f6f5ef] text-[#101426]"
                />
              </div>
              <div className="relative">
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("password_placeholder")}
                  type={showPassword ? "text" : "password"}
                  disabled={loading || mutation.isPending}
                  required
                  minLength={3}
                  maxLength={20}
                  className="border-[#101426]/20 bg-[#f6f5ef] text-[#101426] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#101426]/40 hover:text-[#101426] transition"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={loading || mutation.isPending}
                className="w-full bg-[#5b35d5] font-bold text-white hover:bg-[#101426]"
              >
                {mutation.isPending ? (
                  <Loader2 className="mr-2 size-5 animate-spin" />
                ) : (
                  t("continue")
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <p className="mt-6 text-center text-sm text-[#101426]/50">
              {t("already_have_account")}{" "}
              <Link href="/sign-in" onClick={() => setLoading(true)}>
                <span className="font-bold text-[#5b35d5] hover:underline">{t("sign_in")}</span>
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
