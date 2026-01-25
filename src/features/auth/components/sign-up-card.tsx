"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Loader2, TriangleAlert } from "lucide-react";

import { useSignUp } from "@/features/auth/hooks/use-sign-up";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardTitle, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
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
    <Card className="w-full h-full p-8 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <CardHeader className="px-0 pt-0">
        <CardTitle>{showSuccess ? t("registration_successful") : t("signup_title")}</CardTitle>
        <CardDescription>
          {showSuccess ? t("check_email_confirm") : t("signup_subtitle")}
        </CardDescription>
      </CardHeader>

      {showSuccess ? (
        <CardContent className="space-y-5 px-0 pb-0">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200 mb-4">
              {t("confirmation_email_sent")} <strong>{email}</strong>. {t("check_inbox_activate")}
            </p>
          </div>
          <Link href="/sign-in" className="w-full block">
            <Button className="w-full" size="lg">
              {t("go_to_signin")}
            </Button>
          </Link>
        </CardContent>
      ) : (
        <>
          {!!mutation.error && (
            <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
              <TriangleAlert className="size-4" />
              <p>{mutation.error.message}</p>
            </div>
          )}
          <CardContent className="space-y-5 px-0 pb-0">
            <form onSubmit={onCredentialSignUp} className="space-y-2.5">
              <Input
                disabled={mutation.isPending || loading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("fullname_placeholder")}
                type="text"
                required
              />
              <Input
                disabled={mutation.isPending || loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("email_placeholder")}
                type="email"
                required
              />
              <Input
                disabled={mutation.isPending || loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("password_placeholder")}
                type="password"
                required
                minLength={3}
                maxLength={20}
              />
              <Button
                className="w-full"
                type="submit"
                size="lg"
                disabled={loading || mutation.isPending}
              >
                {mutation.isPending ? (
                  <Loader2 className="mr-2 size-5 top-2.5 left-2.5 animate-spin" />
                ) : (
                  t("continue")
                )}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/sign-in" onClick={() => setLoading(true)}>
                <span className="text-sky-700 hover:underline">Sign in</span>
              </Link>
            </p>
          </CardContent>
        </>
      )}
    </Card>
  );
};
