"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer, Line, Rect } from "react-konva";
import { CanvasElement } from "../types";
import { KonvaRect } from "./elements/KonvaRect";
import { KonvaText } from "./elements/KonvaText";
import { KonvaImage } from "./elements/KonvaImage";
import { KonvaCircle } from "./elements/KonvaCircle";
import { KonvaTriangle } from "./elements/KonvaTriangle";
import { KonvaDiamond } from "./elements/KonvaDiamond";
import { KonvaTransformer } from "./KonvaTransformer";

interface KonvaCanvasProps {
  elements: CanvasElement[];
  workspace?: {
    width: number;
    height: number;
    background: string;
  };
  selectedIds: string[];
  onSelect: (id: string) => void;
  onMultiSelect: (ids: string[]) => void;
  onChange: (id: string, changes: Partial<CanvasElement>) => void;
  isEditingText?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  onDragMove?: (elementId: string, x: number, y: number) => void;
  onDragEnd?: () => void;
  onStageReady?: (stage: any) => void;
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
}) => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(0.5);
  const [snapGuides, setSnapGuides] = useState<{axis: 'x' | 'y', position: number, type: 'center' | 'edge'}[]>([]);

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

  // Handlers para snap guides
  const handleDragMove = useCallback((elementId: string, x: number, y: number) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      calculateSnapGuides(element, x, y);
    }
    onParentDragMove?.(elementId, x, y);
  }, [elements, calculateSnapGuides, onParentDragMove]);

  const handleDragEnd = useCallback(() => {
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
        backgroundColor: "#f3f4f6",
        overflow: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
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
  );
};

export default KonvaCanvas;
