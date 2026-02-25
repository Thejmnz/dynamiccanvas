"use client";

import React, { useState, useEffect, useRef } from "react";
import { CanvasElement } from "../types";
import { useLanguage } from "@/lib/contexts/LanguageContext";

interface ElementMenuProps {
  element: CanvasElement;
  elementX: number;
  elementY: number;
  elementWidth: number;
  elementHeight: number;
  scale: number;
  stageOffset: { x: number; y: number };
  onDelete: (id: string) => void;
  onDuplicate: (element: CanvasElement) => void;
  onLock?: (id: string) => void;
  onUnlock?: (id: string) => void;
  isLocked?: boolean;
  onClose: () => void;
}

export const ElementMenu: React.FC<ElementMenuProps> = ({
  element,
  elementX,
  elementY,
  elementWidth,
  elementHeight,
  scale,
  stageOffset,
  onDelete,
  onDuplicate,
  onLock,
  onUnlock,
  isLocked = false,
  onClose,
}) => {
  const { t } = useLanguage();
  const menuRef = useRef<HTMLDivElement>(null);

  // Obtener nombre del layer (igual que en layers-panel)
  const getLayerName = () => {
    const getTypeName = (type: string) => {
      switch (type) {
        case "text": return t("floating_layer_text");
        case "rect": return t("floating_layer_rect");
        case "circle": return t("floating_layer_circle");
        case "triangle": return t("floating_layer_triangle");
        case "diamond": return t("floating_layer_diamond");
        case "image": return t("floating_layer_image");
        case "path": return t("floating_layer_path");
        default: return t("floating_layer_element");
      }
    };

    const name = element.name || getTypeName(element.type);
    if (name.length > 15) {
      return name.substring(0, 15) + "...";
    }
    return name;
  };

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Calcular posición del menú (centrado abajo del elemento)
  const menuX = stageOffset.x + (elementX + elementWidth / 2) * scale;
  const menuY = stageOffset.y + (elementY + elementHeight) * scale;

  const handleLockToggle = () => {
    if (isLocked && onUnlock) {
      onUnlock(element.id);
    } else if (!isLocked && onLock) {
      onLock(element.id);
    }
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        left: menuX,
        top: menuY,
        zIndex: 1000,
        transform: "translate(-50%, 8px)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 px-2 py-1"
        style={{
          animation: "fadeInUp 0.25s ease-out forwards",
        }}
      >
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
        {/* Nombre del layer */}
        <span className="text-xs font-medium text-gray-600 px-2 max-w-[80px] truncate">
          {getLayerName()}
        </span>

        <div className="w-px h-4 bg-gray-200" />

        {/* Lock/Unlock */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLockToggle();
          }}
          className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 transition-colors"
          title={isLocked ? t("floating_unlock") : t("floating_lock")}
        >
          {isLocked ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-500"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
            </svg>
          )}
        </button>

        {/* Duplicar y Eliminar - solo si no está bloqueado */}
        {!isLocked && (
          <>
            {/* Duplicar */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate({
                  ...element,
                  x: element.x + 20,
                  y: element.y + 20,
                });
              }}
              className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 transition-colors"
              title={t("floating_duplicate")}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>

            {/* Eliminar */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(element.id);
              }}
              className="flex items-center justify-center w-6 h-6 rounded hover:bg-red-50 transition-colors"
              title={t("floating_delete")}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-500"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
