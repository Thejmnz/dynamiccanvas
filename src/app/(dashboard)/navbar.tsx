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
    <nav className="sticky top-0 z-30 flex h-[72px] w-full items-center justify-between border-b border-[#101426]/10 bg-[#f6f5ef]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#5b35d5]">Dynamic Canvas</p>
        <p className="text-sm font-black text-[#101426]">Creative workspace</p>
      </div>
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
