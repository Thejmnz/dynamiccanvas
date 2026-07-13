import { fabric } from "fabric";
import { useCallback, useRef } from "react";

import { JSON_KEYS } from "@/features/editor/types";

interface UseClipboardProps {
  canvas: fabric.Canvas | null;
};

export const useClipboard = ({
  canvas
}: UseClipboardProps) => {
  const clipboard = useRef<any>(null);

  const addClonedObject = useCallback((clonedObj: any) => {
    if (!canvas) return;

    canvas.discardActiveObject();
    clonedObj.set({
      left: Number(clonedObj.left || 0) + 10,
      top: Number(clonedObj.top || 0) + 10,
      evented: true,
    });

    if (clonedObj.type === "activeSelection") {
      clonedObj.canvas = canvas;
      clonedObj.forEachObject((object: fabric.Object) => canvas.add(object));
      clonedObj.setCoords();
    } else {
      canvas.add(clonedObj);
    }

    canvas.setActiveObject(clonedObj);
    canvas.requestRenderAll();
  }, [canvas]);

  const copy = useCallback(() => {
    canvas?.getActiveObject()?.clone((cloned: any) => {
      clipboard.current = cloned;
    }, JSON_KEYS);
  }, [canvas]);

  const paste = useCallback(() => {
    if (!clipboard.current) return;

    clipboard.current.clone((clonedObj: any) => {
      addClonedObject(clonedObj);
      clipboard.current.set({
        left: Number(clipboard.current.left || 0) + 10,
        top: Number(clipboard.current.top || 0) + 10,
      });
    }, JSON_KEYS);
  }, [addClonedObject]);

  const duplicate = useCallback(() => {
    canvas?.getActiveObject()?.clone((clonedObj: any) => {
      addClonedObject(clonedObj);
    }, JSON_KEYS);
  }, [addClonedObject, canvas]);

  const cut = useCallback(() => {
    const activeObject = canvas?.getActiveObject();
    if (!canvas || !activeObject) return;

    activeObject.clone((cloned: any) => {
      clipboard.current = cloned;
      const removableObjects = canvas
        .getActiveObjects()
        .filter((object) => !(object as any).locked);
      canvas.remove(...removableObjects);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }, JSON_KEYS);
  }, [canvas]);

  return { copy, cut, duplicate, paste };
};
