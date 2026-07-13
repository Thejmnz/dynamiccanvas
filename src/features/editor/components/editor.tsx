"use client";

import { fabric } from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";

import { ResponseType } from "@/features/projects/api/use-get-project";
import { useUpdateProject } from "@/features/projects/api/use-update-project";

import {
  ActiveTool,
  selectionDependentTools
} from "@/features/editor/types";
import { Navbar } from "@/features/editor/components/navbar";
import { useEditor } from "@/features/editor/hooks/use-editor";
import { Sidebar } from "@/features/editor/components/sidebar";
import { Toolbar } from "@/features/editor/components/toolbar";
import { ShapeSidebar } from "@/features/editor/components/shape-sidebar";
import { FillColorSidebar } from "@/features/editor/components/fill-color-sidebar";
import { StrokeColorSidebar } from "@/features/editor/components/stroke-color-sidebar";
import { StrokeWidthSidebar } from "@/features/editor/components/stroke-width-sidebar";
import { OpacitySidebar } from "@/features/editor/components/opacity-sidebar";
import { TextSidebar } from "@/features/editor/components/text-sidebar";
import { FontSidebar } from "@/features/editor/components/font-sidebar";
import { ImageSidebar } from "@/features/editor/components/image-sidebar";
import { FilterSidebar } from "@/features/editor/components/filter-sidebar";
import { DrawSidebar } from "@/features/editor/components/draw-sidebar";
import { TemplateSidebar } from "@/features/editor/components/template-sidebar";
import { RemoveBgSidebar } from "@/features/editor/components/remove-bg-sidebar";
import { QRCodeSidebar } from "@/features/editor/components/qrcode-sidebar";
import { BarcodeSidebar } from "@/features/editor/components/barcode-sidebar";
import { VectorSidebar } from "@/features/editor/components/vector-sidebar";
import { UploadsSidebar } from "@/features/editor/components/uploads-sidebar";
import { FabricCanvasGuides } from "@/features/editor/components/fabric-canvas-guides";
import { FabricSnapGuides } from "@/features/editor/components/fabric-snap-guides";
import { LayersPanel } from "@/features/editor/components/layers-panel";
import { SelectionActions } from "@/features/editor/components/selection-actions";
import { ZoomControl } from "@/features/editor/components/zoom-control";
import { useFontLoader } from "@/features/editor/hooks/use-font-loader";
import { ImageCropOverlay } from "@/features/editor/components/image-crop-overlay";
import { applyFabricRuntimeFixes } from "@/features/editor/fabric-runtime-fixes";

applyFabricRuntimeFixes();

interface EditorProps {
  initialData: ResponseType["data"];
};

export const Editor = ({ initialData }: EditorProps) => {
  const { mutate } = useUpdateProject(initialData.id);

  const saveProject = useCallback((values: {
    json: string,
    height: number,
    width: number,
    thumbnailDataUrl?: string,
  }) => {
    mutate(values);
  }, [mutate]);

  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const [showGrid, setShowGrid] = useState(false);
  const [showPrintSafeZone, setShowPrintSafeZone] = useState(false);

  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool("select");
    }
  }, [activeTool]);

  const { init, editor } = useEditor({
    defaultState: initialData.json,
    defaultWidth: initialData.width,
    defaultHeight: initialData.height,
    clearSelectionCallback: onClearSelection,
    saveCallback: saveProject,
  });

  useFontLoader(() => {
    editor?.canvas.getObjects().forEach((object) => {
      if (["text", "i-text", "textbox"].includes(object.type || "")) {
        (object as fabric.Textbox).initDimensions();
        object.setCoords();
      }
    });
    editor?.canvas.requestRenderAll();
  });

  const onChangeActiveTool = useCallback((tool: ActiveTool) => {
    if (tool === "draw") {
      editor?.enableDrawingMode();
    }

    if (activeTool === "draw") {
      editor?.disableDrawingMode();
    }

    if (tool === activeTool) {
      return setActiveTool("select");
    }

    setActiveTool(tool);
  }, [activeTool, editor]);

  const canvasRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
    });

    // Fabric 5's `loadFromJSON` cannot be cancelled. In development React
    // Strict Mode can dispose this first canvas while images/filters/clipPaths
    // are still being enlivened. Fabric then finishes the async load and calls
    // `renderAll()` with a null context, which crashes in setImageSmoothing.
    // Keep stale async callbacks harmless after the canvas has been disposed.
    let isDisposed = false;
    const originalRenderAll = canvas.renderAll.bind(canvas);
    const originalRequestRenderAll = canvas.requestRenderAll.bind(canvas);

    canvas.renderAll = function () {
      if (isDisposed || !(this as any).contextContainer) return this;
      return originalRenderAll();
    };

    canvas.requestRenderAll = function () {
      if (isDisposed || !(this as any).contextContainer) return this;
      return originalRequestRenderAll();
    };

    const origClearContext = canvas.clearContext.bind(canvas);
    (canvas as any).clearContext = function (ctx: any) {
      if (isDisposed || !ctx || !(this as any).contextContainer) return undefined;
      return origClearContext(ctx);
    };

    init({
      initialCanvas: canvas,
      initialContainer: containerRef.current!,
    });

    return () => {
      isDisposed = true;
      (canvas as any).cancelRequestedRender?.();
      canvas.dispose();
    };
  }, [init]);

  return (
    <div className="h-full flex flex-col">
      <Navbar
        id={initialData.id}
        initialProject={initialData}
        editor={editor}
        showGrid={showGrid}
        onShowGridChange={setShowGrid}
        showPrintSafeZone={showPrintSafeZone}
        onShowPrintSafeZoneChange={setShowPrintSafeZone}
      />
      <div className="absolute top-[60px] flex h-[calc(100%-60px)] w-full">
        <Sidebar
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ShapeSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FillColorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeColorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeWidthSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <OpacitySidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <TextSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FontSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ImageSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <UploadsSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <QRCodeSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <BarcodeSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <VectorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <TemplateSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FilterSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <RemoveBgSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <DrawSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <main className="bg-muted flex-1 overflow-hidden relative flex flex-col">
          <Toolbar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
          <div
            className="editor-canvas-background flex-1 w-full relative"
            ref={containerRef}
          >
            <canvas ref={canvasRef} />
            <FabricCanvasGuides
              editor={editor}
              showGrid={showGrid}
              showPrintSafeZone={showPrintSafeZone}
            />
            <FabricSnapGuides editor={editor} />
            <SelectionActions editor={editor} />
            <ZoomControl editor={editor} />
            <ImageCropOverlay
              editor={editor}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
          </div>
        </main>
        <LayersPanel editor={editor} />
      </div>
    </div>
  );
};
