import { fabric } from "fabric";

import {
  DEFAULT_WORKSPACE_HEIGHT,
  DEFAULT_WORKSPACE_WIDTH,
  createFilter,
  getValidCanvasDimension,
} from "@/features/editor/utils";

type KonvaElement = {
  id?: string;
  type?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
  opacity?: number;
  invert?: boolean;
  rx?: number;
  ry?: number;
  cornerRadius?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: string;
  textAlign?: string;
  textVerticalAlign?: "top" | "middle" | "bottom";
  lineHeight?: number;
  letterSpacing?: number;
  textDecoration?: string;
  src?: string;
  flipX?: boolean;
  flipY?: boolean;
  filterType?: string;
  cropX?: number;
  cropY?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
  locked?: boolean;
  visible?: boolean;
  name?: string;
  path?: string;
  data?: string;
  svgPath?: string;
};

export type KonvaCanvasData = {
  version?: string;
  workspace?: {
    width?: number;
    height?: number;
    background?: string;
  };
  elements?: KonvaElement[];
};

export type ConvertedKonvaCanvas = {
  width: number;
  height: number;
  workspace: fabric.Rect;
  objects: fabric.Object[];
  skippedTypes: string[];
};

export function isKonvaCanvasData(data: any): data is KonvaCanvasData {
  return Boolean(
    data &&
    typeof data === "object" &&
    !Array.isArray(data.objects) &&
    data.workspace &&
    Array.isArray(data.elements),
  );
}

function polygonPoints(sides: number, width: number, height: number) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2;

  return Array.from({ length: sides }, (_, index) => {
    const angle = (index * 2 * Math.PI) / sides - Math.PI / 2;

    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
}

function starPoints(width: number, height: number) {
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = Math.min(width, height) / 2;
  const innerRadius = outerRadius * 0.4;

  return Array.from({ length: 10 }, (_, index) => {
    const angle = (index * Math.PI) / 5 - Math.PI / 2;
    const radius = index % 2 === 0 ? outerRadius : innerRadius;

    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
}

function heartPoints(width: number, height: number) {
  return Array.from({ length: 51 }, (_, index) => {
    const angle = (index / 50) * 2 * Math.PI;
    const x = 16 * Math.pow(Math.sin(angle), 3);
    const y = -(
      13 * Math.cos(angle) -
      5 * Math.cos(2 * angle) -
      2 * Math.cos(3 * angle) -
      Math.cos(4 * angle)
    );

    return {
      x: (x + 16) * (width / 32),
      y: (y + 16) * (height / 32),
    };
  });
}

function commonOptions(element: KonvaElement): fabric.IObjectOptions & Record<string, any> {
  const shadowOpacity = element.shadowOpacity ?? 0.5;
  const shadow = element.shadowColor && element.shadowColor !== "transparent"
    ? new fabric.Shadow({
        color: element.shadowColor,
        blur: element.shadowBlur ?? 0,
        offsetX: element.shadowOffsetX ?? 0,
        offsetY: element.shadowOffsetY ?? 0,
        opacity: shadowOpacity,
      } as any)
    : undefined;

  return {
    left: Number(element.x) || 0,
    top: Number(element.y) || 0,
    angle: Number(element.rotation) || 0,
    scaleX: getValidCanvasDimension(element.scaleX, 1),
    scaleY: getValidCanvasDimension(element.scaleY, 1),
    fill: element.fill ?? "#000000",
    stroke: element.stroke && element.stroke !== "none" ? element.stroke : undefined,
    strokeWidth: Math.max(0, Number(element.strokeWidth) || 0),
    strokeDashArray: element.strokeDashArray,
    opacity: Math.min(1, Math.max(0, Number(element.opacity ?? 1))),
    flipX: element.flipX ?? false,
    flipY: element.flipY ?? false,
    selectable: !element.locked,
    evented: !element.locked,
    visible: element.visible !== false,
    name: element.name || element.id,
    konvaId: element.id,
    shadow,
  };
}

function loadImage(element: KonvaElement) {
  return new Promise<fabric.Image | null>((resolve) => {
    if (!element.src) return resolve(null);

    fabric.Image.fromURL(
      element.src,
      (image) => {
        if (!image) return resolve(null);

        image.set({
          ...commonOptions(element),
          width: getValidCanvasDimension(element.width, image.width, 100),
          height: getValidCanvasDimension(element.height, image.height, 100),
          cropX: Math.max(0, Number(element.cropX) || 0),
          cropY: Math.max(0, Number(element.cropY) || 0),
        });

        const filter = element.filterType && element.filterType !== "none"
          ? createFilter(element.filterType)
          : undefined;

        if (filter) {
          image.filters = [filter];
          image.applyFilters();
        }

        resolve(image);
      },
      { crossOrigin: "anonymous" },
    );
  });
}

async function convertElement(element: KonvaElement) {
  const width = getValidCanvasDimension(element.width, 100)!;
  const height = getValidCanvasDimension(element.height, 100)!;
  const options = commonOptions(element);

  switch (element.type) {
    case "rect":
      return new fabric.Rect({
        ...options,
        width,
        height,
        rx: Math.max(0, Number(element.cornerRadius ?? element.rx) || 0),
        ry: Math.max(0, Number(element.cornerRadius ?? element.ry) || 0),
      });
    case "circle":
      return new fabric.Ellipse({
        ...options,
        rx: width / 2,
        ry: height / 2,
      });
    case "triangle":
      return new fabric.Polygon(
        element.invert
          ? [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width / 2, y: height }]
          : [{ x: width / 2, y: 0 }, { x: width, y: height }, { x: 0, y: height }],
        options,
      );
    case "diamond":
      return new fabric.Polygon([
        { x: width / 2, y: 0 },
        { x: width, y: height / 2 },
        { x: width / 2, y: height },
        { x: 0, y: height / 2 },
      ], options);
    case "pentagon":
      return new fabric.Polygon(polygonPoints(5, width, height), options);
    case "hexagon":
      return new fabric.Polygon(polygonPoints(6, width, height), options);
    case "star":
      return new fabric.Polygon(starPoints(width, height), options);
    case "heart":
      return new fabric.Polygon(heartPoints(width, height), options);
    case "arrow": {
      const arrowWidth = Math.min(width * 0.3, height);
      const bodyWidth = width - arrowWidth;
      return new fabric.Polygon([
        { x: 0, y: height * 0.3 },
        { x: bodyWidth, y: height * 0.3 },
        { x: bodyWidth, y: 0 },
        { x: width, y: height * 0.5 },
        { x: bodyWidth, y: height },
        { x: bodyWidth, y: height * 0.7 },
        { x: 0, y: height * 0.7 },
      ], options);
    }
    case "line": {
      const radius = height / 2;
      return new fabric.Polygon([
        { x: radius, y: 0 },
        { x: width - radius, y: 0 },
        { x: width, y: radius },
        { x: width - radius, y: height },
        { x: radius, y: height },
        { x: 0, y: radius },
      ], options);
    }
    case "text": {
      const fontSize = getValidCanvasDimension(element.fontSize, 32)!;
      const fontStyle = element.fontStyle || "normal";
      const textbox = new fabric.Textbox(element.text || "", {
        ...options,
        width,
        fontSize,
        fontFamily: element.fontFamily || "Arial",
        fontWeight: element.fontWeight ?? (fontStyle.includes("bold") ? 700 : 400),
        fontStyle: fontStyle.includes("italic") ? "italic" : "normal",
        textAlign: element.textAlign || "left",
        splitByGrapheme: false,
        lineHeight: getValidCanvasDimension(element.lineHeight, 1.2),
        charSpacing: ((Number(element.letterSpacing) || 0) / fontSize) * 1000,
        underline: element.textDecoration === "underline",
        linethrough: element.textDecoration === "line-through",
      });

      (textbox as any).fixedHeight = Math.max(height, textbox.calcTextHeight());
      (textbox as any).textVerticalAlign = element.textVerticalAlign || "top";
      textbox.height = (textbox as any).fixedHeight;
      return textbox;
    }
    case "image":
      return loadImage(element);
    case "path": {
      const pathData = element.path || element.data || element.svgPath;
      return pathData ? new fabric.Path(pathData, options) : null;
    }
    default:
      return null;
  }
}

export async function convertKonvaCanvas(data: KonvaCanvasData): Promise<ConvertedKonvaCanvas> {
  const width = getValidCanvasDimension(
    data.workspace?.width,
    DEFAULT_WORKSPACE_WIDTH,
  )!;
  const height = getValidCanvasDimension(
    data.workspace?.height,
    DEFAULT_WORKSPACE_HEIGHT,
  )!;
  const workspace = new fabric.Rect({
    width,
    height,
    name: "clip",
    fill: data.workspace?.background || "#ffffff",
    selectable: false,
    evented: false,
    hasControls: false,
    shadow: new fabric.Shadow({
      color: "rgba(0,0,0,0.8)",
      blur: 5,
    }),
  });
  const converted = await Promise.all((data.elements || []).map(convertElement));
  const skippedTypes = (data.elements || [])
    .filter((_, index) => !converted[index])
    .map((element) => element.type || "unknown");

  return {
    width,
    height,
    workspace,
    objects: converted.filter((object): object is fabric.Object => Boolean(object)),
    skippedTypes,
  };
}
