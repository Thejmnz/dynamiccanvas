"use client";

import { Loader, LogOut } from "lucide-react";

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
  const { user, loading, logout } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return <Loader className="size-4 animate-spin text-muted-foreground" />
  }

  if (!user) {
    return null;
  }

  const name = user.user_metadata?.full_name || user.email || "User";
  const imageUrl = user.user_metadata?.avatar_url;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative">
        <Avatar className="size-10 hover:opcaity-75 transition">
          <AvatarImage alt={name} src={imageUrl || ""} />
          <AvatarFallback className="bg-blue-500 font-medium text-white flex items-center justify-center">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem className="h-10" onClick={() => logout()}>
          <LogOut className="size-4 mr-2" />
          {t("log_out")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
