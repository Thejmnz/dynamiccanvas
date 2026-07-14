"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
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
  const dragPoint = useRef<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [frame, setFrame] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    angle: number;
  } | null>(null);

  const updateFrame = useCallback(() => {
    const canvas = editor?.canvas;
    const image = canvas?.getActiveObject();
    if (!canvas || !image || image.type !== "image") {
      setFrame(null);
      return;
    }

    const transform = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    const center = image.getCenterPoint();
    const centerX = transform[0] * center.x + transform[2] * center.y + transform[4];
    const centerY = transform[1] * center.x + transform[3] * center.y + transform[5];
    const zoomX = Math.hypot(transform[0], transform[1]);
    const zoomY = Math.hypot(transform[2], transform[3]);
    const width = Math.max(24, image.getScaledWidth() * zoomX);
    const height = Math.max(24, image.getScaledHeight() * zoomY);
    const next = {
      left: centerX - width / 2,
      top: centerY - height / 2,
      width,
      height,
      angle: Number(image.angle || 0),
    };

    setFrame((current) => current
      && Math.abs(current.left - next.left) < 0.25
      && Math.abs(current.top - next.top) < 0.25
      && Math.abs(current.width - next.width) < 0.25
      && Math.abs(current.height - next.height) < 0.25
      && current.angle === next.angle
        ? current
        : next);
  }, [editor]);

  useEffect(() => {
    if (activeTool === "crop") {
      initialState.current = editor?.getActiveImageCropState();
      updateFrame();
      const canvas = editor?.canvas;
      canvas?.on("after:render", updateFrame);
      window.addEventListener("resize", updateFrame);

      return () => {
        canvas?.off("after:render", updateFrame);
        window.removeEventListener("resize", updateFrame);
      };
    } else {
      initialState.current = undefined;
      setFrame(null);
    }
  }, [activeTool, editor, updateFrame]);

  if (activeTool !== "crop") return null;

  const cancel = () => {
    if (initialState.current) editor?.setActiveImageCropState(initialState.current);
    onChangeActiveTool("select");
  };

  const done = () => {
    editor?.commitActiveImageCrop();
    onChangeActiveTool("select");
  };

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragPoint.current = { x: event.clientX, y: event.clientY };
    setDragging(true);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragPoint.current) return;
    event.preventDefault();
    const deltaX = event.clientX - dragPoint.current.x;
    const deltaY = event.clientY - dragPoint.current.y;
    dragPoint.current = { x: event.clientX, y: event.clientY };
    editor?.panActiveImageCrop(deltaX, deltaY);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragPoint.current = null;
    setDragging(false);
  };

  const zoom = (direction: "in" | "out") => {
    editor?.adjustActiveImageCropZoom(direction);
    window.requestAnimationFrame(updateFrame);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-[65] overflow-hidden">
      {!frame && <div className="absolute inset-0 bg-slate-950/40" />}
      {frame && (
        <div
          className={`pointer-events-auto absolute touch-none overflow-hidden border-2 border-white shadow-[0_0_0_9999px_rgba(15,23,42,.48),0_0_0_1px_rgba(15,23,42,.45)] ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          style={{
            left: frame.left,
            top: frame.top,
            width: frame.width,
            height: frame.height,
            transform: `rotate(${frame.angle}deg)`,
          }}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <span className="absolute left-1/3 top-0 h-full w-px bg-white/55" />
          <span className="absolute left-2/3 top-0 h-full w-px bg-white/55" />
          <span className="absolute left-0 top-1/3 h-px w-full bg-white/55" />
          <span className="absolute left-0 top-2/3 h-px w-full bg-white/55" />
          <span className="absolute left-1/2 top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-black/15" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 top-5 text-center text-sm font-semibold text-white drop-shadow-md">
        {language === "es"
          ? "Arrastra la imagen dentro del marco y ajusta el zoom"
          : "Drag the image inside the frame and adjust the zoom"}
      </div>
      <div className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/70 bg-white p-3 shadow-2xl">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={language === "es" ? "Alejar imagen" : "Zoom out"}
          onClick={() => zoom("out")}
        >
          <Minus className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={language === "es" ? "Acercar imagen" : "Zoom in"}
          onClick={() => zoom("in")}
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
