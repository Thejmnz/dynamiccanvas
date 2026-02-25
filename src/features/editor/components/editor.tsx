"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import debounce from "lodash.debounce";

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
import { VectorSidebar } from "@/features/editor/components/vector-sidebar";
import { FillColorSidebar } from "@/features/editor/components/fill-color-sidebar";
import { StrokeColorSidebar } from "@/features/editor/components/stroke-color-sidebar";
import { StrokeWidthSidebar } from "@/features/editor/components/stroke-width-sidebar";
import { OpacitySidebar } from "@/features/editor/components/opacity-sidebar";
import { TextSidebar } from "@/features/editor/components/text-sidebar";
import { FontSidebar } from "@/features/editor/components/font-sidebar";
import { ImageSidebar } from "@/features/editor/components/image-sidebar";
import { UploadsSidebar } from "@/features/editor/components/uploads-sidebar";
import { FilterSidebar } from "@/features/editor/components/filter-sidebar";
import { EffectsSidebar } from "@/features/editor/components/effects-sidebar";
import { QRCodeSidebar } from "@/features/editor/components/qrcode-sidebar";
import { BarcodeSidebar } from "@/features/editor/components/barcode-sidebar";
import { TemplateSidebar } from "@/features/editor/components/template-sidebar";
import { RemoveBgSidebar } from "@/features/editor/components/remove-bg-sidebar";
import { SettingsSidebar } from "@/features/editor/components/settings-sidebar";
import { KonvaCanvas } from "@/features/editor/components/KonvaCanvas";
import { LayersPanel } from "@/features/editor/components/layers-panel";

interface EditorProps {
  initialData: ResponseType["data"];
};

// Adaptador para que los sidebars funcionen con la nueva API Konva
interface EditorAdapter {
  canvas?: any; // Placeholder para compatibilidad
  addRect: () => void;
  addRectangle?: () => void;
  addSoftRectangle: () => void;
  addCircle: () => void;
  addTriangle: () => void;
  addInverseTriangle: () => void;
  addDiamond: () => void;
  addPentagon: () => void;
  addHexagon: () => void;
  addStar: () => void;
  addHeart: () => void;
  addArrow: () => void;
  addLine: () => void;
  addText: (value: string, options?: any) => void;
  addImage: (value: string) => void;
  delete: () => void;
  changeFillColor: (value: string) => void;
  changeStrokeColor: (value: string) => void;
  changeStrokeWidth: (value: number) => void;
  changeStrokeDashArray?: (value: number[]) => void;
  changeOpacity: (value: number) => void;
  changeFontSize: (value: number) => void;
  getActiveFontSize: () => number;
  changeTextAlign: (value: string) => void;
  getActiveTextAlign: () => string;
  changeTextVerticalAlign: (value: string) => void;
  getActiveTextVerticalAlign: () => string;
  changeLetterSpacing: (value: number) => void;
  getActiveLetterSpacing: () => number;
  changeLineHeight: (value: number) => void;
  getActiveLineHeight: () => number;
  changeFontUnderline: (value: boolean) => void;
  getActiveFontUnderline: () => boolean;
  changeFontLinethrough: (value: boolean) => void;
  getActiveFontLinethrough: () => boolean;
  changeFontStyle: (value: string) => void;
  getActiveFontStyle: () => string;
  changeFontWeight: (value: number) => void;
  getActiveFontWeight: () => number;
  getActiveFontFamily: () => string;
  changeFontFamily: (value: string) => void;
  changeImageFilter: (value: string) => void;
  getActiveFillColor: () => string;
  getActiveStrokeColor: () => string;
  getActiveStrokeWidth: () => number;
  getActiveStrokeDashArray?: () => number[];
  getActiveOpacity: () => number;
  selectedObjects: any[];
  getSelectedElements: () => any[];
  centerHorizontally: () => void;
  centerVertically: () => void;
  bringForward: () => void;
  sendBackwards: () => void;
  savePng: () => void;
  saveJpg: () => void;
  saveSvg: () => void;
  saveJson: () => void;
  loadJson: (json: string) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  onUndo: () => void;
  onRedo: () => void;
  save: () => void;
  getWorkspace?: () => any;
  changeBackground?: (value: string) => void;
}

export const Editor = ({ initialData }: EditorProps) => {
  const { mutate } = useUpdateProject(initialData.id);

  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const [showGrid, setShowGrid] = useState(false);
  const [showPrintSafeZone, setShowPrintSafeZone] = useState(false);

  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool("select");
    }
  }, [activeTool]);

  const editor = useEditor({
    defaultState: initialData.json,
    defaultWidth: initialData.width,
    defaultHeight: initialData.height,
    clearSelectionCallback: onClearSelection,
    // Sin saveCallback - guardado manual
  });

  // Función de guardado silencioso (para auto-save, sin notificaciones)
  const handleAutoSave = useCallback(() => {
    setTimeout(() => {
      const json = JSON.stringify({
        version: "2.0",
        workspace: editor.workspace,
        elements: editor.elements,
      });

      const thumbnailDataUrl = editor.generateThumbnail?.();

      mutate({
        json,
        height: editor.workspace.height,
        width: editor.workspace.width,
        thumbnailDataUrl,
        silent: true, // No mostrar toast
      });
    }, 100);
  }, [editor, mutate]);

  // Función de guardado manual (con notificación)
  const handleManualSave = useCallback(() => {
    setTimeout(() => {
      const json = JSON.stringify({
        version: "2.0",
        workspace: editor.workspace,
        elements: editor.elements,
      });

      const thumbnailDataUrl = editor.generateThumbnail?.();
      console.log("🖼️ Generating thumbnail:", thumbnailDataUrl ? `Success (${thumbnailDataUrl.substring(0, 50)}...)` : "Failed - stageRef not ready");
      console.log("📊 Workspace:", editor.workspace);
      console.log("📦 Elements count:", editor.elements.length);

      mutate({
        json,
        height: editor.workspace.height,
        width: editor.workspace.width,
        thumbnailDataUrl,
      });
    }, 100);
  }, [editor, mutate]);

  // Cargar estado inicial si existe
  useEffect(() => {
    if (initialData.json && editor.loadJson) {
      try {
        console.log("Loading initial JSON:", initialData.json.substring(0, 200));
        editor.loadJson(initialData.json);
      } catch (e) {
        console.error("Error loading initial state:", e);
      }
    }
  }, [initialData.json, editor.loadJson]);

  // Crear adaptador para compatibilidad con sidebars existentes
  const editorAdapter: EditorAdapter = {
    ...editor,
    get selectedObjects() {
      return editor.getSelectedElements();
    },
    getSelectedElements: () => editor.getSelectedElements(),
    addRect: editor.addRect,
    addRectangle: editor.addRectangle,
    addSoftRectangle: () => editor.addRect(true),
    addCircle: editor.addCircle,
    addTriangle: editor.addTriangle,
    addInverseTriangle: () => editor.addTriangle(true),
    addDiamond: editor.addDiamond,
    addPentagon: editor.addPentagon,
    addHexagon: editor.addHexagon,
    addStar: editor.addStar,
    addHeart: editor.addHeart,
    addArrow: editor.addArrow,
    addLine: editor.addLine,
    // Use the actual fontSize methods from the hook
    changeFontSize: editor.changeFontSize,
    getActiveFontSize: editor.getActiveFontSize,
    changeTextAlign: (align: string) => editor.changeTextAlign?.(align as 'left' | 'center' | 'right'),
    getActiveTextAlign: editor.getActiveTextAlign,
    changeTextVerticalAlign: (align: string) => {
      editor.selectedIds.forEach(id => {
        editor.onChange(id, { textVerticalAlign: align as 'top' | 'middle' | 'bottom' });
      });
    },
    getActiveTextVerticalAlign: () => {
      const firstSelected = editor.getSelectedElements()[0];
      return firstSelected?.textVerticalAlign || 'top';
    },
    changeLetterSpacing: (spacing: number) => {
      editor.selectedIds.forEach(id => {
        editor.onChange(id, { letterSpacing: spacing });
      });
    },
    getActiveLetterSpacing: () => {
      const firstSelected = editor.getSelectedElements()[0];
      return firstSelected?.letterSpacing ?? 0;
    },
    changeLineHeight: (height: number) => {
      editor.selectedIds.forEach(id => {
        editor.onChange(id, { lineHeight: height });
      });
    },
    getActiveLineHeight: () => {
      const firstSelected = editor.getSelectedElements()[0];
      return firstSelected?.lineHeight ?? 1;
    },
    changeFontUnderline: (value: boolean) => {
      editor.selectedIds.forEach(id => {
        editor.onChange(id, { textDecoration: value ? 'underline' : 'none' });
      });
    },
    getActiveFontUnderline: () => {
      const firstSelected = editor.getSelectedElements()[0];
      return firstSelected?.textDecoration === 'underline';
    },
    changeFontLinethrough: (value: boolean) => {
      editor.selectedIds.forEach(id => {
        editor.onChange(id, { textDecoration: value ? 'line-through' : 'none' });
      });
    },
    getActiveFontLinethrough: () => {
      const firstSelected = editor.getSelectedElements()[0];
      return firstSelected?.textDecoration === 'line-through';
    },
    changeFontStyle: (value: string) => {
      editor.selectedIds.forEach(id => {
        const el = editor.elements.find(e => e.id === id);
        const currentFontWeight = el?.fontWeight || 400;
        const isBold = currentFontWeight > 500;

        // Combinar fontStyle con fontWeight
        let newFontStyle: 'bold' | 'normal' | 'italic' | 'bold italic' = value as 'bold' | 'normal' | 'italic' | 'bold italic';
        if (isBold) {
          newFontStyle = value === 'italic' ? 'bold italic' : 'bold';
        }
        editor.onChange(id, { fontStyle: newFontStyle });
      });
    },
    getActiveFontStyle: () => {
      const firstSelected = editor.getSelectedElements()[0];
      const fontStyle = firstSelected?.fontStyle || 'normal';
      // Extraer solo italic del fontStyle (que puede ser 'bold', 'italic', 'bold italic')
      return fontStyle.includes('italic') ? 'italic' : 'normal';
    },
    changeFontWeight: (value: number) => {
      editor.selectedIds.forEach(id => {
        const el = editor.elements.find(e => e.id === id);
        const currentFontStyle = el?.fontStyle || 'normal';
        const isItalic = currentFontStyle.includes('italic');

        // Konva usa fontStyle para bold, no fontWeight numérico
        let newFontStyle: 'bold' | 'normal' | 'italic' | 'bold italic' = 'normal';
        if (value > 500) {
          newFontStyle = isItalic ? 'bold italic' : 'bold';
        } else {
          newFontStyle = isItalic ? 'italic' : 'normal';
        }
        editor.onChange(id, { fontStyle: newFontStyle, fontWeight: value });
      });
    },
    getActiveFontWeight: () => {
      const firstSelected = editor.getSelectedElements()[0];
      const fontStyle = firstSelected?.fontStyle || 'normal';
      // Determinar si es bold por el fontStyle
      return fontStyle.includes('bold') ? 700 : 400;
    },
    getActiveFontFamily: () => {
      const firstSelected = editor.getSelectedElements()[0];
      return firstSelected?.fontFamily || 'Arial';
    },
    changeFontFamily: (font: string) => {
      editor.selectedIds.forEach(id => {
        editor.onChange(id, { fontFamily: font });
      });
    },
    changeImageFilter: (filter: string) => {
      editor.selectedIds.forEach(id => {
        const element = editor.elements.find(e => e.id === id);
        if (element?.type === 'image') {
          editor.onChange(id, { filterType: filter });
        }
      });
    },
    centerHorizontally: () => {
      const centerX = editor.workspace.width / 2;
      editor.selectedIds.forEach(id => {
        const el = editor.elements.find(e => e.id === id);
        if (el) {
          // Calcular el ancho real del elemento
          const elementWidth = el.width * (el.scaleX ?? 1);
          // Para elementos con originX='left', restamos la mitad del ancho
          const newX = centerX - elementWidth / 2;
          editor.onChange(id, { x: newX, originX: 'left' });
        }
      });
    },
    centerVertically: () => {
      const centerY = editor.workspace.height / 2;
      editor.selectedIds.forEach(id => {
        const el = editor.elements.find(e => e.id === id);
        if (el) {
          const elementHeight = (el.height || 100) * (el.scaleY ?? 1);
          const newY = centerY - elementHeight / 2;
          editor.onChange(id, { y: newY });
        }
      });
    },
    // Stroke dash array
    changeStrokeDashArray: (value: number[]) => {
      editor.selectedIds.forEach(id => {
        editor.onChange(id, { strokeDashArray: value });
      });
    },
    getActiveStrokeDashArray: () => editor.getActiveStrokeDashArray?.() || [],
    canUndo: () => editor.canUndo(),
    canRedo: () => editor.canRedo(),
    onUndo: () => editor.undo(),
    onRedo: () => editor.redo(),
    getWorkspace: () => editor.workspace,
    changeBackground: (value: string) => {
      // Update workspace background - this would need to be implemented in useEditor hook
      // For now, we'll update it locally
      editor.workspace.background = value;
    },
    // Guardado manual
    save: handleManualSave,
  };

  const onChangeActiveTool = useCallback((tool: ActiveTool) => {
    if (tool === activeTool) {
      return setActiveTool("select");
    }
    setActiveTool(tool);
  }, [activeTool]);

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="h-full flex flex-col">
      <Navbar
        id={initialData.id}
        editor={editorAdapter as any}
        activeTool={activeTool}
        onChangeActiveTool={onChangeActiveTool}
        onSave={handleManualSave}
        onAutoSave={handleAutoSave}
        showGrid={showGrid}
        onShowGridChange={setShowGrid}
        showPrintSafeZone={showPrintSafeZone}
        onShowPrintSafeZoneChange={setShowPrintSafeZone}
      />
      <div className="absolute h-[calc(100%-68px)] w-full top-[68px] flex">
        <Sidebar
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        {/* Floating Sidebars - positioned absolutely over the editor */}
        <div className="absolute left-[100px] top-0 bottom-0 z-[40] pointer-events-none">
          <div className="pointer-events-auto h-full">
            <ShapeSidebar
              editor={editorAdapter as any}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
            <VectorSidebar
              editor={editorAdapter as any}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
            <FillColorSidebar
              editor={editorAdapter as any}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
            <StrokeColorSidebar
              editor={editorAdapter as any}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
            <StrokeWidthSidebar
              editor={editorAdapter as any}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
            <OpacitySidebar
              editor={editorAdapter as any}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
            <TextSidebar
              editor={editorAdapter as any}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
            <FontSidebar
              editor={editorAdapter as any}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
            <ImageSidebar
              editor={editorAdapter as any}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
            <UploadsSidebar
              editor={editorAdapter as any}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
            <TemplateSidebar
              editor={editorAdapter as any}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
            <FilterSidebar
              editor={editorAdapter as any}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
            <EffectsSidebar
              editor={editorAdapter as any}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
              selectedElement={editor.selectedIds.length === 1
                ? editor.elements.find(el => el.id === editor.selectedIds[0])
                : null}
              onChangeElement={editor.onChange}
            />
            <QRCodeSidebar
              editor={editorAdapter as any}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
            <BarcodeSidebar
              editor={editorAdapter as any}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
            <RemoveBgSidebar
              editor={editorAdapter as any}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
            <SettingsSidebar
              editor={editorAdapter as any}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
            />
          </div>
        </div>
        <main
          className="bg-muted flex-1 overflow-auto relative flex flex-col"
          onClick={(e) => {
            // Cerrar sidebar cuando se hace clic fuera del sidebar
            const target = e.target as HTMLElement;
            // Verificar que no sea un clic dentro de un sidebar
            if (!target.closest('aside') && !target.closest('[data-sidebar]')) {
              setActiveTool("select");
            }
          }}
        >
          <div
            className="flex-1 h-full bg-muted flex items-center justify-center"
            ref={containerRef}
            onDoubleClick={(e) => {
              // Detener doble clic para evitar que seleccione la toolbar
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <KonvaCanvas
              elements={editor.elements}
              workspace={editor.workspace || { width: 1080, height: 1350, background: "#ffffff" }}
              selectedIds={editor.selectedIds}
              onSelect={editor.onSelect}
              onMultiSelect={editor.onMultiSelect}
              onChange={editor.onChange}
              isEditingText={editor.isEditingText}
              onEditingChange={editor.setIsEditingText}
              onStageReady={editor.setStageRef}
              onDeleteElement={editor.deleteElement}
              onAddElement={editor.addElement}
              onBringForward={editor.bringForward}
              onSendBackwards={editor.sendBackwards}
              onChangeActiveTool={onChangeActiveTool}
              activeTool={activeTool}
              showGrid={showGrid}
              showPrintSafeZone={showPrintSafeZone}
            />
          </div>
        </main>

        {/* Layers Panel - Floating on the right */}
        <LayersPanel
          elements={editor.elements}
          selectedIds={editor.selectedIds}
          onSelect={editor.onSelect}
          onChange={editor.onChange}
          onDelete={editor.deleteElement}
          onReorder={editor.reorderElements}
        />
      </div>
    </div>
  );
};
