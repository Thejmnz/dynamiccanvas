import { uuid } from "uuidv4";
import { fabric } from "fabric";

type RGBColor = {
  r: number;
  g: number;
  b: number;
  a?: number;
};

export const DEFAULT_WORKSPACE_WIDTH = 900;
export const DEFAULT_WORKSPACE_HEIGHT = 1200;

export function getValidCanvasDimension(...values: unknown[]) {
  for (const value of values) {
    const dimension = Number(value);

    if (Number.isFinite(dimension) && dimension > 0) {
      return dimension;
    }
  }

  return undefined;
}

export function sanitizeFabricCanvasData(
  data: any,
  fallbackWidth = DEFAULT_WORKSPACE_WIDTH,
  fallbackHeight = DEFAULT_WORKSPACE_HEIGHT,
) {
  if (!data || typeof data !== "object") return data;

  const workspace = Array.isArray(data.objects)
    ? data.objects.find((object: any) => object?.name === "clip")
    : undefined;

  const width = getValidCanvasDimension(
    workspace?.width,
    data.clipPath?.width,
    fallbackWidth,
    DEFAULT_WORKSPACE_WIDTH,
  )!;
  const height = getValidCanvasDimension(
    workspace?.height,
    data.clipPath?.height,
    fallbackHeight,
    DEFAULT_WORKSPACE_HEIGHT,
  )!;

  if (workspace) {
    workspace.width = width;
    workspace.height = height;
  }

  if (data.clipPath) {
    data.clipPath.width = width;
    data.clipPath.height = height;
  }

  return data;
}

export function ensureFabricWorkspace(
  canvas: fabric.Canvas,
  data: any,
  fallbackWidth = DEFAULT_WORKSPACE_WIDTH,
  fallbackHeight = DEFAULT_WORKSPACE_HEIGHT,
) {
  const existingWorkspace = canvas
    .getObjects()
    .find((object) => object.name === "clip") as fabric.Rect | undefined;
  const serializedWorkspace = Array.isArray(data?.objects)
    ? data.objects.find((object: any) => object?.name === "clip")
    : undefined;
  const source = serializedWorkspace || data?.clipPath || data?.workspace || {};
  const width = getValidCanvasDimension(
    existingWorkspace?.width,
    source.width,
    fallbackWidth,
    DEFAULT_WORKSPACE_WIDTH,
  )!;
  const height = getValidCanvasDimension(
    existingWorkspace?.height,
    source.height,
    fallbackHeight,
    DEFAULT_WORKSPACE_HEIGHT,
  )!;

  if (existingWorkspace) {
    existingWorkspace.set({
      width,
      height,
      selectable: false,
      evented: false,
      hasControls: false,
    });
    existingWorkspace.sendToBack();
    return existingWorkspace;
  }

  const workspace = new fabric.Rect({
    left: Number.isFinite(Number(source.left)) ? Number(source.left) : 0,
    top: Number.isFinite(Number(source.top)) ? Number(source.top) : 0,
    width,
    height,
    originX: source.originX || "left",
    originY: source.originY || "top",
    angle: Number(source.angle) || 0,
    scaleX: getValidCanvasDimension(source.scaleX, 1),
    scaleY: getValidCanvasDimension(source.scaleY, 1),
    fill: source.background || source.fill || "#ffffff",
    name: "clip",
    selectable: false,
    evented: false,
    hasControls: false,
    shadow: new fabric.Shadow({
      color: "rgba(0,0,0,0.8)",
      blur: 5,
    }),
  });

  canvas.add(workspace);
  workspace.sendToBack();
  return workspace;
}

export function transformText(objects: any) {
  if (!objects) return;

  objects.forEach((item: any) => {
    if (item.objects) {
      transformText(item.objects);
    } else {
      item.type === "text" && (item.type === "textbox");
    }
  });
};

export function downloadFile(file: string, type: string) {
  const anchorElement = document.createElement("a");

  anchorElement.href = file;
  anchorElement.download = `${uuid()}.${type}`;
  document.body.appendChild(anchorElement);
  anchorElement.click();
  anchorElement.remove();
};

export function isTextType(type: string | undefined) {
  return type === "text" || type === "i-text" || type === "textbox";
};

type ResizableTextbox = fabric.Textbox & {
  fixedHeight?: number;
  textVerticalAlign?: "top" | "middle" | "bottom";
  __textboxConfigured?: boolean;
  __isConfiguring?: boolean;
  __isResizing?: boolean;
};

type TextboxTransform = {
  target: ResizableTextbox;
  originX: string;
  originY: string;
};

function resizeTextboxHeight(
  _eventData: Event,
  transform: TextboxTransform,
  x: number,
  y: number,
) {
  const textbox = transform.target;
  const controlsUtils = (fabric as any).controlsUtils;
  const localPoint = controlsUtils.getLocalPoint(
    transform,
    transform.originX,
    transform.originY,
    x,
    y,
  );
  const multiplier = transform.originY === "center" ? 2 : 1;
  const strokePadding = (textbox.strokeWidth || 0) /
    (textbox.strokeUniform ? textbox.scaleY || 1 : 1);
  const contentHeight = textbox.calcTextHeight();
  const nextHeight = Math.max(
    Math.abs((localPoint.y * multiplier) / (textbox.scaleY || 1)) - strokePadding,
    contentHeight,
    1,
  );
  const changed = textbox.fixedHeight !== nextHeight;

  textbox.fixedHeight = nextHeight;
  textbox.set({ height: nextHeight, dirty: true } as any);
  return changed;
}

function resizeTextboxDimensions(
  _eventData: Event,
  transform: TextboxTransform,
  x: number,
  y: number,
) {
  const textbox = transform.target;
  const controlsUtils = (fabric as any).controlsUtils;
  const localPoint = controlsUtils.getLocalPoint(
    transform,
    transform.originX,
    transform.originY,
    x,
    y,
  );
  const multiplierX = transform.originX === "center" ? 2 : 1;
  const multiplierY = transform.originY === "center" ? 2 : 1;
  const strokePaddingX = (textbox.strokeWidth || 0) /
    (textbox.strokeUniform ? textbox.scaleX || 1 : 1);
  const strokePaddingY = (textbox.strokeWidth || 0) /
    (textbox.strokeUniform ? textbox.scaleY || 1 : 1);
  const nextWidth = Math.max(
    Math.abs((localPoint.x * multiplierX) / (textbox.scaleX || 1)) - strokePaddingX,
    textbox.minWidth || 20,
  );
  const previousWidth = textbox.width;
  const previousHeight = textbox.fixedHeight;

  textbox.set("width", nextWidth);
  textbox.__isResizing = true;
  textbox.initDimensions();
  textbox.__isResizing = false;

  const contentHeight = textbox.calcTextHeight();
  const nextHeight = Math.max(
    Math.abs((localPoint.y * multiplierY) / (textbox.scaleY || 1)) - strokePaddingY,
    contentHeight,
    1,
  );

  textbox.fixedHeight = nextHeight;
  textbox.set({ height: nextHeight, dirty: true } as any);

  return previousWidth !== nextWidth || previousHeight !== nextHeight;
}

export function configureTextboxControls(object: fabric.Object) {
  if (object.type !== "textbox") return;

  const textbox = object as ResizableTextbox;
  if (textbox.__textboxConfigured) return;

  textbox.__textboxConfigured = true;
  textbox.splitByGrapheme = false;
  textbox.fixedHeight = getValidCanvasDimension(
    textbox.fixedHeight,
    textbox.height,
    textbox.calcTextHeight(),
  );
  textbox.textVerticalAlign ||= "top";

  const baseInitDimensions = textbox.initDimensions.bind(textbox);
  textbox.initDimensions = function initResizableTextboxDimensions() {
    const requestedWidth = textbox.width;
    const oldHeight = textbox.height || 0;
    // Fabric recalculates text metrics after loading a canvas and whenever a
    // web font becomes available. Keep the object's visual position stable
    // while those internal dimensions change.
    const centerBeforeReflow = textbox.getCenterPoint();
    baseInitDimensions();
    // Fabric normally widens a textbox to fit its longest word. Keep the user
    // defined boundary while still wrapping regular text at word boundaries.
    textbox.width = requestedWidth;
    const contentHeight = textbox.calcTextHeight();
    textbox.height = Math.max(textbox.fixedHeight || 0, contentHeight);

    // Keep the exact visual center when height changes from content (line
    // breaks or font loading), but NOT during an explicit resize operation
    // where Fabric's fixed-anchor control owns the position.
    if (!textbox.__isResizing && !textbox.__isConfiguring) {
      const heightDiff = textbox.height - oldHeight;
      if (Math.abs(heightDiff) > 0.5) {
        textbox.setPositionByOrigin(centerBeforeReflow, "center", "center");
      }
    }
  };

  (textbox as any)._getTopOffset = function getVerticallyAlignedTopOffset() {
    const contentHeight = textbox.calcTextHeight();
    const textboxHeight = textbox.height || contentHeight;
    const freeSpace = Math.max(0, textboxHeight - contentHeight);
    const verticalOffset = textbox.textVerticalAlign === "bottom"
      ? freeSpace
      : textbox.textVerticalAlign === "middle"
        ? freeSpace / 2
        : 0;

    return -textboxHeight / 2 + verticalOffset;
  };

  const controlsUtils = (fabric as any).controlsUtils;
  const objectControls = fabric.Object.prototype.controls;
  const heightAction = controlsUtils.wrapWithFireEvent(
    "resizing",
    controlsUtils.wrapWithFixedAnchor(resizeTextboxHeight),
  );
  const dimensionsAction = controlsUtils.wrapWithFireEvent(
    "resizing",
    controlsUtils.wrapWithFixedAnchor(resizeTextboxDimensions),
  );

  textbox.controls = {
    mtr: objectControls.mtr,
    ml: new fabric.Control({
      x: -0.5,
      y: 0,
      actionHandler: controlsUtils.changeWidth,
      cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
      actionName: "resizing",
    }),
    mr: new fabric.Control({
      x: 0.5,
      y: 0,
      actionHandler: controlsUtils.changeWidth,
      cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
      actionName: "resizing",
    }),
    mt: new fabric.Control({
      x: 0,
      y: -0.5,
      actionHandler: heightAction,
      cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
      actionName: "resizing",
    }),
    mb: new fabric.Control({
      x: 0,
      y: 0.5,
      actionHandler: heightAction,
      cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
      actionName: "resizing",
    }),
    tl: new fabric.Control({
      x: -0.5,
      y: -0.5,
      actionHandler: dimensionsAction,
      cursorStyleHandler: controlsUtils.scaleCursorStyleHandler,
      actionName: "resizing",
    }),
    tr: new fabric.Control({
      x: 0.5,
      y: -0.5,
      actionHandler: dimensionsAction,
      cursorStyleHandler: controlsUtils.scaleCursorStyleHandler,
      actionName: "resizing",
    }),
    bl: new fabric.Control({
      x: -0.5,
      y: 0.5,
      actionHandler: dimensionsAction,
      cursorStyleHandler: controlsUtils.scaleCursorStyleHandler,
      actionName: "resizing",
    }),
    br: new fabric.Control({
      x: 0.5,
      y: 0.5,
      actionHandler: dimensionsAction,
      cursorStyleHandler: controlsUtils.scaleCursorStyleHandler,
      actionName: "resizing",
    }),
  };

  // Fabric rebuilds a serialized Textbox using its content height before our
  // custom fixedHeight is restored. During this first pass, `top`/`left` are
  // already the exact saved coordinates, so recentering around that temporary
  // one-line height would move the whole box upward after every reload.
  textbox.__isConfiguring = true;
  try {
    textbox.initDimensions();
  } finally {
    textbox.__isConfiguring = false;
  }
  textbox.setCoords();
}

export function rgbaObjectToString(rgba: RGBColor | "transparent") {
  if (rgba === "transparent") {
    return `rgba(0,0,0,0)`;
  }

  const alpha = rgba.a === undefined ? 1 : rgba.a;

  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${alpha})`;
};

export const createFilter = (value: string) => {
  let effect;

  switch (value) {
    case "greyscale":
      effect = new fabric.Image.filters.Grayscale();
      break;
    case "polaroid":
      // @ts-ignore
      effect = new fabric.Image.filters.Polaroid();
      break;
    case "sepia":
      effect = new fabric.Image.filters.Sepia();
      break;
    case "kodachrome":
      // @ts-ignore
      effect = new fabric.Image.filters.Kodachrome();
      break;
    case "contrast":
      effect = new fabric.Image.filters.Contrast({ contrast: 0.3 });
      break;
    case "brightness":
      effect = new fabric.Image.filters.Brightness({ brightness: 0.8 });
      break;
    case "brownie":
      // @ts-ignore
      effect = new fabric.Image.filters.Brownie();
      break;
    case "vintage":
      // @ts-ignore
      effect = new fabric.Image.filters.Vintage();
      break;
    case "technicolor":
      // @ts-ignore
      effect = new fabric.Image.filters.Technicolor();
      break;
    case "pixelate":
      effect = new fabric.Image.filters.Pixelate();
      break;
    case "invert":
      effect = new fabric.Image.filters.Invert();
      break;
    case "blur":
      effect = new fabric.Image.filters.Blur();
      break;
    case "sharpen":
      effect = new fabric.Image.filters.Convolute({
        matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0],
      });
      break;
    case "emboss":
      effect = new fabric.Image.filters.Convolute({
        matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1],
      });
      break;
    case "removecolor":
      // @ts-ignore
      effect = new fabric.Image.filters.RemoveColor({
        threshold: 0.2,
        distance: 0.5
      });
      break;
    case "blacknwhite":
      // @ts-ignore
      effect = new fabric.Image.filters.BlackWhite();
      break;
    case "vibrance":
      // @ts-ignore
      effect = new fabric.Image.filters.Vibrance({
        vibrance: 1,
      });
      break;
    case "blendcolor":
      effect = new fabric.Image.filters.BlendColor({
        color: "#00ff00",
        mode: "multiply",
      });
      break;
    case "huerotate":
      effect = new fabric.Image.filters.HueRotation({
        rotation: 0.5,
      });
      break;
    case "resize":
      effect = new fabric.Image.filters.Resize();
      break;
    case "gamma":
      // @ts-ignore
      effect = new fabric.Image.filters.Gamma({
        gamma: [1, 0.5, 2.1]
      });
    case "saturation":
      effect = new fabric.Image.filters.Saturation({
        saturation: 0.7,
      });
      break;
    default:
      effect = null;
      return;
  };

  return effect;
};
