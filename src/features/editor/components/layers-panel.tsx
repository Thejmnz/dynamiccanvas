"use client";

import { useState } from "react";
import { CanvasElement, ElementType } from "@/features/editor/types";
import { cn } from "@/lib/utils";

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedIds: string[];
  onSelect: (id: string, isShiftKey: boolean) => void;
  onChange: (id: string, changes: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

const getElementIcon = (type: ElementType) => {
  switch (type) {
    case "text":
      return "text_fields";
    case "rect":
      return "rectangle";
    case "circle":
      return "circle";
    case "triangle":
      return "change_history";
    case "diamond":
      return "diamond";
    case "image":
      return "image";
    case "path":
      return "gesture";
    default:
      return "layers";
  }
};

const getElementTypeName = (type: ElementType) => {
  switch (type) {
    case "text":
      return "Texto";
    case "rect":
      return "Rect";
    case "circle":
      return "Círculo";
    case "triangle":
      return "Triángulo";
    case "diamond":
      return "Diamante";
    case "image":
      return "Imagen";
    case "path":
      return "Trazo";
    default:
      return "Elemento";
  }
};

export const LayersPanel = ({
  elements,
  selectedIds,
  onSelect,
  onChange,
  onDelete,
  onReorder,
}: LayersPanelProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedElement, setDraggedElement] = useState<CanvasElement | null>(null);

  const handleStartEdit = (element: CanvasElement) => {
    setEditingId(element.id);
    setEditValue(element.name || `${getElementTypeName(element.type)} ${elements.indexOf(element) + 1}`);
  };

  const handleSaveEdit = (id: string) => {
    if (editValue.trim()) {
      onChange(id, { name: editValue.trim() });
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      handleSaveEdit(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
      setEditValue("");
    }
  };

  const handleDragStart = (e: React.DragEvent, element: CanvasElement, index: number) => {
    setDraggedIndex(index);
    setDraggedElement(element);
    // Set drag image
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", element.id);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      onReorder(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDraggedElement(null);
  };

  const handleToggleVisibility = (e: React.MouseEvent, id: string, currentVisible: boolean) => {
    e.stopPropagation();
    onChange(id, { visible: !currentVisible });
  };

  const handleToggleLock = (e: React.MouseEvent, id: string, currentLocked: boolean) => {
    e.stopPropagation();
    onChange(id, { locked: !currentLocked });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  };

  // Reversed elements to show top layers first
  const reversedElements = [...elements].reverse();

  return (
    <>
      {/* Floating drag preview */}
      {draggedElement && (
        <div
          className="fixed pointer-events-none z-[100] bg-white border-2 border-blue-500 rounded-lg shadow-xl px-3 py-2 flex items-center gap-2"
          style={{
            left: "var(--mouse-x, 50%)",
            top: "var(--mouse-y, 50%)",
            transform: "translate(-50%, -50%) rotate(3deg)",
          }}
        >
          <span className="material-symbols-outlined text-blue-500 text-sm">
            {getElementIcon(draggedElement.type)}
          </span>
          <span className="text-sm font-medium text-slate-700">
            {draggedElement.name || getElementTypeName(draggedElement.type)}
          </span>
        </div>
      )}

      <div className="fixed right-3 top-[72px] w-52 z-30" style={{ bottom: elements.length > 8 ? '12px' : 'auto' }}>
        <div
          className="bg-white/95 backdrop-blur border border-slate-200 rounded-lg shadow-lg flex flex-col overflow-hidden"
          style={{
            height: elements.length === 0
              ? 'auto'
              : Math.min(Math.max(elements.length * 32 + 70, 120), 400) + 'px'
          }}
        >
          {/* Header */}
          <div className="px-2 py-1.5 border-b border-slate-200 bg-slate-50/50 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-slate-700 font-medium text-xs flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                Capas
              </h3>
              <span className="text-slate-400 text-[10px]">{elements.length}</span>
            </div>
          </div>

          {/* Layers List */}
          <div className="flex-1 overflow-y-auto p-1 min-h-0">
            {reversedElements.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-1 opacity-40">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                <p className="text-xs">Sin elementos</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {reversedElements.map((element, reverseIndex) => {
                  const originalIndex = elements.length - 1 - reverseIndex;
                  const isSelected = selectedIds.includes(element.id);
                  const isEditing = editingId === element.id;
                  const isDraggedOver = dragOverIndex === originalIndex;
                  const isBeingDragged = draggedIndex === originalIndex;

                  return (
                    <div
                      key={element.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, element, originalIndex)}
                      onDragOver={(e) => handleDragOver(e, originalIndex)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => onSelect(element.id, e.shiftKey)}
                      className={cn(
                        "group relative rounded-lg transition-all cursor-pointer",
                        isSelected
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-transparent border border-transparent hover:bg-slate-50 hover:border-slate-200",
                        isDraggedOver && "border-t-2 border-t-blue-500 bg-blue-50/50",
                        isBeingDragged && "opacity-30 scale-95"
                      )}
                    >
                      {/* Layer Content */}
                      <div className="flex items-center gap-1 px-1.5 py-1">
                        {/* Drag Handle */}
                        <div className="text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500 flex items-center justify-center w-5 h-5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="9" cy="5" r="1.5" />
                            <circle cx="15" cy="5" r="1.5" />
                            <circle cx="9" cy="12" r="1.5" />
                            <circle cx="15" cy="12" r="1.5" />
                            <circle cx="9" cy="19" r="1.5" />
                            <circle cx="15" cy="19" r="1.5" />
                          </svg>
                        </div>

                        {/* Icon */}
                        <div
                          className={cn(
                            "w-5 h-5 rounded flex items-center justify-center shrink-0",
                            isSelected ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
                          )}
                        >
                          <span className="material-symbols-outlined text-xs">
                            {getElementIcon(element.type)}
                          </span>
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleSaveEdit(element.id)}
                              onKeyDown={(e) => handleKeyDown(e, element.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full bg-white border border-blue-300 rounded px-1 py-0.5 text-slate-700 text-xs focus:outline-none focus:border-blue-500"
                              autoFocus
                            />
                          ) : (
                            <div
                              className="text-xs truncate cursor-text"
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(element);
                              }}
                            >
                              <span className={element.visible === false ? "text-slate-400 line-through" : "text-slate-700"}>
                                {element.name || `${getElementTypeName(element.type)} ${originalIndex + 1}`}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center">
                          <button
                            onClick={(e) => handleToggleVisibility(e, element.id, element.visible !== false)}
                            className={cn(
                              "flex items-center justify-center w-5 h-5 rounded transition-colors",
                              element.visible === false ? "text-red-400" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            )}
                            title={element.visible === false ? "Mostrar" : "Ocultar"}
                          >
                            {element.visible === false ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={(e) => handleToggleLock(e, element.id, element.locked === true)}
                            className={cn(
                              "flex items-center justify-center w-5 h-5 rounded transition-colors",
                              element.locked ? "text-amber-500" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            )}
                            title={element.locked ? "Desbloquear" : "Bloquear"}
                          >
                            {element.locked ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, element.id)}
                            className="flex items-center justify-center w-5 h-5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Eliminar"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Hint */}
          <div className="px-2 py-1 border-t border-slate-200 bg-slate-50/50 shrink-0">
            <p className="text-slate-400 text-[10px] text-center">
              Doble clic para renombrar
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
