import { useMemo } from "react";
import { CanvasElement } from "../types";

const SNAP_THRESHOLD = 10;

export interface SnapGuide {
  axis: 'x' | 'y';
  position: number;
  type: 'center' | 'edge';
}

interface ElementBounds {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

export const useSnapGuides = (
  elements: CanvasElement[],
  draggingId: string | null,
  dragX: number,
  dragY: number
): SnapGuide[] => {
  return useMemo(() => {
    if (!draggingId) return [];

    const draggingElement = elements.find(e => e.id === draggingId);
    if (!draggingElement) return [];

    const otherElements = elements.filter(e => e.id !== draggingId);
    const guides: SnapGuide[] = [];

    // Calcular bounds del elemento que se arrastra
    const draggingBounds: ElementBounds = {
      id: draggingId,
      left: dragX,
      right: dragX + draggingElement.width * (draggingElement.scaleX ?? 1),
      top: dragY,
      bottom: dragY + draggingElement.height * (draggingElement.scaleY ?? 1),
      centerX: dragX + (draggingElement.width * (draggingElement.scaleX ?? 1)) / 2,
      centerY: dragY + (draggingElement.height * (draggingElement.scaleY ?? 1)) / 2,
    };

    // Calcular bounds de los otros elementos
    const otherBounds: ElementBounds[] = otherElements.map(el => ({
      id: el.id,
      left: el.x,
      right: el.x + el.width * (el.scaleX ?? 1),
      top: el.y,
      bottom: el.y + el.height * (el.scaleY ?? 1),
      centerX: el.x + (el.width * (el.scaleX ?? 1)) / 2,
      centerY: el.y + (el.height * (el.scaleY ?? 1)) / 2,
    }));

    // Snap a bordes y centros de otros elementos
    otherBounds.forEach(bounds => {
      // Snap horizontal (alineación vertical)
      // Left edge
      if (Math.abs(draggingBounds.left - bounds.left) < SNAP_THRESHOLD) {
        guides.push({ axis: 'x', position: bounds.left, type: 'edge' });
      }
      // Right edge
      if (Math.abs(draggingBounds.left - bounds.right) < SNAP_THRESHOLD) {
        guides.push({ axis: 'x', position: bounds.right, type: 'edge' });
      }
      // Centers
      if (Math.abs(draggingBounds.centerX - bounds.centerX) < SNAP_THRESHOLD) {
        guides.push({ axis: 'x', position: bounds.centerX, type: 'center' });
      }

      // Snap vertical (alineación horizontal)
      // Top edge
      if (Math.abs(draggingBounds.top - bounds.top) < SNAP_THRESHOLD) {
        guides.push({ axis: 'y', position: bounds.top, type: 'edge' });
      }
      // Bottom edge
      if (Math.abs(draggingBounds.top - bounds.bottom) < SNAP_THRESHOLD) {
        guides.push({ axis: 'y', position: bounds.bottom, type: 'edge' });
      }
      // Centers
      if (Math.abs(draggingBounds.centerY - bounds.centerY) < SNAP_THRESHOLD) {
        guides.push({ axis: 'y', position: bounds.centerY, type: 'center' });
      }
    });

    return guides;
  }, [elements, draggingId, dragX, dragY]);
};
