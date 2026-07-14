"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/language-switcher";
import { BrandLogo } from "@/components/brand-mark";

export default function TermsPage() {
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
          {t("terms_title")}
        </h1>
        <p className="text-slate-400 mb-8">
          {t("last_updated")}: January 2025
        </p>

        <div className="prose prose-invert prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("terms_intro_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {t("terms_intro_desc")}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("terms_acceptance_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {t("terms_acceptance_desc")}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("terms_service_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              {t("terms_service_desc")}
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>{t("terms_service_templates")}</li>
              <li>{t("terms_service_api")}</li>
              <li>{t("terms_service_renders")}</li>
              <li>{t("terms_service_storage")}</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("terms_accounts_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              {t("terms_accounts_desc")}
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>{t("terms_accounts_accurate")}</li>
              <li>{t("terms_accounts_security")}</li>
              <li>{t("terms_accounts_responsible")}</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("terms_usage_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              {t("terms_usage_desc")}
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>{t("terms_usage_illegal")}</li>
              <li>{t("terms_usage_harmful")}</li>
              <li>{t("terms_usage_infringe")}</li>
              <li>{t("terms_usage_malicious")}</li>
              <li>{t("terms_usage_reverse")}</li>
              <li>{t("terms_usage_spam")}</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("terms_ip_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              {t("terms_ip_desc")}
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>{t("terms_ip_platform")}</li>
              <li>{t("terms_ip_content")}</li>
              <li>{t("terms_ip_renders")}</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("terms_payment_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {t("terms_payment_desc")}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("terms_cancellation_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {t("terms_cancellation_desc")}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("terms_limitation_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {t("terms_limitation_desc")}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("terms_modifications_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {t("terms_modifications_desc")}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("terms_governing_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {t("terms_governing_desc")}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("terms_contact_title")}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {t("terms_contact_desc")}{" "}
              <a
                href="mailto:legal@dynamiccanvas.com"
                className="text-[#135bec] hover:underline"
              >
                legal@dynamiccanvas.com
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
