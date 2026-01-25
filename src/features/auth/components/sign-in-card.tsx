"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn as signInWithNextAuth } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Loader2, TriangleAlert } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardTitle, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/language-switcher";
import { toast } from "sonner";

export const SignInCard = () => {
  const { signIn, signInWithGoogle } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
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

      // Also sign in to NextAuth to establish server session
      const result = await signInWithNextAuth("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success(t("logged_in"));
      router.push("/");
    } catch (err) {
      toast.error(t("invalid_credentials"));
      setLoading(false);
      setLoadingLogin(false);
    }
  };

  const onProviderSignIn = async (provider: "github" | "google") => {
    setLoading(true);
    if (provider === "google") {
      setLoadingGoogle(true);
      try {
        await signInWithGoogle();
      } catch (err) {
        setLoading(false);
        setLoadingGoogle(false);
      }
    }
    // Github not implemented yet in this context
  };

  return (
    <Card className="w-full h-full p-8 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <CardHeader className="px-0 pt-0">
        <CardTitle>{t("login_title")}</CardTitle>
        <CardDescription>{t("login_subtitle")}</CardDescription>
      </CardHeader>
      {!!error && (
        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
          <TriangleAlert className="size-4" />
          <p>{t("invalid_credentials")}</p>
        </div>
      )}
      <CardContent className="space-y-5 px-0 pb-0">
        <form onSubmit={onCredentialSignIn} className="space-y-2.5">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("email_placeholder")}
            type="email"
            disabled={loading || loadingLogin}
            required
          />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("password_placeholder")}
            type="password"
            disabled={loading || loadingLogin}
            required
          />
          <Button className="w-full" type="submit" size="lg" disabled={loading}>
            {loadingLogin ? (
              <Loader2 className="mr-2 size-5 top-2.5 left-2.5 animate-spin" />
            ) : (
              t("continue")
            )}
          </Button>
        </form>
        {/* Social login buttons - Hidden for now, uncomment to enable
        <Separator />
        <div className="flex flex-col gap-y-2.5">
          <Button
            onClick={() => onProviderSignIn("google")}
            size="lg"
            variant="outline"
            className="w-full relative"
            disabled={loading}
          >
            {loadingGoogle ? (
              <Loader2 className="mr-2 size-5 top-2.5 left-2.5 absolute animate-spin" />
            ) : (
              <FcGoogle className="mr-2 size-5 top-2.5 left-2.5 absolute" />
            )}
            Continue with Google
          </Button>
          <Button
            onClick={() => onProviderSignIn("github")}
            size="lg"
            variant="outline"
            disabled={true} // Disabled Github
            className="w-full relative opacity-50 cursor-not-allowed"
            title="Github login not configured"
          >
            <FaGithub className="mr-2 size-5 top-2.5 left-2.5 absolute" />
            Continue with Github
          </Button>
        </div>
        */}
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" onClick={() => setLoading(true)}>
            <span className="text-sky-700 hover:underline">Sign up</span>
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};
