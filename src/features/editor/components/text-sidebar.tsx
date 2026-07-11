"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ActiveTool, Editor } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/contexts/LanguageContext";

interface TextSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

const PRESET_TITLES = [
  { text: "SPECIAL OFFER", color: "#ef4444", fontFamily: "Impact", fontSize: 60 },
  { text: "DOWNLOAD NOW", color: "#22c55e", fontFamily: "Arial Black", fontSize: 56 },
  { text: "BEST SELLER", color: "#f59e0b", fontFamily: "Georgia", fontSize: 58 },
  { text: "BUY HERE", color: "#3b82f6", fontFamily: "Verdana", fontSize: 54 },
  { text: "SALE", color: "#ec4899", fontFamily: "Impact", fontSize: 72 },
  { text: "NEW ARRIVAL", color: "#8b5cf6", fontFamily: "Trebuchet MS", fontSize: 52 },
  { text: "LIMITED TIME", color: "#06b6d4", fontFamily: "Arial Black", fontSize: 50 },
  { text: "FREE SHIPPING", color: "#10b981", fontFamily: "Tahoma", fontSize: 48 },
  { text: "HOT DEAL", color: "#f97316", fontFamily: "Impact", fontSize: 64 },
  { text: "50% OFF", color: "#dc2626", fontFamily: "Arial Black", fontSize: 68 },
  { text: "EXCLUSIVE", color: "#7c3aed", fontFamily: "Georgia", fontSize: 54 },
  { text: "COMING SOON", color: "#0ea5e9", fontFamily: "Trebuchet MS", fontSize: 52 },
  { text: "SUMMER SALE", color: "#fbbf24", fontFamily: "Impact", fontSize: 56 },
  { text: "WINTER DEAL", color: "#38bdf8", fontFamily: "Arial Black", fontSize: 52 },
  { text: "MUST HAVE", color: "#f472b6", fontFamily: "Georgia", fontSize: 50 },
  { text: "TRENDING", color: "#a855f7", fontFamily: "Verdana", fontSize: 48 },
  { text: "FLASH SALE", color: "#ef4444", fontFamily: "Impact", fontSize: 58 },
  { text: "GET IT NOW", color: "#22c55e", fontFamily: "Arial Black", fontSize: 52 },
  { text: "TOP RATED", color: "#eab308", fontFamily: "Georgia", fontSize: 50 },
  { text: "POPULAR", color: "#f97316", fontFamily: "Trebuchet MS", fontSize: 48 },
  { text: "WOW!", color: "#ec4899", fontFamily: "Impact", fontSize: 80 },
  { text: "AMAZING", color: "#8b5cf6", fontFamily: "Arial Black", fontSize: 56 },
  { text: "DON'T MISS", color: "#dc2626", fontFamily: "Georgia", fontSize: 48 },
  { text: "HURRY UP!", color: "#f59e0b", fontFamily: "Impact", fontSize: 54 },
  { text: "TODAY ONLY", color: "#0ea5e9", fontFamily: "Arial Black", fontSize: 46 },
  { text: "MEGA SALE", color: "#be185d", fontFamily: "Impact", fontSize: 62 },
  { text: "BLACK FRIDAY", color: "#1f2937", fontFamily: "Arial Black", fontSize: 52 },
  { text: "CYBER MONDAY", color: "#2563eb", fontFamily: "Impact", fontSize: 48 },
  { text: "BIG SAVE", color: "#16a34a", fontFamily: "Georgia", fontSize: 54 },
  { text: "PREMIUM", color: "#b45309", fontFamily: "Times New Roman", fontSize: 50 },
];

export const TextSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: TextSidebarProps) => {
  const { language } = useLanguage();

  const addPreset = (preset: typeof PRESET_TITLES[number]) => {
    editor?.addText(preset.text, {
      fontSize: preset.fontSize,
      fontFamily: preset.fontFamily,
      fill: preset.color,
      fontWeight: preset.fontFamily === "Impact" || preset.fontFamily === "Arial Black"
        ? 900
        : 700,
    });
  };

  return (
    <aside
      className={cn(
        "relative z-[40] flex h-full w-[320px] flex-col border-r bg-white",
        activeTool === "text" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title={language === "es" ? "Texto" : "Text"}
        description={language === "es" ? "Agrega texto a tu lienzo" : "Add text to your canvas"}
      />
      <ScrollArea>
        <div className="space-y-5 p-4">
          <section>
            <h3 className="mb-2 text-xs font-medium text-slate-500">
              {language === "es" ? "Agregar texto" : "Add text"}
            </h3>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => editor?.addText("Heading", { fontSize: 80, fontWeight: 700 })}
                className="flex h-14 items-center justify-center rounded-lg border border-transparent bg-slate-50 text-2xl font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
              >
                {language === "es" ? "Título" : "Heading"}
              </button>
              <button
                type="button"
                onClick={() => editor?.addText("Subheading", { fontSize: 44, fontWeight: 600 })}
                className="flex h-12 items-center justify-center rounded-lg border border-transparent bg-slate-50 text-xl font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
              >
                {language === "es" ? "Subtítulo" : "Subheading"}
              </button>
              <button
                type="button"
                onClick={() => editor?.addText("Textbox")}
                className="flex h-11 items-center justify-center rounded-lg border border-transparent bg-slate-50 text-lg font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
              >
                {language === "es" ? "Caja de texto" : "Text Box"}
              </button>
              <button
                type="button"
                onClick={() => editor?.addText("Paragraph", { fontSize: 32 })}
                className="flex h-10 items-center justify-center rounded-lg border border-transparent bg-slate-50 text-base text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
              >
                {language === "es" ? "Párrafo" : "Paragraph"}
              </button>
            </div>
          </section>

          <section className="border-t pt-4">
            <h3 className="mb-2 text-xs font-medium text-slate-500">
              {language === "es" ? "Títulos predefinidos" : "Preset titles"}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_TITLES.map((preset) => {
                const previewSize = preset.text.length > 10
                  ? 10
                  : preset.text.length > 6
                    ? 12
                    : 14;
                const previewWeight = preset.fontFamily === "Impact" || preset.fontFamily === "Arial Black"
                  ? 900
                  : 700;

                return (
                  <button
                    key={preset.text}
                    type="button"
                    title={`${preset.text} · ${preset.fontFamily}`}
                    onClick={() => addPreset(preset)}
                    className="flex h-12 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 px-2 transition hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
                  >
                    <span
                      className="truncate tracking-wide"
                      style={{
                        color: preset.color,
                        fontFamily: preset.fontFamily,
                        fontSize: previewSize,
                        fontWeight: previewWeight,
                      }}
                    >
                      {preset.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={() => onChangeActiveTool("select")} />
    </aside>
  );
};
