"use client";

import { fabric } from "fabric";
import { useEffect, useMemo, useState } from "react";

import { Editor } from "@/features/editor/types";

const SNAP_DISTANCE_PX = 8;

type Axis = "x" | "y";
type AnchorName = "start" | "center" | "end";

type Bounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
};

type SnapGuide = {
  axis: Axis;
  position: number;
  start: number;
  end: number;
  kind: "center" | "edge";
};

type Anchor = {
  name: AnchorName;
  value: number;
};

type SnapMatch = {
  delta: number;
  position: number;
  kind: "center" | "edge";
};

interface FabricSnapGuidesProps {
  editor: Editor | undefined;
}

const getBounds = (object: fabric.Object): Bounds => {
  const rect = object.getBoundingRect(true, true);

  return {
    left: rect.left,
    top: rect.top,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
  };
};

const getAnchors = (bounds: Bounds, axis: Axis): Anchor[] => {
  if (axis === "x") {
    return [
      { name: "start", value: bounds.left },
      { name: "center", value: bounds.centerX },
      { name: "end", value: bounds.right },
    ];
  }

  return [
    { name: "start", value: bounds.top },
    { name: "center", value: bounds.centerY },
    { name: "end", value: bounds.bottom },
  ];
};

export const FabricSnapGuides = ({ editor }: FabricSnapGuidesProps) => {
  const [guides, setGuides] = useState<SnapGuide[]>([]);

  useEffect(() => {
    const canvas = editor?.canvas;
    if (!canvas) return;

    const clearGuides = () => setGuides([]);

    const handleObjectMoving = (event: fabric.IEvent<Event>) => {
      const target = event.target;
      const workspace = editor.getWorkspace();
      if (!target || !workspace || target === workspace || target.name === "clip") {
        return clearGuides();
      }

      const zoom = canvas.getZoom() || 1;
      const threshold = SNAP_DISTANCE_PX / zoom;
      const movingBounds = getBounds(target);
      const workspaceBounds = getBounds(workspace);
      const selectedChildren = new Set(
        target.type === "activeSelection"
          ? ((target as fabric.ActiveSelection).getObjects?.() || [])
          : [],
      );
      const otherObjects = canvas.getObjects().filter((object) => (
        object !== target &&
        object !== workspace &&
        object.name !== "clip" &&
        !selectedChildren.has(object) &&
        object.group !== target &&
        object.visible !== false
      ));

      const findSnap = (axis: Axis) => {
        const movingAnchors = getAnchors(movingBounds, axis);
        const candidates: Array<{
          anchor: Anchor;
          onlyMatchingAnchor: boolean;
          isWorkspace: boolean;
        }> = getAnchors(workspaceBounds, axis).map((anchor) => ({
          anchor,
          onlyMatchingAnchor: true,
          isWorkspace: true,
        }));

        otherObjects.forEach((object) => {
          getAnchors(getBounds(object), axis).forEach((anchor) => {
            candidates.push({
              anchor,
              onlyMatchingAnchor: false,
              isWorkspace: false,
            });
          });
        });

        let best: {
          delta: number;
          position: number;
          kind: "center" | "edge";
          score: number;
        } | null = null;

        candidates.forEach(({ anchor: reference, onlyMatchingAnchor, isWorkspace }) => {
          movingAnchors.forEach((movingAnchor) => {
            if (onlyMatchingAnchor && movingAnchor.name !== reference.name) return;

            const delta = reference.value - movingAnchor.value;
            const distance = Math.abs(delta);
            if (distance > threshold) return;

            const isCenter = movingAnchor.name === "center" && reference.name === "center";
            const priority = isWorkspace && isCenter ? -0.25 : 0;
            const score = distance + priority;

            if (!best || score < best.score) {
              best = {
                delta,
                position: reference.value,
                kind: isCenter ? "center" : "edge",
                score,
              };
            }
          });
        });

        return best as (SnapMatch & { score: number }) | null;
      };

      const bestX = findSnap("x");
      const bestY = findSnap("y");

      if (bestX) target.set("left", (target.left || 0) + bestX.delta);
      if (bestY) target.set("top", (target.top || 0) + bestY.delta);
      if (bestX || bestY) target.setCoords();

      const nextGuides: SnapGuide[] = [];
      if (bestX) {
        nextGuides.push({
          axis: "x",
          position: bestX.position,
          start: workspaceBounds.top,
          end: workspaceBounds.bottom,
          kind: bestX.kind,
        });
      }
      if (bestY) {
        nextGuides.push({
          axis: "y",
          position: bestY.position,
          start: workspaceBounds.left,
          end: workspaceBounds.right,
          kind: bestY.kind,
        });
      }

      setGuides(nextGuides);
    };

    canvas.on("object:moving", handleObjectMoving);
    canvas.on("object:modified", clearGuides);
    canvas.on("mouse:up", clearGuides);
    canvas.on("selection:cleared", clearGuides);

    return () => {
      canvas.off("object:moving", handleObjectMoving);
      canvas.off("object:modified", clearGuides);
      canvas.off("mouse:up", clearGuides);
      canvas.off("selection:cleared", clearGuides);
    };
  }, [editor]);

  const screenGuides = useMemo(() => {
    const canvas = editor?.canvas;
    if (!canvas) return [];
    const viewport = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];

    return guides.map((guide) => {
      const from = guide.axis === "x"
        ? new fabric.Point(guide.position, guide.start)
        : new fabric.Point(guide.start, guide.position);
      const to = guide.axis === "x"
        ? new fabric.Point(guide.position, guide.end)
        : new fabric.Point(guide.end, guide.position);
      const screenFrom = fabric.util.transformPoint(from, viewport);
      const screenTo = fabric.util.transformPoint(to, viewport);

      return {
        ...guide,
        left: Math.min(screenFrom.x, screenTo.x),
        top: Math.min(screenFrom.y, screenTo.y),
        width: Math.max(1, Math.abs(screenTo.x - screenFrom.x)),
        height: Math.max(1, Math.abs(screenTo.y - screenFrom.y)),
      };
    });
  }, [editor, guides]);

  if (screenGuides.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {screenGuides.map((guide, index) => (
        <div
          key={`${guide.axis}-${guide.position}-${index}`}
          className={guide.kind === "center" ? "bg-fuchsia-500" : "bg-blue-500"}
          style={{
            position: "absolute",
            left: guide.left,
            top: guide.top,
            width: guide.axis === "x" ? 1 : guide.width,
            height: guide.axis === "y" ? 1 : guide.height,
            boxShadow: guide.kind === "center"
              ? "0 0 0 1px rgba(217, 70, 239, 0.16)"
              : "0 0 0 1px rgba(59, 130, 246, 0.14)",
          }}
        />
      ))}
    </div>
  );
};
