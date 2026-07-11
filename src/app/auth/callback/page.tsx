"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const processAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/dashboard");
      } else {
        router.replace("/sign-in");
      }
    };
    processAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f5ef]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b35d5]" />
    </div>
  );
}
