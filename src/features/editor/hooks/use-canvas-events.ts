import { fabric } from "fabric";
import { useEffect } from "react";
import { isTextType } from "@/features/editor/utils";

interface UseCanvasEventsProps {
  save: () => void;
  canvas: fabric.Canvas | null;
  setSelectedObjects: (objects: fabric.Object[]) => void;
  clearSelectionCallback?: () => void;
};

export const useCanvasEvents = ({
  save,
  canvas,
  setSelectedObjects,
  clearSelectionCallback,
}: UseCanvasEventsProps) => {
  useEffect(() => {
    if (canvas) {
      canvas.on("object:added", (e) => {
        const obj = e.target;
        if (obj && isTextType(obj.type)) {
          // @ts-ignore
          obj.set({ splitByGrapheme: false });
        }
        save();
      });
      canvas.on("object:removed", () => save());
      canvas.on("object:modified", () => save());
      canvas.on("selection:created", (e) => {
        setSelectedObjects(e.selected || []);
      });
      canvas.on("selection:updated", (e) => {
        setSelectedObjects(e.selected || []);
      });
      canvas.on("selection:cleared", () => {
        setSelectedObjects([]);
        clearSelectionCallback?.();
      });

      // Snapping Logic
      canvas.on("object:moving", (e) => {
        // @ts-ignore
        const guideLines = canvas.getObjects().filter((obj) => obj.id === "guide-line");
        // Clear previous lines
        guideLines.forEach((obj) => canvas.remove(obj));

        const obj = e.target;
        if (!obj) return;

        const canvasWidth = canvas.width || 0;
        const canvasHeight = canvas.height || 0;

        const snapDist = 10; // Distance to snap
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        // Use centerPoint instead of logic manually if possible, but manual is safer for v5
        const objCenter = obj.getCenterPoint();

        let snappedX = false;
        let snappedY = false;

        // Verify vertical center snap
        if (Math.abs(objCenter.x - centerX) < snapDist) {
          obj.setPositionByOrigin(
            new fabric.Point(centerX, objCenter.y),
            'center',
            'center'
          );

          // Draw Vertical Line
          const line = new fabric.Line([centerX, 0, centerX, canvasHeight], {
            stroke: "#ff0077",
            strokeWidth: 1,
            selectable: false,
            evented: false,
            strokeDashArray: [4, 4],
            // @ts-ignore
            id: "guide-line"
          });
          canvas.add(line);
          snappedX = true;
        }

        // Verify horizontal center snap
        if (Math.abs(objCenter.y - centerY) < snapDist) {
          obj.setPositionByOrigin(
            new fabric.Point(snappedX ? centerX : objCenter.x, centerY),
            'center',
            'center'
          );

          // Draw Horizontal Line
          const line = new fabric.Line([0, centerY, canvasWidth, centerY], {
            stroke: "#ff0077",
            strokeWidth: 1,
            selectable: false,
            evented: false,
            strokeDashArray: [4, 4],
            // @ts-ignore
            id: "guide-line"
          });
          canvas.add(line);
          snappedY = true;
        }
      });

      canvas.on("mouse:up", () => {
        // Clear guide lines on drop
        // @ts-ignore
        const guideLines = canvas.getObjects().filter((obj) => obj.id === "guide-line");
        guideLines.forEach((obj) => canvas.remove(obj));
        canvas.renderAll();
      });
    }

    return () => {
      if (canvas) {
        canvas.off("object:added");
        canvas.off("object:removed");
        canvas.off("object:modified");
        canvas.off("selection:created");
        canvas.off("selection:updated");
        canvas.off("selection:cleared");
        canvas.off("object:moving");
        canvas.off("mouse:up");
      }
    };
  },
    [
      save,
      canvas,
      clearSelectionCallback,
      setSelectedObjects
    ]);
};
