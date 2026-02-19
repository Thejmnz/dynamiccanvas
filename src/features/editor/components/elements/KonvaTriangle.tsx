"use client";

import React from "react";
import { Line } from "react-konva";
import { CanvasElement } from "../../types";

interface KonvaTriangleProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (id: string, changes: Partial<CanvasElement>) => void;
  onDragMove?: (elementId: string, x: number, y: number) => void;
  onDragEnd?: () => void;
}

export const KonvaTriangle: React.FC<KonvaTriangleProps> = ({
  element,
  onSelect,
  onChange,
  onDragMove,
  onDragEnd,
}) => {
  const {
    id,
    x,
    y,
    width,
    height,
    rotation = 0,
    scaleX = 1,
    scaleY = 1,
    fill = "#888888",
    stroke,
    strokeWidth = 0,
    opacity = 1,
  } = element;

  // Puntos del triángulo (relativos a x, y)
  const points = [
    width / 2, 0,      // Punta superior
    width, height,     // Esquina inferior derecha
    0, height,         // Esquina inferior izquierda
  ];

  return (
    <Line
      id={id}
      points={points}
      x={x}
      y={y}
      rotation={rotation}
      scaleX={scaleX}
      scaleY={scaleY}
      closed={true}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
      draggable
      onDragStart={onSelect}
      onDragMove={(e) => {
        onDragMove?.(id, e.target.x(), e.target.y());
      }}
      onDragEnd={(e) => {
        onChange(id, { x: e.target.x(), y: e.target.y() });
        onDragEnd?.();
      }}
      onClick={onSelect}
      onTap={onSelect}
    />
  );
};
