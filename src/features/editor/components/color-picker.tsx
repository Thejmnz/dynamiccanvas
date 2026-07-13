"use client";

import { colors } from "@/features/editor/types";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

type ParsedColor = {
  hex: string;
  alpha: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const componentToHex = (value: number) =>
  clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
};

const parseColor = (value: string): ParsedColor => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "transparent") return { hex: "#000000", alpha: 0 };

  const rgba = normalized.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/,
  );
  if (rgba) {
    return {
      hex: `#${componentToHex(Number(rgba[1]))}${componentToHex(Number(rgba[2]))}${componentToHex(Number(rgba[3]))}`,
      alpha: rgba[4] === undefined ? 1 : clamp(Number(rgba[4]), 0, 1),
    };
  }

  if (/^#[\da-f]{3}$/.test(normalized)) {
    return {
      hex: `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`,
      alpha: 1,
    };
  }

  if (/^#[\da-f]{6}$/.test(normalized)) {
    return { hex: normalized, alpha: 1 };
  }

  if (/^#[\da-f]{8}$/.test(normalized)) {
    return {
      hex: normalized.slice(0, 7),
      alpha: Number.parseInt(normalized.slice(7, 9), 16) / 255,
    };
  }

  return { hex: "#000000", alpha: 1 };
};

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const current = parseColor(value);
  const opacity = Math.round(current.alpha * 100);

  const setColor = (hex: string, alpha = current.alpha) => {
    onChange(hexToRgba(hex, alpha));
  };

  return (
    <div className="w-full space-y-4 rounded-xl border bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={current.hex}
          aria-label="Seleccionar color"
          className="h-11 w-14 cursor-pointer rounded-lg border bg-white p-1"
          onChange={(event) => setColor(event.target.value)}
        />
        <input
          type="text"
          value={current.hex.toUpperCase()}
          aria-label="Código hexadecimal"
          spellCheck={false}
          className="h-11 min-w-0 flex-1 rounded-lg border px-3 font-mono text-sm uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          onChange={(event) => {
            const next = event.target.value.trim();
            if (/^#[\da-f]{6}$/i.test(next)) setColor(next);
          }}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-slate-600">
          <span>Opacidad</span>
          <span>{opacity}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          aria-label="Opacidad del color"
          className="h-2 w-full cursor-pointer accent-blue-600"
          onChange={(event) => setColor(current.hex, Number(event.target.value) / 100)}
        />
      </div>

      <div className="grid grid-cols-7 gap-2" aria-label="Paleta de colores">
        {colors.map((color) => {
          const transparent = color === "transparent";
          const parsed = parseColor(color);
          const selected = transparent
            ? current.alpha === 0
            : current.alpha > 0 && parsed.hex === current.hex;

          return (
            <button
              key={color}
              type="button"
              aria-label={transparent ? "Transparente" : `Color ${color}`}
              title={transparent ? "Transparente" : color}
              className={cn(
                "relative aspect-square rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                selected && "ring-2 ring-blue-600 ring-offset-2",
              )}
              style={{
                background: transparent
                  ? "linear-gradient(135deg, #fff 0 43%, #ef4444 44% 56%, #fff 57% 100%)"
                  : color,
              }}
              onClick={() => {
                if (transparent) {
                  onChange("rgba(0, 0, 0, 0)");
                } else {
                  setColor(parsed.hex, 1);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
