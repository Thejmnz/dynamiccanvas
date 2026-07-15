"use client";

import { fabric } from "fabric";
import { Copy, Lock, LockOpen, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { Editor } from "@/features/editor/types";
import {
  isFabricObjectLocked,
  setFabricObjectLocked,
} from "@/features/editor/utils";
import { useLanguage } from "@/lib/contexts/LanguageContext";

interface SelectionActionsProps {
  editor?: Editor;
}

interface MenuPosition {
  left: number;
  top: number;
}

const getObjectName = (
  object: fabric.Object,
  canvas: fabric.Canvas,
  language: "en" | "es",
) => {
  if (object.name && object.name !== "clip") {
    const match = object.name.match(/^(Texto|Text|Imagen|Image|Rectángulo|Rectangle|Círculo|Circle|Triángulo|Triangle|Trazo|Path|Elemento|Element)\s+(\d+)$/i);
    if (!match) return object.name;

    const translated: Record<string, { en: string; es: string }> = {
      texto: { en: "Text", es: "Texto" },
      text: { en: "Text", es: "Texto" },
      imagen: { en: "Image", es: "Imagen" },
      image: { en: "Image", es: "Imagen" },
      rectángulo: { en: "Rectangle", es: "Rectángulo" },
      rectangle: { en: "Rectangle", es: "Rectángulo" },
      círculo: { en: "Circle", es: "Círculo" },
      circle: { en: "Circle", es: "Círculo" },
      triángulo: { en: "Triangle", es: "Triángulo" },
      triangle: { en: "Triangle", es: "Triángulo" },
      trazo: { en: "Path", es: "Trazo" },
      path: { en: "Path", es: "Trazo" },
      elemento: { en: "Element", es: "Elemento" },
      element: { en: "Element", es: "Elemento" },
    };
    const prefix = translated[match[1].toLocaleLowerCase("es")];
    return prefix ? `${prefix[language]} ${match[2]}` : object.name;
  }

  if (["textbox", "text", "i-text"].includes(object.type || "")) {
    const text = (object as fabric.Text).text?.trim();
    if (text) return text.length > 24 ? `${text.slice(0, 24)}…` : text;
  }

  const layerNumber = canvas
    .getObjects()
    .filter((item) => item.name !== "clip")
    .indexOf(object) + 1;
  const suffix = layerNumber > 0 ? ` ${layerNumber}` : "";

  const typeName = (() => {
    switch (object.type) {
    case "textbox":
    case "text":
    case "i-text":
      return language === "es" ? "Texto" : "Text";
    case "image":
      return language === "es" ? "Imagen" : "Image";
    case "rect":
      return language === "es" ? "Rectángulo" : "Rectangle";
    case "circle":
      return language === "es" ? "Círculo" : "Circle";
    case "triangle":
      return language === "es" ? "Triángulo" : "Triangle";
    case "path":
      return language === "es" ? "Trazo" : "Path";
    default:
      return language === "es" ? "Elemento" : "Element";
    }
  })();

  return `${typeName}${suffix}`;
};

export const SelectionActions = ({ editor }: SelectionActionsProps) => {
  const { language } = useLanguage();
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const updatePosition = useCallback(() => {
    const canvas = editor?.canvas;
    const object = canvas?.getActiveObject();

    if (!canvas || !object || object.name === "clip") {
      setPosition(null);
      return;
    }

    const bounds = object.getBoundingRect();
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const menuWidth = 220;
    const left = Math.min(
      Math.max(bounds.left + bounds.width / 2, menuWidth / 2 + 8),
      canvasWidth - menuWidth / 2 - 8,
    );
    const below = bounds.top + bounds.height + 10;
    const top = below > canvasHeight - 48 ? Math.max(8, bounds.top - 46) : below;

    setPosition({ left, top });
  }, [editor]);

  useEffect(() => {
    const canvas = editor?.canvas;
    if (!canvas) return;

    const events = [
      "selection:created",
      "selection:updated",
      "selection:cleared",
      "object:moving",
      "object:scaling",
      "object:rotating",
      "object:modified",
      "after:render",
    ] as const;

    events.forEach((event) => canvas.on(event, updatePosition));
    updatePosition();

    return () => {
      events.forEach((event) => canvas.off(event, updatePosition));
    };
  }, [editor, updatePosition]);

  const object = editor?.selectedObjects.length === 1
    ? editor.selectedObjects[0]
    : undefined;

  if (!editor || !object || object.name === "clip" || !position) return null;

  const locked = isFabricObjectLocked(object);

  const toggleObjectLock = () => {
    setFabricObjectLocked(object, !locked);
    editor.canvas.requestRenderAll();
    // This records Undo/Redo state only. Permanent storage still happens
    // exclusively through the editor's Save button.
    editor.canvas.fire("object:modified", { target: object });
  };

  return (
    <div
      className="pointer-events-auto absolute z-[55] flex -translate-x-1/2 items-center gap-1 rounded-lg border border-slate-200 bg-white/95 px-2 py-1 shadow-lg backdrop-blur"
      style={{ left: position.left, top: position.top }}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <span className="max-w-24 truncate px-1 text-xs font-medium text-slate-600">
        {getObjectName(object, editor.canvas, language)}
      </span>
      <div className="h-4 w-px bg-slate-200" />
      <Hint label={locked
        ? (language === "es" ? "Desbloquear" : "Unlock")
        : (language === "es" ? "Bloquear" : "Lock")} side="bottom" sideOffset={5}>
        <Button
          size="icon"
          variant="ghost"
          className="size-7"
          onClick={toggleObjectLock}
          aria-label={locked
            ? (language === "es" ? "Desbloquear capa" : "Unlock layer")
            : (language === "es" ? "Bloquear capa" : "Lock layer")}
        >
          {locked
            ? <Lock className="size-3.5" />
            : <LockOpen className="size-3.5" />}
        </Button>
      </Hint>
      {!locked && (
        <Hint label={language === "es" ? "Duplicar" : "Duplicate"} side="bottom" sideOffset={5}>
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            aria-label={language === "es" ? "Duplicar capa" : "Duplicate layer"}
            onClick={() => {
              editor.onCopy();
              editor.onPaste();
            }}
          >
            <Copy className="size-3.5" />
          </Button>
        </Hint>
      )}
      <Hint label={language === "es" ? "Eliminar" : "Delete"} side="bottom" sideOffset={5}>
        <Button
          size="icon"
          variant="ghost"
          className="size-7 text-red-600"
          aria-label={language === "es" ? "Eliminar capa" : "Delete layer"}
          onClick={editor.delete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </Hint>
    </div>
  );
};
