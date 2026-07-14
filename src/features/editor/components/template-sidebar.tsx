"use client";

import {
  BriefcaseBusiness,
  FileText,
  GalleryHorizontalEnd,
  Instagram,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { DESIGN_PRESETS, DesignPreset } from "@/features/editor/design-presets";
import { ActiveTool, Editor } from "@/features/editor/types";
import { useConfirm } from "@/hooks/use-confirm";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface TemplateSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

type Category = "all" | DesignPreset["category"];

const CATEGORIES: Array<{ id: Category; labelEn: string; labelEs: string; icon: typeof GalleryHorizontalEnd }> = [
  { id: "all", labelEn: "Gallery", labelEs: "Galería", icon: GalleryHorizontalEnd },
  { id: "social", labelEn: "Social", labelEs: "Redes", icon: Instagram },
  { id: "business", labelEn: "Business", labelEs: "Negocios", icon: BriefcaseBusiness },
  { id: "documents", labelEn: "Documents", labelEs: "Documentos", icon: FileText },
  { id: "seasonal", labelEn: "Seasonal", labelEs: "Temporada", icon: Sparkles },
];

const SIZE_FILTERS = [
  { id: "all", labelEn: "All sizes", labelEs: "Todos", size: null },
  { id: "square", labelEn: "Square", labelEs: "Cuadrado", size: [1080, 1080] as const },
  { id: "portrait", labelEn: "Portrait post", labelEs: "Post vertical", size: [1080, 1350] as const },
  { id: "story", labelEn: "Story / Reel", labelEs: "Historia / Reel", size: [1080, 1920] as const },
  { id: "youtube", labelEn: "YouTube", labelEs: "YouTube", size: [1280, 720] as const },
  { id: "open-graph", labelEn: "Open Graph", labelEs: "Open Graph", size: [1200, 630] as const },
  { id: "document", labelEn: "Documents", labelEs: "Documentos", size: "document" as const },
];

export const TemplateSidebar = ({ editor, activeTool, onChangeActiveTool }: TemplateSidebarProps) => {
  const { language } = useLanguage();
  const isSpanish = language === "es";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [ConfirmDialog, confirm] = useConfirm(
    isSpanish ? "¿Usar este diseño?" : "Use this design?",
    isSpanish
      ? "El diseño reemplazará el contenido actual del lienzo."
      : "This design will replace the current canvas content.",
  );

  const filteredPresets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const selectedSize = SIZE_FILTERS.find((item) => item.id === sizeFilter)?.size;

    return DESIGN_PRESETS.filter((preset) => {
      const matchesCategory = category === "all" || preset.category === category;
      const matchesSearch = !normalized || [preset.name, ...preset.keywords]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
      const matchesSize = !selectedSize
        || (selectedSize === "document"
          ? preset.category === "documents"
          : preset.width === selectedSize[0] && preset.height === selectedSize[1]);
      return matchesCategory && matchesSearch && matchesSize;
    });
  }, [category, query, sizeFilter]);

  const close = () => onChangeActiveTool("select");
  const applyPreset = async (preset: DesignPreset) => {
    if (!(await confirm())) return;
    editor?.loadJson(preset.json);
    close();
  };

  if (activeTool !== "templates") return null;

  return (
    <section className="fixed inset-0 z-[120] flex items-center justify-center bg-[#101426]/45 p-3 text-[#101426] backdrop-blur-[2px] sm:p-6">
      <ConfirmDialog />

      <div className="flex h-[min(94vh,1040px)] w-full max-w-[1720px] flex-col overflow-hidden rounded-[28px] border-2 border-white/70 bg-[#fbfbfd] shadow-[0_32px_100px_rgba(16,20,38,0.35)]">
      <header className="relative flex min-h-[74px] items-center justify-center border-b border-[#101426]/10 bg-white px-16">
        <nav className="flex max-w-[calc(100vw-150px)] items-center gap-1 overflow-x-auto rounded-full bg-[#f2f2f5] p-1.5">
          {CATEGORIES.map((item) => {
            const Icon = item.icon;
            const active = category === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                className={cn(
                  "flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-bold transition",
                  active ? "bg-white text-[#101426] shadow-sm" : "text-[#101426]/55 hover:text-[#101426]",
                )}
              >
                <Icon className="size-4" />
                {isSpanish ? item.labelEs : item.labelEn}
              </button>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={close}
          aria-label={isSpanish ? "Cerrar diseños" : "Close designs"}
          className="absolute right-6 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-[#101426]/45 transition hover:bg-[#f2f2f5] hover:text-[#101426]"
        >
          <X className="size-6" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1720px] px-6 pb-16 pt-9 sm:px-10 lg:px-14">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#5b35d5]">
              {DESIGN_PRESETS.length} {isSpanish ? "diseños editables" : "editable designs"}
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              {isSpanish ? "Elige un punto de partida" : "Choose a starting point"}
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-[#101426]/50">
              {isSpanish
                ? "Todos los textos, colores, formas e imágenes se pueden editar en el lienzo."
                : "Every text, color, shape and image can be edited on the canvas."}
            </p>
          </div>

          <div className="relative mx-auto mt-7 max-w-3xl">
            <Search className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#101426]/30" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isSpanish ? "Buscar diseños, formatos o ideas" : "Search designs, formats or ideas"}
              className="h-14 rounded-full border-2 border-[#101426]/10 bg-white pl-14 pr-6 text-base shadow-sm focus-visible:border-[#5b35d5] focus-visible:ring-0"
            />
          </div>

          <div className="mt-8 flex gap-3 overflow-x-auto pb-3">
            {SIZE_FILTERS.map((item) => {
              const active = sizeFilter === item.id;
              const dimensions = Array.isArray(item.size) ? `${item.size[0]} × ${item.size[1]}` : "";
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSizeFilter(item.id)}
                  className={cn(
                    "min-w-[142px] shrink-0 rounded-2xl border-2 px-4 py-3 text-left transition",
                    active
                      ? "border-[#5b35d5] bg-[#e9e5ff] shadow-[3px_3px_0_#5b35d5]"
                      : "border-[#101426]/10 bg-white hover:border-[#101426]/25",
                  )}
                >
                  <p className="text-sm font-black">{isSpanish ? item.labelEs : item.labelEn}</p>
                  <p className="mt-1 text-[11px] font-semibold text-[#101426]/42">{dimensions || (isSpanish ? "Varios tamaños" : "Multiple sizes")}</p>
                </button>
              );
            })}
          </div>

          {filteredPresets.length > 0 ? (
            <div className="mt-8 columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6">
              {filteredPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => void applyPreset(preset)}
                  className="group mb-5 block w-full break-inside-avoid text-left"
                >
                  <div className="relative overflow-hidden rounded-2xl border-2 border-[#101426]/10 bg-[#f1f1f4] shadow-sm transition group-hover:-translate-y-1 group-hover:border-[#5b35d5] group-hover:shadow-[6px_6px_0_rgba(91,53,213,.18)]">
                    <div className="relative" style={{ aspectRatio: `${preset.width}/${preset.height}` }}>
                      {preset.previewPhotoUrl && (
                        <img
                          src={preset.previewPhotoUrl}
                          alt=""
                          loading="lazy"
                          className="absolute inset-0 size-full object-cover"
                        />
                      )}
                      <img
                        src={preset.thumbnailUrl}
                        alt={preset.name}
                        loading="lazy"
                        className="absolute inset-0 size-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#101426]/80 via-transparent to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                      <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#101426]">
                        {isSpanish ? "Usar diseño" : "Use design"}
                      </span>
                    </div>
                  </div>
                  <h2 className="mt-3 truncate text-sm font-black">{preset.name}</h2>
                  <p className="mt-0.5 text-xs font-semibold text-[#101426]/42">{preset.width} × {preset.height} px</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-24 text-center">
              <GalleryHorizontalEnd className="size-10 text-[#101426]/20" />
              <h2 className="mt-4 text-lg font-black">{isSpanish ? "No encontramos coincidencias" : "No matching designs"}</h2>
              <button
                type="button"
                onClick={() => { setQuery(""); setCategory("all"); setSizeFilter("all"); }}
                className="mt-3 text-sm font-bold text-[#5b35d5] hover:underline"
              >
                {isSpanish ? "Limpiar filtros" : "Clear filters"}
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </section>
  );
};
