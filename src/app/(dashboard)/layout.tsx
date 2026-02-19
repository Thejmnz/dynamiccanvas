"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "lucide-react";

import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      const timeout = setTimeout(() => {
        router.push("/sign-in");
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader className="animate-spin size-6 text-[#135bec]" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader className="animate-spin size-6 text-[#135bec]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="lg:pl-[300px] flex flex-col min-h-screen">
        <Navbar />
        <main className="bg-slate-50 flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
