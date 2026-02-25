"use client";

import React from "react";
import { Line } from "react-konva";
import { CanvasElement } from "../../types";

interface KonvaLineProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (id: string, changes: Partial<CanvasElement>) => void;
  onDragMove?: (elementId: string, x: number, y: number) => void;
  onDragEnd?: () => void;
}

export const KonvaLine: React.FC<KonvaLineProps> = ({
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
    locked = false,
  } = element;

  // Línea horizontal con extremos redondeados
  // La "línea" se representa como un rectángulo delgado con bordes redondeados
  const halfHeight = height / 2;
  const radius = halfHeight;
  const points = [
    radius, 0,                          // Inicio superior izquierdo (después del radio)
    width - radius, 0,                  // Esquina superior derecha
    width, halfHeight,                  // Punta derecha
    width - radius, height,             // Esquina inferior derecha
    radius, height,                     // Inicio inferior izquierdo
    0, halfHeight,                      // Punta izquierda
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
      visible={element.visible !== false}
      draggable={!locked}
      onDragStart={() => {
        if (locked) return;
        onSelect();
      }}
      onDragMove={(e) => {
        if (locked) return;
        onDragMove?.(id, e.target.x(), e.target.y());
      }}
      onDragEnd={(e) => {
        if (locked) return;
        onChange(id, { x: e.target.x(), y: e.target.y() });
        onDragEnd?.();
      }}
      onClick={onSelect}
      onTap={onSelect}
    />
  );
};
