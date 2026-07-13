"use client";

import { useEffect, useRef } from "react";
import { Check, Minus, Plus, X } from "lucide-react";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ImageCropState } from "@/features/editor/image-effects";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/contexts/LanguageContext";

interface ImageCropOverlayProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const ImageCropOverlay = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ImageCropOverlayProps) => {
  const { language } = useLanguage();
  const initialState = useRef<ImageCropState>();

  useEffect(() => {
    if (activeTool === "crop") {
      initialState.current = editor?.getActiveImageCropState();
    } else {
      initialState.current = undefined;
    }
  }, [activeTool, editor]);

  if (activeTool !== "crop") return null;

  const cancel = () => {
    if (initialState.current) editor?.setActiveImageCropState(initialState.current);
    onChangeActiveTool("select");
  };

  const done = () => {
    editor?.commitActiveImageCrop();
    onChangeActiveTool("select");
  };

  return (
    <div className="absolute inset-0 z-[65] bg-slate-950/40 backdrop-blur-[1px]">
      <div className="pointer-events-none absolute inset-x-0 top-5 text-center text-sm font-medium text-white drop-shadow">
        {language === "es"
          ? "Ajusta el encuadre con los controles de zoom"
          : "Adjust the crop with the zoom controls"}
      </div>
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/70 bg-white p-3 shadow-2xl">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={language === "es" ? "Alejar imagen" : "Zoom out"}
          onClick={() => editor?.adjustActiveImageCropZoom("out")}
        >
          <Minus className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={language === "es" ? "Acercar imagen" : "Zoom in"}
          onClick={() => editor?.adjustActiveImageCropZoom("in")}
        >
          <Plus className="size-4" />
        </Button>
        <div className="mx-1 h-8 w-px bg-slate-200" />
        <Button type="button" variant="outline" onClick={cancel} className="gap-2">
          <X className="size-4" />
          {language === "es" ? "Cancelar" : "Cancel"}
        </Button>
        <Button type="button" onClick={done} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Check className="size-4" />
          {language === "es" ? "Listo" : "Done"}
        </Button>
      </div>
    </div>
  );
};
