"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Braces,
  Check,
  GitBranch,
  ImageIcon,
  Keyboard,
  Layers3,
  LayoutList,
  Map,
  MousePointer2,
  Palette,
  Sparkles,
  Type,
  WandSparkles,
  Zap,
} from "lucide-react";

import { useLanguage } from "@/lib/contexts/LanguageContext";

type ReleaseCategory = "editor" | "images" | "text" | "workflow" | "api";

type Release = {
  version: string;
  date: { es: string; en: string };
  title: { es: string; en: string };
  summary: { es: string; en: string };
  category: ReleaseCategory;
  image: string;
  imageEs?: string;
  imageAlt: string;
  accent: string;
  soft: string;
  icon: typeof Sparkles;
  highlights: Array<{ es: string; en: string }>;
  tags: Array<{ es: string; en: string }>;
};

const RELEASES: Release[] = [
  {
    version: "Editor 2.4",
    date: { es: "15 de julio de 2026", en: "July 15, 2026" },
    title: { es: "Un editor visual más rápido y preciso", en: "A faster, more precise visual editor" },
    summary: {
      es: "Reconstruimos la experiencia del lienzo sobre Fabric para que crear, mover y organizar elementos se sienta natural incluso en plantillas grandes.",
      en: "We rebuilt the canvas experience on Fabric so creating, moving and organizing elements feels natural, even in large templates.",
    },
    category: "editor",
    image: "/landing/editor-workspace-en.webp",
    imageEs: "/landing/editor-workspace-es.webp",
    imageAlt: "Dynamic Canvas visual editor",
    accent: "#5b35d5",
    soft: "#eeeaff",
    icon: MousePointer2,
    highlights: [
      { es: "Redimensiona desde cualquier lado sin deformar texto ni imágenes.", en: "Resize from every side without stretching text or images." },
      { es: "Guías magnéticas para alinear al centro y con otros elementos.", en: "Magnetic guides for canvas-center and object alignment." },
      { es: "Panel de capas flotante con orden en vivo, bloqueo y nombres editables.", en: "Floating layers panel with live ordering, locking and editable names." },
      { es: "Zoom estable, selección limpia y guardado manual desde la barra superior.", en: "Stable zoom, cleaner selection and manual saving from the top bar." },
    ],
    tags: [
      { es: "Lienzo", en: "Canvas" },
      { es: "Capas", en: "Layers" },
      { es: "Alineación", en: "Alignment" },
    ],
  },
  {
    version: "Editor 2.3",
    date: { es: "14 de julio de 2026", en: "July 14, 2026" },
    title: { es: "Herramientas de imagen que sí dan control", en: "Image tools that put you in control" },
    summary: {
      es: "Editar una foto ya no exige salir del proyecto. El recorte, las máscaras, los bordes y los ajustes viven directamente en el editor.",
      en: "Editing a photo no longer means leaving your project. Crop, masks, borders and adjustments now live directly inside the editor.",
    },
    category: "images",
    image: "/pink-running-shoe-optimized.webp",
    imageAlt: "Product image edited in Dynamic Canvas",
    accent: "#df5d56",
    soft: "#fff0ee",
    icon: WandSparkles,
    highlights: [
      { es: "Recorte interactivo con movimiento, zoom, cancelar y aplicar.", en: "Interactive crop with pan, zoom, cancel and apply." },
      { es: "Máscaras: círculo, estrella, triángulo, diamante y polígonos.", en: "Masks: circle, star, triangle, diamond and polygons." },
      { es: "Bordes uniformes, radio en px o %, sombras y bordes suaves.", en: "Uniform borders, px/% radius, shadows and soft edges." },
      { es: "Filtros, temperatura, contraste, saturación y modos de mezcla.", en: "Filters, temperature, contrast, saturation and blend modes." },
      { es: "Pixabay con miniaturas rápidas y carga de la versión HD en segundo plano.", en: "Pixabay with fast thumbnails and background HD loading." },
    ],
    tags: [
      { es: "Recorte", en: "Crop" },
      { es: "Efectos", en: "Effects" },
      { es: "Pixabay", en: "Pixabay" },
    ],
  },
  {
    version: "Editor 2.2",
    date: { es: "13 de julio de 2026", en: "July 13, 2026" },
    title: { es: "Tipografía y cajas de texto mejoradas", en: "Better typography and text boxes" },
    summary: {
      es: "Las cajas conservan su tamaño y posición mientras el texto fluye correctamente. También ampliamos las opciones tipográficas para diseños más cuidados.",
      en: "Text boxes keep their size and position while text flows correctly. We also expanded typography controls for more polished designs.",
    },
    category: "text",
    image: "/car_sale.png",
    imageAlt: "Typography-driven automotive story design",
    accent: "#f1672d",
    soft: "#fff2e9",
    icon: Type,
    highlights: [
      { es: "Salto de línea por palabra dentro del ancho definido.", en: "Word wrapping inside the defined box width." },
      { es: "Alineación vertical del texto arriba, centro o abajo.", en: "Vertical text alignment: top, middle or bottom." },
      { es: "Espaciado entre letras y altura de línea con slider y valor exacto.", en: "Letter spacing and line height with slider and exact values." },
      { es: "Más fuentes populares y carga de fuentes personalizada para planes pagos.", en: "More popular fonts and custom font uploads for paid plans." },
      { es: "Edición en el lienzo sin saltos de tamaño ni desplazamientos inesperados.", en: "In-canvas editing without font jumps or unexpected shifting." },
    ],
    tags: [
      { es: "Texto", en: "Text" },
      { es: "Fuentes", en: "Fonts" },
      { es: "Espaciado", en: "Spacing" },
    ],
  },
  {
    version: "Editor 2.1",
    date: { es: "12 de julio de 2026", en: "July 12, 2026" },
    title: { es: "Flujo de trabajo más rápido", en: "A faster editing workflow" },
    summary: {
      es: "Añadimos los pequeños detalles que ahorran cientos de clics: atajos, historial, acciones de capa y miniaturas limpias.",
      en: "We added the small details that save hundreds of clicks: shortcuts, history, layer actions and clean thumbnails.",
    },
    category: "workflow",
    image: "/changelog/editor-workspace.png",
    imageAlt: "Layers and editing workflow in Dynamic Canvas",
    accent: "#2272db",
    soft: "#eaf3ff",
    icon: Keyboard,
    highlights: [
      { es: "Ctrl/Cmd + Z, C, V, duplicar, eliminar y selección rápida.", en: "Ctrl/Cmd + Z, C, V, duplicate, delete and quick selection." },
      { es: "Deshacer y rehacer junto al botón Guardar.", en: "Undo and redo beside the Save button." },
      { es: "Enviar atrás y traer adelante sincronizado con el panel de capas.", en: "Send backward and bring forward synced with the Layers panel." },
      { es: "Las capas bloqueadas siguen siendo seleccionables para desbloquearlas.", en: "Locked layers stay selectable so they can be unlocked in place." },
      { es: "Miniaturas guardadas sin controles ni selección visible.", en: "Saved thumbnails without controls or active selection." },
    ],
    tags: [
      { es: "Atajos", en: "Shortcuts" },
      { es: "Historial", en: "History" },
      { es: "Productividad", en: "Productivity" },
    ],
  },
  {
    version: "Render 2.0",
    date: { es: "11 de julio de 2026", en: "July 11, 2026" },
    title: { es: "Del editor al render en alta calidad", en: "From editor to high-quality render" },
    summary: {
      es: "El resultado del editor, Playground y API ahora comparte el mismo motor para mantener posiciones, fuentes e imágenes con calidad 2×.",
      en: "Editor, Playground and API output now share the same engine to preserve positions, fonts and images at 2× quality.",
    },
    category: "api",
    image: "/flash_sale.png",
    imageAlt: "High resolution automated render",
    accent: "#16966a",
    soft: "#e9f9f2",
    icon: Braces,
    highlights: [
      { es: "Exportación y API en HD con pixel ratio 2×.", en: "HD export and API output with a 2× pixel ratio." },
      { es: "Respuesta JSON clara con URL, tamaño, tiempo y créditos restantes.", en: "Clear JSON response with URL, dimensions, timing and credits." },
      { es: "Galería de renders por usuario y logs internos ocultos.", en: "Per-user render gallery with internal logs hidden." },
      { es: "Playground visual para probar capas antes de integrar.", en: "Visual Playground for testing layers before integration." },
    ],
    tags: [
      { es: "HD", en: "HD" },
      { es: "API", en: "API" },
      { es: "Playground", en: "Playground" },
    ],
  },
];

const FILTERS: Array<{ value: "all" | ReleaseCategory; icon: typeof Sparkles; es: string; en: string }> = [
  { value: "all", icon: Sparkles, es: "Todo", en: "All" },
  { value: "editor", icon: MousePointer2, es: "Editor", en: "Editor" },
  { value: "images", icon: ImageIcon, es: "Imágenes", en: "Images" },
  { value: "text", icon: Type, es: "Texto", en: "Text" },
  { value: "workflow", icon: Layers3, es: "Flujo", en: "Workflow" },
  { value: "api", icon: Braces, es: "Render y API", en: "Render & API" },
];

export default function ChangelogPage() {
  const { language } = useLanguage();
  const es = language === "es";
  const [filter, setFilter] = useState<"all" | ReleaseCategory>("all");

  const releases = useMemo(
    () => RELEASES.filter((release) => filter === "all" || release.category === filter),
    [filter],
  );

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#101426]">
      <header className="sticky top-0 z-40 border-b border-[#101426]/8 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <Image src="/dynamic-canvas-logo.png" alt="Dynamic Canvas" width={178} height={66} className="h-11 w-auto object-contain" priority />
          </Link>
          <div className="flex items-center gap-2">
            <button aria-label={es ? "Notificaciones" : "Notifications"} className="flex size-10 items-center justify-center rounded-xl border border-[#101426]/10 bg-white text-[#596174] transition hover:border-[#5b35d5]/25 hover:text-[#5b35d5]"><Bell className="size-4" /></button>
            <Link href="/dashboard" className="flex h-10 items-center gap-2 rounded-xl bg-[#101426] px-4 text-xs font-black text-white transition hover:bg-[#5b35d5]"><ArrowLeft className="size-3.5" /><span className="hidden sm:inline">{es ? "Volver al dashboard" : "Back to dashboard"}</span></Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1440px] items-center overflow-x-auto px-5 sm:px-8">
          <Link href="/dashboard" className="flex h-14 shrink-0 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-black text-[#596174] transition hover:text-[#5b35d5]"><ArrowLeft className="size-4" />{es ? "Volver al sitio" : "Back to site"}</Link>
          <Link href="/feedback" className="flex h-14 shrink-0 items-center gap-2 border-b-2 border-transparent px-5 text-sm font-black text-[#596174] transition hover:bg-[#fafafe] hover:text-[#5b35d5]"><LayoutList className="size-4" />Feedback</Link>
          <Link href="/roadmap" className="flex h-14 shrink-0 items-center gap-2 border-b-2 border-transparent px-5 text-sm font-black text-[#596174] transition hover:bg-[#fafafe] hover:text-[#5b35d5]"><Map className="size-4" />Roadmap</Link>
          <span className="flex h-14 shrink-0 items-center gap-2 border-b-2 border-[#5b35d5] bg-[#f5f2ff] px-5 text-sm font-black text-[#5b35d5]"><GitBranch className="size-4" />Changelog</span>
        </nav>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 pb-20 pt-8 sm:px-8 sm:pt-12">
        <section className="relative overflow-hidden rounded-[32px] border border-[#5b35d5]/10 bg-[radial-gradient(circle_at_85%_10%,rgba(182,255,71,.35),transparent_22%),radial-gradient(circle_at_5%_100%,rgba(91,53,213,.18),transparent_30%),linear-gradient(135deg,#101426,#171a30)] px-6 py-10 text-white shadow-[0_30px_80px_rgba(16,20,38,.16)] sm:px-10 sm:py-14 lg:px-14">
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-[#b6ff47]"><Sparkles className="size-4" />{es ? "Novedades del producto" : "Product updates"}</div>
              <h1 className="mt-5 text-4xl font-black leading-[.96] tracking-[-.05em] sm:text-6xl">{es ? "Todo lo nuevo dentro del editor." : "Everything new inside the editor."}</h1>
              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-white/62 sm:text-lg">{es ? "Mejoras reales para diseñar más rápido, mantener cada elemento bajo control y renderizar sin perder calidad." : "Real improvements to design faster, keep every element under control and render without losing quality."}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-white/10 bg-white/[.06] p-4 backdrop-blur"><strong className="block text-2xl font-black">30+</strong><span className="mt-1 block text-[11px] font-bold text-white/45">{es ? "mejoras" : "improvements"}</span></div>
              <div className="rounded-2xl border border-white/10 bg-white/[.06] p-4 backdrop-blur"><strong className="block text-2xl font-black">5</strong><span className="mt-1 block text-[11px] font-bold text-white/45">{es ? "entregas" : "releases"}</span></div>
              <div className="rounded-2xl border border-[#b6ff47]/25 bg-[#b6ff47]/10 p-4 backdrop-blur"><strong className="block text-2xl font-black text-[#b6ff47]">2×</strong><span className="mt-1 block text-[11px] font-bold text-white/45">{es ? "calidad HD" : "HD quality"}</span></div>
            </div>
          </div>
        </section>

        <div className="sticky top-[134px] z-30 -mx-4 mt-7 overflow-x-auto border-y border-[#101426]/6 bg-[#f7f8fc]/92 px-4 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
          <div className="mx-auto flex w-max items-center gap-2">
            {FILTERS.map((item) => {
              const Icon = item.icon;
              const active = filter === item.value;
              return <button key={item.value} onClick={() => setFilter(item.value)} className={`flex h-10 items-center gap-2 rounded-xl border px-4 text-xs font-black transition ${active ? "border-[#5b35d5] bg-[#5b35d5] text-white shadow-[0_8px_22px_rgba(91,53,213,.18)]" : "border-[#101426]/9 bg-white text-[#596174] hover:border-[#5b35d5]/25 hover:text-[#5b35d5]"}`}><Icon className="size-3.5" />{es ? item.es : item.en}</button>;
            })}
          </div>
        </div>

        <div className="mt-10 space-y-10">
          {releases.map((release, index) => {
            const Icon = release.icon;
            const imageSrc = es && release.imageEs ? release.imageEs : release.image;
            return (
              <article key={release.version} className="group overflow-hidden rounded-[28px] border border-[#101426]/8 bg-white shadow-[0_18px_60px_rgba(16,20,38,.06)]">
                <div className={`grid ${index % 2 === 0 ? "lg:grid-cols-[1.04fr_.96fr]" : "lg:grid-cols-[.96fr_1.04fr]"}`}>
                  <div className={`relative min-h-[320px] overflow-hidden bg-[#eef0f6] ${index % 2 !== 0 ? "lg:order-2" : ""}`}>
                    <Image src={imageSrc} alt={release.imageAlt} fill sizes="(min-width: 1024px) 600px, 100vw" className={`${release.category === "editor" || release.category === "workflow" ? "object-cover object-center" : "object-contain p-7 sm:p-10"} transition duration-700 group-hover:scale-[1.015]`} />
                    <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/50 bg-white/88 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#101426] shadow-sm backdrop-blur"><Icon className="size-3.5" style={{ color: release.accent }} />{release.version}</div>
                  </div>
                  <div className={`flex flex-col justify-center p-6 sm:p-9 lg:p-11 ${index % 2 !== 0 ? "lg:order-1" : ""}`}>
                    <div className="flex flex-wrap items-center gap-3">
                      <time className="text-xs font-black uppercase tracking-[.13em]" style={{ color: release.accent }}>{es ? release.date.es : release.date.en}</time>
                      <span className="h-1 w-1 rounded-full bg-[#101426]/20" />
                      <span className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em]" style={{ color: release.accent, backgroundColor: release.soft }}>{es ? "Disponible" : "Available"}</span>
                    </div>
                    <h2 className="mt-4 text-3xl font-black leading-[1.02] tracking-[-.04em] sm:text-4xl">{es ? release.title.es : release.title.en}</h2>
                    <p className="mt-4 text-sm font-medium leading-relaxed text-[#596174] sm:text-[15px]">{es ? release.summary.es : release.summary.en}</p>
                    <ul className="mt-6 space-y-3">
                      {release.highlights.map((highlight) => <li key={highlight.en} className="flex items-start gap-3 text-sm font-semibold leading-snug text-[#343a50]"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full" style={{ color: release.accent, backgroundColor: release.soft }}><Check className="size-3 stroke-[3]" /></span>{es ? highlight.es : highlight.en}</li>)}
                    </ul>
                    <div className="mt-7 flex flex-wrap gap-2">{release.tags.map((tag) => <span key={tag.en} className="rounded-lg border border-[#101426]/8 bg-[#fafafe] px-2.5 py-1.5 text-[10px] font-black text-[#596174]">{es ? tag.es : tag.en}</span>)}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <section className="mt-12 overflow-hidden rounded-[28px] border border-[#5b35d5]/12 bg-gradient-to-br from-[#eeeaff] via-white to-[#f4f8ff] p-7 sm:p-10">
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#5b35d5]"><Zap className="size-4" />{es ? "Lo siguiente" : "What’s next"}</div>
              <h2 className="mt-3 text-3xl font-black tracking-[-.04em]">{es ? "Tú ayudas a decidir la próxima mejora." : "You help decide the next improvement."}</h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[#596174]">{es ? "Consulta la hoja de ruta, vota por las funciones que necesitas o cuéntanos qué debería mejorar dentro del editor." : "Browse the roadmap, vote for the features you need or tell us what should improve inside the editor."}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/roadmap" className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#5b35d5]/18 bg-white px-5 text-xs font-black text-[#5b35d5] transition hover:-translate-y-0.5 hover:shadow-lg"><Map className="size-4" />{es ? "Ver hoja de ruta" : "View roadmap"}</Link>
              <Link href="/feedback" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#5b35d5] px-5 text-xs font-black text-white shadow-[0_12px_24px_rgba(91,53,213,.2)] transition hover:-translate-y-0.5"><Palette className="size-4" />{es ? "Sugerir una mejora" : "Suggest an improvement"}</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
