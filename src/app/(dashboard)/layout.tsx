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

  return (
    <div className="min-h-screen bg-[#f6f5ef] text-[#101426]">
      <Sidebar />
      <div className="lg:pl-[230px] flex flex-col min-h-screen">
        <Navbar />
        <main className="brand-dots flex-1 overflow-auto px-5 pb-5 pt-3 sm:px-8 sm:pb-8 sm:pt-4 lg:px-10 lg:pb-10 lg:pt-5">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
