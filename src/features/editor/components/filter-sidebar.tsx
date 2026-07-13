"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";

import { ActiveTool, Editor } from "@/features/editor/types";
import {
  DEFAULT_IMAGE_EFFECTS,
  ImageEffectSettings,
  ImagePreset,
} from "@/features/editor/image-effects";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface FilterSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

type AdjustmentKey =
  | "blur"
  | "brightness"
  | "temperature"
  | "contrast"
  | "saturation"
  | "vibrance"
  | "whites"
  | "blacks";

const PRESETS: Array<{
  value: ImagePreset;
  label: { en: string; es: string };
  cssFilter: string;
}> = [
  { value: "none", label: { en: "None", es: "Ninguno" }, cssFilter: "none" },
  { value: "grayscale", label: { en: "Grayscale", es: "Escala de grises" }, cssFilter: "grayscale(1)" },
  { value: "sepia", label: { en: "Sepia", es: "Sepia" }, cssFilter: "sepia(1)" },
  { value: "cold", label: { en: "Cold", es: "Frío" }, cssFilter: "saturate(.9) hue-rotate(175deg)" },
  { value: "natural", label: { en: "Natural", es: "Natural" }, cssFilter: "contrast(1.05) saturate(1.06)" },
  { value: "warm", label: { en: "Warm", es: "Cálido" }, cssFilter: "sepia(.2) saturate(1.15)" },
];

const ADJUSTMENTS: Array<{
  key: AdjustmentKey;
  label: { en: string; es: string };
  min: number;
  max: number;
}> = [
  { key: "blur", label: { en: "Blur", es: "Desenfoque" }, min: 0, max: 100 },
  { key: "brightness", label: { en: "Brightness", es: "Brillo" }, min: -100, max: 100 },
  { key: "temperature", label: { en: "Temperature", es: "Temperatura" }, min: -100, max: 100 },
  { key: "contrast", label: { en: "Contrast", es: "Contraste" }, min: -100, max: 100 },
  { key: "saturation", label: { en: "Saturation", es: "Saturación" }, min: -100, max: 100 },
  { key: "vibrance", label: { en: "Vibrance", es: "Intensidad" }, min: -100, max: 100 },
  { key: "whites", label: { en: "White", es: "Blancos" }, min: -100, max: 100 },
  { key: "blacks", label: { en: "Black", es: "Negros" }, min: -100, max: 100 },
];

const BLEND_MODES = [
  ["source-over", "Normal"],
  ["multiply", "Multiply"],
  ["screen", "Screen"],
  ["overlay", "Overlay"],
  ["darken", "Darken"],
  ["lighten", "Lighten"],
  ["color-dodge", "Color Dodge"],
  ["color-burn", "Color Burn"],
];

const SliderRow = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between gap-3">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        aria-label={`${label} value`}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-7 w-16 rounded-md border border-slate-200 px-2 text-right text-xs tabular-nums outline-none focus:border-blue-500"
      />
    </div>
    <input
      aria-label={label}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
    />
  </div>
);

export const FilterSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FilterSidebarProps) => {
  const { language } = useLanguage();
  const selectedObject = editor?.selectedObjects[0];
  const [settings, setSettings] = useState<ImageEffectSettings>(DEFAULT_IMAGE_EFFECTS);

  useEffect(() => {
    if (activeTool === "filter" && selectedObject?.type === "image") {
      setSettings(editor?.getActiveImageEffects() || DEFAULT_IMAGE_EFFECTS);
    }
  }, [activeTool, editor, selectedObject]);

  const imageSrc = useMemo(() => {
    if (selectedObject?.type !== "image") return "";
    const element = (selectedObject as any).getElement?.() as HTMLImageElement | undefined;
    return element?.currentSrc || element?.src || "";
  }, [selectedObject]);

  const update = (values: Partial<ImageEffectSettings>) => {
    setSettings((current) => ({ ...current, ...values }));
    editor?.updateActiveImageEffects(values);
  };

  const reset = () => {
    setSettings({ ...DEFAULT_IMAGE_EFFECTS });
    editor?.resetActiveImageEffects();
  };

  return (
    <aside
      className={cn(
        "relative z-[40] flex h-full w-[340px] shrink-0 flex-col border-r bg-white",
        activeTool === "filter" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title={language === "es" ? "Efectos de imagen" : "Image Effects"}
        description={language === "es"
          ? "Filtros, ajustes y modo de mezcla"
          : "Filters, adjustments and blend mode"}
      />
      <div className="border-b px-4 pb-3">
        <Button type="button" variant="outline" className="w-full gap-2" onClick={reset}>
          <RotateCcw className="size-4" />
          {language === "es" ? "Restablecer todo" : "Reset All"}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4 pb-12">
          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              {language === "es" ? "Preajustes" : "Presets"}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => update({ preset: preset.value })}
                  className={cn(
                    "overflow-hidden rounded-xl border bg-white text-left transition hover:border-blue-300 hover:shadow-sm",
                    settings.preset === preset.value && "border-blue-600 ring-2 ring-blue-100",
                  )}
                >
                  <div
                    className="h-20 bg-slate-100 bg-cover bg-center"
                    style={{
                      backgroundImage: imageSrc ? `url(${JSON.stringify(imageSrc).slice(1, -1)})` : undefined,
                      filter: preset.cssFilter,
                    }}
                  />
                  <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                    <span className="truncate text-xs font-medium text-slate-700">
                      {preset.label[language === "es" ? "es" : "en"]}
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600">
                      {language === "es" ? "Aplicar" : "Apply"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4 border-t pt-5">
            <h3 className="text-sm font-semibold text-slate-900">
              {language === "es" ? "Ajustes" : "Adjustments"}
            </h3>
            {ADJUSTMENTS.map((adjustment) => (
              <SliderRow
                key={adjustment.key}
                label={adjustment.label[language === "es" ? "es" : "en"]}
                value={settings[adjustment.key]}
                min={adjustment.min}
                max={adjustment.max}
                onChange={(value) => update({ [adjustment.key]: value })}
              />
            ))}
          </section>

          <section className="space-y-3 border-t pt-5">
            <h3 className="text-sm font-semibold text-slate-900">
              {language === "es" ? "Modo de mezcla" : "Blend Mode"}
            </h3>
            <select
              aria-label={language === "es" ? "Modo de mezcla" : "Blend mode"}
              value={settings.blendMode}
              onChange={(event) => update({ blendMode: event.target.value })}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
            >
              {BLEND_MODES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </section>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={() => onChangeActiveTool("select")} />
    </aside>
  );
};
