import { fabric } from "fabric";
import { useCallback, useEffect } from "react";

interface UseAutoResizeProps {
  canvas: fabric.Canvas | null;
  container: HTMLDivElement | null;
}

export const useAutoResize = ({ canvas, container }: UseAutoResizeProps) => {
  const autoZoom = useCallback(() => {
    if (!canvas || !container || !canvas.getContext()) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Fabric cannot render a canvas or clip-path cache with a zero-sized side.
    // ResizeObserver can briefly report zero while the editor is mounting or hidden.
    if (width <= 0 || height <= 0) return;

    canvas.setWidth(width);
    canvas.setHeight(height);

    const center = canvas.getCenter();

    const zoomRatio = 0.85;
    const localWorkspace = canvas
      .getObjects()
      .find((object) => object.name === "clip");

    if (!localWorkspace) return;

    if (
      !Number.isFinite(localWorkspace.width) ||
      !Number.isFinite(localWorkspace.height) ||
      (localWorkspace.width ?? 0) <= 0 ||
      (localWorkspace.height ?? 0) <= 0
    ) {
      return;
    }

    // @ts-ignore
    const scale = fabric.util.findScaleToFit(localWorkspace, {
      width: width,
      height: height,
    });

    const zoom = zoomRatio * scale;

    canvas.setViewportTransform(fabric.iMatrix.concat());
    canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoom);

    const workspaceCenter = localWorkspace.getCenterPoint();
    const viewportTransform = canvas.viewportTransform;

    if (
      canvas.width === undefined ||
      canvas.height === undefined ||
      !viewportTransform
    ) {
      return;
    }

    viewportTransform[4] = canvas.width / 2 - workspaceCenter.x * viewportTransform[0];

    viewportTransform[5] = canvas.height / 2 - workspaceCenter.y * viewportTransform[3];

    canvas.setViewportTransform(viewportTransform);

    localWorkspace.clone((cloned: fabric.Rect) => {
      // A clone callback can finish after React has disposed the Fabric canvas.
      if (!canvas.getContext()) return;

      canvas.clipPath = cloned;
      canvas.requestRenderAll();
    });
  }, [canvas, container]);

  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;

    if (canvas && container) {
      resizeObserver = new ResizeObserver(() => {
        autoZoom();
      });

      resizeObserver.observe(container);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [canvas, container, autoZoom]);

  return { autoZoom };
};
