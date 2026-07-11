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
import { BrandMark } from "@/components/brand-mark";

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

  const onProviderSignUp = async (provider: "github" | "google") => {
    setLoading(true);
    setLoadingGithub(provider === "github");
    setLoadingGoogle(provider === "google");

    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch {
      setLoading(false);
      setLoadingGithub(false);
      setLoadingGoogle(false);
    }
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
                  className="border-[#101426]/20 bg-[#f6f5ef] text-[#101426]"
                />
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
