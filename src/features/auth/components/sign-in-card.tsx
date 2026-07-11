"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn as signInWithNextAuth } from "next-auth/react";
import { Loader2, TriangleAlert } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/language-switcher";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand-mark";

export const SignInCard = () => {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const params = useSearchParams();
  const error = params.get("error");

  const onCredentialSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setLoadingLogin(true);

    try {
      // 1. Sign in with Supabase (sets Supabase session cookie)
      await signIn(email, password);

      // 2. Sign in with NextAuth (creates JWT session + fetches role from DB)
      const result = await signInWithNextAuth("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success(t("logged_in"));
      router.push("/dashboard");
    } catch (err) {
      toast.error(t("invalid_credentials"));
      setLoading(false);
      setLoadingLogin(false);
    }
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
            <h1 className="mb-1 text-2xl font-black text-[#101426]">{t("login_title")}</h1>
            <p className="text-sm text-[#101426]/50">{t("login_subtitle")}</p>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Error Message */}
        {!!error && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-x-2 text-sm text-red-400 mb-6">
            <TriangleAlert className="size-4" />
            <p>{t("invalid_credentials")}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={onCredentialSignIn} className="space-y-4">
          <div>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("email_placeholder")}
              type="email"
              disabled={loading || loadingLogin}
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
              disabled={loading || loadingLogin}
              required
              className="border-[#101426]/20 bg-[#f6f5ef] text-[#101426]"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full bg-[#5b35d5] font-bold text-white hover:bg-[#101426]"
          >
            {loadingLogin ? (
              <Loader2 className="mr-2 size-5 animate-spin" />
            ) : (
              t("continue")
            )}
          </Button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-sm text-[#101426]/50">
          {t("no_account")}{" "}
          <Link href="/sign-up" onClick={() => setLoading(true)}>
            <span className="font-bold text-[#5b35d5] hover:underline">{t("sign_up")}</span>
          </Link>
        </p>
      </div>
    </div>
  );
};
