"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAuth } from "@/lib/contexts/AuthContext";

interface UseUserRoleResult {
  role: string | undefined;
  userId: string | undefined;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useUserRole = (): UseUserRoleResult => {
  const { data: session, status: sessionStatus } = useSession();
  const { user, loading: authLoading } = useAuth();
  const [supabaseRole, setSupabaseRole] = useState<string | undefined>(undefined);

  const hasSession = sessionStatus !== "loading" && !!session?.user;
  const supabaseUserId = user?.id;

  // Fetch role from DB only if NextAuth session is unavailable
  useEffect(() => {
    if (hasSession || !supabaseUserId) {
      setSupabaseRole(undefined);
      return;
    }

    let cancelled = false;
    const fetchRole = async () => {
      try {
        const res = await fetch("/api/user-role");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setSupabaseRole(data.role || "user");
          }
        }
      } catch {
        if (!cancelled) setSupabaseRole("user");
      }
    };

    fetchRole();
    return () => { cancelled = true; };
  }, [hasSession, supabaseUserId]);

  if (hasSession) {
    return {
      role: session!.user!.role,
      userId: session!.user!.id,
      isAuthenticated: true,
      loading: false,
    };
  }

  return {
    role: supabaseRole,
    userId: supabaseUserId,
    isAuthenticated: !!user,
    loading: sessionStatus === "loading" || (authLoading) || (!!supabaseUserId && !supabaseRole),
  };
};
