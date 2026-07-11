"use client";

import { useUserRole } from "@/hooks/use-user-role";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "lucide-react";

import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isAuthenticated, loading } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="brand-dots min-h-screen flex items-center justify-center">
        <Loader className="animate-spin size-7 text-[#5b35d5]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="brand-dots min-h-screen flex items-center justify-center">
        <Loader className="animate-spin size-7 text-[#5b35d5]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f5ef] text-[#101426]">
      <Sidebar />
      <div className="lg:pl-[280px] flex flex-col min-h-screen">
        <Navbar />
        <main className="brand-dots flex-1 overflow-auto p-5 sm:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
