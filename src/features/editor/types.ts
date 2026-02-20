import * as material from "material-colors";

// ============ Konva Canvas Types ============

export type ElementType = 'text' | 'rect' | 'circle' | 'triangle' | 'diamond' | 'image' | 'path';

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
  opacity?: number;
  // For circle/triangle center positioning
  radiusX?: number;
  radiusY?: number;
  invert?: boolean; // For inverted triangle
  rx?: number; // Corner radius for rect
  ry?: number; // Corner radius for rect
  cornerRadius?: number; // Alternative corner radius
  // Origin for centering
  originX?: 'left' | 'center' | 'right';
  originY?: 'top' | 'middle' | 'bottom';
  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: 'normal' | 'italic' | 'bold italic' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  textVerticalAlign?: 'top' | 'middle' | 'bottom';
  lineHeight?: number;
  letterSpacing?: number;
  textDecoration?: 'underline' | 'line-through' | 'none';
  // Image specific
  src?: string;
  // Common
  locked?: boolean;
  visible?: boolean;
  name?: string;
}

export interface CanvasState {
  version: string;
  workspace: {
    width: number;
    height: number;
    background: string;
  };
  elements: CanvasElement[];
}

// ============ Constants ============

export const fonts = [
  // Fonts in public/fonts folder
  "Arial",
  "Arial Black",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Times New Roman",
  "Georgia",
  "Garamond",
  "Courier New",
  "Palatino",
  "Bookman",
  "Comic Sans MS",
  "Impact",
  "Lucida Console",
  "Playfair Display",
  // Google Fonts in public/fonts
  "Lato",
  "Open Sans",
  "Oswald",
  "Raleway",
  "Ubuntu",
  "Merriweather",
  "Roboto",
  "Roboto Slab",
  "Noto Sans",
  "Noto Serif",
];

export const filters = [
  "none",
  "polaroid",
  "sepia",
  "kodachrome",
  "contrast",
  "brightness",
  "greyscale",
  "brownie",
  "vintage",
  "technicolor",
  "pixelate",
  "invert",
  "blur",
  "sharpen",
  "emboss",
  "removecolor",
  "blacknwhite",
  "vibrance",
  "blendcolor",
  "huerotate",
  "resize",
  "saturation",
  "gamma",
];

export const selectionDependentTools = [
  "fill",
  "font",
  "filter",
  "opacity",
  "remove-bg",
  "stroke-color",
  "stroke-width",
];

export const colors = [
  material.red["500"],
  material.pink["500"],
  material.purple["500"],
  material.deepPurple["500"],
  material.indigo["500"],
  material.blue["500"],
  material.lightBlue["500"],
  material.cyan["500"],
  material.teal["500"],
  material.green["500"],
  material.lightGreen["500"],
  material.lime["500"],
  material.yellow["500"],
  material.amber["500"],
  material.orange["500"],
  material.deepOrange["500"],
  material.brown["500"],
  material.blueGrey["500"],
  "transparent",
];

export type ActiveTool =
  | "select"
  | "shapes"
  | "text"
  | "images"
  | "draw"
  | "fill"
  | "stroke-color"
  | "stroke-width"
  | "font"
  | "opacity"
  | "filter"
  | "settings"
  | "ai"
  | "remove-bg"
  | "templates";

export const FILL_COLOR = "rgba(0,0,0,1)";
export const STROKE_COLOR = "rgba(0,0,0,1)";
export const STROKE_WIDTH = 2;
export const STROKE_DASH_ARRAY = [];
export const FONT_FAMILY = "Arial";
export const FONT_SIZE = 32;
export const FONT_WEIGHT = 400;

// Editor type for compatibility
export interface Editor {
  canvas?: any;
  addRect: () => void;
  addRectangle: () => void;
  addSoftRectangle: () => void;
  addCircle: () => void;
  addTriangle: () => void;
  addInverseTriangle: () => void;
  addDiamond: () => void;
  addText: (text: string, options?: any) => void;
  addImage: (src: string) => void;
  delete: () => void;
  selectedObjects: any[];
  getActiveFillColor: () => string;
  getActiveStrokeColor: () => string;
  getActiveStrokeWidth: () => number;
  getActiveStrokeDashArray: () => number[];
  getActiveOpacity: () => number;
  getActiveFontFamily: () => string;
  getActiveFontSize: () => number;
  getActiveFontWeight: () => number;
  getActiveFontStyle: () => string;
  getActiveTextAlign: () => string;
  getActiveTextVerticalAlign: () => string;
  getActiveLineHeight: () => number;
  getActiveLetterSpacing: () => number;
  getActiveFontUnderline: () => boolean;
  getActiveFontLinethrough: () => boolean;
  changeFillColor: (color: string) => void;
  changeStrokeColor: (color: string) => void;
  changeStrokeWidth: (width: number) => void;
  changeStrokeDashArray: (dashArray: number[]) => void;
  changeOpacity: (opacity: number) => void;
  changeFontSize: (size: number) => void;
  changeFontWeight: (weight: number) => void;
  changeFontStyle: (style: string) => void;
  changeFontFamily: (family: string) => void;
  changeTextAlign: (align: string) => void;
  changeTextVerticalAlign: (align: string) => void;
  changeLineHeight: (height: number) => void;
  changeLetterSpacing: (spacing: number) => void;
  changeFontUnderline: (underline: boolean) => void;
  changeFontLinethrough: (linethrough: boolean) => void;
  changeImageFilter: (filter: string) => void;
  changeSize: (width: number, height: number) => void;
  changeBackground: (color: string) => void;
  bringForward: () => void;
  sendBackwards: () => void;
  centerHorizontally: () => void;
  centerVertically: () => void;
  savePng: () => void;
  saveJpg: () => void;
  saveSvg: () => void;
  saveJson: () => void;
  loadJson: (json: string) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  autoZoom: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  getWorkspace: () => any;
}
