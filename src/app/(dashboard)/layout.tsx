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
      <div className="h-full flex items-center justify-center bg-muted">
        <Loader className="animate-spin size-6 text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center bg-muted">
        <Loader className="animate-spin size-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-muted h-full">
      <Sidebar />
      <div className="lg:pl-[300px] flex flex-col h-full">
        <Navbar />
        <main className="bg-white flex-1 overflow-auto p-8 lg:rounded-tl-2xl">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
