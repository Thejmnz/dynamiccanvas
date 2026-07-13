import { fabric } from "fabric";
import { useEvent } from "react-use";

interface UseHotkeysProps {
  canvas: fabric.Canvas | null;
  undo: () => void;
  redo: () => void;
  save: () => void;
  copy: () => void;
  cut: () => void;
  duplicate: () => void;
  paste: () => void;
}

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return true;
  return target.isContentEditable || Boolean(target.closest("[contenteditable='true']"));
};

export const useHotkeys = ({
  canvas,
  undo,
  redo,
  save,
  copy,
  cut,
  duplicate,
  paste,
}: UseHotkeysProps) => {
  useEvent("keydown", (event) => {
    if (event.defaultPrevented || isEditableTarget(event.target)) return;

    const activeObject = canvas?.getActiveObject() as (fabric.Object & { isEditing?: boolean }) | undefined;
    if (activeObject?.isEditing) return;

    const isCtrlKey = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();

    if (isCtrlKey && key === "z") {
      event.preventDefault();
      event.shiftKey ? redo() : undo();
      return;
    }

    if (isCtrlKey && key === "y") {
      event.preventDefault();
      redo();
      return;
    }

    if (isCtrlKey && key === "c") {
      event.preventDefault();
      copy();
      return;
    }

    if (isCtrlKey && key === "x") {
      event.preventDefault();
      cut();
      return;
    }

    if (isCtrlKey && key === "v") {
      event.preventDefault();
      paste();
      return;
    }

    if (isCtrlKey && key === "d") {
      event.preventDefault();
      duplicate();
      return;
    }

    if (isCtrlKey && key === "s") {
      event.preventDefault();
      save();
      return;
    }

    if (isCtrlKey && key === "a") {
      event.preventDefault();
      canvas?.discardActiveObject();

      const allObjects = canvas
        ?.getObjects()
        .filter((object) => object.selectable && object.name !== "clip") || [];

      if (canvas && allObjects.length > 0) {
        canvas.setActiveObject(new fabric.ActiveSelection(allObjects, { canvas }));
        canvas.requestRenderAll();
      }
      return;
    }

    if (isCtrlKey && (key === "[" || key === "]")) {
      event.preventDefault();
      const selectedObjects = canvas?.getActiveObjects() || [];
      selectedObjects.forEach((object) => {
        if ((object as any).locked) return;
        key === "]" ? canvas?.bringForward(object) : canvas?.sendBackwards(object);
      });
      canvas?.getObjects().find((object) => object.name === "clip")?.sendToBack();
      canvas?.requestRenderAll();
      if (activeObject && selectedObjects.length > 0) {
        canvas?.fire("object:modified", { target: activeObject });
      }
      return;
    }

    if (key === "escape") {
      canvas?.discardActiveObject();
      canvas?.requestRenderAll();
      return;
    }

    if (key === "delete" || key === "backspace") {
      const removableObjects = canvas
        ?.getActiveObjects()
        .filter((object) => !(object as any).locked) || [];
      if (removableObjects.length === 0) return;

      event.preventDefault();
      canvas?.remove(...removableObjects);
      canvas?.discardActiveObject();
      canvas?.requestRenderAll();
      return;
    }

    if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
      if (!activeObject || (activeObject as any).locked || activeObject.name === "clip") return;

      event.preventDefault();
      const distance = event.shiftKey ? 10 : 1;
      const left = Number(activeObject.left || 0);
      const top = Number(activeObject.top || 0);
      activeObject.set({
        left: key === "arrowleft" ? left - distance : key === "arrowright" ? left + distance : left,
        top: key === "arrowup" ? top - distance : key === "arrowdown" ? top + distance : top,
      });
      activeObject.setCoords();
      canvas?.requestRenderAll();
      canvas?.fire("object:modified", { target: activeObject });
    }
  });
};
