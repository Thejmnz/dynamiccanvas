"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/language-switcher";

type Section = {
  id: string;
  titleKey: string;
};

type Category = {
  titleKey: string;
  sections: Section[];
};

export default function DocsPage() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState("getting-started");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const categories: Category[] = [
    {
      titleKey: "docs_getting_started",
      sections: [
        { id: "getting-started", titleKey: "docs_introduction" },
        { id: "quick-start", titleKey: "docs_quick_start" },
        { id: "authentication", titleKey: "docs_authentication" },
      ],
    },
    {
      titleKey: "docs_api_reference",
      sections: [
        { id: "api-overview", titleKey: "docs_api_overview" },
        { id: "render-endpoint", titleKey: "docs_render_endpoint" },
        { id: "templates", titleKey: "docs_templates" },
        { id: "modifications", titleKey: "docs_modifications" },
        { id: "formats", titleKey: "docs_formats" },
        { id: "errors", titleKey: "docs_errors" },
      ],
    },
    {
      titleKey: "docs_guides",
      sections: [
        { id: "creating-templates", titleKey: "docs_creating_templates" },
        { id: "dynamic-images", titleKey: "docs_dynamic_images" },
        { id: "dynamic-text", titleKey: "docs_dynamic_text" },
        { id: "batch-processing", titleKey: "docs_batch_processing" },
      ],
    },
    {
      titleKey: "docs_integrations",
      sections: [
        { id: "n8n", titleKey: "docs_n8n" },
        { id: "zapier", titleKey: "docs_zapier" },
        { id: "make", titleKey: "docs_make" },
        { id: "sdks", titleKey: "docs_sdks" },
      ],
    },
    {
      titleKey: "docs_limits",
      sections: [
        { id: "rate-limits", titleKey: "docs_rate_limits" },
        { id: "pricing", titleKey: "docs_pricing" },
      ],
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = categories
        .flatMap((cat) => cat.sections)
        .map((section) => document.getElementById(section.id))
        .filter(Boolean);

      for (const element of sectionElements) {
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(element.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setSidebarOpen(false);
  };

  return (
    <div className="dark min-h-screen bg-[#101622] text-slate-100 antialiased">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-[#101622]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-white">
                  {sidebarOpen ? "close" : "menu"}
                </span>
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 group cursor-pointer"
              >
                <div className="w-8 h-8 bg-[#135bec] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  DC
                </div>
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Dynamic Canvas
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                {t("back_to_home")}
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-72 bg-[#0d1320] border-r border-white/10 overflow-y-auto z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
            {t("docs_documentation")}
          </h2>
          <nav className="space-y-6">
            {categories.map((category) => (
              <div key={category.titleKey}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#135bec] mb-3">
                  {t(category.titleKey)}
                </h3>
                <ul className="space-y-1">
                  {category.sections.map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === section.id
                            ? "bg-[#135bec]/20 text-[#135bec] font-medium"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {t(section.titleKey)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Getting Started */}
          <section id="getting-started" className="mb-16 scroll-mt-24">
            <h1 className="text-4xl font-black text-white mb-4">
              {t("docs_introduction")}
            </h1>
            <p className="text-slate-400 text-lg mb-8">
              {t("docs_intro_desc")}
            </p>
            <div className="bg-gradient-to-br from-[#135bec]/20 to-blue-500/10 border border-[#135bec]/30 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#135bec]/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#135bec]">rocket_launch</span>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">{t("docs_new_here")}</h3>
                  <p className="text-slate-400 text-sm">
                    {t("docs_new_here_desc")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Start */}
          <section id="quick-start" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("docs_quick_start")}
            </h2>
            <p className="text-slate-300 mb-6">
              {t("docs_quick_start_desc")}
            </p>

            <div className="space-y-6">
              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#135bec] text-white text-xs flex items-center justify-center">1</span>
                  {t("docs_step_api_key")}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {t("docs_step_api_key_desc")}
                </p>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                  <span className="text-slate-500">$ </span>
                  <span className="text-green-400">export</span>
                  <span className="text-white"> DYNAMIC_CANVAS_API_KEY=</span>
                  <span className="text-amber-400">"your-api-key"</span>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#135bec] text-white text-xs flex items-center justify-center">2</span>
                  {t("docs_step_create_request")}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {t("docs_step_create_request_desc")}
                </p>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-slate-300">{`curl -X POST https://api.dynamiccanvas.com/v1/render \\
  -H "Authorization: Bearer $DYNAMIC_CANVAS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "template_id": "social-media-post",
    "modifications": [
      { "name": "title", "text": "Hello World" },
      { "name": "image", "src": "https://example.com/image.jpg" }
    ],
    "format": "png"
  }'`}</pre>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#135bec] text-white text-xs flex items-center justify-center">3</span>
                  {t("docs_step_receive")}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {t("docs_step_receive_desc")}
                </p>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-slate-300">{`{
  "success": true,
  "render_id": "render_abc123",
  "url": "https://cdn.dynamiccanvas.com/renders/abc123.png",
  "width": 1080,
  "height": 1080,
  "format": "png",
  "created_at": "2025-01-15T10:30:00Z"
}`}</pre>
                </div>
              </div>
            </div>
          </section>

          {/* Authentication */}
          <section id="authentication" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("docs_authentication")}
            </h2>
            <p className="text-slate-300 mb-6">
              {t("docs_auth_desc")}
            </p>

            <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-white font-bold mb-3">{t("docs_auth_header")}</h3>
              <p className="text-slate-400 text-sm mb-4">
                {t("docs_auth_header_desc")}
              </p>
              <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                <span className="text-[#135bec]">Authorization</span>
                <span className="text-white">: </span>
                <span className="text-green-400">Bearer</span>
                <span className="text-white"> your-api-key</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-500">warning</span>
                <div>
                  <h4 className="text-amber-400 font-bold mb-1">{t("docs_security_note")}</h4>
                  <p className="text-slate-400 text-sm">
                    {t("docs_security_note_desc")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* API Overview */}
          <section id="api-overview" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("docs_api_overview")}
            </h2>
            <p className="text-slate-300 mb-6">
              {t("docs_api_overview_desc")}
            </p>

            <div className="bg-slate-800/60 border border-white/10 rounded-xl overflow-hidden">
              <div className="border-b border-white/10 px-6 py-4">
                <h3 className="text-white font-bold">{t("docs_base_url")}</h3>
              </div>
              <div className="p-6">
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                  <span className="text-green-400">https://api.dynamiccanvas.com/v1</span>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">{t("docs_endpoints")}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-800/40 border border-white/10 rounded-lg px-4 py-3">
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold">POST</span>
                <code className="text-slate-300 font-mono text-sm">/render</code>
                <span className="text-slate-500 text-sm">{t("docs_endpoint_render")}</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-800/40 border border-white/10 rounded-lg px-4 py-3">
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">GET</span>
                <code className="text-slate-300 font-mono text-sm">/templates</code>
                <span className="text-slate-500 text-sm">{t("docs_endpoint_templates")}</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-800/40 border border-white/10 rounded-lg px-4 py-3">
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">GET</span>
                <code className="text-slate-300 font-mono text-sm">/templates/:id</code>
                <span className="text-slate-500 text-sm">{t("docs_endpoint_template")}</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-800/40 border border-white/10 rounded-lg px-4 py-3">
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">GET</span>
                <code className="text-slate-300 font-mono text-sm">/renders/:id</code>
                <span className="text-slate-500 text-sm">{t("docs_endpoint_render_status")}</span>
              </div>
            </div>
          </section>

          {/* Render Endpoint */}
          <section id="render-endpoint" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("docs_render_endpoint")}
            </h2>
            <p className="text-slate-300 mb-6">
              {t("docs_render_desc")}
            </p>

            <div className="bg-slate-800/60 border border-white/10 rounded-xl overflow-hidden mb-6">
              <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold">POST</span>
                <code className="text-white font-mono">/render</code>
              </div>
              <div className="p-6">
                <h4 className="text-white font-bold mb-4">{t("docs_request_body")}</h4>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-slate-300">{`{
  "template_id": "string (required)",
  "modifications": [
    {
      "name": "string (required) - element name in template",
      "text": "string (optional) - for text elements",
      "src": "string (optional) - for image elements",
      "value": "string (optional) - for color/style elements",
      "visible": "boolean (optional) - show/hide element"
    }
  ],
  "format": "string (optional) - png, jpg, webp, pdf. Default: png",
  "width": "number (optional) - override template width",
  "height": "number (optional) - override template height",
  "scale": "number (optional) - 1x, 2x, 3x. Default: 1x"
}`}</pre>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-4">{t("docs_example_request")}</h3>
            <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm overflow-x-auto mb-6">
              <pre className="text-slate-300">{`{
  "template_id": "instagram-post",
  "modifications": [
    {
      "name": "headline",
      "text": "Summer Sale 50% OFF"
    },
    {
      "name": "product_image",
      "src": "https://example.com/product.jpg"
    },
    {
      "name": "price",
      "text": "$29.99"
    },
    {
      "name": "accent_color",
      "value": "#ff6b6b"
    },
    {
      "name": "disclaimer",
      "visible": false
    }
  ],
  "format": "png",
  "scale": 2
}`}</pre>
            </div>

            <h3 className="text-xl font-bold text-white mb-4">{t("docs_response")}</h3>
            <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm overflow-x-auto">
              <pre className="text-slate-300">{`{
  "success": true,
  "render_id": "render_xyz789",
  "url": "https://cdn.dynamiccanvas.com/renders/xyz789.png",
  "width": 1080,
  "height": 1080,
  "format": "png",
  "file_size": 245678,
  "created_at": "2025-01-15T14:22:30Z",
  "expires_at": "2025-01-22T14:22:30Z"
}`}</pre>
            </div>
          </section>

          {/* Templates */}
          <section id="templates" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("docs_templates")}
            </h2>
            <p className="text-slate-300 mb-6">
              {t("docs_templates_desc")}
            </p>

            <div className="bg-slate-800/60 border border-white/10 rounded-xl overflow-hidden mb-6">
              <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">GET</span>
                <code className="text-white font-mono">/templates</code>
              </div>
              <div className="p-6">
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-slate-300">{`{
  "templates": [
    {
      "id": "instagram-post",
      "name": "Instagram Post",
      "width": 1080,
      "height": 1080,
      "elements": ["headline", "product_image", "price", "cta"],
      "thumbnail": "https://cdn.dynamiccanvas.com/templates/instagram-post.png"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 20
}`}</pre>
                </div>
              </div>
            </div>
          </section>

          {/* Modifications */}
          <section id="modifications" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("docs_modifications")}
            </h2>
            <p className="text-slate-300 mb-6">
              {t("docs_modifications_desc")}
            </p>

            <div className="grid gap-4">
              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-[#135bec]">text_fields</span>
                  <h3 className="text-white font-bold">{t("docs_mod_text")}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">{t("docs_mod_text_desc")}</p>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                  <span className="text-slate-500">{"{ "}</span>
                  <span className="text-[#135bec]">"name"</span>
                  <span className="text-white">: </span>
                  <span className="text-green-400">"headline"</span>
                  <span className="text-white">, </span>
                  <span className="text-[#135bec]">"text"</span>
                  <span className="text-white">: </span>
                  <span className="text-green-400">"Your Title Here"</span>
                  <span className="text-slate-500">{" }"}</span>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-[#135bec]">image</span>
                  <h3 className="text-white font-bold">{t("docs_mod_image")}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">{t("docs_mod_image_desc")}</p>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                  <span className="text-slate-500">{"{ "}</span>
                  <span className="text-[#135bec]">"name"</span>
                  <span className="text-white">: </span>
                  <span className="text-green-400">"photo"</span>
                  <span className="text-white">, </span>
                  <span className="text-[#135bec]">"src"</span>
                  <span className="text-white">: </span>
                  <span className="text-green-400">"https://example.com/image.jpg"</span>
                  <span className="text-slate-500">{" }"}</span>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-[#135bec]">palette</span>
                  <h3 className="text-white font-bold">{t("docs_mod_color")}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">{t("docs_mod_color_desc")}</p>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                  <span className="text-slate-500">{"{ "}</span>
                  <span className="text-[#135bec]">"name"</span>
                  <span className="text-white">: </span>
                  <span className="text-green-400">"accent_color"</span>
                  <span className="text-white">, </span>
                  <span className="text-[#135bec]">"value"</span>
                  <span className="text-white">: </span>
                  <span className="text-green-400">"#ff6b6b"</span>
                  <span className="text-slate-500">{" }"}</span>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-[#135bec]">visibility</span>
                  <h3 className="text-white font-bold">{t("docs_mod_visibility")}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">{t("docs_mod_visibility_desc")}</p>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                  <span className="text-slate-500">{"{ "}</span>
                  <span className="text-[#135bec]">"name"</span>
                  <span className="text-white">: </span>
                  <span className="text-green-400">"watermark"</span>
                  <span className="text-white">, </span>
                  <span className="text-[#135bec]">"visible"</span>
                  <span className="text-white">: </span>
                  <span className="text-amber-400">false</span>
                  <span className="text-slate-500">{" }"}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Formats */}
          <section id="formats" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("docs_formats")}
            </h2>
            <p className="text-slate-300 mb-6">
              {t("docs_formats_desc")}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs font-bold">PNG</span>
                  <span className="text-white font-bold">{t("docs_format_png")}</span>
                </div>
                <p className="text-slate-400 text-sm">{t("docs_format_png_desc")}</p>
              </div>
              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs font-bold">JPG</span>
                  <span className="text-white font-bold">{t("docs_format_jpg")}</span>
                </div>
                <p className="text-slate-400 text-sm">{t("docs_format_jpg_desc")}</p>
              </div>
              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold">WEBP</span>
                  <span className="text-white font-bold">{t("docs_format_webp")}</span>
                </div>
                <p className="text-slate-400 text-sm">{t("docs_format_webp_desc")}</p>
              </div>
              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold">PDF</span>
                  <span className="text-white font-bold">{t("docs_format_pdf")}</span>
                </div>
                <p className="text-slate-400 text-sm">{t("docs_format_pdf_desc")}</p>
              </div>
            </div>
          </section>

          {/* Errors */}
          <section id="errors" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("docs_errors")}
            </h2>
            <p className="text-slate-300 mb-6">
              {t("docs_errors_desc")}
            </p>

            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <code className="text-red-400 font-mono">401 Unauthorized</code>
                  <span className="text-slate-500 text-sm">{t("docs_error_401")}</span>
                </div>
                <p className="text-slate-400 text-sm">{t("docs_error_401_desc")}</p>
              </div>
              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <code className="text-red-400 font-mono">404 Not Found</code>
                  <span className="text-slate-500 text-sm">{t("docs_error_404")}</span>
                </div>
                <p className="text-slate-400 text-sm">{t("docs_error_404_desc")}</p>
              </div>
              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <code className="text-red-400 font-mono">422 Unprocessable Entity</code>
                  <span className="text-slate-500 text-sm">{t("docs_error_422")}</span>
                </div>
                <p className="text-slate-400 text-sm">{t("docs_error_422_desc")}</p>
              </div>
              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <code className="text-red-400 font-mono">429 Too Many Requests</code>
                  <span className="text-slate-500 text-sm">{t("docs_error_429")}</span>
                </div>
                <p className="text-slate-400 text-sm">{t("docs_error_429_desc")}</p>
              </div>
              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <code className="text-red-400 font-mono">500 Internal Server Error</code>
                  <span className="text-slate-500 text-sm">{t("docs_error_500")}</span>
                </div>
                <p className="text-slate-400 text-sm">{t("docs_error_500_desc")}</p>
              </div>
            </div>
          </section>

          {/* Creating Templates */}
          <section id="creating-templates" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("docs_creating_templates")}
            </h2>
            <p className="text-slate-300 mb-6">
              {t("docs_creating_templates_desc")}
            </p>

            <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-white font-bold mb-4">{t("docs_template_steps")}</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-[#135bec] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>{t("docs_template_step1")}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-[#135bec] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>{t("docs_template_step2")}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-[#135bec] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>{t("docs_template_step3")}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-[#135bec] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
                  <span>{t("docs_template_step4")}</span>
                </li>
              </ol>
            </div>
          </section>

          {/* Dynamic Images */}
          <section id="dynamic-images" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("docs_dynamic_images")}
            </h2>
            <p className="text-slate-300 mb-6">
              {t("docs_dynamic_images_desc")}
            </p>

            <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-bold mb-3">{t("docs_supported_formats")}</h3>
              <div className="flex flex-wrap gap-2">
                {["JPG", "PNG", "WEBP", "GIF", "SVG", "BMP"].map((format) => (
                  <span
                    key={format}
                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Dynamic Text */}
          <section id="dynamic-text" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("docs_dynamic_text")}
            </h2>
            <p className="text-slate-300 mb-6">
              {t("docs_dynamic_text_desc")}
            </p>

            <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-bold mb-3">{t("docs_text_tips")}</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#135bec] text-sm mt-0.5">check_circle</span>
                  {t("docs_text_tip1")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#135bec] text-sm mt-0.5">check_circle</span>
                  {t("docs_text_tip2")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#135bec] text-sm mt-0.5">check_circle</span>
                  {t("docs_text_tip3")}
                </li>
              </ul>
            </div>
          </section>

          {/* Batch Processing */}
          <section id="batch-processing" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("docs_batch_processing")}
            </h2>
            <p className="text-slate-300 mb-6">
              {t("docs_batch_processing_desc")}
            </p>

            <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm overflow-x-auto">
              <pre className="text-slate-300">{`# Example: Generate multiple social posts
templates = [
  { "title": "Product A", "image": "product-a.jpg" },
  { "title": "Product B", "image": "product-b.jpg" },
  { "title": "Product C", "image": "product-c.jpg" },
]

for item in templates:
  response = requests.post(
    "https://api.dynamiccanvas.com/v1/render",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
      "template_id": "instagram-post",
      "modifications": [
        { "name": "headline", "text": item["title"] },
        { "name": "product_image", "src": item["image"] }
      ]
    }
  )
  print(response.json()["url"])`}</pre>
            </div>
          </section>

          {/* Integrations */}
          <section id="n8n" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("docs_n8n")}
            </h2>
            <p className="text-slate-300 mb-6">
              {t("docs_n8n_desc")}
            </p>

            <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-bold mb-3">{t("docs_n8n_steps")}</h3>
              <ol className="space-y-2 text-slate-400 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#135bec] font-bold">1.</span>
                  {t("docs_n8n_step1")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#135bec] font-bold">2.</span>
                  {t("docs_n8n_step2")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#135bec] font-bold">3.</span>
                  {t("docs_n8n_step3")}
                </li>
              </ol>
            </div>
          </section>

          <section id="zapier" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("docs_zapier")}
            </h2>
            <p className="text-slate-300 mb-6">
              {t("docs_zapier_desc")}
            </p>
          </section>

          <section id="make" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("docs_make")}
            </h2>
            <p className="text-slate-300 mb-6">
              {t("docs_make_desc")}
            </p>
          </section>

          <section id="sdks" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("docs_sdks")}
            </h2>
            <p className="text-slate-300 mb-6">
              {t("docs_sdks_desc")}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-bold mb-2">Node.js</h3>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                  <span className="text-slate-500">npm install </span>
                  <span className="text-green-400">@dynamic-canvas/sdk</span>
                </div>
              </div>
              <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-bold mb-2">Python</h3>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                  <span className="text-slate-500">pip install </span>
                  <span className="text-green-400">dynamic-canvas</span>
                </div>
              </div>
            </div>
          </section>

          {/* Rate Limits */}
          <section id="rate-limits" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("docs_rate_limits")}
            </h2>
            <p className="text-slate-300 mb-6">
              {t("docs_rate_limits_desc")}
            </p>

            <div className="bg-slate-800/60 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="text-left px-6 py-4 text-slate-400 font-medium">{t("docs_plan")}</th>
                    <th className="text-left px-6 py-4 text-slate-400 font-medium">{t("docs_requests_min")}</th>
                    <th className="text-left px-6 py-4 text-slate-400 font-medium">{t("docs_renders_month")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="px-6 py-4 text-white font-medium">{t("docs_free")}</td>
                    <td className="px-6 py-4 text-slate-300">10</td>
                    <td className="px-6 py-4 text-slate-300">100</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-6 py-4 text-white font-medium">{t("docs_pro")}</td>
                    <td className="px-6 py-4 text-slate-300">60</td>
                    <td className="px-6 py-4 text-slate-300">5,000</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-6 py-4 text-white font-medium">{t("docs_enterprise")}</td>
                    <td className="px-6 py-4 text-slate-300">500</td>
                    <td className="px-6 py-4 text-slate-300">{t("docs_unlimited")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("docs_pricing")}
            </h2>
            <p className="text-slate-300 mb-6">
              {t("docs_pricing_desc")}
            </p>

            <div className="bg-[#135bec]/10 border border-[#135bec]/30 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#135bec]">info</span>
                <p className="text-slate-300">
                  {t("docs_pricing_info")}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
