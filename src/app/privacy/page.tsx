"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/language-switcher";
import { BrandLogo } from "@/components/brand-mark";

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="legal-modern min-h-screen bg-[#fafafe] text-[#101426] antialiased">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-[#101426]/10 bg-white/90 shadow-[0_8px_30px_rgba(16,20,38,.035)] backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              href="/"
              className="flex items-center gap-2 group cursor-pointer"
            >
              <BrandLogo className="h-9" />
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-black text-white mb-4">
          {t("privacy_policy")}
        </h1>
        <p className="text-slate-400 mb-8">
          {t("last_updated")}: January 2025
        </p>

        <div className="prose prose-invert prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("privacy_intro_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {t("privacy_intro_desc")}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("privacy_collect_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              {t("privacy_collect_desc")}
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>{t("privacy_collect_name")}</li>
              <li>{t("privacy_collect_email")}</li>
              <li>{t("privacy_collect_usage")}</li>
              <li>{t("privacy_collect_api")}</li>
              <li>{t("privacy_collect_device")}</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("privacy_use_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              {t("privacy_use_desc")}
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>{t("privacy_use_service")}</li>
              <li>{t("privacy_use_communicate")}</li>
              <li>{t("privacy_use_improve")}</li>
              <li>{t("privacy_use_security")}</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("privacy_storage_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {t("privacy_storage_desc")}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("privacy_rights_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              {t("privacy_rights_desc")}
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>{t("privacy_rights_access")}</li>
              <li>{t("privacy_rights_correct")}</li>
              <li>{t("privacy_rights_delete")}</li>
              <li>{t("privacy_rights_export")}</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("privacy_cookies_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {t("privacy_cookies_desc")}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("privacy_third_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {t("privacy_third_desc")}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("privacy_children_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {t("privacy_children_desc")}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("privacy_changes_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {t("privacy_changes_desc")}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("privacy_contact_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {t("privacy_contact_desc")}{" "}
              <a
                href="mailto:privacy@dynamiccanvas.com"
                className="text-[#135bec] hover:underline"
              >
                privacy@dynamiccanvas.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <Link
            href="/"
            className="text-[#135bec] hover:underline flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {t("back_to_home")}
          </Link>
        </div>
      </main>
    </div>
  );
}
