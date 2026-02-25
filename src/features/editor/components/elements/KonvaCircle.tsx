"use client";

import React, { useRef, useEffect } from "react";
import { Ellipse } from "react-konva";
import { CanvasElement } from "../../types";
import Konva from "konva";

interface KonvaCircleProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (id: string, changes: Partial<CanvasElement>) => void;
  onDragMove?: (elementId: string, x: number, y: number) => void;
  onDragEnd?: () => void;
}

export const KonvaCircle: React.FC<KonvaCircleProps> = ({
  element,
  onSelect,
  onChange,
  onDragMove,
  onDragEnd,
}) => {
  const shapeRef = useRef<Konva.Ellipse>(null);

  const {
    id,
    x,
    y,
    width,
    height,
    rotation = 0,
    scaleX = 1,
    scaleY = 1,
    fill = "#000000",
    stroke,
    strokeWidth = 0,
    opacity = 1,
    locked = false,
  } = element;

  // Asegurar que width y height tengan valores válidos
  const safeWidth = width || 200;
  const safeHeight = height || 200;

  const radiusX = safeWidth / 2;
  const radiusY = safeHeight / 2;

  // El centro del círculo/elipse
  const centerX = x + radiusX;
  const centerY = y + radiusY;

  // Efecto para actualizar el Transformer cuando cambia el elemento
  useEffect(() => {
    if (shapeRef.current) {
      shapeRef.current.getLayer()?.batchDraw();
    }
  }, [safeWidth, safeHeight, x, y, rotation, scaleX, scaleY]);

  return (
    <Ellipse
      ref={shapeRef}
      id={id}
      x={centerX}
      y={centerY}
      radiusX={radiusX}
      radiusY={radiusY}
      rotation={rotation}
      scaleX={scaleX}
      scaleY={scaleY}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
      visible={element.visible !== false}
      draggable={!locked}
      onDragStart={() => {
        if (locked) return;
        onSelect();
      }}
      onDragMove={(e) => {
        if (locked) return;
        // Convertir de centro a esquina superior izquierda para el editor
        const newX = e.target.x() - radiusX * scaleX;
        const newY = e.target.y() - radiusY * scaleY;
        onDragMove?.(id, newX, newY);
      }}
      onDragEnd={(e) => {
        if (locked) return;
        // Convertir de centro a esquina superior izquierda para el editor
        const newX = e.target.x() - radiusX * scaleX;
        const newY = e.target.y() - radiusY * scaleY;
        onChange(id, { x: newX, y: newY });
        onDragEnd?.();
      }}
      onClick={onSelect}
      onTap={onSelect}
    />
  );
};
