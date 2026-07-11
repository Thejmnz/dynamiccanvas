"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    const processAuth = async () => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

      if (error || !data.session) {
        // Fallback: try getSession (works for hash-based flow)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace("/dashboard");
          return;
        }
        setError(true);
        setTimeout(() => router.replace("/sign-in"), 2000);
        return;
      }

      router.replace("/dashboard");
    };
    processAuth();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f6f5ef]">
        <p className="text-sm font-bold text-[#101426]/60">Redirecting to sign in...</p>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5b35d5]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f5ef]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b35d5]" />
    </div>
  );
}
