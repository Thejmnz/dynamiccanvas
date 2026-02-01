"use client";

import { Home, Code } from "lucide-react";
import { usePathname } from "next/navigation";

import { SidebarItem } from "./sidebar-item";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export const SidebarRoutes = () => {
  const { t } = useLanguage();
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-y-4 flex-1">
      <ul className="flex flex-col gap-y-1 px-3">
        <SidebarItem href="/" icon={Home} label={t("home")} isActive={pathname === "/"} />
        <SidebarItem href="/api-integration" icon={Code} label={t("api_integration")} isActive={pathname === "/api-integration"} />
      </ul>
    </div>
  );
};
