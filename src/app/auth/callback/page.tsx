"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    let done = false;
    let timeout: ReturnType<typeof setTimeout>;

    // Listen for the session to be established
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (done) return;
      if (session) {
        done = true;
        clearTimeout(timeout);
        router.replace("/dashboard");
      }
    });

    // Also check if session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (done) return;
      if (session) {
        done = true;
        clearTimeout(timeout);
        router.replace("/dashboard");
      }
    });

    // Timeout after 8s → redirect to sign-in
    timeout = setTimeout(() => {
      if (!done) {
        done = true;
        setStatus("error");
        setTimeout(() => router.replace("/sign-in"), 1500);
      }
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f6f5ef]">
      {status === "loading" ? (
        <>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b35d5]" />
          <p className="text-sm font-bold text-[#101426]/50">Signing you in...</p>
        </>
      ) : (
        <p className="text-sm font-bold text-[#101426]/50">Redirecting to sign in...</p>
      )}
    </div>
  );
}
