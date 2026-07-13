import { fabric } from "fabric";

let fixesApplied = false;

/**
 * Fabric 5.3 writes `alphabetical` to CanvasRenderingContext2D.textBaseline.
 * The valid canvas value is `alphabetic`; Chromium rejects the former and
 * emits one warning on practically every text render.
 */
export function applyFabricRuntimeFixes() {
  if (fixesApplied) return;
  fixesApplied = true;

  const textPrototype = fabric.Text.prototype as any;

  textPrototype._setTextStyles = function (
    ctx: CanvasRenderingContext2D,
    charStyle?: Record<string, unknown>,
    forMeasuring?: boolean,
  ) {
    ctx.textBaseline = "alphabetic";

    if (this.path) {
      switch (this.pathAlign) {
        case "center":
          ctx.textBaseline = "middle";
          break;
        case "ascender":
          ctx.textBaseline = "top";
          break;
        case "descender":
          ctx.textBaseline = "bottom";
          break;
      }
    }

    ctx.font = this._getFontDeclaration(charStyle, forMeasuring);
  };
}
