import { fabric } from "fabric";
import { useEffect, useRef } from "react";

import { JSON_KEYS } from "@/features/editor/types";
import {
  configureTextboxControls,
  DEFAULT_WORKSPACE_HEIGHT,
  DEFAULT_WORKSPACE_WIDTH,
  ensureFabricWorkspace,
  getValidCanvasDimension,
  normalizeFabricObjectLock,
  sanitizeFabricCanvasData,
} from "@/features/editor/utils";
import {
  convertKonvaCanvas,
  isKonvaCanvasData,
} from "@/features/editor/konva-to-fabric";

interface UseLoadStateProps {
  autoZoom: () => void;
  canvas: fabric.Canvas | null;
  initialState: React.MutableRefObject<string | undefined>;
  canvasHistory: React.MutableRefObject<string[]>;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
};

export const useLoadState = ({
  canvas,
  autoZoom,
  initialState,
  canvasHistory,
  setHistoryIndex,
}: UseLoadStateProps) => {
  const initializedCanvas = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (canvas && initializedCanvas.current !== canvas) {
      initializedCanvas.current = canvas;

      if (initialState?.current) {
        try {
          const data = sanitizeFabricCanvasData(JSON.parse(initialState.current));

          if (isKonvaCanvasData(data)) {
            void convertKonvaCanvas(data)
              .then(({ objects, skippedTypes, workspace }) => {
                if (cancelled || !canvas.getContext()) return;

                canvas.clear();
                canvas.add(workspace, ...objects);
                ensureFabricWorkspace(canvas, data);

                const currentState = JSON.stringify(canvas.toJSON(JSON_KEYS));
                canvasHistory.current = [currentState];
                setHistoryIndex(0);
                autoZoom();

                console.info(
                  `[Editor] Converted ${objects.length} Konva elements to Fabric`,
                );

                if (skippedTypes.length > 0) {
                  console.warn(
                    `[Editor] Konva conversion skipped: ${skippedTypes.join(", ")}`,
                  );
                }
              })
              .catch((error) => {
                if (!cancelled) {
                  console.error("[Editor] Failed to convert Konva template:", error);
                }
              });
          // Only load if it's Fabric format (has "objects" array)
          } else if (data.objects !== undefined) {
            canvas.loadFromJSON(data, () => {
              if (cancelled || !canvas.getContext()) return;

              canvas.getObjects().forEach((object) => {
                configureTextboxControls(object);
                normalizeFabricObjectLock(object);
              });
              ensureFabricWorkspace(
                canvas,
                data,
                getValidCanvasDimension(data.clipPath?.width, DEFAULT_WORKSPACE_WIDTH),
                getValidCanvasDimension(data.clipPath?.height, DEFAULT_WORKSPACE_HEIGHT),
              );

              canvas.renderAll();
              const currentState = JSON.stringify(canvas.toJSON(JSON_KEYS));
              canvasHistory.current = [currentState];
              setHistoryIndex(0);
              autoZoom();
            });
          } else {
            console.warn("[Editor] JSON format is not supported");
            autoZoom();
          }
        } catch (e) {
          console.error("[Editor] Failed to parse initial state:", e);
          autoZoom();
        }
      } else {
        // No initial state - just zoom to show workspace
        autoZoom();
      }
    }

    return () => {
      cancelled = true;
    };
  }, [canvas, autoZoom, canvasHistory, initialState, setHistoryIndex]);
};
