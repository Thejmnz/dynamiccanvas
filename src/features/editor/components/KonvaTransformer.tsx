"use client";

import React, { useRef, useEffect, useState } from "react";
import { Transformer } from "react-konva";
import { CanvasElement } from "../types";

interface KonvaTransformerProps {
  selectedIds: string[];
  elements: CanvasElement[];
  onChange: (id: string, changes: Partial<CanvasElement>) => void;
  isEditing?: boolean;
}

export const KonvaTransformer: React.FC<KonvaTransformerProps> = ({
  selectedIds,
  elements,
  onChange,
  isEditing = false,
}) => {
  const transformerRef = useRef<any>(null);
  const [hoveredAnchor, setHoveredAnchor] = useState<string | null>(null);

  // Determinar qué anchors usar
  const selectedElements = elements.filter(e => selectedIds.includes(e.id));
  const hasText = selectedElements.some(e => e.type === 'text');
  const isSingleText = selectedIds.length === 1 && hasText;

  const enabledAnchors = ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'];

  // Función para cambiar el estilo del anchor en hover
  const anchorStyleFunc = (anchor: any) => {
    const name = anchor.name();
    if (hoveredAnchor === name) {
      anchor.fill("#1677FF");
      anchor.stroke("#1677FF");
    } else {
      anchor.fill("#ffffff");
      anchor.stroke("#9ca3af");
    }
  };

  // Actualizar los nodos seleccionados cuando cambian los selectedIds
  useEffect(() => {
    if (!transformerRef.current) return;

    const stage = transformerRef.current.getStage();
    if (!stage) return;

    const selectedNodes: any[] = [];
    selectedIds.forEach((id) => {
      const node = stage.findOne(`#${id}`);
      if (node) {
        selectedNodes.push(node);
      }
    });

    if (selectedNodes.length > 0) {
      transformerRef.current.nodes(selectedNodes);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedIds, elements]);

  // No mostrar transformer si está editando texto
  if (selectedIds.length === 0 || isEditing) return null;

  return (
    <Transformer
      ref={transformerRef}
      enabledAnchors={enabledAnchors}
      anchorCornerRadius={50}
      anchorSize={14}
      anchorStroke="#9ca3af"
      anchorFill="#ffffff"
      anchorStrokeWidth={1}
      borderStroke="#1677FF"
      borderStrokeWidth={2}
      anchorStyleFunc={anchorStyleFunc}
      onMouseOver={(e: any) => {
        const name = e.target.name();
        if (name && name.includes("anchor")) {
          setHoveredAnchor(name);
        }
      }}
      onMouseOut={() => {
        setHoveredAnchor(null);
      }}
      boundBoxFunc={(oldBox, newBox) => {
        // Limitar el tamaño mínimo
        if (newBox.width < 20 || newBox.height < 20) {
          return oldBox;
        }
        return newBox;
      }}
      onTransform={(e) => {
        // Manejar transform en tiempo real para texto y círculos
        const transformedNodes = transformerRef.current?.nodes() || [];

        transformedNodes.forEach((node: any) => {
          const element = elements.find(el => el.id === node.id());
          if (element?.type === 'text') {
            // Para texto: convertir escala a dimensiones reales (sin escalar la letra)
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            const newWidth = node.width() * Math.abs(scaleX);
            const newHeight = node.height() * Math.abs(scaleY);

            node.setAttrs({
              width: newWidth,
              height: newHeight,
              scaleX: 1,
              scaleY: 1,
            });
          } else if (element?.type === 'circle') {
            // Para círculos: usar el bounding box del transformer
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            // Para Circle, width()/height() retornan 0, usamos radiusX*2 y radiusY*2
            const oldRadiusX = node.radiusX();
            const oldRadiusY = node.radiusY();
            const newRadiusX = oldRadiusX * Math.abs(scaleX);
            const newRadiusY = oldRadiusY * Math.abs(scaleY);

            // Actualizar los radios del círculo
            node.setAttrs({
              radiusX: newRadiusX,
              radiusY: newRadiusY,
              scaleX: 1,
              scaleY: 1,
            });
          }
        });
      }}
      onTransformEnd={(e) => {
        // Obtener los nodos transformados
        const transformedNodes = transformerRef.current?.nodes() || [];

        transformedNodes.forEach((node: any) => {
          const id = node.id();
          const element = elements.find(el => el.id === id);
          const rotation = node.rotation();
          let x = node.x();
          let y = node.y();

          let newWidth: number;
          let newHeight: number;

          if (element?.type === 'text') {
            // Para texto: usar width/height directamente
            newWidth = node.width();
            newHeight = node.height();
          } else if (element?.type === 'circle') {
            // Para círculos: usar radius para calcular dimensiones
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            newWidth = node.radiusX() * 2 * Math.abs(scaleX);
            newHeight = node.radiusY() * 2 * Math.abs(scaleY);

            // Validar que las dimensiones sean válidas
            if (newWidth < 5) newWidth = 5;
            if (newHeight < 5) newHeight = 5;

            // Actualizar el nodo con los nuevos radios
            node.setAttrs({
              radiusX: newWidth / 2,
              radiusY: newHeight / 2,
              scaleX: 1,
              scaleY: 1,
            });

            // Para círculos, ajustar las coordenadas (el círculo se posiciona desde el centro)
            x = x - newWidth / 2;
            y = y - newHeight / 2;
          } else {
            // Para otros elementos (rect, triangle, etc.)
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            newWidth = node.width() * Math.abs(scaleX);
            newHeight = node.height() * Math.abs(scaleY);

            // Validar que las dimensiones sean válidas
            if (newWidth < 5) newWidth = 5;
            if (newHeight < 5) newHeight = 5;

            // Resetear escala a 1
            node.scaleX(1);
            node.scaleY(1);
          }

          onChange(id, {
            x,
            y,
            width: newWidth,
            height: newHeight,
            rotation,
            scaleX: 1,
            scaleY: 1,
          });
        });
      }}
    />
  );
};
