"use client";

import { fabric } from "fabric";
import { useEffect, useState } from "react";

import { Editor } from "@/features/editor/types";

interface CanvasGuidesProps {
  editor: Editor | undefined;
  showGrid: boolean;
  showPrintSafeZone: boolean;
}

type GuideBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
  gridSize: number;
};

export const FabricCanvasGuides = ({
  editor,
  showGrid,
  showPrintSafeZone,
}: CanvasGuidesProps) => {
  const [bounds, setBounds] = useState<GuideBounds | null>(null);

  useEffect(() => {
    const canvas = editor?.canvas;
    if (!canvas) return;

    let animationFrame: number | undefined;
    const updateBounds = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const workspace = editor.getWorkspace();
        if (!workspace) return setBounds(null);

        const workspaceBounds = workspace.getBoundingRect(true, true);
        const viewport = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        const topLeft = fabric.util.transformPoint(
          new fabric.Point(workspaceBounds.left, workspaceBounds.top),
          viewport,
        );
        const bottomRight = fabric.util.transformPoint(
          new fabric.Point(
            workspaceBounds.left + workspaceBounds.width,
            workspaceBounds.top + workspaceBounds.height,
          ),
          viewport,
        );
        const zoom = canvas.getZoom();

        setBounds({
          left: topLeft.x,
          top: topLeft.y,
          width: bottomRight.x - topLeft.x,
          height: bottomRight.y - topLeft.y,
          gridSize: Math.max(8, 40 * zoom),
        });
      });
    };

    updateBounds();
    canvas.on("after:render", updateBounds);
    window.addEventListener("resize", updateBounds);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      canvas.off("after:render", updateBounds);
      window.removeEventListener("resize", updateBounds);
    };
  }, [editor]);

  if (!bounds || (!showGrid && !showPrintSafeZone)) return null;

  return (
    <div
      className="pointer-events-none absolute z-20 overflow-hidden"
      style={{
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
      }}
    >
      {showGrid && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(59, 130, 246, 0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.22) 1px, transparent 1px)",
            backgroundSize: `${bounds.gridSize}px ${bounds.gridSize}px`,
          }}
        />
      )}
      {showPrintSafeZone && (
        <div className="absolute inset-[5%] border-2 border-dashed border-rose-500/80" />
      )}
    </div>
  );
};
