import { fabric } from "fabric";
import { useCallback, useRef, useState } from "react";

import { JSON_KEYS } from "@/features/editor/types";
import { configureTextboxControls } from "@/features/editor/utils";

interface UseHistoryProps {
  canvas: fabric.Canvas | null;
  saveCallback?: (values: {
    json: string;
    height: number;
    width: number;
    thumbnailDataUrl?: string;
  }) => void;
};

const generateCleanThumbnail = (
  canvas: fabric.Canvas,
  workspace: fabric.Object,
): Promise<string | undefined> => new Promise((resolve) => {
  const width = workspace.width || 0;
  const height = workspace.height || 0;
  if (width <= 0 || height <= 0) {
    resolve(undefined);
    return;
  }

  const serialized = canvas.toJSON(JSON_KEYS) as any;
  delete serialized.clipPath;

  const previewElement = document.createElement("canvas");
  const preview = new fabric.StaticCanvas(previewElement, {
    width,
    height,
    renderOnAddRemove: false,
  });

  preview.loadFromJSON(serialized, () => {
    try {
      preview.getObjects().forEach(configureTextboxControls);

      const previewWorkspace = preview
        .getObjects()
        .find((object) => object.name === "clip");
      if (!previewWorkspace) {
        resolve(undefined);
        return;
      }

      const workspaceLeft = previewWorkspace.left || 0;
      const workspaceTop = previewWorkspace.top || 0;

      preview.getObjects().forEach((object) => {
        object.set({
          left: (object.left || 0) - workspaceLeft,
          top: (object.top || 0) - workspaceTop,
        });
        object.setCoords();
      });

      previewWorkspace.set({
        left: 0,
        top: 0,
        shadow: undefined,
      });
      previewWorkspace.sendToBack();
      preview.renderAll();

      resolve(preview.toDataURL({
        format: "jpeg",
        quality: 0.86,
        multiplier: Math.min(1, 640 / Math.max(width, height)),
      }));
    } catch (error) {
      console.error("[Editor] Failed to generate thumbnail:", error);
      resolve(undefined);
    } finally {
      preview.dispose();
    }
  });
});

export const useHistory = ({ canvas, saveCallback }: UseHistoryProps) => {
  const [historyIndex, setHistoryIndex] = useState(0);
  const canvasHistory = useRef<string[]>([]);
  const skipSave = useRef(false);

  const canUndo = useCallback(() => {
    return historyIndex > 0;
  }, [historyIndex]);

  const canRedo = useCallback(() => {
    return historyIndex < canvasHistory.current.length - 1;
  }, [historyIndex]);

  const save = useCallback(() => {
    if (!canvas || skipSave.current) return;

    const currentState = canvas.toJSON(JSON_KEYS);
    const json = JSON.stringify(currentState);

    canvasHistory.current.push(json);
    setHistoryIndex(canvasHistory.current.length - 1);
  }, [canvas]);

  const suspendHistory = useCallback(() => {
    skipSave.current = true;
  }, []);

  const resumeHistory = useCallback((recordState = true) => {
    skipSave.current = false;
    if (recordState) save();
  }, [save]);

  const persist = useCallback(async () => {
    if (!canvas) return;

    const json = JSON.stringify(canvas.toJSON(JSON_KEYS));

    const workspace = canvas
      .getObjects()
      .find((object) => object.name === "clip");
    const height = workspace?.height || 0;
    const width = workspace?.width || 0;
    const thumbnailDataUrl = workspace
      ? await generateCleanThumbnail(canvas, workspace)
      : undefined;

    saveCallback?.({ json, height, width, thumbnailDataUrl });
  }, [canvas, saveCallback]);

  const undo = useCallback(() => {
    if (canUndo()) {
      skipSave.current = true;
      canvas?.clear().renderAll();

      const previousIndex = historyIndex - 1;
      const previousState = JSON.parse(
        canvasHistory.current[previousIndex]
      );

      canvas?.loadFromJSON(previousState, () => {
        canvas.getObjects().forEach(configureTextboxControls);
        canvas.renderAll();
        setHistoryIndex(previousIndex);
        skipSave.current = false;
      });
    }
  }, [canUndo, canvas, historyIndex]);

  const redo = useCallback(() => {
    if (canRedo()) {
      skipSave.current = true;
      canvas?.clear().renderAll();

      const nextIndex = historyIndex + 1;
      const nextState = JSON.parse(
        canvasHistory.current[nextIndex]
      );

      canvas?.loadFromJSON(nextState, () => {
        canvas.getObjects().forEach(configureTextboxControls);
        canvas.renderAll();
        setHistoryIndex(nextIndex);
        skipSave.current = false;
      });
    }
  }, [canvas, historyIndex, canRedo]);

  return {
    save,
    persist,
    canUndo,
    canRedo,
    undo,
    redo,
    suspendHistory,
    resumeHistory,
    setHistoryIndex,
    canvasHistory,
  };
};
