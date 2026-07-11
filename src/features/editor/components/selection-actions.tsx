"use client";

import { fabric } from "fabric";
import { Copy, Lock, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { Editor } from "@/features/editor/types";

interface SelectionActionsProps {
  editor?: Editor;
}

interface MenuPosition {
  left: number;
  top: number;
}

const getObjectName = (object: fabric.Object) => {
  if (object.name && object.name !== "clip") return object.name;

  switch (object.type) {
    case "textbox":
    case "text":
    case "i-text":
      return "Texto";
    case "image":
      return "Imagen";
    case "rect":
      return "Rectángulo";
    case "circle":
      return "Círculo";
    case "triangle":
      return "Triángulo";
    case "path":
      return "Trazo";
    default:
      return "Elemento";
  }
};

export const SelectionActions = ({ editor }: SelectionActionsProps) => {
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

  const lockObject = () => {
    object.set({
      selectable: false,
      evented: false,
    });
    (object as fabric.Object & { locked?: boolean }).locked = true;
    editor.canvas.discardActiveObject();
    editor.canvas.requestRenderAll();
    editor.save();
  };

  return (
    <div
      className="pointer-events-auto absolute z-[55] flex -translate-x-1/2 items-center gap-1 rounded-lg border border-slate-200 bg-white/95 px-2 py-1 shadow-lg backdrop-blur"
      style={{ left: position.left, top: position.top }}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <span className="max-w-24 truncate px-1 text-xs font-medium text-slate-600">
        {getObjectName(object)}
      </span>
      <div className="h-4 w-px bg-slate-200" />
      <Hint label="Bloquear" side="bottom" sideOffset={5}>
        <Button size="icon" variant="ghost" className="size-7" onClick={lockObject}>
          <Lock className="size-3.5" />
        </Button>
      </Hint>
      <Hint label="Duplicar" side="bottom" sideOffset={5}>
        <Button
          size="icon"
          variant="ghost"
          className="size-7"
          onClick={() => {
            editor.onCopy();
            editor.onPaste();
          }}
        >
          <Copy className="size-3.5" />
        </Button>
      </Hint>
      <Hint label="Eliminar" side="bottom" sideOffset={5}>
        <Button size="icon" variant="ghost" className="size-7 text-red-600" onClick={editor.delete}>
          <Trash2 className="size-3.5" />
        </Button>
      </Hint>
    </div>
  );
};
