"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [totalRenders, setTotalRenders] = useState<number>(0);

  // Hero carousel state - cycles through different designs
  const [heroSlide, setHeroSlide] = useState(0);

  const heroSlides = [
    // 1. Post Postre - Sweet
    {
      type: "sweet-promo",
      categoryKey: "desserts",
      image:
        "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80",
      title: "SWEET",
      titleLine2: "DREAMS",
      subtitleKey: "sweet_subtitle",
      price: "From $2.99",
      accentColor: "#f472b6",
      secondaryColor: "#ec4899",
      cta: "ORDER NOW",
    },
    // 2. Post Pizza - Italiano
    {
      type: "pizza-promo",
      categoryKey: "italian_food",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
      title: "AUTHENTIC",
      titleLine2: "PIZZA",
      subtitleKey: "pizza_subtitle",
      discount: "2x1",
      discountText: "TUESDAY",
      accentColor: "#dc2626",
      secondaryColor: "#16a34a",
      cta: "ORDER NOW",
    },
    // 3. Post Mascotas - Pet Shop
    {
      type: "pet-promo",
      categoryKey: "pet_shop",
      image:
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
      title: "FRIENDLY",
      titleLine2: "PETS",
      subtitleKey: "pet_subtitle",
      price: "From $9.99",
      accentColor: "#f59e0b",
      secondaryColor: "#d97706",
      cta: "SHOP NOW",
    },
  ];

  // Auto-cycle through slides
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const currentSlide = heroSlides[heroSlide];

  return (
    <div className="dark min-h-screen bg-[#101622] text-slate-100 antialiased selection:bg-[#135bec]/30">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#101622]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
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
            <div className="hidden md:flex items-center space-x-8">
              <a
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                href="#features"
              >
                {t("features")}
              </a>
              <a
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                href="#pricing"
              >
                {t("pricing")}
              </a>
              <a
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                href="/docs"
              >
                {t("documentation")}
              </a>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <Link
                  href="/dashboard"
                  className="bg-[#135bec] hover:bg-[#135bec]/90 text-white text-sm font-bold py-2 px-5 rounded-lg transition-all shadow-lg shadow-[#135bec]/20"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="text-sm font-semibold text-white px-4 py-2 hover:bg-white/5 rounded-lg transition-all"
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href="/sign-up"
                    className="bg-[#135bec] hover:bg-[#135bec]/90 text-white text-sm font-bold py-2 px-5 rounded-lg transition-all shadow-lg shadow-[#135bec]/20"
                  >
                    {t("start_free")}
                  </Link>
                </>
              )}
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-24 overflow-hidden bg-[#101622]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#135bec]/40 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-blue-600/30 blur-[100px] rounded-full"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Hero Content */}
            <div className="flex flex-col gap-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#135bec]/10 border border-[#135bec]/20 w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#135bec] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#135bec]"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#135bec]">
                  {t("v2_available")}
                </span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
                {t("hero_title")}{" "}
                <span className="text-[#135bec]">
                  {t("hero_title_highlight")}
                </span>
              </h1>
              <p className="text-xl text-slate-400 leading-snug max-w-xl">
                {t("hero_subtitle")}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href={user ? "/dashboard" : "/sign-up"}
                  className="bg-[#135bec] hover:bg-[#135bec]/90 text-white font-bold h-14 px-8 rounded-xl transition-all shadow-xl shadow-[#135bec]/25 flex items-center gap-2"
                >
                  {t("btn_start_free")}{" "}
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>

            {/* Hero Visual - Carousel with JSON + Design */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#135bec] to-blue-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>

              {/* Container with JSON + Design */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-white/10">
                {/* JSON Header */}
                <div className="bg-slate-800 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[#135bec] font-mono text-sm font-bold">
                      POST
                    </span>
                    <span className="text-slate-400 font-mono text-sm">
                      /render
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {t(currentSlide.categoryKey)}
                    </span>
                    <div className="flex gap-1">
                      {heroSlides.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === heroSlide
                              ? "w-4 bg-[#135bec]"
                              : "w-1.5 bg-white/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* JSON Code - Colored like demo section */}
                <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] px-4 py-3 border-b border-white/5">
                  <div className="font-mono text-xs leading-relaxed">
                    <span className="text-white">{"{"}</span>
                    <br />
                    &nbsp;&nbsp;
                    <span className="text-[#135bec]">"template_id"</span>:{" "}
                    <span className="text-green-400">
                      "{currentSlide.type}"
                    </span>
                    ,<br />
                    &nbsp;&nbsp;
                    <span className="text-[#135bec]">"modifications"</span>: [
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="text-white">{"{"}</span>{" "}
                    <span className="text-[#135bec]">"name"</span>:{" "}
                    <span className="text-green-400">"title"</span>,{" "}
                    <span className="text-[#135bec]">"text"</span>:{" "}
                    <span className="text-green-400">
                      "{currentSlide.title}"
                    </span>{" "}
                    <span className="text-white">{"}"}</span>,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="text-white">{"{"}</span>{" "}
                    <span className="text-[#135bec]">"name"</span>:{" "}
                    <span className="text-green-400">"subtitle"</span>,{" "}
                    <span className="text-[#135bec]">"text"</span>:{" "}
                    <span className="text-green-400">
                      "{t(currentSlide.subtitleKey)}"
                    </span>{" "}
                    <span className="text-white">{"}"}</span>
                    {currentSlide.price ? (
                      <>
                        ,<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <span className="text-white">{"{"}</span>{" "}
                        <span className="text-[#135bec]">"name"</span>:{" "}
                        <span className="text-green-400">"price"</span>,{" "}
                        <span className="text-[#135bec]">"text"</span>:{" "}
                        <span className="text-green-400">
                          "{currentSlide.price}"
                        </span>{" "}
                        <span className="text-white">{"}"}</span>
                      </>
                    ) : (
                      ""
                    )}
                    {currentSlide.discount ? (
                      <>
                        ,<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <span className="text-white">{"{"}</span>{" "}
                        <span className="text-[#135bec]">"name"</span>:{" "}
                        <span className="text-green-400">"discount"</span>,{" "}
                        <span className="text-[#135bec]">"text"</span>:{" "}
                        <span className="text-green-400">
                          "{currentSlide.discount}"
                        </span>{" "}
                        <span className="text-white">{"}"}</span>
                      </>
                    ) : (
                      ""
                    )}
                    ,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="text-white">{"{"}</span>{" "}
                    <span className="text-[#135bec]">"name"</span>:{" "}
                    <span className="text-green-400">"accent_color"</span>,{" "}
                    <span className="text-[#135bec]">"value"</span>:{" "}
                    <span className="text-green-400">
                      "{currentSlide.accentColor}"
                    </span>{" "}
                    <span className="text-white">{"}"}</span>
                    <br />
                    &nbsp;&nbsp;],
                    <br />
                    &nbsp;&nbsp;<span className="text-[#135bec]">"format"</span>
                    : <span className="text-green-400">"png"</span>
                    <br />
                    <span className="text-white">{"}"}</span>
                  </div>
                </div>

                {/* Design Preview */}
                <div
                  key={heroSlide}
                  className="relative overflow-hidden transition-all duration-500 bg-white"
                >
                  {/* Promo Split - Fast Food Style */}
                  {currentSlide.type === "promo-split" && (
                    <div className="relative aspect-[4/3] bg-white flex">
                      {/* Decorative shapes */}
                      <div
                        className="absolute top-4 right-4 w-8 h-8 rounded-full opacity-30"
                        style={{ backgroundColor: currentSlide.accentColor }}
                      ></div>
                      <div
                        className="absolute top-20 right-20 w-4 h-4 rotate-45 opacity-20"
                        style={{ backgroundColor: currentSlide.accentColor }}
                      ></div>
                      <div
                        className="absolute bottom-32 left-8 w-6 h-6 rounded-full opacity-25"
                        style={{ backgroundColor: currentSlide.accentColor }}
                      ></div>

                      {/* Left - Image */}
                      <div className="w-1/2 relative overflow-hidden">
                        <img
                          src={currentSlide.image}
                          alt={currentSlide.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Right - Content */}
                      <div className="w-1/2 p-6 flex flex-col justify-center relative">
                        {/* Logo Badge */}
                        <div
                          className="absolute top-4 right-4 w-12 h-12 rotate-45 flex items-center justify-center"
                          style={{
                            backgroundColor: currentSlide.secondaryColor,
                          }}
                        >
                          <span className="text-white text-xs font-bold -rotate-45">
                            LOGO
                          </span>
                        </div>

                        {/* Main Text */}
                        <h2
                          className="text-4xl font-black mb-2"
                          style={{ color: currentSlide.accentColor }}
                        >
                          {currentSlide.title}
                        </h2>
                        <p className="text-gray-600 font-medium mb-4">
                          {t(currentSlide.subtitleKey)}
                        </p>

                        {/* Discount Badge */}
                        <div className="flex items-center gap-2 mb-4">
                          <div
                            className="w-16 h-16 rotate-45 flex flex-col items-center justify-center"
                            style={{
                              backgroundColor: currentSlide.secondaryColor,
                            }}
                          >
                            <span className="text-white text-xl font-black -rotate-45">
                              {currentSlide.discount}
                            </span>
                            <span className="text-white text-xs font-bold -rotate-45">
                              {currentSlide.discountText}
                            </span>
                          </div>
                        </div>

                        {/* CTA */}
                        <button
                          className="px-4 py-2 rounded text-sm font-bold text-white"
                          style={{ backgroundColor: currentSlide.accentColor }}
                        >
                          {currentSlide.cta}
                        </button>

                        {/* Social Icons */}
                        <div className="flex gap-2 mt-4">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                            📱
                          </div>
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                            💬
                          </div>
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                            📷
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Travel Split - Layout dividido */}
                  {currentSlide.type === "travel-split" && (
                    <div className="relative aspect-[4/3] bg-white flex">
                      {/* Border */}
                      <div
                        className="absolute inset-0 border-4 rounded-lg"
                        style={{ borderColor: currentSlide.accentColor }}
                      ></div>

                      {/* Left - Image */}
                      <div className="w-[45%] relative overflow-hidden m-2 rounded-l-lg">
                        <img
                          src={currentSlide.image}
                          alt={currentSlide.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Right - Content */}
                      <div className="w-[55%] p-4 flex flex-col justify-center relative">
                        {/* Logo */}
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <div
                            className="w-4 h-4 rounded"
                            style={{
                              backgroundColor: currentSlide.accentColor,
                            }}
                          ></div>
                          <span className="text-xs font-bold text-gray-700">
                            LOGO
                          </span>
                        </div>

                        {/* Main Text */}
                        <h2 className="text-2xl font-black text-gray-900 leading-tight">
                          {currentSlide.title}
                          <br />
                          <span style={{ color: currentSlide.accentColor }}>
                            {currentSlide.titleLine2}
                          </span>
                        </h2>
                        <p className="text-gray-500 text-xs mt-2">
                          {t(currentSlide.subtitleKey)}
                        </p>
                      </div>

                      {/* Bottom Bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-16 flex">
                        <div
                          className="w-[60%] flex items-center justify-center gap-4"
                          style={{ backgroundColor: currentSlide.accentColor }}
                        >
                          <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs">
                            ✈
                          </div>
                          <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs">
                            🚢
                          </div>
                          <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs">
                            ⛺
                          </div>
                          <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs">
                            🗺
                          </div>
                        </div>
                        <div
                          className="w-[40%]"
                          style={{
                            backgroundColor: currentSlide.secondaryColor,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Coffee Minimal */}
                  {currentSlide.type === "coffee-minimal" && (
                    <div className="relative aspect-[4/3] bg-amber-50 flex">
                      {/* Decorative circles */}
                      <div
                        className="absolute top-8 left-8 w-20 h-20 rounded-full opacity-20"
                        style={{ backgroundColor: currentSlide.accentColor }}
                      ></div>
                      <div
                        className="absolute bottom-16 right-16 w-12 h-12 rounded-full opacity-15"
                        style={{ backgroundColor: currentSlide.accentColor }}
                      ></div>

                      {/* Image - Left side */}
                      <div className="w-[55%] relative overflow-hidden">
                        <img
                          src={currentSlide.image}
                          alt={currentSlide.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content - Right side */}
                      <div className="w-[45%] p-6 flex flex-col justify-center">
                        <h2
                          className="text-3xl font-black leading-tight"
                          style={{ color: currentSlide.accentColor }}
                        >
                          {currentSlide.title}
                          <br />
                          <span className="text-4xl">
                            {currentSlide.titleLine2}
                          </span>
                        </h2>
                        <p className="text-amber-800 text-sm mt-2">
                          {t(currentSlide.subtitleKey)}
                        </p>

                        {/* Price */}
                        <div className="mt-4 inline-flex">
                          <span
                            className="px-3 py-1 rounded-full text-white font-bold text-sm"
                            style={{
                              backgroundColor: currentSlide.accentColor,
                            }}
                          >
                            {currentSlide.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pet Profile */}
                  {(currentSlide.type === "pet-profile" ||
                    currentSlide.type === "cat-profile") && (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {/* Background Image */}
                      <img
                        src={currentSlide.image}
                        alt={currentSlide.title}
                        className="w-full h-full object-cover"
                      />

                      {/* Overlay */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${currentSlide.accentColor}dd 0%, ${currentSlide.secondaryColor}dd 100%)`,
                        }}
                      ></div>

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                        {/* Badge */}
                        <div
                          className="absolute top-4 right-4 px-3 py-1 rounded-full text-white text-xs font-bold uppercase"
                          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                        >
                          {t(currentSlide.categoryKey)}
                        </div>

                        {/* Profile Circle */}
                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/50 shadow-xl mb-4">
                          <img
                            src={currentSlide.image}
                            alt={currentSlide.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Text */}
                        <h2 className="text-white text-3xl font-black">
                          {currentSlide.title}
                        </h2>
                        <p className="text-white/80 text-sm mt-1">
                          {t(currentSlide.subtitleKey)}
                        </p>

                        {/* CTA */}
                        <button
                          className="mt-4 px-6 py-2 rounded-full bg-white font-bold text-sm"
                          style={{ color: currentSlide.accentColor }}
                        >
                          {currentSlide.cta}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Fitness Promo */}
                  {currentSlide.type === "fitness-promo" && (
                    <div className="relative aspect-[4/3] bg-white flex">
                      {/* Left - Image */}
                      <div className="w-1/2 relative overflow-hidden">
                        <img
                          src={currentSlide.image}
                          alt={currentSlide.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay */}
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(135deg, ${currentSlide.accentColor}60 0%, ${currentSlide.secondaryColor}60 100%)`,
                          }}
                        ></div>
                      </div>

                      {/* Right - Content */}
                      <div
                        className="w-1/2 p-6 flex flex-col justify-center"
                        style={{ backgroundColor: currentSlide.accentColor }}
                      >
                        <h2 className="text-white text-3xl font-black leading-tight">
                          {currentSlide.title}
                          <br />
                          <span className="text-pink-200">
                            {currentSlide.titleLine2}
                          </span>
                        </h2>
                        <p className="text-white/80 text-sm mt-2">
                          {t(currentSlide.subtitleKey)}
                        </p>

                        {/* Discount */}
                        <div className="mt-4 flex items-center gap-2">
                          <div
                            className="px-4 py-2 rounded-lg bg-white font-black"
                            style={{ color: currentSlide.accentColor }}
                          >
                            <span className="text-2xl">
                              {currentSlide.discount}
                            </span>
                            <span className="text-xs block">
                              {currentSlide.discountText}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sweet Promo */}
                  {currentSlide.type === "sweet-promo" && (
                    <div className="relative aspect-[4/3] bg-pink-50 flex">
                      {/* Decorative */}
                      <div
                        className="absolute top-4 left-4 w-16 h-16 rounded-full opacity-30"
                        style={{ backgroundColor: currentSlide.accentColor }}
                      ></div>
                      <div
                        className="absolute bottom-8 right-8 w-8 h-8 rotate-45 opacity-20"
                        style={{ backgroundColor: currentSlide.accentColor }}
                      ></div>

                      {/* Image */}
                      <div className="w-1/2 relative overflow-hidden m-4 rounded-2xl">
                        <img
                          src={currentSlide.image}
                          alt={currentSlide.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="w-1/2 p-6 flex flex-col justify-center">
                        <h2
                          className="text-4xl font-black leading-tight"
                          style={{ color: currentSlide.accentColor }}
                        >
                          {currentSlide.title}
                          <br />
                          <span className="text-pink-400">
                            {currentSlide.titleLine2}
                          </span>
                        </h2>
                        <p className="text-pink-600 text-sm mt-2">
                          {t(currentSlide.subtitleKey)}
                        </p>

                        {/* Price */}
                        <div className="mt-4">
                          <span
                            className="px-4 py-2 rounded-full text-white font-bold"
                            style={{
                              backgroundColor: currentSlide.accentColor,
                            }}
                          >
                            {currentSlide.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pizza Promo */}
                  {currentSlide.type === "pizza-promo" && (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {/* Background - Full coverage */}
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${currentSlide.image})`,
                        }}
                      ></div>
                      <div className="absolute inset-0 bg-black/40"></div>

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <h2 className="text-white text-4xl font-black drop-shadow-lg">
                          {currentSlide.title}
                          <br />
                          <span className="text-green-400">
                            {currentSlide.titleLine2}
                          </span>
                        </h2>
                        <p className="text-white/90 text-sm mt-2">
                          {t(currentSlide.subtitleKey)}
                        </p>

                        {/* Discount Badge */}
                        <div
                          className="mt-4 px-6 py-3 rounded-lg font-black text-white shadow-xl"
                          style={{
                            backgroundColor: currentSlide.secondaryColor,
                          }}
                        >
                          <span className="text-3xl">
                            {currentSlide.discount}
                          </span>
                          <span className="text-sm block">
                            {currentSlide.discountText}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pet Promo */}
                  {currentSlide.type === "pet-promo" && (
                    <div className="relative aspect-[4/3] bg-amber-50 flex">
                      {/* Decorative */}
                      <div
                        className="absolute top-4 left-4 w-16 h-16 rounded-full opacity-30"
                        style={{ backgroundColor: currentSlide.accentColor }}
                      ></div>
                      <div
                        className="absolute bottom-8 right-8 w-8 h-8 rotate-45 opacity-20"
                        style={{ backgroundColor: currentSlide.accentColor }}
                      ></div>
                      <div
                        className="absolute top-1/2 left-1/4 w-6 h-6 rounded-full opacity-15"
                        style={{ backgroundColor: currentSlide.secondaryColor }}
                      ></div>

                      {/* Image */}
                      <div className="w-1/2 relative overflow-hidden m-4 rounded-2xl">
                        <img
                          src={currentSlide.image}
                          alt={currentSlide.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="w-1/2 p-6 flex flex-col justify-center">
                        {/* Category Badge */}
                        <span
                          className="text-xs font-bold uppercase tracking-wider mb-2"
                          style={{ color: currentSlide.secondaryColor }}
                        >
                          {t(currentSlide.categoryKey)} 🐾
                        </span>
                        <h2
                          className="text-4xl font-black leading-tight"
                          style={{ color: currentSlide.accentColor }}
                        >
                          {currentSlide.title}
                          <br />
                          <span className="text-amber-600">
                            {currentSlide.titleLine2}
                          </span>
                        </h2>
                        <p className="text-amber-700 text-sm mt-2">
                          {t(currentSlide.subtitleKey)}
                        </p>

                        {/* Price */}
                        <div className="mt-4">
                          <span
                            className="px-4 py-2 rounded-full text-white font-bold"
                            style={{
                              backgroundColor: currentSlide.accentColor,
                            }}
                          >
                            {currentSlide.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nature Promo */}
                  {currentSlide.type === "nature-promo" && (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {/* Background */}
                      <img
                        src={currentSlide.image}
                        alt={currentSlide.title}
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${currentSlide.accentColor}80 0%, ${currentSlide.secondaryColor}80 100%)`,
                        }}
                      ></div>

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <span
                          className="px-3 py-1 rounded-full text-white text-xs font-bold uppercase mb-4"
                          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                        >
                          {t(currentSlide.categoryKey)}
                        </span>
                        <h2 className="text-white text-4xl font-black leading-tight">
                          {currentSlide.title}
                          <br />
                          <span className="text-emerald-200">
                            {currentSlide.titleLine2}
                          </span>
                        </h2>
                        <p className="text-white/80 text-sm mt-2">
                          {t(currentSlide.subtitleKey)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Slide Counter */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {heroSlides.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === heroSlide
                            ? "w-6 bg-white"
                            : "w-1.5 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Integrations Section */}
      <section className="py-20 bg-[#101622]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-black text-white mb-4">
              {t("integrations_title")}
            </h3>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {t("integrations_subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-12 mb-12">
            {/* n8n */}
            <div className="h-12 flex items-center justify-center">
              <img
                src="https://brandlogos.net/wp-content/uploads/2025/05/n8n-logo_brandlogos.net_jjyhx-300x81.png"
                alt="n8n"
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </div>

            {/* Make */}
            <div className="h-12 flex items-center justify-center">
              <img
                src="https://www.enable.services/wp-content/uploads/2023/10/White-Make-Logo-1024x211.png"
                alt="Make"
                className="h-8 w-auto object-contain"
              />
            </div>

            {/* Zapier */}
            <div className="h-12 flex items-center justify-center">
              <img
                src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/zapier.png"
                alt="Zapier"
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </div>
          </div>

          <div className="text-center">
            <p className="text-slate-500 text-sm mb-4">{t("use_directly")}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="px-4 py-2 rounded-lg bg-slate-800/40 border border-white/5 text-slate-400 text-sm font-mono">
                Node.js
              </span>
              <span className="px-4 py-2 rounded-lg bg-slate-800/40 border border-white/5 text-slate-400 text-sm font-mono">
                Python
              </span>
              <span className="px-4 py-2 rounded-lg bg-slate-800/40 border border-white/5 text-slate-400 text-sm font-mono">
                PHP
              </span>
              <span className="px-4 py-2 rounded-lg bg-slate-800/40 border border-white/5 text-slate-400 text-sm font-mono">
                cURL
              </span>
              <span className="px-4 py-2 rounded-lg bg-slate-800/40 border border-white/5 text-slate-400 text-sm font-mono">
                Ruby
              </span>
              <span className="px-4 py-2 rounded-lg bg-slate-800/40 border border-white/5 text-slate-400 text-sm font-mono">
                Go
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#101622]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 max-w-2xl">
            <h2 className="text-[#135bec] font-bold uppercase tracking-widest text-sm mb-4">
              {t("core_capabilities")}
            </h2>
            <h3 className="text-4xl font-black text-white leading-tight">
              {t("power_workflow")}
            </h3>
            <p className="text-slate-400 mt-4 text-lg">
              {t("power_workflow_desc")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="group p-8 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-[#135bec]/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#135bec]/10 flex items-center justify-center text-[#135bec] mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">draw</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">
                {t("visual_editor")}
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t("visual_editor_desc")}
              </p>
            </div>
            {/* Card 2 */}
            <div className="group p-8 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-[#135bec]/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#135bec]/10 flex items-center justify-center text-[#135bec] mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">
                  variable_insert
                </span>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">
                {t("live_templates")}
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t("live_templates_desc")}
              </p>
            </div>
            {/* Card 3 */}
            <div className="group p-8 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-[#135bec]/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#135bec]/10 flex items-center justify-center text-[#135bec] mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">bolt</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">
                {t("flash_rendering")}
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t("flash_rendering_desc")}
              </p>
            </div>
            {/* Card 4 */}
            <div className="group p-8 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-[#135bec]/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#135bec]/10 flex items-center justify-center text-[#135bec] mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">
                  verified_user
                </span>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">
                {t("enterprise_security")}
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t("enterprise_security_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-[#101622]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#135bec] to-blue-700 p-12 lg:p-20 text-center">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <svg
                className="w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <defs>
                  <pattern
                    height="10"
                    id="grid"
                    patternUnits="userSpaceOnUse"
                    width="10"
                  >
                    <path
                      d="M 10 0 L 0 0 0 10"
                      fill="none"
                      stroke="white"
                      strokeWidth="0.5"
                    ></path>
                  </pattern>
                </defs>
                <rect fill="url(#grid)" height="100" width="100"></rect>
              </svg>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 relative z-10">
              {t("ready_automate")}
            </h2>
            <p className="text-blue-100 text-lg lg:text-xl mb-10 max-w-2xl mx-auto relative z-10 leading-relaxed">
              {t("ready_automate_desc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                href={user ? "/dashboard" : "/sign-up"}
                className="bg-white text-[#135bec] hover:bg-slate-100 font-extrabold h-16 px-10 rounded-xl transition-all shadow-2xl flex items-center justify-center gap-2 text-lg"
              >
                {t("start_free_now")}{" "}
                <span className="material-symbols-outlined">rocket_launch</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 pt-16 pb-8 bg-[#101622]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-[#135bec] rounded flex items-center justify-center text-white font-bold text-xs">
                  DC
                </div>
                <span className="text-lg font-bold text-white">
                  Dynamic Canvas
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                {t("footer_tagline")}
              </p>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">{t("product")}</h5>
              <ul className="space-y-4">
                <li>
                  <a
                    className="text-slate-500 hover:text-[#135bec] transition-colors text-sm"
                    href="#features"
                  >
                    {t("features")}
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-500 hover:text-[#135bec] transition-colors text-sm"
                    href="/docs"
                  >
                    {t("api_reference")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">{t("resources")}</h5>
              <ul className="space-y-4">
                <li>
                  <a
                    className="text-slate-500 hover:text-[#135bec] transition-colors text-sm"
                    href="/docs"
                  >
                    {t("documentation")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">{t("legal")}</h5>
              <ul className="space-y-4">
                <li>
                  <Link
                    className="text-slate-500 hover:text-[#135bec] transition-colors text-sm"
                    href="/privacy"
                  >
                    {t("privacy")}
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-slate-500 hover:text-[#135bec] transition-colors text-sm"
                    href="/terms"
                  >
                    {t("terms")}
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-slate-500 hover:text-[#135bec] transition-colors text-sm"
                    href="/security"
                  >
                    {t("security")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-xs">
              © 2025 Dynamic Canvas. {t("all_rights")}
            </p>
            <div className="flex items-center gap-4">
              <a
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/30 transition-all"
                href="#"
              >
                <span className="material-symbols-outlined !text-base">
                  terminal
                </span>
              </a>
              <a
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/30 transition-all"
                href="#"
              >
                <span className="material-symbols-outlined !text-base">
                  public
                </span>
              </a>
              <a
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/30 transition-all"
                href="#"
              >
                <span className="material-symbols-outlined !text-base">
                  alternate_email
                </span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
