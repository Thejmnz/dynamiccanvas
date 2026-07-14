"use client";

import { UserButton } from "@/features/auth/components/user-button"
import { useUserRole } from "@/hooks/use-user-role";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const Navbar = () => {
  const { isAuthenticated, loading } = useUserRole();
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-30 flex h-[72px] w-full items-center justify-end border-b border-[#101426]/10 bg-white/90 px-5 shadow-[0_8px_30px_rgba(16,20,38,.035)] backdrop-blur-xl sm:px-8 lg:px-10">
      <div className="flex items-center gap-x-3">
        <LanguageSwitcher />
        <UserButton />
        {!isAuthenticated && !loading && (
          <Button onClick={() => router.push("/sign-in")}>
            {t("sign_in")}
          </Button>
        )}
      </div>
    </nav>
  );
};
