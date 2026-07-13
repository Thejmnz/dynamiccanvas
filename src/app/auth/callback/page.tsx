"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn as signInWithNextAuth } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";
import { BrandLoading } from "@/components/brand-loading";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    const finishSignIn = async () => {
      try {
        const code = new URLSearchParams(window.location.search).get("code");
        let { data: { session } } = await supabase.auth.getSession();

        if (!session && code) {
          const exchanged = await supabase.auth.exchangeCodeForSession(code);
          if (exchanged.error) throw exchanged.error;
          session = exchanged.data.session;
        }

        if (!session?.access_token) {
          throw new Error("Supabase did not return an OAuth session");
        }

        const result = await signInWithNextAuth("supabase-token", {
          accessToken: session.access_token,
          redirect: false,
        });
        if (result?.error) throw new Error(result.error);
        if (!cancelled) {
          router.replace("/dashboard");
          router.refresh();
        }
      } catch (error) {
        console.error("Google OAuth callback failed:", error);
        if (!cancelled) {
          setStatus("error");
          window.setTimeout(() => router.replace("/sign-in?error=OAuthCallback"), 1500);
        }
      }
    };

    void finishSignIn();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f6f5ef]">
      {status === "loading" ? <BrandLoading fullScreen label="" /> : (
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm font-bold text-[#101426]/50">Redirecting to sign in...</p>
        </div>
      )}
    </div>
  );
}
