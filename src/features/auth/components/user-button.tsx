"use client";

import { Loader, LogOut } from "lucide-react";
import { signOut as signOutNextAuth, useSession } from "next-auth/react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export const UserButton = () => {
  const { user, loading: supabaseLoading, logout } = useAuth();
  const { data: session, status: sessionStatus } = useSession();
  const { t } = useLanguage();
  const loading = !user && !session?.user &&
    (supabaseLoading || sessionStatus === "loading");

  if (loading) {
    return <Loader className="size-4 animate-spin text-muted-foreground" />
  }

  const sessionUser = user || session?.user;

  if (!sessionUser) {
    return null;
  }

  const name = user?.user_metadata?.full_name ||
    session?.user?.name ||
    sessionUser.email ||
    "User";
  const imageUrl = user?.user_metadata?.avatar_url || session?.user?.image;

  const handleLogout = async () => {
    await Promise.allSettled([
      logout(),
      signOutNextAuth({ redirect: false }),
    ]);
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
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem className="h-10" onClick={handleLogout}>
          <LogOut className="size-4 mr-2" />
          {t("log_out")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
