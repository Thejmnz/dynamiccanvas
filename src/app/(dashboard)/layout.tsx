"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { BrandLoading } from "@/components/brand-loading";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useUserCredits } from "@/hooks/use-user-credits";

import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { DashboardOnboarding } from "./dashboard-onboarding";

interface DashboardLayoutProps {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, loading: supabaseLoading } = useAuth();
  const { data: session, status: sessionStatus } = useSession();
  const loading = supabaseLoading || sessionStatus === "loading";
  const isAuthenticated = Boolean(user || session?.user);
  const router = useRouter();
  const pathname = usePathname();
  const isDashboardHome = pathname === "/dashboard";
  const projectsQuery = useGetProjects(isDashboardHome && isAuthenticated);
  const creditsQuery = useUserCredits(isAuthenticated);
  const dashboardDataLoading = isAuthenticated && (
    creditsQuery.isPending || (isDashboardHome && projectsQuery.isPending)
  );
  const onboardingUserId = user?.id || session?.user?.email || "session-user";
  const onboardingUserName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || session?.user?.name
    || session?.user?.email?.split("@")[0]
    || null;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || dashboardDataLoading) {
    return (
      <BrandLoading fullScreen label="" />
    )
  }

  if (!isAuthenticated) {
    return (
      <BrandLoading fullScreen label="" />
    );
  }

  if (
    pathname === "/feedback"
    || pathname.startsWith("/feedback/")
    || pathname === "/roadmap"
    || pathname.startsWith("/roadmap/")
    || pathname === "/changelog"
    || pathname.startsWith("/changelog/")
  ) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] text-[#101426]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafe] text-[#101426]">
      <Sidebar />
      <div className="lg:pl-[250px] flex flex-col min-h-screen">
        <Navbar />
        <main className={`${isDashboardHome ? "dashboard-tech-grid-light" : "modern-app-background"} flex-1 overflow-auto px-5 pb-5 pt-3 sm:px-8 sm:pb-8 sm:pt-4 lg:px-10 lg:pb-10 lg:pt-5`}>
          {children}
        </main>
      </div>
      <DashboardOnboarding
        enabled={isDashboardHome}
        userId={onboardingUserId}
        userName={onboardingUserName}
        userCreatedAt={user?.created_at}
        onboardingCompleted={user?.user_metadata?.onboarding_completed}
      />
    </div>
  );
};

export default DashboardLayout;
