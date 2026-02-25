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
      await signIn(email, password);

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
            <h1 className="text-xl font-bold text-white mb-1">{t("login_title")}</h1>
            <p className="text-slate-400 text-sm">{t("login_subtitle")}</p>
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
              className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-[#135bec]"
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
              className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-[#135bec]"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full bg-[#135bec] hover:bg-[#135bec]/90 text-white font-bold shadow-lg shadow-[#135bec]/20"
          >
            {loadingLogin ? (
              <Loader2 className="mr-2 size-5 animate-spin" />
            ) : (
              t("continue")
            )}
          </Button>
        </form>

        {/* Sign Up Link */}
        <p className="text-sm text-slate-400 mt-6 text-center">
          {t("no_account")}{" "}
          <Link href="/sign-up" onClick={() => setLoading(true)}>
            <span className="text-[#135bec] hover:underline font-semibold">{t("sign_up")}</span>
          </Link>
        </p>
      </div>
    </div>
  );
};
