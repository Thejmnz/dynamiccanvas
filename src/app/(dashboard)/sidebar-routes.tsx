"use client";

import { Home, Code, Shield, KeyRound, BookOpen, Images, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { SidebarItem } from "./sidebar-item";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { CreateTemplateModal } from "./create-template-modal";
import { useUserRole } from "@/hooks/use-user-role";
import {
  adminOverviewQueryKey,
  apiKeyQueryKey,
  fetchAdminOverview,
  fetchOrCreateApiKey,
  fetchPlaygroundTemplates,
  fetchRenders,
  playgroundTemplatesQueryKey,
  rendersQueryKey,
} from "@/features/dashboard/api/dashboard-prefetch";

export const SidebarRoutes = () => {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const { role, userId } = useUserRole();
  const queryClient = useQueryClient();

  const prefetchApiKey = () => {
    if (!userId) return;
    void queryClient.prefetchQuery({
      queryKey: apiKeyQueryKey(userId),
      queryFn: () => fetchOrCreateApiKey(userId),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchPlayground = () => {
    if (!userId) return;
    prefetchApiKey();
    void queryClient.prefetchQuery({
      queryKey: playgroundTemplatesQueryKey(userId),
      queryFn: () => fetchPlaygroundTemplates(userId),
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchRenders = () => {
    if (!userId) return;
    void queryClient.prefetchQuery({
      queryKey: rendersQueryKey(userId),
      queryFn: fetchRenders,
      staleTime: 60 * 1000,
    });
  };

  const openSupportChat = () => {
    window.$crisp = window.$crisp || [];
    window.$crisp.push(["do", "chat:show"]);
    window.$crisp.push(["do", "chat:open"]);
  };

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
          onboardingId="api-key"
          onPrefetch={prefetchApiKey}
        />
        <SidebarItem
          href="/playground"
          icon={Code}
          label={t("api_integration")}
          isActive={pathname === "/playground"}
          onboardingId="playground"
          onPrefetch={prefetchPlayground}
        />
        <SidebarItem
          href="/renders"
          icon={Images}
          label="Renders"
          isActive={pathname === "/renders"}
          onPrefetch={prefetchRenders}
        />

        {/* Admin button - only visible for superadmins */}
        {role === "superadmin" && (
          <SidebarItem
            href="/admin"
            icon={Shield}
            label={t("admin")}
            isActive={pathname === "/admin"}
            onPrefetch={() => {
              void queryClient.prefetchQuery({
                queryKey: adminOverviewQueryKey,
                queryFn: fetchAdminOverview,
                staleTime: 60 * 1000,
              });
            }}
          />
        )}
      </ul>

      <div className="mt-auto space-y-1 border-t border-[#101426]/[0.07] pb-4 pt-4">
        <SidebarItem
          href="/docs"
          icon={BookOpen}
          label={t("documentation")}
          isActive={pathname === "/docs"}
        />
        <button
          type="button"
          onClick={openSupportChat}
          data-onboarding="support"
          className="flex w-full items-center rounded-xl px-3.5 py-3 text-left text-[#596174] transition-all duration-200 hover:bg-[#f6f5fb] hover:text-[#101426]"
        >
          <MessageCircle className="mr-3 size-[18px] stroke-2" />
          <span className="text-sm font-semibold">
            {language === "es" ? "Chat de soporte" : "Chat Support"}
          </span>
        </button>
      </div>
    </div>
  );
};
