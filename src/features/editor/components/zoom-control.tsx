"use client";

import { fabric } from "fabric";
import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Hint } from "@/components/hint";
import { Editor } from "@/features/editor/types";

interface ZoomControlProps {
  editor?: Editor;
}

const MIN_ZOOM = 10;
const MAX_ZOOM = 300;
const RESET_ZOOM = 50;

export const ZoomControl = ({ editor }: ZoomControlProps) => {
  const [percent, setPercent] = useState(100);
  const [inputValue, setInputValue] = useState("100");
  const [isEditing, setIsEditing] = useState(false);

  const readZoom = useCallback(() => {
    const nextPercent = Math.round((editor?.canvas.getZoom() || 1) * 100);
    setPercent(nextPercent);
    if (!isEditing) setInputValue(String(nextPercent));
  }, [editor, isEditing]);

  useEffect(() => {
    const canvas = editor?.canvas;
    if (!canvas) return;

    canvas.on("after:render", readZoom);
    readZoom();

    return () => {
      canvas.off("after:render", readZoom);
    };
  }, [editor, readZoom]);

  const setZoom = (nextPercent: number) => {
    const canvas = editor?.canvas;
    if (!canvas) return;

    const boundedPercent = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextPercent));
    const center = canvas.getCenter();
    canvas.zoomToPoint(
      new fabric.Point(center.left, center.top),
      boundedPercent / 100,
    );
    canvas.requestRenderAll();
    setPercent(boundedPercent);
    setInputValue(String(boundedPercent));
  };

  const finishEditing = () => {
    const value = Number.parseInt(inputValue, 10);
    if (Number.isFinite(value) && value >= MIN_ZOOM && value <= MAX_ZOOM) {
      setZoom(value);
    } else {
      setInputValue(String(percent));
    }
    setIsEditing(false);
  };

  const sliderValue = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, percent));

  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 z-30 flex items-center gap-3 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
      <div
        className="flex h-6 min-w-12 cursor-text items-center justify-center rounded px-1 hover:bg-slate-100"
        onDoubleClick={() => {
          setInputValue(String(percent));
          setIsEditing(true);
        }}
        title="Doble clic para escribir el zoom"
      >
        {isEditing ? (
          <input
            autoFocus
            inputMode="numeric"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onBlur={finishEditing}
            onKeyDown={(event) => {
              if (event.key === "Enter") finishEditing();
              if (event.key === "Escape") {
                setInputValue(String(percent));
                setIsEditing(false);
              }
            }}
            className="h-5 w-10 border-0 bg-transparent text-center text-xs font-medium text-slate-600 outline-none"
          />
        ) : (
          <span className="select-none text-xs font-medium text-slate-600">
            {percent}%
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-400">{MIN_ZOOM}%</span>
        <input
          aria-label="Zoom del lienzo"
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={2}
          value={sliderValue}
          onChange={(event) => setZoom(Number.parseInt(event.target.value, 10))}
          className="h-2 w-24 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#5b35d5]"
        />
        <span className="text-[10px] text-slate-400">{MAX_ZOOM}%</span>
      </div>

      <div className="h-5 w-px bg-slate-200" />

      <Hint label="Restablecer al 50%" side="top" sideOffset={5}>
        <button
          type="button"
          aria-label="Restablecer zoom al 50%"
          onClick={() => setZoom(RESET_ZOOM)}
          className="flex size-6 items-center justify-center rounded transition-colors hover:bg-slate-100"
        >
          <RotateCcw className="size-3.5 text-slate-600" />
        </button>
      </Hint>
    </div>
  );
};
