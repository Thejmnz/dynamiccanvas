import { fabric } from "fabric";
import { useCallback, useState, useMemo, useRef } from "react";

import {
  Editor,
  FILL_COLOR,
  STROKE_WIDTH,
  STROKE_COLOR,
  CIRCLE_OPTIONS,
  DIAMOND_OPTIONS,
  TRIANGLE_OPTIONS,
  BuildEditorProps,
  RECTANGLE_OPTIONS,
  EditorHookProps,
  STROKE_DASH_ARRAY,
  TEXT_OPTIONS,
  FONT_FAMILY,
  FONT_LINE_HEIGHT,
  FONT_WEIGHT,
  FONT_SIZE,
  JSON_KEYS,
} from "@/features/editor/types";
import { useHistory } from "@/features/editor/hooks/use-history";
import {
  createFilter,
  configureTextboxControls,
  DEFAULT_WORKSPACE_HEIGHT,
  DEFAULT_WORKSPACE_WIDTH,
  downloadFile,
  ensureFabricWorkspace,
  getValidCanvasDimension,
  isTextType,
  moveSelectedObjectsInStack,
  sanitizeFabricCanvasData,
  transformText
} from "@/features/editor/utils";
import { useHotkeys } from "@/features/editor/hooks/use-hotkeys";
import { useClipboard } from "@/features/editor/hooks//use-clipboard";
import { useAutoResize } from "@/features/editor/hooks/use-auto-resize";
import { useCanvasEvents } from "@/features/editor/hooks/use-canvas-events";
import { useWindowEvents } from "@/features/editor/hooks/use-window-events";
import { useLoadState } from "@/features/editor/hooks/use-load-state";
import {
  convertKonvaCanvas,
  isKonvaCanvasData,
} from "@/features/editor/konva-to-fabric";
import {
  getShapeDefinition,
  ShapeKind,
} from "@/features/editor/shape-library";
import {
  applyImageEffects,
  EditableFabricImage,
  getImageEffectSettings,
  ImageCropState,
  ImageEffectSettings,
  ImageMaskShape,
  resetImageEffects,
} from "@/features/editor/image-effects";

const buildEditor = ({
  save,
  persist,
  suspendHistory,
  resumeHistory,
  undo,
  redo,
  canRedo,
  canUndo,
  autoZoom,
  copy,
  paste,
  canvas,
  fillColor,
  fontFamily,
  setFontFamily,
  setFillColor,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  selectedObjects,
  strokeDashArray,
  setStrokeDashArray,
}: BuildEditorProps): Editor => {
  const createExportCanvas = (): Promise<fabric.StaticCanvas> => new Promise((resolve, reject) => {
    const workspace = getWorkspace();
    const width = workspace?.width || 0;
    const height = workspace?.height || 0;

    if (!workspace || width <= 0 || height <= 0) {
      reject(new Error("Workspace is not available"));
      return;
    }

    const serialized = canvas.toJSON(JSON_KEYS) as any;
    delete serialized.clipPath;

    const exportCanvas = new fabric.StaticCanvas(document.createElement("canvas"), {
      width,
      height,
      renderOnAddRemove: false,
    });

    exportCanvas.loadFromJSON(serialized, () => {
      try {
        exportCanvas.getObjects().forEach(configureTextboxControls);

        const exportWorkspace = exportCanvas
          .getObjects()
          .find((object) => object.name === "clip");

        if (!exportWorkspace) {
          throw new Error("Export workspace is not available");
        }

        const workspaceLeft = exportWorkspace.left || 0;
        const workspaceTop = exportWorkspace.top || 0;

        exportCanvas.getObjects().forEach((object) => {
          object.set({
            left: (object.left || 0) - workspaceLeft,
            top: (object.top || 0) - workspaceTop,
          });
          object.setCoords();
        });

        exportWorkspace.set({ left: 0, top: 0, shadow: undefined });
        exportWorkspace.sendToBack();
        exportCanvas.renderAll();
        resolve(exportCanvas);
      } catch (error) {
        exportCanvas.dispose();
        reject(error);
      }
    });
  });

  const saveRaster = async (format: "png" | "jpeg", extension: "png" | "jpg") => {
    let exportCanvas: fabric.StaticCanvas | undefined;

    try {
      exportCanvas = await createExportCanvas();
      const maxDimension = Math.max(exportCanvas.getWidth(), exportCanvas.getHeight());
      const multiplier = Math.max(1, Math.min(3, 4096 / maxDimension));
      const dataUrl = exportCanvas.toDataURL({
        format,
        quality: 1,
        multiplier,
        enableRetinaScaling: false,
      });

      downloadFile(dataUrl, extension);
    } catch (error) {
      console.error(`[Editor] Failed to export ${extension.toUpperCase()}:`, error);
    } finally {
      exportCanvas?.dispose();
    }
  };

  const savePng = () => void saveRaster("png", "png");
  const saveJpg = () => void saveRaster("jpeg", "jpg");

  const saveSvg = async () => {
    let exportCanvas: fabric.StaticCanvas | undefined;

    try {
      exportCanvas = await createExportCanvas();
      const svg = exportCanvas.toSVG();
      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      downloadFile(dataUrl, "svg");
    } catch (error) {
      console.error("[Editor] Failed to export SVG:", error);
    } finally {
      exportCanvas?.dispose();
    }
  };

  const saveJson = async () => {
    const dataUrl = canvas.toJSON(JSON_KEYS);

    await transformText(dataUrl.objects);
    const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataUrl, null, "\t"),
    )}`;
    downloadFile(fileString, "json");
  };

  const loadJson = (json: string) => {
    try {
      const data = sanitizeFabricCanvasData(JSON.parse(json));
      suspendHistory();
      canvas.discardActiveObject();

      if (isKonvaCanvasData(data)) {
        void convertKonvaCanvas(data)
          .then(({ objects, skippedTypes, workspace }) => {
            canvas.clear();
            canvas.add(workspace, ...objects);
            ensureFabricWorkspace(canvas, data);
            canvas.renderAll();
            autoZoom();
            resumeHistory();

            if (skippedTypes.length > 0) {
              console.warn(
                `[Editor] Konva conversion skipped: ${skippedTypes.join(", ")}`,
              );
            }
          })
          .catch((error) => {
            resumeHistory(false);
            console.error("[Editor] Failed to convert Konva JSON:", error);
          });
        return;
      }

      canvas.loadFromJSON(data, () => {
        canvas.getObjects().forEach(configureTextboxControls);
        ensureFabricWorkspace(canvas, data);
        canvas.renderAll();
        autoZoom();
        resumeHistory();
      });
    } catch (error) {
      resumeHistory(false);
      console.error("[Editor] Failed to load JSON:", error);
    }
  };

  const getWorkspace = () => {
    return canvas
    .getObjects()
    .find((object) => object.name === "clip");
  };

  const center = (object: fabric.Object) => {
    const workspace = getWorkspace();
    const center = workspace?.getCenterPoint();

    if (!center) return;

    // @ts-ignore
    canvas._centerObject(object, center);
  };

  const addToCanvas = (object: fabric.Object) => {
    center(object);
    canvas.add(object);
    canvas.setActiveObject(object);
  };

  const addLibraryShape = (kind: ShapeKind) => {
    const definition = getShapeDefinition(kind);
    if (!definition) return;

    const object = new fabric.Path(definition.path, {
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      strokeDashArray,
      strokeUniform: true,
      fillRule: "evenodd",
      name: definition.label.es,
    });

    const longestSide = Math.max(object.width || 100, object.height || 100);
    object.scale(340 / longestSide);
    addToCanvas(object);
  };

  const adjustImageCropZoom = (direction: "in" | "out") => {
    const object = canvas.getActiveObject();
    if (!object || object.type !== "image") return;
    const image = object as fabric.Image;
    const element = image.getElement() as HTMLImageElement;
    const sourceWidth = Number(element.naturalWidth || element.width || image.width || 1);
    const sourceHeight = Number(element.naturalHeight || element.height || image.height || 1);
    const currentWidth = Number(image.width || sourceWidth);
    const currentHeight = Number(image.height || sourceHeight);
    const displayWidth = currentWidth * Number(image.scaleX || 1);
    const displayHeight = currentHeight * Number(image.scaleY || 1);
    const factor = direction === "in" ? 0.9 : 1.1;
    const nextWidth = Math.max(sourceWidth * 0.1, Math.min(sourceWidth, currentWidth * factor));
    const nextHeight = Math.max(sourceHeight * 0.1, Math.min(sourceHeight, currentHeight * factor));
    const centerCropX = Number(image.cropX || 0) + currentWidth / 2;
    const centerCropY = Number(image.cropY || 0) + currentHeight / 2;
    const nextCropX = Math.max(0, Math.min(sourceWidth - nextWidth, centerCropX - nextWidth / 2));
    const nextCropY = Math.max(0, Math.min(sourceHeight - nextHeight, centerCropY - nextHeight / 2));
    const centerPoint = image.getCenterPoint();

    image.set({
      cropX: nextCropX,
      cropY: nextCropY,
      width: nextWidth,
      height: nextHeight,
      scaleX: displayWidth / nextWidth,
      scaleY: displayHeight / nextHeight,
      dirty: true,
    } as any);
    image.setPositionByOrigin(centerPoint, "center", "center");
    applyImageEffects(image as EditableFabricImage);
    image.setCoords();
    canvas.requestRenderAll();
  };

  const panImageCrop = (deltaX: number, deltaY: number) => {
    const object = canvas.getActiveObject();
    if (!object || object.type !== "image") return;
    const image = object as fabric.Image;
    const element = image.getElement() as HTMLImageElement;
    const sourceWidth = Number(element.naturalWidth || element.width || image.width || 1);
    const sourceHeight = Number(element.naturalHeight || element.height || image.height || 1);

    // A full-source image has nowhere to pan. The first drag creates a small
    // crop area automatically so the gesture always produces visible motion.
    if (
      Number(image.width || sourceWidth) >= sourceWidth - 0.5
      && Number(image.height || sourceHeight) >= sourceHeight - 0.5
    ) {
      adjustImageCropZoom("in");
    }

    const zoom = Math.max(0.01, canvas.getZoom());
    const angle = (Number(image.angle || 0) * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const sceneDeltaX = deltaX / zoom;
    const sceneDeltaY = deltaY / zoom;
    const localDeltaX = (sceneDeltaX * cos + sceneDeltaY * sin) / Math.max(0.0001, Math.abs(Number(image.scaleX || 1)));
    const localDeltaY = (-sceneDeltaX * sin + sceneDeltaY * cos) / Math.max(0.0001, Math.abs(Number(image.scaleY || 1)));
    const width = Number(image.width || sourceWidth);
    const height = Number(image.height || sourceHeight);

    image.set({
      cropX: Math.max(0, Math.min(sourceWidth - width, Number(image.cropX || 0) - localDeltaX)),
      cropY: Math.max(0, Math.min(sourceHeight - height, Number(image.cropY || 0) - localDeltaY)),
      dirty: true,
    } as any);
    applyImageEffects(image as EditableFabricImage);
    image.setCoords();
    canvas.requestRenderAll();
  };

  return {
    save: persist,
    savePng,
    saveJpg,
    saveSvg,
    saveJson,
    loadJson,
    canUndo,
    canRedo,
    autoZoom,
    getWorkspace,
    zoomIn: () => {
      let zoomRatio = canvas.getZoom();
      zoomRatio += 0.05;
      const center = canvas.getCenter();
      canvas.zoomToPoint(
        new fabric.Point(center.left, center.top),
        zoomRatio > 1 ? 1 : zoomRatio
      );
    },
    zoomOut: () => {
      let zoomRatio = canvas.getZoom();
      zoomRatio -= 0.05;
      const center = canvas.getCenter();
      canvas.zoomToPoint(
        new fabric.Point(center.left, center.top),
        zoomRatio < 0.2 ? 0.2 : zoomRatio,
      );
    },
    changeSize: (value: { width: number; height: number }) => {
      const workspace = getWorkspace();

      if (!workspace) return;

      const width = getValidCanvasDimension(
        value.width,
        workspace.width,
        DEFAULT_WORKSPACE_WIDTH,
      )!;
      const height = getValidCanvasDimension(
        value.height,
        workspace.height,
        DEFAULT_WORKSPACE_HEIGHT,
      )!;

      workspace.set({ width, height });
      autoZoom();
      save();
    },
    changeBackground: (value: string) => {
      const workspace = getWorkspace();
      workspace?.set({ fill: value });
      canvas.renderAll();
      save();
    },
    alignActiveObjectVertical: (value) => {
      const workspace = getWorkspace();
      const object = canvas.getActiveObject();

      if (!workspace || !object || object === workspace) return;

      workspace.setCoords();
      object.setCoords();

      const workspaceBounds = workspace.getBoundingRect(true, true);
      const objectBounds = object.getBoundingRect(true, true);
      const workspaceTop = workspaceBounds.top;
      const workspaceMiddle = workspaceBounds.top + workspaceBounds.height / 2;
      const workspaceBottom = workspaceBounds.top + workspaceBounds.height;
      const objectTop = objectBounds.top;
      const objectMiddle = objectBounds.top + objectBounds.height / 2;
      const objectBottom = objectBounds.top + objectBounds.height;
      const deltaY = value === "top"
        ? workspaceTop - objectTop
        : value === "bottom"
          ? workspaceBottom - objectBottom
          : workspaceMiddle - objectMiddle;

      object.set("top", (object.top || 0) + deltaY);
      object.setCoords();
      canvas.requestRenderAll();
      save();
    },
    enableDrawingMode: () => {
      canvas.discardActiveObject();
      canvas.renderAll();
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.width = strokeWidth;
      canvas.freeDrawingBrush.color = strokeColor;
    },
    disableDrawingMode: () => {
      canvas.isDrawingMode = false;
    },
    onUndo: () => undo(),
    onRedo: () => redo(),
    onCopy: () => copy(),
    onPaste: () => paste(),
    changeImageFilter: (value: string) => {
      const objects = canvas.getActiveObjects();
      objects.forEach((object) => {
        if (object.type === "image") {
          const imageObject = object as fabric.Image;

          const effect = createFilter(value);

          imageObject.filters = effect ? [effect] : [];
          imageObject.applyFilters();
          canvas.renderAll();
        }
      });
    },
    getActiveImageEffects: () => {
      const object = canvas.getActiveObject();
      return getImageEffectSettings(object?.type === "image" ? object as fabric.Image : undefined);
    },
    updateActiveImageEffects: (values: Partial<ImageEffectSettings>) => {
      const propertyMap: Record<keyof ImageEffectSettings, keyof EditableFabricImage> = {
        preset: "imagePreset",
        blur: "imageBlur",
        brightness: "imageBrightness",
        temperature: "imageTemperature",
        contrast: "imageContrast",
        saturation: "imageSaturation",
        vibrance: "imageVibrance",
        whites: "imageWhites",
        blacks: "imageBlacks",
        borderColor: "imageBorderColor",
        borderWidth: "imageBorderWidth",
        cornerRadius: "imageCornerRadius",
        cornerMode: "imageCornerMode",
        softEdges: "imageSoftEdges",
        shadowColor: "imageShadowColor",
        shadowBlur: "imageShadowBlur",
        shadowOpacity: "imageShadowOpacity",
        shadowOffsetX: "imageShadowOffsetX",
        shadowOffsetY: "imageShadowOffsetY",
        blendMode: "imageBlendMode",
        maskShape: "imageMaskShape",
      };

      canvas.getActiveObjects().forEach((object) => {
        if (object.type !== "image") return;
        const image = object as EditableFabricImage;
        Object.entries(values).forEach(([key, value]) => {
          (image as any)[propertyMap[key as keyof ImageEffectSettings]] = value;
        });
        applyImageEffects(image);
        image.setCoords();
      });
      canvas.requestRenderAll();
      save();
    },
    resetActiveImageEffects: () => {
      canvas.getActiveObjects().forEach((object) => {
        if (object.type === "image") resetImageEffects(object as EditableFabricImage);
      });
      canvas.requestRenderAll();
      save();
    },
    flipActiveImage: (axis: "horizontal" | "vertical") => {
      canvas.getActiveObjects().forEach((object) => {
        if (object.type !== "image") return;
        if (axis === "horizontal") object.toggle("flipX");
        if (axis === "vertical") object.toggle("flipY");
        object.setCoords();
      });
      canvas.requestRenderAll();
      save();
    },
    replaceActiveImage: (url: string) => {
      const object = canvas.getActiveObject();
      if (!object || object.type !== "image") return;
      const image = object as EditableFabricImage;
      const center = image.getCenterPoint();
      const displayWidth = image.getScaledWidth();
      const displayHeight = image.getScaledHeight();

      fabric.Image.fromURL(url, (replacement) => {
        image.setElement(replacement.getElement());
        image.set({
          cropX: 0,
          cropY: 0,
          width: replacement.width,
          height: replacement.height,
          scaleX: displayWidth / Math.max(1, replacement.width || 1),
          scaleY: displayHeight / Math.max(1, replacement.height || 1),
          dirty: true,
        } as any);
        image.setPositionByOrigin(center, "center", "center");
        applyImageEffects(image);
        image.setCoords();
        canvas.requestRenderAll();
        save();
      }, { crossOrigin: "anonymous" });
    },
    applyActiveImageMask: (shape: ImageMaskShape) => {
      canvas.getActiveObjects().forEach((object) => {
        if (object.type !== "image") return;
        const image = object as EditableFabricImage;
        image.imageMaskShape = shape;
        (image as any).imageMaskSvg = undefined;
        applyImageEffects(image);
        image.setCoords();
      });
      canvas.requestRenderAll();
      save();
    },
    applyActiveImageSvgMask: (svg: string) => {
      const object = canvas.getActiveObject();
      if (!object || object.type !== "image") return;
      const image = object as EditableFabricImage;

      fabric.loadSVGFromString(svg, (objects, options) => {
        const mask = fabric.util.groupSVGElements(objects, options);
        mask.set({ originX: "center", originY: "center", left: 0, top: 0 });
        mask.scaleToWidth(Math.max(1, image.width || 1));
        mask.scaleToHeight(Math.max(1, image.height || 1));
        image.clipPath = mask;
        image.imageMaskShape = "none";
        (image as any).imageMaskSvg = svg;
        image.set({ dirty: true } as any);
        image.setCoords();
        canvas.requestRenderAll();
        save();
      });
    },
    getActiveImageCropState: () => {
      const object = canvas.getActiveObject();
      if (!object || object.type !== "image") return undefined;
      const image = object as fabric.Image;
      return {
        cropX: Number(image.cropX || 0),
        cropY: Number(image.cropY || 0),
        width: Number(image.width || 1),
        height: Number(image.height || 1),
        scaleX: Number(image.scaleX || 1),
        scaleY: Number(image.scaleY || 1),
        left: Number(image.left || 0),
        top: Number(image.top || 0),
      };
    },
    setActiveImageCropState: (state: ImageCropState) => {
      const object = canvas.getActiveObject();
      if (!object || object.type !== "image") return;
      object.set({ ...state, dirty: true } as any);
      object.setCoords();
      canvas.requestRenderAll();
    },
    adjustActiveImageCropZoom: adjustImageCropZoom,
    panActiveImageCrop: panImageCrop,
    commitActiveImageCrop: () => save(),
    addImage: (value: string) => new Promise((resolve) => {
      fabric.Image.fromURL(
        value,
        (image) => {
          const element = image?.getElement() as HTMLImageElement | undefined;
          const sourceWidth = Number(
            element?.naturalWidth || element?.width || image?.width || 0,
          );
          const sourceHeight = Number(
            element?.naturalHeight || element?.height || image?.height || 0,
          );

          if (!image || !element || sourceWidth <= 0 || sourceHeight <= 0) {
            resolve(undefined);
            return;
          }
          const workspace = getWorkspace();
          const workspaceWidth = Number(workspace?.width || DEFAULT_WORKSPACE_WIDTH);
          const workspaceHeight = Number(workspace?.height || DEFAULT_WORKSPACE_HEIGHT);
          const imageWidth = Math.max(1, sourceWidth);
          const imageHeight = Math.max(1, sourceHeight);
          const fitScale = Math.min(
            (workspaceWidth * 0.65) / imageWidth,
            (workspaceHeight * 0.65) / imageHeight,
          );

          // Fabric can create an Image object before its internal width and
          // height reflect the decoded HTML image. Set those dimensions
          // explicitly so its controls never collapse to a one-pixel line.
          image.set({ width: imageWidth, height: imageHeight } as any);
          image.scale(fitScale);

          addToCanvas(image);
          canvas.requestRenderAll();
          resolve(image);
        },
        {
          crossOrigin: "anonymous",
        },
      );
    }),
    replaceImageObjectSource: (image: fabric.Image, url: string) => new Promise((resolve, reject) => {
      if (!canvas.contains(image)) {
        resolve();
        return;
      }

      const centerPoint = image.getCenterPoint();
      const displayWidth = image.getScaledWidth();
      const displayHeight = image.getScaledHeight();

      fabric.Image.fromURL(url, (replacement) => {
        if (!replacement || !replacement.getElement()) {
          reject(new Error("Could not decode HD image"));
          return;
        }

        const replacementElement = replacement.getElement() as HTMLImageElement;
        const width = Math.max(1, Number(
          replacementElement.naturalWidth || replacementElement.width || replacement.width || 1,
        ));
        const height = Math.max(1, Number(
          replacementElement.naturalHeight || replacementElement.height || replacement.height || 1,
        ));
        image.setElement(replacementElement);
        image.set({
          cropX: 0,
          cropY: 0,
          width,
          height,
          scaleX: displayWidth / width,
          scaleY: displayHeight / height,
          dirty: true,
        } as any);
        image.setPositionByOrigin(centerPoint, "center", "center");
        applyImageEffects(image as EditableFabricImage);
        image.setCoords();
        canvas.requestRenderAll();
        save();
        resolve();
      }, { crossOrigin: "anonymous" });
    }),
    delete: () => {
      canvas.getActiveObjects().forEach((object) => canvas.remove(object));
      canvas.discardActiveObject();
      canvas.renderAll();
    },
    addText: (value, options) => {
      const object = new fabric.Textbox(value, {
        ...TEXT_OPTIONS,
        fill: fillColor,
        ...options,
      });

      configureTextboxControls(object);

      addToCanvas(object);
    },
    getActiveOpacity: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return 1;
      }

      const value = selectedObject.get("opacity") || 1;

      return value;
    },
    changeFontSize: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontSize exists.
          object.set({ fontSize: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontSize: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return FONT_SIZE;
      }

      // @ts-ignore
      // Faulty TS library, fontSize exists.
      const value = selectedObject.get("fontSize") || FONT_SIZE;

      return value;
    },
    changeLineHeight: (value: number) => {
      const nextValue = Math.min(3, Math.max(0.5, value));

      canvas.getActiveObjects().forEach((object) => {
        if (!isTextType(object.type)) return;

        object.set({ lineHeight: nextValue, dirty: true } as any);
        if (object.type === "textbox") {
          configureTextboxControls(object);
        }
        (object as fabric.Text).initDimensions();
        object.setCoords();
      });
      canvas.requestRenderAll();
      save();
    },
    getActiveLineHeight: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject || !isTextType(selectedObject.type)) {
        return FONT_LINE_HEIGHT;
      }

      return Number((selectedObject as fabric.Text).lineHeight) || FONT_LINE_HEIGHT;
    },
    changeCharSpacing: (value: number) => {
      const nextValue = Math.min(800, Math.max(-200, value));

      canvas.getActiveObjects().forEach((object) => {
        if (!isTextType(object.type)) return;

        object.set({ charSpacing: nextValue, dirty: true } as any);
        if (object.type === "textbox") {
          configureTextboxControls(object);
        }
        (object as fabric.Text).initDimensions();
        object.setCoords();
      });
      canvas.requestRenderAll();
      save();
    },
    getActiveCharSpacing: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject || !isTextType(selectedObject.type)) {
        return 0;
      }

      return Number((selectedObject as fabric.Text).charSpacing) || 0;
    },
    changeTextAlign: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, textAlign exists.
          object.set({ textAlign: value });
        }
      });
      canvas.renderAll();
    },
    getActiveTextAlign: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return "left";
      }

      // @ts-ignore
      // Faulty TS library, textAlign exists.
      const value = selectedObject.get("textAlign") || "left";

      return value;
    },
    changeTextVerticalAlign: (value) => {
      canvas.getActiveObjects().forEach((object) => {
        if (object.type === "textbox") {
          (object as any).textVerticalAlign = value;
          object.set({ dirty: true } as any);
        }
      });
      canvas.requestRenderAll();
      save();
    },
    getActiveTextVerticalAlign: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject || selectedObject.type !== "textbox") {
        return "top";
      }

      return (selectedObject as any).textVerticalAlign || "top";
    },
    changeFontUnderline: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, underline exists.
          object.set({ underline: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontUnderline: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return false;
      }

      // @ts-ignore
      // Faulty TS library, underline exists.
      const value = selectedObject.get("underline") || false;

      return value;
    },
    changeFontLinethrough: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, linethrough exists.
          object.set({ linethrough: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontLinethrough: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return false;
      }

      // @ts-ignore
      // Faulty TS library, linethrough exists.
      const value = selectedObject.get("linethrough") || false;

      return value;
    },
    changeFontStyle: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontStyle exists.
          object.set({ fontStyle: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontStyle: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return "normal";
      }

      // @ts-ignore
      // Faulty TS library, fontStyle exists.
      const value = selectedObject.get("fontStyle") || "normal";

      return value;
    },
    changeFontWeight: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontWeight exists.
          object.set({ fontWeight: value });
        }
      });
      canvas.renderAll();
    },
    changeOpacity: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ opacity: value });
      });
      canvas.renderAll();
    },
    bringForward: () => {
      moveSelectedObjectsInStack(canvas, "forward");
    },
    sendBackwards: () => {
      moveSelectedObjectsInStack(canvas, "backward");
    },
    changeFontFamily: (value: string) => {
      setFontFamily(value);
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontFamily exists.
          object.set({ fontFamily: value });
        }
      });
      canvas.renderAll();
    },
    changeFillColor: (value: string) => {
      setFillColor(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ fill: value });
      });
      canvas.renderAll();
    },
    changeStrokeColor: (value: string) => {
      setStrokeColor(value);
      canvas.getActiveObjects().forEach((object) => {
        // Text types don't have stroke
        if (isTextType(object.type)) {
          object.set({ fill: value });
          return;
        }

        object.set({ stroke: value });
      });
      canvas.freeDrawingBrush.color = value;
      canvas.renderAll();
    },
    changeStrokeWidth: (value: number) => {
      setStrokeWidth(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeWidth: value });
      });
      canvas.freeDrawingBrush.width = value;
      canvas.renderAll();
    },
    changeStrokeDashArray: (value: number[]) => {
      setStrokeDashArray(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeDashArray: value });
      });
      canvas.renderAll();
    },
    addCircle: () => {
      const object = new fabric.Circle({
        ...CIRCLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addSoftRectangle: () => {
      const object = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        rx: 50,
        ry: 50,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addRectangle: () => {
      const object = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addTriangle: () => {
      const object = new fabric.Triangle({
        ...TRIANGLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addInverseTriangle: () => {
      const HEIGHT = TRIANGLE_OPTIONS.height;
      const WIDTH = TRIANGLE_OPTIONS.width;

      const object = new fabric.Polygon(
        [
          { x: 0, y: 0 },
          { x: WIDTH, y: 0 },
          { x: WIDTH / 2, y: HEIGHT },
        ],
        {
          ...TRIANGLE_OPTIONS,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        }
      );

      addToCanvas(object);
    },
    addDiamond: () => {
      const HEIGHT = DIAMOND_OPTIONS.height;
      const WIDTH = DIAMOND_OPTIONS.width;

      const object = new fabric.Polygon(
        [
          { x: WIDTH / 2, y: 0 },
          { x: WIDTH, y: HEIGHT / 2 },
          { x: WIDTH / 2, y: HEIGHT },
          { x: 0, y: HEIGHT / 2 },
        ],
        {
          ...DIAMOND_OPTIONS,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        }
      );
      addToCanvas(object);
    },
    addShape: addLibraryShape,
    canvas,
    getActiveFontWeight: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return FONT_WEIGHT;
      }

      // @ts-ignore
      // Faulty TS library, fontWeight exists.
      const value = selectedObject.get("fontWeight") || FONT_WEIGHT;

      return value;
    },
    getActiveFontFamily: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return fontFamily;
      }

      // @ts-ignore
      // Faulty TS library, fontFamily exists.
      const value = selectedObject.get("fontFamily") || fontFamily;

      return value;
    },
    getActiveFillColor: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return fillColor;
      }

      const value = selectedObject.get("fill") || fillColor;

      // Currently, gradients & patterns are not supported
      return value as string;
    },
    getActiveStrokeColor: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeColor;
      }

      const value = selectedObject.get("stroke") || strokeColor;

      return value;
    },
    getActiveStrokeWidth: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeWidth;
      }

      const value = selectedObject.get("strokeWidth") || strokeWidth;

      return value;
    },
    getActiveStrokeDashArray: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeDashArray;
      }

      const value = selectedObject.get("strokeDashArray") || strokeDashArray;

      return value;
    },
    selectedObjects,
  };
};

export const useEditor = ({
  defaultState,
  defaultHeight,
  defaultWidth,
  clearSelectionCallback,
  saveCallback,
}: EditorHookProps) => {
  const initialState = useRef(defaultState);
  const initialWidth = useRef(defaultWidth);
  const initialHeight = useRef(defaultHeight);

  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);

  const [fontFamily, setFontFamily] = useState(FONT_FAMILY);
  const [fillColor, setFillColor] = useState(FILL_COLOR);
  const [strokeColor, setStrokeColor] = useState(STROKE_COLOR);
  const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH);
  const [strokeDashArray, setStrokeDashArray] = useState<number[]>(STROKE_DASH_ARRAY);

  useWindowEvents();

  const {
    save,
    persist,
    canRedo,
    canUndo,
    undo,
    redo,
    suspendHistory,
    resumeHistory,
    canvasHistory,
    setHistoryIndex,
  } = useHistory({
    canvas,
    saveCallback
  });

  const { copy, cut, duplicate, paste } = useClipboard({ canvas });

  const { autoZoom } = useAutoResize({
    canvas,
    container,
  });

  useCanvasEvents({
    save,
    canvas,
    setSelectedObjects,
    clearSelectionCallback,
  });

  useHotkeys({
    undo,
    redo,
    copy,
    cut,
    duplicate,
    paste,
    save: persist,
    canvas,
  });

  useLoadState({
    canvas,
    autoZoom,
    initialState,
    canvasHistory,
    setHistoryIndex,
  });

  const editor = useMemo(() => {
    if (canvas) {
      return buildEditor({
        save,
        persist,
        suspendHistory,
        resumeHistory,
        undo,
        redo,
        canUndo,
        canRedo,
        autoZoom,
        copy,
        paste,
        canvas,
        fillColor,
        strokeWidth,
        strokeColor,
        setFillColor,
        setStrokeColor,
        setStrokeWidth,
        strokeDashArray,
        selectedObjects,
        setStrokeDashArray,
        fontFamily,
        setFontFamily,
      });
    }

    return undefined;
  },
  [
    canRedo,
    canUndo,
    suspendHistory,
    resumeHistory,
    undo,
    redo,
    save,
    persist,
    autoZoom,
    copy,
    paste,
    canvas,
    fillColor,
    strokeWidth,
    strokeColor,
    selectedObjects,
    strokeDashArray,
    fontFamily,
  ]);

  const init = useCallback(
    ({
      initialCanvas,
      initialContainer,
    }: {
      initialCanvas: fabric.Canvas;
      initialContainer: HTMLDivElement;
    }) => {
      let savedState: any;

      try {
        savedState = initialState.current
          ? JSON.parse(initialState.current)
          : undefined;
      } catch {
        savedState = undefined;
      }

      const savedWorkspace = Array.isArray(savedState?.objects)
        ? savedState.objects.find((object: any) => object?.name === "clip")
        : undefined;
      const workspaceWidth = getValidCanvasDimension(
        initialWidth.current,
        savedState?.workspace?.width,
        savedWorkspace?.width,
        savedState?.clipPath?.width,
        DEFAULT_WORKSPACE_WIDTH,
      )!;
      const workspaceHeight = getValidCanvasDimension(
        initialHeight.current,
        savedState?.workspace?.height,
        savedWorkspace?.height,
        savedState?.clipPath?.height,
        DEFAULT_WORKSPACE_HEIGHT,
      )!;

      fabric.Object.prototype.set({
        cornerColor: "#FFF",
        cornerStyle: "circle",
        borderColor: "#3b82f6",
        borderScaleFactor: 1.5,
        transparentCorners: false,
        borderOpacityWhenMoving: 1,
        cornerStrokeColor: "#3b82f6",
      });

      const initialWorkspace = new fabric.Rect({
        width: workspaceWidth,
        height: workspaceHeight,
        name: "clip",
        fill: "white",
        selectable: false,
        hasControls: false,
        shadow: new fabric.Shadow({
          color: "rgba(0,0,0,0.8)",
          blur: 5,
        }),
      });

      initialCanvas.setWidth(initialContainer.offsetWidth || 800);
      initialCanvas.setHeight(initialContainer.offsetHeight || 600);

      initialCanvas.add(initialWorkspace);
      initialCanvas.centerObject(initialWorkspace);

      setCanvas(initialCanvas);
      setContainer(initialContainer);

      const currentState = JSON.stringify(
        initialCanvas.toJSON(JSON_KEYS)
      );
      canvasHistory.current = [currentState];
      setHistoryIndex(0);

    },
    [
      canvasHistory, // No need, this is from useRef
      setHistoryIndex, // No need, this is from useState
    ]
  );

  return { init, editor };
};
