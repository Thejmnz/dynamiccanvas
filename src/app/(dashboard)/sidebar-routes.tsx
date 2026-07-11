"use client";

import { Home, Code, Shield, KeyRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { SidebarItem } from "./sidebar-item";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { CreateTemplateModal } from "./create-template-modal";
import { useUserRole } from "@/hooks/use-user-role";

export const SidebarRoutes = () => {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { role } = useUserRole();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col flex-1 px-3 pt-4">
      <ul className="flex flex-col gap-y-1">
        {/* Create Template Button */}
        <li>
          <CreateTemplateModal />
        </li>

        <SidebarItem
          href="/dashboard"
          icon={Home}
          label={t("home")}
          isActive={pathname === "/dashboard"}
        />
        <SidebarItem
          href="/api-key"
          icon={KeyRound}
          label={t("api_key")}
          isActive={pathname === "/api-key"}
        />
        <SidebarItem
          href="/playground"
          icon={Code}
          label={t("api_integration")}
          isActive={pathname === "/playground"}
        />

        {/* Admin button - only visible for superadmins */}
        {role === "superadmin" && (
          <SidebarItem
            href="/admin"
            icon={Shield}
            label={t("admin")}
            isActive={pathname === "/admin"}
          />
        )}
      </ul>
    </div>
  );
};
