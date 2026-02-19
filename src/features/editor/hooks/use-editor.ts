"use client";

import { useCallback, useState, useRef } from "react";
import { CanvasElement, ElementType } from "../types";

const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

interface UseEditorProps {
  defaultState?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  saveCallback?: (values: {
    json: string;
    height: number;
    width: number;
  }) => void;
  clearSelectionCallback?: () => void;
}

export const useEditor = ({
  defaultWidth = 1080,
  defaultHeight = 1350,
  saveCallback,
  clearSelectionCallback,
}: UseEditorProps = {}) => {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isEditingText, setIsEditingText] = useState(false);
  const [workspace, setWorkspace] = useState({
    width: defaultWidth,
    height: defaultHeight,
    background: "#ffffff",
  });

  // Historia para undo/redo
  const historyRef = useRef<CanvasElement[][]>([[]]);
  const historyIndexRef = useRef(0);

  // Referencia al Stage de Konva para exportación
  const stageRef = useRef<any>(null);

  // Helper function to calculate text height based on content and font properties
  const calculateTextHeight = useCallback((element: CanvasElement): number => {
    if (element.type !== 'text') return element.height || 100;

    const lines = (element.text || '').split('\n').length;
    const fontSize = element.fontSize || 32;
    const lineHeight = element.lineHeight || 1.2;
    const estimatedHeight = fontSize * lineHeight * lines;

    // For middle/bottom alignment, use tighter height to avoid text "floating"
    if (element.textVerticalAlign === 'middle' || element.textVerticalAlign === 'bottom') {
      return Math.max(estimatedHeight, fontSize * lineHeight * 0.9);
    }

    // For top alignment, add a bit more padding
    return Math.max(estimatedHeight, fontSize * lineHeight * 1.1);
  }, []);

  // Funciones de utilidad
  const updateElement = useCallback((id: string, changes: Partial<CanvasElement>) => {
    setElements(prev => {
      const newElements = prev.map(el => {
        if (el.id === id) {
          const updatedElement = { ...el, ...changes };

          // NO recalcular height automáticamente - el usuario controla el tamaño del textbox
          // El height solo se establece al crear el elemento, no se recalcula

          return updatedElement;
        }
        return el;
      });

      // Guardar en historial
      historyRef.current = [...historyRef.current.slice(0, historyIndexRef.current + 1), newElements];
      historyIndexRef.current = historyRef.current.length - 1;

      // Auto-guardar
      saveCallback?.({
        json: JSON.stringify({ version: "2.0", workspace, elements: newElements }),
        height: workspace.height,
        width: workspace.width,
      });

      return newElements;
    });
  }, [workspace, saveCallback, calculateTextHeight]);

  const addElement = useCallback((element: Omit<CanvasElement, "id">) => {
    const newElement: CanvasElement = {
      id: generateId(),
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
          visible: true,
      ...element,
    };

    setElements(prev => {
      const newElements = [...prev, newElement];

      historyRef.current = [...historyRef.current.slice(0, historyIndexRef.current + 1), newElements];
      historyIndexRef.current = historyRef.current.length - 1;

      saveCallback?.({
        json: JSON.stringify({ version: "2.0", workspace, elements: newElements }),
        height: workspace.height,
        width: workspace.width,
      });

      return newElements;
    });

    return newElement;
  }, [workspace, saveCallback]);

  const deleteSelected = useCallback(() => {
    setElements(prev => {
      const newElements = prev.filter(el => !selectedIds.includes(el.id));

      historyRef.current = [...historyRef.current.slice(0, historyIndexRef.current + 1), newElements];
      historyIndexRef.current = historyRef.current.length - 1;

      saveCallback?.({
        json: JSON.stringify({ version: "2.0", workspace, elements: newElements }),
        height: workspace.height,
        width: workspace.width,
      });

      setSelectedIds([]);
      return newElements;
    });
  }, [selectedIds, workspace, saveCallback]);

  // Crear formas
  const addRect = useCallback((soft = false) => {
    const newElement = addElement({
      type: "rect",
      x: 100,
      y: 100,
      width: 400,
      height: 400,
      fill: "#000000",
      stroke: "none",
      strokeWidth: 0,
      rx: soft ? 50 : 0,
      ry: soft ? 50 : 0,
    });
    setSelectedIds([newElement.id]);
    clearSelectionCallback?.();
  }, [addElement, clearSelectionCallback]);

  const addCircle = useCallback(() => {
    const newElement = addElement({
      type: "circle",
      x: 100,
      y: 100,
      width: 450,
      height: 450,
      fill: "#000000",
      stroke: "none",
      strokeWidth: 0,
    });
    setSelectedIds([newElement.id]);
    clearSelectionCallback?.();
  }, [addElement, clearSelectionCallback]);

  const addTriangle = useCallback((invert = false) => {
    const newElement = addElement({
      type: "triangle",
      x: 100,
      y: 100,
      width: 400,
      height: 400,
      fill: "#000000",
      stroke: "none",
      strokeWidth: 0,
      invert,
    });
    setSelectedIds([newElement.id]);
    clearSelectionCallback?.();
  }, [addElement, clearSelectionCallback]);

  const addDiamond = useCallback(() => {
    const newElement = addElement({
      type: "diamond",
      x: 100,
      y: 100,
      width: 600,
      height: 600,
      fill: "#000000",
      stroke: "none",
      strokeWidth: 0,
    });
    setSelectedIds([newElement.id]);
    clearSelectionCallback?.();
  }, [addElement, clearSelectionCallback]);

  const addText = useCallback((text: string, options?: Partial<CanvasElement>) => {
    // Calcular un height inicial aproximado basado en el número de líneas
    const lines = text.split('\n').length;
    const estimatedHeight = (options?.fontSize || 32) * (options?.lineHeight || 1) * lines;

    // Calcular un width aproximado basado en el largo del texto
    // Esto ayuda a que el textbox no sea demasiado grande para textos cortos
    const estimatedWidth = Math.min(
      Math.max(text.length * (options?.fontSize || 32) * 0.6, 100), // Mínimo 100px
      800 // Máximo 800px
    );

    const newElement = addElement({
      type: "text",
      x: 100,
      y: 100,
      width: options?.width || estimatedWidth, // Usar width estimado o el proporcionado
      height: estimatedHeight,
      text,
      fontSize: 32,
      fontFamily: "Arial",
      fill: "#000000",
      ...options,
    });
    // Seleccionar el nuevo elemento automáticamente
    setSelectedIds([newElement.id]);
    clearSelectionCallback?.();
  }, [addElement, clearSelectionCallback]);

  const addImage = useCallback((src: string) => {
    // Cargar la imagen para obtener sus dimensiones reales
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const originalWidth = img.width;
      const originalHeight = img.height;

      // Si la imagen es muy grande, escalarla manteniendo el aspect ratio
      const MAX_SIZE = 800;
      let width = originalWidth;
      let height = originalHeight;

      if (width > MAX_SIZE || height > MAX_SIZE) {
        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
        width = width * ratio;
        height = height * ratio;
      }

      const newElement = addElement({
        type: "image",
        x: 100,
        y: 100,
        width,
        height,
        src,
      });
      setSelectedIds([newElement.id]);
      clearSelectionCallback?.();
    };
    img.onerror = () => {
      console.error("Failed to load image:", src);
    };
    img.src = src;
  }, [addElement, clearSelectionCallback]);

  // Funciones de propiedad
  const changeFillColor = useCallback((color: string) => {
    selectedIds.forEach(id => {
      updateElement(id, { fill: color });
    });
  }, [selectedIds, updateElement]);

  const changeStrokeColor = useCallback((color: string) => {
    selectedIds.forEach(id => {
      updateElement(id, { stroke: color });
    });
  }, [selectedIds, updateElement]);

  const changeStrokeWidth = useCallback((width: number) => {
    selectedIds.forEach(id => {
      updateElement(id, { strokeWidth: width });
    });
  }, [selectedIds, updateElement]);

  const changeOpacity = useCallback((opacity: number) => {
    selectedIds.forEach(id => {
      updateElement(id, { opacity });
    });
  }, [selectedIds, updateElement]);

  // Funciones de capa
  const bringForward = useCallback(() => {
    setElements(prev => {
      const newElements = [...prev];
      selectedIds.forEach(id => {
        const index = newElements.findIndex(el => el.id === id);
        if (index < newElements.length - 1) {
          const [removed] = newElements.splice(index, 1);
          newElements.splice(index + 1, 0, removed);
        }
      });
      return newElements;
    });
  }, [selectedIds]);

  const sendBackwards = useCallback(() => {
    setElements(prev => {
      const newElements = [...prev];
      selectedIds.forEach(id => {
        const index = newElements.findIndex(el => el.id === id);
        if (index > 0) {
          const [removed] = newElements.splice(index, 1);
          newElements.splice(index - 1, 0, removed);
        }
      });
      return newElements;
    });
  }, [selectedIds]);

  // Undo/Redo
  const canUndo = () => historyIndexRef.current > 0;
  const canRedo = () => historyIndexRef.current < historyRef.current.length - 1;

  const undo = () => {
    if (canUndo()) {
      historyIndexRef.current--;
      setElements([...historyRef.current[historyIndexRef.current]]);
    }
  };

  const redo = () => {
    if (canRedo()) {
      historyIndexRef.current++;
      setElements([...historyRef.current[historyIndexRef.current]]);
    }
  };

  // Exportar
  const saveJson = useCallback(() => {
    const data = { version: "2.0", workspace, elements };
    const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, "\t"))}`;
    const link = document.createElement("a");
    link.href = fileString;
    link.download = "project.json";
    link.click();
  }, [workspace, elements]);

  const savePng = useCallback(() => {
    // Usar el stage de Konva para exportar en máxima calidad
    if (!stageRef.current) {
      console.error('Stage reference not available');
      return;
    }

    // El stage tiene scale=0.5, así que usamos pixelRatio=2 para obtener la resolución completa
    const dataURL = stageRef.current.toDataURL({
      pixelRatio: 2, // Compensa el scale del stage
      mimeType: 'image/png',
      quality: 1,
    });

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'project.png';
    link.click();
  }, []);

  const saveJpg = useCallback(() => {
    // Usar el stage de Konva para exportar en máxima calidad
    if (!stageRef.current) {
      console.error('Stage reference not available');
      return;
    }

    // El stage tiene scale=0.5, así que usamos pixelRatio=2 para obtener la resolución completa
    const dataURL = stageRef.current.toDataURL({
      pixelRatio: 2, // Compensa el scale del stage
      mimeType: 'image/jpeg',
      quality: 1.0, // Máxima calidad
    });

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'project.jpg';
    link.click();
  }, []);

  const saveSvg = useCallback(() => {
    // SVG export no es soportado con Konva (canvas-based)
    console.warn('SVG export is not supported with Konva canvas rendering');
    // TODO: Implementar conversión manual de elementos a SVG
    alert('SVG export is not currently supported with the canvas-based editor.');
  }, []);

  // Cargar estado
  const loadJson = useCallback((json: string) => {
    try {
      const data = JSON.parse(json);
      console.log("Loading JSON data:", data);

      // Cargar workspace si existe
      if (data.workspace) {
        setWorkspace(data.workspace);
      }

      // Cargar elementos si existen
      if (data.elements) {
        setElements(data.elements);
        historyRef.current = [data.elements];
        historyIndexRef.current = 0;
      }
    } catch (e) {
      console.error("Error loading JSON:", e);
    }
  }, []);

  const getSelectedElements = useCallback(() => {
    return elements.filter(el => selectedIds.includes(el.id));
  }, [elements, selectedIds]);

  const getActiveFillColor = useCallback(() => {
    const selected = getSelectedElements();
    return selected[0]?.fill || "#000000";
  }, [getSelectedElements]);

  const getActiveOpacity = useCallback(() => {
    const selected = getSelectedElements();
    return selected[0]?.opacity ?? 1;
  }, [getSelectedElements]);

  const getActiveStrokeColor = useCallback(() => {
    const selected = getSelectedElements();
    return selected[0]?.stroke || "rgba(0,0,0,1)";
  }, [getSelectedElements]);

  const getActiveStrokeWidth = useCallback(() => {
    const selected = getSelectedElements();
    return selected[0]?.strokeWidth ?? 0;
  }, [getSelectedElements]);

  const getActiveStrokeDashArray = useCallback(() => {
    const selected = getSelectedElements();
    return selected[0]?.strokeDashArray || [];
  }, [getSelectedElements]);

  // Font properties
  const changeFontSize = useCallback((fontSize: number) => {
    selectedIds.forEach(id => {
      updateElement(id, { fontSize });
    });
  }, [selectedIds, updateElement]);

  const getActiveFontSize = useCallback(() => {
    const selected = getSelectedElements();
    return selected[0]?.fontSize ?? 32;
  }, [getSelectedElements]);

  const changeFontFamily = useCallback((fontFamily: string) => {
    selectedIds.forEach(id => {
      updateElement(id, { fontFamily });
    });
  }, [selectedIds, updateElement]);

  const getActiveFontFamily = useCallback(() => {
    const selected = getSelectedElements();
    return selected[0]?.fontFamily ?? "Arial";
  }, [getSelectedElements]);

  const changeTextAlign = useCallback((textAlign: 'left' | 'center' | 'right') => {
    selectedIds.forEach(id => {
      updateElement(id, { textAlign });
    });
  }, [selectedIds, updateElement]);

  const getActiveTextAlign = useCallback(() => {
    const selected = getSelectedElements();
    return selected[0]?.textAlign ?? "left";
  }, [getSelectedElements]);

  const changeLineHeight = useCallback((lineHeight: number) => {
    selectedIds.forEach(id => {
      updateElement(id, { lineHeight });
    });
  }, [selectedIds, updateElement]);

  const getActiveLineHeight = useCallback(() => {
    const selected = getSelectedElements();
    // Si no hay valor, usar 1.0 en lugar de 1.2 para poder bajar más
    return selected[0]?.lineHeight ?? 1;
  }, [getSelectedElements]);

  // Vertical text alignment
  const changeTextVerticalAlign = useCallback((textVerticalAlign: 'top' | 'middle' | 'bottom') => {
    selectedIds.forEach(id => {
      updateElement(id, { textVerticalAlign });
    });
  }, [selectedIds, updateElement]);

  const getActiveTextVerticalAlign = useCallback(() => {
    const selected = getSelectedElements();
    return selected[0]?.textVerticalAlign ?? "top";
  }, [getSelectedElements]);

  // Letter spacing
  const changeLetterSpacing = useCallback((letterSpacing: number) => {
    selectedIds.forEach(id => {
      updateElement(id, { letterSpacing });
    });
  }, [selectedIds, updateElement]);

  const getActiveLetterSpacing = useCallback(() => {
    const selected = getSelectedElements();
    return selected[0]?.letterSpacing ?? 0;
  }, [getSelectedElements]);

  // Font style (italic, bold)
  const changeFontStyle = useCallback((fontStyle: 'normal' | 'italic') => {
    selectedIds.forEach(id => {
      updateElement(id, { fontStyle });
    });
  }, [selectedIds, updateElement]);

  const getActiveFontStyle = useCallback(() => {
    const selected = getSelectedElements();
    return selected[0]?.fontStyle ?? "normal";
  }, [getSelectedElements]);

  // Font weight (bold)
  const changeFontWeight = useCallback((fontWeight: number) => {
    selectedIds.forEach(id => {
      updateElement(id, { fontWeight });
    });
  }, [selectedIds, updateElement]);

  const getActiveFontWeight = useCallback(() => {
    const selected = getSelectedElements();
    return selected[0]?.fontWeight ?? 400;
  }, [getSelectedElements]);

  // Text decoration (underline, line-through)
  const changeFontUnderline = useCallback((underline: boolean) => {
    selectedIds.forEach(id => {
      updateElement(id, { textDecoration: underline ? 'underline' : 'none' });
    });
  }, [selectedIds, updateElement]);

  const getActiveFontUnderline = useCallback(() => {
    const selected = getSelectedElements();
    return selected[0]?.textDecoration === 'underline';
  }, [getSelectedElements]);

  const changeFontLinethrough = useCallback((linethrough: boolean) => {
    selectedIds.forEach(id => {
      updateElement(id, { textDecoration: linethrough ? 'line-through' : 'none' });
    });
  }, [selectedIds, updateElement]);

  const getActiveFontLinethrough = useCallback(() => {
    const selected = getSelectedElements();
    return selected[0]?.textDecoration === 'line-through';
  }, [getSelectedElements]);

  // Centering functions
  const centerHorizontally = useCallback(() => {
    if (!workspace?.width) return;
    selectedIds.forEach(id => {
      const element = elements.find(el => el.id === id);
      if (element) {
        const elementWidth = element.width * element.scaleX;
        // Centrar el CONTENEDOR del elemento en el medio del canvas
        const centerX = (workspace.width / 2) - (elementWidth / 2);
        updateElement(id, { x: centerX });
      }
    });
  }, [selectedIds, elements, workspace?.width, updateElement]);

  const centerVertically = useCallback(() => {
    if (!workspace?.height) return;
    selectedIds.forEach(id => {
      const element = elements.find(el => el.id === id);
      if (element) {
        const rawHeight = element.height || 100;
        const elementHeight = rawHeight * element.scaleY;
        // Centrar el CONTENEDOR del elemento en el medio del canvas
        const centerY = (workspace.height / 2) - (elementHeight / 2);
        updateElement(id, { y: centerY });
      }
    });
  }, [selectedIds, elements, workspace?.height, updateElement]);

  // Copy/Paste
  const onCopy = useCallback(() => {
    const selected = getSelectedElements();
    if (selected.length > 0) {
      localStorage.setItem('clipboard', JSON.stringify(selected));
    }
  }, [getSelectedElements]);

  const onPaste = useCallback(() => {
    const clipboardData = localStorage.getItem('clipboard');
    if (clipboardData) {
      const copiedElements: CanvasElement[] = JSON.parse(clipboardData);
      // Offset pasted elements slightly
      const newElements = copiedElements.map(el => ({
        ...el,
        id: generateId(),
        x: el.x + 20,
        y: el.y + 20,
      }));

      setElements(prev => {
        const combined = [...prev, ...newElements];
        historyRef.current = [...historyRef.current.slice(0, historyIndexRef.current + 1), combined];
        historyIndexRef.current = historyRef.current.length - 1;
        saveCallback?.({
          json: JSON.stringify({ version: "2.0", workspace, elements: combined }),
          height: workspace.height,
          width: workspace.width,
        });
        return combined;
      });

      // Select pasted elements
      setSelectedIds(newElements.map(el => el.id));
    }
  }, [workspace, saveCallback]);

  return {
    // Estado
    elements,
    selectedIds,
    workspace,
    isEditingText,

    // Acciones
    onSelect: (id: string) => setSelectedIds([id]),
    onMultiSelect: (ids: string[]) => setSelectedIds(ids),
    onChange: updateElement,
    setIsEditingText,

    // API pública
    addRect,
    addCircle,
    addTriangle,
    addDiamond,
    addText,
    addImage,
    delete: deleteSelected,
    changeFillColor,
    changeStrokeColor,
    changeStrokeWidth,
    changeOpacity,
    bringForward,
    sendBackwards,

    // Undo/Redo
    canUndo,
    canRedo,
    undo,
    redo,

    // Exportar
    saveJson,
    savePng,
    saveJpg,
    saveSvg,
    loadJson,

    // Getters
    getSelectedElements,
    getActiveFillColor,
    getActiveOpacity,
    getActiveStrokeColor,
    getActiveStrokeWidth,
    getActiveStrokeDashArray,

    // Font properties
    changeFontSize,
    getActiveFontSize,
    changeFontFamily,
    getActiveFontFamily,
    changeTextAlign,
    getActiveTextAlign,
    changeTextVerticalAlign,
    getActiveTextVerticalAlign,
    changeLineHeight,
    getActiveLineHeight,
    changeLetterSpacing,
    getActiveLetterSpacing,
    changeFontStyle,
    getActiveFontStyle,
    changeFontWeight,
    getActiveFontWeight,
    changeFontUnderline,
    getActiveFontUnderline,
    changeFontLinethrough,
    getActiveFontLinethrough,

    // Centering
    centerHorizontally,
    centerVertically,

    // Copy/Paste
    onCopy,
    onPaste,

    // Stage reference for export
    setStageRef: (stage: any) => { stageRef.current = stage; },
    // Generate thumbnail for dashboard
    generateThumbnail: () => {
      if (!stageRef.current) {
        console.error('Stage reference not available for thumbnail');
        return null;
      }
      if (!workspace?.width) {
        console.error('Workspace width not available for thumbnail');
        return null;
      }
      // Generar thumbnail con mayor resolución para mejor calidad
      // El Stage tiene scale=0.5, así que pixelRatio compensa eso
      const thumbnailWidth = 600; // Aumentado de 300 a 600 para mejor calidad
      const pixelRatio = thumbnailWidth / workspace.width;
      return stageRef.current.toDataURL({
        pixelRatio: pixelRatio,
        mimeType: 'image/jpeg',
        quality: 0.9, // Aumentado de 0.8 a 0.9 para mejor calidad
      });
    },
  };
};
