"use client";

import React, { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Hint } from "@/components/hint";
import { useLanguage } from "@/lib/contexts/LanguageContext";

interface ZoomControlProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export const ZoomControl: React.FC<ZoomControlProps> = ({
  zoom,
  onZoomChange,
}) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(Math.round(zoom * 100)));

  // Slider va de 10% a 300% en pasos de 2
  const minZoom = 10;
  const maxZoom = 300;
  const currentPercent = Math.round(zoom * 100);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    onZoomChange(value / 100);
  };

  const handleReset = () => {
    onZoomChange(0.5);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value) && value >= minZoom && value <= maxZoom) {
      onZoomChange(value / 100);
    } else {
      setInputValue(String(currentPercent));
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleInputBlur();
    } else if (e.key === "Escape") {
      setInputValue(String(currentPercent));
      setIsEditing(false);
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setInputValue(String(currentPercent));
  };

  return (
    <div
      className="flex items-center gap-3 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2"
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        zIndex: 30,
      }}
    >
      {/* Zoom percentage display */}
      <div
        className="flex items-center justify-center min-w-[48px] h-6 px-1 rounded hover:bg-gray-100 cursor-text"
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="w-10 h-5 text-center text-xs font-medium text-gray-600 bg-transparent border-none outline-none focus:ring-0"
            autoFocus
          />
        ) : (
          <span className="text-xs font-medium text-gray-600 select-none">
            {currentPercent}%
          </span>
        )}
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-400">{minZoom}%</span>
        <input
          type="range"
          min={minZoom}
          max={maxZoom}
          step={2}
          value={currentPercent}
          onChange={handleSliderChange}
          className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#135bec]"
        />
        <span className="text-[10px] text-gray-400">{maxZoom}%</span>
      </div>

      <div className="w-px h-5 bg-gray-200" />

      {/* Reset */}
      <Hint label={t("floating_reset")} side="top" sideOffset={5}>
        <button
          onClick={handleReset}
          className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 transition-colors"
        >
          <RotateCcw className="size-3.5 text-gray-600" />
        </button>
      </Hint>
    </div>
  );
};
