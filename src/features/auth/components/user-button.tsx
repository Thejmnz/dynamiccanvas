"use client";

import { Loader, LogOut, Settings, Users, Lightbulb, Flag, GitBranch, LifeBuoy, BookOpen, Activity } from "lucide-react";
import { signOut as signOutNextAuth, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export const UserButton = () => {
  const { user, loading: supabaseLoading, logout } = useAuth();
  const { data: session, status: sessionStatus } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const loading = !user && !session?.user && (supabaseLoading || sessionStatus === "loading");

  if (loading) return <Loader className="size-4 animate-spin text-muted-foreground" />;

  const sessionUser = user || session?.user;
  if (!sessionUser) return null;

  const name = user?.user_metadata?.full_name || session?.user?.name || sessionUser.email || "User";
  const email = user?.email || session?.user?.email || "";
  const imageUrl = user?.user_metadata?.avatar_url || session?.user?.image;

  const handleLogout = async () => {
    await Promise.allSettled([logout(), signOutNextAuth({ redirect: false })]);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative">
        <Avatar className="size-10 hover:opacity-75 transition">
          <AvatarImage alt={name} src={imageUrl || ""} />
          <AvatarFallback className="flex items-center justify-center border-2 border-[#101426] bg-[#5b35d5] font-bold text-white">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-0">
        {/* User info header */}
        <div className="px-3 py-3 border-b border-[#101426]/8">
          <div className="flex items-center gap-2.5">
            <Avatar className="size-9 shrink-0">
              <AvatarImage alt={name} src={imageUrl || ""} />
              <AvatarFallback className="flex items-center justify-center border-2 border-[#101426] bg-[#5b35d5] font-bold text-white text-sm">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-sm font-black truncate">{name}</div>
              <div className="text-xs text-[#101426]/50 truncate">{email}</div>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="px-2 pt-2">
          <div className="px-1 text-[10px] font-black uppercase tracking-wider text-[#101426]/35">
            {t("account") || "Account"}
          </div>
          <DropdownMenuItem className="h-9 cursor-pointer rounded-lg" onClick={() => router.push("/dashboard/settings")}>
            <Settings className="size-4 mr-2 text-[#5b35d5]" />
            {t("settings") || "Settings"}
          </DropdownMenuItem>
          <DropdownMenuItem className="h-9 cursor-pointer rounded-lg" onClick={() => router.push("/dashboard/settings#team")}>
            <Users className="size-4 mr-2 text-[#5b35d5]" />
            {t("team_members") || "Team Members"}
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        {/* Feedback */}
        <div className="px-2 pt-1">
          <div className="px-1 text-[10px] font-black uppercase tracking-wider text-[#101426]/35">
            {t("feedback") || "Feedback"}
          </div>
          <DropdownMenuItem className="h-9 cursor-pointer rounded-lg" onClick={() => window.open("mailto:hello@dynamiccanvas.app?subject=Feature%20Suggestion", "_blank")}>
            <Lightbulb className="size-4 mr-2 text-[#5b35d5]" />
            {t("suggest_features") || "Suggest Features"}
          </DropdownMenuItem>
          <DropdownMenuItem className="h-9 cursor-pointer rounded-lg" onClick={() => router.push("/dashboard#roadmap")}>
            <Flag className="size-4 mr-2 text-[#5b35d5]" />
            {t("roadmap") || "Roadmap"}
          </DropdownMenuItem>
          <DropdownMenuItem className="h-9 cursor-pointer rounded-lg" onClick={() => router.push("/dashboard#changelog")}>
            <GitBranch className="size-4 mr-2 text-[#5b35d5]" />
            {t("changelog") || "Changelog"}
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        {/* Support */}
        <div className="px-2 pt-1">
          <div className="px-1 text-[10px] font-black uppercase tracking-wider text-[#101426]/35">
            {t("support") || "Support"}
          </div>
          <DropdownMenuItem className="h-9 cursor-pointer rounded-lg" onClick={() => router.push("/docs")}>
            <BookOpen className="size-4 mr-2 text-[#5b35d5]" />
            {t("knowledge_base") || "Knowledge Base"}
          </DropdownMenuItem>
          <DropdownMenuItem className="h-9 cursor-pointer rounded-lg" onClick={() => window.open("https://status.supabase.com", "_blank")}>
            <Activity className="size-4 mr-2 text-[#5b35d5]" />
            {t("system_status") || "System Status"}
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        {/* Logout */}
        <div className="px-2 pb-2 pt-1">
          <DropdownMenuItem className="h-9 cursor-pointer rounded-lg text-red-600 focus:text-red-700" onClick={handleLogout}>
            <LogOut className="size-4 mr-2" />
            {t("log_out")}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
