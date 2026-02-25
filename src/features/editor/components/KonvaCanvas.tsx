"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer, Line, Rect } from "react-konva";
import { CanvasElement, ActiveTool } from "../types";
import { KonvaRect } from "./elements/KonvaRect";
import { KonvaText } from "./elements/KonvaText";
import { KonvaImage } from "./elements/KonvaImage";
import { KonvaCircle } from "./elements/KonvaCircle";
import { KonvaTriangle } from "./elements/KonvaTriangle";
import { KonvaDiamond } from "./elements/KonvaDiamond";
import { KonvaPentagon } from "./elements/KonvaPentagon";
import { KonvaHexagon } from "./elements/KonvaHexagon";
import { KonvaStar } from "./elements/KonvaStar";
import { KonvaHeart } from "./elements/KonvaHeart";
import { KonvaArrow } from "./elements/KonvaArrow";
import { KonvaLine } from "./elements/KonvaLine";
import { KonvaTransformer } from "./KonvaTransformer";
import { ElementMenu } from "./ElementMenu";
import { FloatingToolbar } from "./FloatingToolbar";
import { ZoomControl } from "./ZoomControl";

interface KonvaCanvasProps {
  elements: CanvasElement[];
  workspace?: {
    width: number;
    height: number;
    background: string;
  };
  selectedIds: string[];
  onSelect: (id: string, isShiftKey?: boolean) => void;
  onMultiSelect: (ids: string[]) => void;
  onChange: (id: string, changes: Partial<CanvasElement>) => void;
  isEditingText?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  onDragMove?: (elementId: string, x: number, y: number) => void;
  onDragEnd?: () => void;
  onStageReady?: (stage: any) => void;
  onDeleteElement?: (id: string) => void;
  onAddElement?: (element: Omit<CanvasElement, "id">) => CanvasElement;
  onBringForward?: () => void;
  onSendBackwards?: () => void;
  onChangeActiveTool?: (tool: ActiveTool) => void;
  activeTool?: ActiveTool;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  showGrid?: boolean;
  showPrintSafeZone?: boolean;
}

export const KonvaCanvas: React.FC<KonvaCanvasProps> = ({
  elements,
  workspace,
  selectedIds,
  onSelect,
  onMultiSelect,
  onChange,
  isEditingText = false,
  onEditingChange,
  onDragMove: onParentDragMove,
  onDragEnd: onParentDragEnd,
  onStageReady,
  onDeleteElement,
  onAddElement,
  onBringForward,
  onSendBackwards,
  onChangeActiveTool,
  activeTool,
  zoom: externalZoom,
  onZoomChange,
  showGrid = false,
  showPrintSafeZone = false,
}) => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [internalScale, setInternalScale] = useState(0.5);
  const [snapGuides, setSnapGuides] = useState<{axis: 'x' | 'y', position: number, type: 'center' | 'edge'}[]>([]);
  const [stageOffset, setStageOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Use external zoom if provided, otherwise use internal state
  const scale = externalZoom !== undefined ? externalZoom : internalScale;
  const setScale = onZoomChange || setInternalScale;

  // Obtener el elemento seleccionado actual
  const selectedElement = selectedIds.length === 1
    ? elements.find(el => el.id === selectedIds[0])
    : null;

  // Calcular el offset del Stage dentro del contenedor
  useEffect(() => {
    const updateStageOffset = () => {
      if (stageContainerRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const stageRect = stageContainerRef.current.getBoundingClientRect();
        setStageOffset({
          x: stageRect.left - containerRect.left,
          y: stageRect.top - containerRect.top,
        });
      }
    };
    updateStageOffset();
    window.addEventListener('resize', updateStageOffset);
    return () => window.removeEventListener('resize', updateStageOffset);
  }, [workspace, scale]); // Added scale to dependencies

  // Notify parent when stage is ready
  useEffect(() => {
    if (stageRef.current && onStageReady) {
      onStageReady(stageRef.current);
    }
  }, [onStageReady]);

  // Snap guides calculation
  const calculateSnapGuides = useCallback((draggingElement: CanvasElement, currentX: number, currentY: number) => {
    const guides: typeof snapGuides = [];
    // Escalar el threshold por el scale del Stage (0.5) - aumentar a 20 para mejor detección
    const SNAP_THRESHOLD = 20 / scale;
    const otherElements = elements.filter(e => e.id !== draggingElement.id);

    const dragWidth = draggingElement.width * (draggingElement.scaleX ?? 1);
    const dragHeight = draggingElement.height * (draggingElement.scaleY ?? 1);

    // Para círculos y triángulos, la posición es desde el centro
    const isDraggingCenterBased = draggingElement.type === 'circle' || draggingElement.type === 'triangle';
    const dragBounds = {
      left: isDraggingCenterBased ? currentX - dragWidth / 2 : currentX,
      right: isDraggingCenterBased ? currentX + dragWidth / 2 : currentX + dragWidth,
      top: isDraggingCenterBased ? currentY - dragHeight / 2 : currentY,
      bottom: isDraggingCenterBased ? currentY + dragHeight / 2 : currentY + dragHeight,
      centerX: isDraggingCenterBased ? currentX : currentX + dragWidth / 2,
      centerY: isDraggingCenterBased ? currentY : currentY + dragHeight / 2,
    };

    otherElements.forEach(el => {
      const elWidth = el.width * (el.scaleX ?? 1);
      const elHeight = el.height * (el.scaleY ?? 1);
      const isCenterBased = el.type === 'circle' || el.type === 'triangle';

      const bounds = {
        left: isCenterBased ? el.x - elWidth / 2 : el.x,
        right: isCenterBased ? el.x + elWidth / 2 : el.x + elWidth,
        top: isCenterBased ? el.y - elHeight / 2 : el.y,
        bottom: isCenterBased ? el.y + elHeight / 2 : el.y + elHeight,
        centerX: isCenterBased ? el.x : el.x + elWidth / 2,
        centerY: isCenterBased ? el.y : el.y + elHeight / 2,
      };

      // Horizontal snaps (vertical guides) - TODAS las combinaciones
      // Bordes izquierdos
      if (Math.abs(dragBounds.left - bounds.left) < SNAP_THRESHOLD) guides.push({axis: 'x', position: bounds.left, type: 'edge'});
      // Borde izquierdo con borde derecho
      if (Math.abs(dragBounds.left - bounds.right) < SNAP_THRESHOLD) guides.push({axis: 'x', position: bounds.right, type: 'edge'});
      // Borde derecho con borde izquierdo
      if (Math.abs(dragBounds.right - bounds.left) < SNAP_THRESHOLD) guides.push({axis: 'x', position: bounds.left, type: 'edge'});
      // Bordes derechos
      if (Math.abs(dragBounds.right - bounds.right) < SNAP_THRESHOLD) guides.push({axis: 'x', position: bounds.right, type: 'edge'});
      // Centros horizontales
      if (Math.abs(dragBounds.centerX - bounds.centerX) < SNAP_THRESHOLD) guides.push({axis: 'x', position: bounds.centerX, type: 'center'});
      // Borde izquierdo con centro
      if (Math.abs(dragBounds.left - bounds.centerX) < SNAP_THRESHOLD) guides.push({axis: 'x', position: bounds.centerX, type: 'center'});
      // Borde derecho con centro
      if (Math.abs(dragBounds.right - bounds.centerX) < SNAP_THRESHOLD) guides.push({axis: 'x', position: bounds.centerX, type: 'center'});
      // Centro con borde izquierdo
      if (Math.abs(dragBounds.centerX - bounds.left) < SNAP_THRESHOLD) guides.push({axis: 'x', position: bounds.left, type: 'center'});
      // Centro con borde derecho
      if (Math.abs(dragBounds.centerX - bounds.right) < SNAP_THRESHOLD) guides.push({axis: 'x', position: bounds.right, type: 'center'});

      // Vertical snaps (horizontal guides) - TODAS las combinaciones
      // Bordes superiores
      if (Math.abs(dragBounds.top - bounds.top) < SNAP_THRESHOLD) guides.push({axis: 'y', position: bounds.top, type: 'edge'});
      // Borde superior con borde inferior
      if (Math.abs(dragBounds.top - bounds.bottom) < SNAP_THRESHOLD) guides.push({axis: 'y', position: bounds.bottom, type: 'edge'});
      // Borde inferior con borde superior
      if (Math.abs(dragBounds.bottom - bounds.top) < SNAP_THRESHOLD) guides.push({axis: 'y', position: bounds.top, type: 'edge'});
      // Bordes inferiores
      if (Math.abs(dragBounds.bottom - bounds.bottom) < SNAP_THRESHOLD) guides.push({axis: 'y', position: bounds.bottom, type: 'edge'});
      // Centros verticales
      if (Math.abs(dragBounds.centerY - bounds.centerY) < SNAP_THRESHOLD) guides.push({axis: 'y', position: bounds.centerY, type: 'center'});
      // Borde superior con centro
      if (Math.abs(dragBounds.top - bounds.centerY) < SNAP_THRESHOLD) guides.push({axis: 'y', position: bounds.centerY, type: 'center'});
      // Borde inferior con centro
      if (Math.abs(dragBounds.bottom - bounds.centerY) < SNAP_THRESHOLD) guides.push({axis: 'y', position: bounds.centerY, type: 'center'});
      // Centro con borde superior
      if (Math.abs(dragBounds.centerY - bounds.top) < SNAP_THRESHOLD) guides.push({axis: 'y', position: bounds.top, type: 'center'});
      // Centro con borde inferior
      if (Math.abs(dragBounds.centerY - bounds.bottom) < SNAP_THRESHOLD) guides.push({axis: 'y', position: bounds.bottom, type: 'center'});
    });

    setSnapGuides(guides);
  }, [elements, scale]);

  // Click en el canvas para deseleccionar
  const handleStageClick = useCallback((e: any) => {
    if (e.target === e.target.getStage()) {
      onMultiSelect([]);
    }
  }, [onMultiSelect]);

  // Click en el contenedor (área gris) para deseleccionar
  const handleContainerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Solo deseleccionar si el clic fue directamente en el contenedor, no en el Stage
    if (e.target === e.currentTarget) {
      onMultiSelect([]);
    }
  }, [onMultiSelect]);

  // Handlers para snap guides y arrastre
  const handleDragMove = useCallback((elementId: string, x: number, y: number) => {
    setIsDragging(true);
    const element = elements.find(el => el.id === elementId);
    if (element) {
      calculateSnapGuides(element, x, y);
    }
    onParentDragMove?.(elementId, x, y);
  }, [elements, calculateSnapGuides, onParentDragMove]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setSnapGuides([]);
    onParentDragEnd?.();
  }, [onParentDragEnd]);

  // Don't render if workspace is not defined
  if (!workspace) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="text-muted-foreground">Cargando canvas...</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#e5e7eb",
        backgroundImage: "radial-gradient(circle, #9ca3af 1.5px, transparent 1.5px)",
        backgroundSize: "24px 24px",
        overflow: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div ref={stageContainerRef}>
        <Stage
          ref={stageRef}
          width={workspace.width * scale}
          height={workspace.height * scale}
          scaleX={scale}
          scaleY={scale}
          onClick={handleStageClick}
          style={{
            backgroundColor: workspace.background || "#ffffff",
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
            border: "2px solid #e5e7eb",
          }}
        >
        <Layer>
          {/* Fondo del lienzo para exportación */}
          <Rect
            x={0}
            y={0}
            width={workspace.width}
            height={workspace.height}
            fill={workspace.background || "#ffffff"}
            listening={false}
          />

          {elements.map((element) => {
            const isSelected = selectedIds.includes(element.id);

            switch (element.type) {
              case "rect":
                return (
                  <KonvaRect
                    key={element.id}
                    element={element}
                    isSelected={isSelected}
                    onSelect={() => onSelect(element.id)}
                    onChange={onChange}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                  />
                );
              case "text":
                return (
                  <KonvaText
                    key={element.id}
                    element={element}
                    isSelected={isSelected}
                    onSelect={() => onSelect(element.id)}
                    onChange={onChange}
                    onEditingChange={onEditingChange}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                  />
                );
              case "image":
                return (
                  <KonvaImage
                    key={element.id}
                    element={element}
                    isSelected={isSelected}
                    onSelect={() => onSelect(element.id)}
                    onChange={onChange}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                  />
                );
              case "circle":
                return (
                  <KonvaCircle
                    key={element.id}
                    element={element}
                    isSelected={isSelected}
                    onSelect={() => onSelect(element.id)}
                    onChange={onChange}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                  />
                );
              case "triangle":
                return (
                  <KonvaTriangle
                    key={element.id}
                    element={element}
                    isSelected={isSelected}
                    onSelect={() => onSelect(element.id)}
                    onChange={onChange}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                  />
                );
              case "diamond":
                return (
                  <KonvaDiamond
                    key={element.id}
                    element={element}
                    isSelected={isSelected}
                    onSelect={() => onSelect(element.id)}
                    onChange={onChange}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                  />
                );
              case "pentagon":
                return (
                  <KonvaPentagon
                    key={element.id}
                    element={element}
                    isSelected={isSelected}
                    onSelect={() => onSelect(element.id)}
                    onChange={onChange}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                  />
                );
              case "hexagon":
                return (
                  <KonvaHexagon
                    key={element.id}
                    element={element}
                    isSelected={isSelected}
                    onSelect={() => onSelect(element.id)}
                    onChange={onChange}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                  />
                );
              case "star":
                return (
                  <KonvaStar
                    key={element.id}
                    element={element}
                    isSelected={isSelected}
                    onSelect={() => onSelect(element.id)}
                    onChange={onChange}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                  />
                );
              case "heart":
                return (
                  <KonvaHeart
                    key={element.id}
                    element={element}
                    isSelected={isSelected}
                    onSelect={() => onSelect(element.id)}
                    onChange={onChange}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                  />
                );
              case "arrow":
                return (
                  <KonvaArrow
                    key={element.id}
                    element={element}
                    isSelected={isSelected}
                    onSelect={() => onSelect(element.id)}
                    onChange={onChange}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                  />
                );
              case "line":
                return (
                  <KonvaLine
                    key={element.id}
                    element={element}
                    isSelected={isSelected}
                    onSelect={() => onSelect(element.id)}
                    onChange={onChange}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                  />
                );
              default:
                return null;
            }
          })}

          {/* Snap guides */}
          {snapGuides.map((guide, i) => {
            const isVertical = guide.axis === 'x';
            const color = guide.type === 'center' ? '#3b82f6' : '#ef4444';
            return (
              <Line
                key={i}
                points={isVertical
                  ? [guide.position, 0, guide.position, workspace.height]
                  : [0, guide.position, workspace.width, guide.position]
                }
                stroke={color}
                strokeWidth={2}
                dash={[5, 5]}
                listening={false}
              />
            );
          })}

          {/* Grid de 32px - por encima de los elementos */}
          {showGrid && (
            <>
              {/* Líneas verticales */}
              {Array.from({ length: Math.floor(workspace.width / 32) + 1 }, (_, i) => (
                <Line
                  key={`v-grid-${i}`}
                  points={[i * 32, 0, i * 32, workspace.height]}
                  stroke="rgba(0, 0, 0, 0.1)"
                  strokeWidth={1}
                  listening={false}
                />
              ))}
              {/* Líneas horizontales */}
              {Array.from({ length: Math.floor(workspace.height / 32) + 1 }, (_, i) => (
                <Line
                  key={`h-grid-${i}`}
                  points={[0, i * 32, workspace.width, i * 32]}
                  stroke="rgba(0, 0, 0, 0.1)"
                  strokeWidth={1}
                  listening={false}
                />
              ))}
            </>
          )}

          {/* Print Safe Zone - margen de seguridad para impresión (5% en cada lado) - por encima de los elementos */}
          {showPrintSafeZone && (
            <>
              {/* Zona segura (borde punteado) */}
              <Rect
                x={workspace.width * 0.05}
                y={workspace.height * 0.05}
                width={workspace.width * 0.9}
                height={workspace.height * 0.9}
                stroke="#f59e0b"
                strokeWidth={2}
                dash={[10, 5]}
                fill="transparent"
                listening={false}
              />
              {/* Advertencia visual en las esquinas (zonas de corte) */}
              <Rect
                x={0}
                y={0}
                width={workspace.width * 0.05}
                height={workspace.height * 0.05}
                fill="rgba(245, 158, 11, 0.15)"
                listening={false}
              />
              <Rect
                x={workspace.width * 0.95}
                y={0}
                width={workspace.width * 0.05}
                height={workspace.height * 0.05}
                fill="rgba(245, 158, 11, 0.15)"
                listening={false}
              />
              <Rect
                x={0}
                y={workspace.height * 0.95}
                width={workspace.width * 0.05}
                height={workspace.height * 0.05}
                fill="rgba(245, 158, 11, 0.15)"
                listening={false}
              />
              <Rect
                x={workspace.width * 0.95}
                y={workspace.height * 0.95}
                width={workspace.width * 0.05}
                height={workspace.height * 0.05}
                fill="rgba(245, 158, 11, 0.15)"
                listening={false}
              />
            </>
          )}

          {/* Transformer para selección múltiple */}
          <KonvaTransformer
            selectedIds={selectedIds}
            elements={elements}
            onChange={onChange}
            isEditing={isEditingText}
          />
        </Layer>
      </Stage>
      </div>

      {/* Menú de acciones del elemento */}
      {selectedElement && !isEditingText && onDeleteElement && onAddElement && !isDragging && (
        <ElementMenu
          element={selectedElement}
          elementX={selectedElement.x}
          elementY={selectedElement.y}
          elementWidth={selectedElement.width * (selectedElement.scaleX ?? 1)}
          elementHeight={(selectedElement.height || 100) * (selectedElement.scaleY ?? 1)}
          scale={scale}
          stageOffset={stageOffset}
          onDelete={onDeleteElement}
          onDuplicate={(el) => {
            const { id: _id, ...rest } = el;
            onAddElement(rest);
          }}
          onLock={(id) => onChange(id, { locked: true })}
          onUnlock={(id) => onChange(id, { locked: false })}
          isLocked={selectedElement.locked === true}
          onClose={() => {}}
        />
      )}

      {/* Floating Toolbar - arriba del canvas centrado, siempre visible */}
      {selectedElement && !isEditingText && (
        <FloatingToolbar
          element={selectedElement}
          elementX={selectedElement.x}
          elementY={selectedElement.y}
          elementWidth={selectedElement.width * (selectedElement.scaleX ?? 1)}
          scale={scale}
          stageOffset={stageOffset}
          onChange={onChange}
          onChangeActiveTool={onChangeActiveTool}
          activeTool={activeTool}
        />
      )}

      {/* Zoom Control - abajo a la izquierda */}
      <ZoomControl
        zoom={scale}
        onZoomChange={setScale}
      />
    </div>
  );
};

export default KonvaCanvas;
