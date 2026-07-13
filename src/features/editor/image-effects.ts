import { fabric } from "fabric";

export type ImagePreset = "none" | "grayscale" | "sepia" | "cold" | "natural" | "warm";
export type ImageMaskShape =
  | "none"
  | "star"
  | "triangle"
  | "diamond"
  | "circle"
  | "pentagon"
  | "hexagon"
  | "octagon"
  | "quarter-circle"
  | "rounded-rectangle";
export type CornerMode = "px" | "%";

export type ImageEffectSettings = {
  preset: ImagePreset;
  blur: number;
  brightness: number;
  temperature: number;
  contrast: number;
  saturation: number;
  vibrance: number;
  whites: number;
  blacks: number;
  borderColor: string;
  borderWidth: number;
  cornerRadius: number;
  cornerMode: CornerMode;
  softEdges: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOpacity: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  blendMode: string;
  maskShape: ImageMaskShape;
};

export type ImageCropState = {
  cropX: number;
  cropY: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  left: number;
  top: number;
};

export type EditableFabricImage = fabric.Image & {
  imagePreset?: ImagePreset;
  imageBlur?: number;
  imageBrightness?: number;
  imageTemperature?: number;
  imageContrast?: number;
  imageSaturation?: number;
  imageVibrance?: number;
  imageWhites?: number;
  imageBlacks?: number;
  imageBorderColor?: string;
  imageBorderWidth?: number;
  imageCornerRadius?: number;
  imageCornerMode?: CornerMode;
  imageSoftEdges?: number;
  imageShadowColor?: string;
  imageShadowBlur?: number;
  imageShadowOpacity?: number;
  imageShadowOffsetX?: number;
  imageShadowOffsetY?: number;
  imageBlendMode?: string;
  imageMaskShape?: ImageMaskShape;
};

export const DEFAULT_IMAGE_EFFECTS: ImageEffectSettings = {
  preset: "none",
  blur: 0,
  brightness: 0,
  temperature: 0,
  contrast: 0,
  saturation: 0,
  vibrance: 0,
  whites: 0,
  blacks: 0,
  borderColor: "#000000",
  borderWidth: 0,
  cornerRadius: 0,
  cornerMode: "px",
  softEdges: 0,
  shadowColor: "#000000",
  shadowBlur: 0,
  shadowOpacity: 0.35,
  shadowOffsetX: 0,
  shadowOffsetY: 8,
  blendMode: "source-over",
  maskShape: "none",
};

const numberOr = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const shadowColorWithOpacity = (color: string, opacity: number) => {
  const parsedColor = new fabric.Color(color || "#000000");
  parsedColor.setAlpha(Math.max(0, Math.min(1, opacity)));
  return parsedColor.toRgba();
};

/**
 * Fabric draws an image stroke centered on the object's outer bounds. Half of
 * that stroke can therefore be clipped by the workspace or by the image's own
 * rounded clipPath, making one or more corners look thinner or disappear.
 * Draw image borders just inside those bounds so all four sides and corners
 * remain visible and symmetrical.
 */
const installUniformImageBorderRenderer = () => {
  const imagePrototype = fabric.Image.prototype as any;
  if (imagePrototype.__dynamicCanvasUniformBorder) return;

  const originalStroke = imagePrototype._stroke;

  imagePrototype._stroke = function (ctx: CanvasRenderingContext2D) {
    const borderWidth = Math.max(0, numberOr(this.imageBorderWidth, this.strokeWidth || 0));
    const maskShape = this.imageMaskShape || "none";

    if (
      !this.stroke ||
      borderWidth === 0 ||
      (maskShape !== "none" && maskShape !== "rounded-rectangle")
    ) {
      return originalStroke.call(this, ctx);
    }

    const width = Math.max(0, numberOr(this.width, 0));
    const height = Math.max(0, numberOr(this.height, 0));
    const scaleX = Math.max(0.0001, Math.abs(numberOr(this.scaleX, 1)));
    const scaleY = Math.max(0.0001, Math.abs(numberOr(this.scaleY, 1)));
    const insetX = this.strokeUniform ? borderWidth / (2 * scaleX) : borderWidth / 2;
    const insetY = this.strokeUniform ? borderWidth / (2 * scaleY) : borderWidth / 2;
    const left = -width / 2 + insetX;
    const top = -height / 2 + insetY;
    const right = width / 2 - insetX;
    const bottom = height / 2 - insetY;

    if (right <= left || bottom <= top) return;

    const cornerValue = Math.max(0, numberOr(this.imageCornerRadius, 0));
    const rawRadius = this.imageCornerMode === "%"
      ? Math.min(width, height) * Math.min(50, cornerValue) / 100
      : cornerValue;
    const radius = Math.max(
      0,
      Math.min(
        (right - left) / 2,
        (bottom - top) / 2,
        rawRadius - Math.max(insetX, insetY),
      ),
    );

    ctx.beginPath();
    if (radius <= 0) {
      ctx.rect(left, top, right - left, bottom - top);
    } else {
      ctx.moveTo(left + radius, top);
      ctx.lineTo(right - radius, top);
      ctx.quadraticCurveTo(right, top, right, top + radius);
      ctx.lineTo(right, bottom - radius);
      ctx.quadraticCurveTo(right, bottom, right - radius, bottom);
      ctx.lineTo(left + radius, bottom);
      ctx.quadraticCurveTo(left, bottom, left, bottom - radius);
      ctx.lineTo(left, top + radius);
      ctx.quadraticCurveTo(left, top, left + radius, top);
    }
    ctx.closePath();
  };

  imagePrototype.__dynamicCanvasUniformBorder = true;
};

installUniformImageBorderRenderer();

/**
 * Fabric's WebGL filter backend is limited by `fabric.textureSize` (2048px by
 * default). When a source image is taller or wider than that limit Fabric
 * silently creates a smaller filtered bitmap while keeping the object's
 * original dimensions. The result is a transparent strip, normally visible at
 * the bottom or right edge of full-canvas images.
 *
 * Use the 2D backend only for oversized sources. It is a little slower, but it
 * preserves every source pixel and keeps ordinary images on the faster WebGL
 * path.
 */
const applyFiltersWithoutTextureClipping = (image: fabric.Image) => {
  const fabricRuntime = fabric as any;
  const originalElement = (image as any)._originalElement || image.getElement();
  const sourceWidth = Number(
    originalElement?.naturalWidth || originalElement?.videoWidth || originalElement?.width || image.width || 1,
  );
  const sourceHeight = Number(
    originalElement?.naturalHeight || originalElement?.videoHeight || originalElement?.height || image.height || 1,
  );
  const textureLimit = Number(fabricRuntime.textureSize || 2048);

  if (Math.max(sourceWidth, sourceHeight) <= textureLimit) {
    image.applyFilters();
    return;
  }

  const previousBackend = fabricRuntime.filterBackend;
  try {
    fabricRuntime.filterBackend = new fabric.Canvas2dFilterBackend();
    image.applyFilters();
  } finally {
    fabricRuntime.filterBackend = previousBackend;
  }
};

export const getImageEffectSettings = (image?: fabric.Image | null): ImageEffectSettings => {
  if (!image) return { ...DEFAULT_IMAGE_EFFECTS };
  const source = image as EditableFabricImage;

  return {
    preset: source.imagePreset || "none",
    blur: numberOr(source.imageBlur, 0),
    brightness: numberOr(source.imageBrightness, 0),
    temperature: numberOr(source.imageTemperature, 0),
    contrast: numberOr(source.imageContrast, 0),
    saturation: numberOr(source.imageSaturation, 0),
    vibrance: numberOr(source.imageVibrance, 0),
    whites: numberOr(source.imageWhites, 0),
    blacks: numberOr(source.imageBlacks, 0),
    borderColor: source.imageBorderColor || source.stroke?.toString() || "#000000",
    borderWidth: numberOr(source.imageBorderWidth, source.strokeWidth || 0),
    cornerRadius: numberOr(source.imageCornerRadius, 0),
    cornerMode: source.imageCornerMode || "px",
    softEdges: numberOr(source.imageSoftEdges, 0),
    shadowColor: source.imageShadowColor || "#000000",
    shadowBlur: numberOr(source.imageShadowBlur, 0),
    shadowOpacity: numberOr(source.imageShadowOpacity, 0.35),
    shadowOffsetX: numberOr(source.imageShadowOffsetX, 0),
    shadowOffsetY: numberOr(source.imageShadowOffsetY, 8),
    blendMode: source.imageBlendMode || source.globalCompositeOperation || "source-over",
    maskShape: source.imageMaskShape || "none",
  };
};

const regularPolygonPoints = (sides: number, width: number, height: number) => {
  const radiusX = width / 2;
  const radiusY = height / 2;
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
    return { x: Math.cos(angle) * radiusX, y: Math.sin(angle) * radiusY };
  });
};

const starPoints = (width: number, height: number) => {
  const outerX = width / 2;
  const outerY = height / 2;
  const innerX = outerX * 0.45;
  const innerY = outerY * 0.45;
  return Array.from({ length: 10 }, (_, index) => {
    const outer = index % 2 === 0;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    return {
      x: Math.cos(angle) * (outer ? outerX : innerX),
      y: Math.sin(angle) * (outer ? outerY : innerY),
    };
  });
};

const createMask = (
  shape: ImageMaskShape,
  width: number,
  height: number,
  radius: number,
): fabric.Object | undefined => {
  const common = {
    originX: "center" as const,
    originY: "center" as const,
    left: 0,
    top: 0,
    fill: "#000000",
    strokeWidth: 0,
  };

  if (shape === "circle") {
    return new fabric.Ellipse({ ...common, rx: width / 2, ry: height / 2 });
  }
  if (shape === "rounded-rectangle" || (shape === "none" && radius > 0)) {
    return new fabric.Rect({ ...common, width, height, rx: radius, ry: radius });
  }
  if (shape === "triangle") {
    return new fabric.Polygon(regularPolygonPoints(3, width, height), common);
  }
  if (shape === "diamond") {
    return new fabric.Polygon(regularPolygonPoints(4, width, height), common);
  }
  if (shape === "pentagon") {
    return new fabric.Polygon(regularPolygonPoints(5, width, height), common);
  }
  if (shape === "hexagon") {
    return new fabric.Polygon(regularPolygonPoints(6, width, height), common);
  }
  if (shape === "octagon") {
    return new fabric.Polygon(regularPolygonPoints(8, width, height), common);
  }
  if (shape === "star") {
    return new fabric.Polygon(starPoints(width, height), common);
  }
  if (shape === "quarter-circle") {
    const path = new fabric.Path(
      `M 0 0 L ${width} 0 A ${width} ${height} 0 0 1 0 ${height} Z`,
      common,
    );
    path.scaleToWidth(width);
    path.scaleToHeight(height);
    return path;
  }
  return undefined;
};

export const applyImageClipPath = (image: EditableFabricImage) => {
  const settings = getImageEffectSettings(image);
  const width = Math.max(1, image.width || 1);
  const height = Math.max(1, image.height || 1);
  const radius = settings.cornerMode === "%"
    ? Math.min(width, height) * Math.min(50, settings.cornerRadius) / 100
    : Math.min(Math.min(width, height) / 2, settings.cornerRadius);

  const mask = createMask(
    settings.maskShape === "none" && settings.softEdges > 0
      ? "rounded-rectangle"
      : settings.maskShape,
    width,
    height,
    radius,
  );
  if (mask && settings.softEdges > 0) {
    mask.shadow = new fabric.Shadow({
      color: "#000000",
      blur: settings.softEdges,
      offsetX: 0,
      offsetY: 0,
      nonScaling: false,
    });
  }
  image.clipPath = mask;
  image.set({ dirty: true } as any);
};

export const applyImageEffects = (image: EditableFabricImage) => {
  const settings = getImageEffectSettings(image);
  const nextFilters: any[] = [];

  if (settings.preset === "grayscale") nextFilters.push(new fabric.Image.filters.Grayscale());
  if (settings.preset === "sepia") nextFilters.push(new fabric.Image.filters.Sepia());
  if (settings.preset === "cold") {
    nextFilters.push(new fabric.Image.filters.BlendColor({ color: "#5b8cff", mode: "tint", alpha: 0.18 }));
  }
  if (settings.preset === "natural") {
    nextFilters.push(new fabric.Image.filters.Contrast({ contrast: 0.05 }));
    nextFilters.push(new fabric.Image.filters.Saturation({ saturation: 0.06 }));
  }
  if (settings.preset === "warm") {
    nextFilters.push(new fabric.Image.filters.BlendColor({ color: "#ff914d", mode: "tint", alpha: 0.18 }));
  }

  if (settings.blur !== 0) nextFilters.push(new fabric.Image.filters.Blur({ blur: Math.abs(settings.blur) / 100 }));
  if (settings.brightness !== 0) nextFilters.push(new fabric.Image.filters.Brightness({ brightness: settings.brightness / 100 }));
  if (settings.contrast !== 0) nextFilters.push(new fabric.Image.filters.Contrast({ contrast: settings.contrast / 100 }));
  if (settings.saturation !== 0) nextFilters.push(new fabric.Image.filters.Saturation({ saturation: settings.saturation / 100 }));
  if (settings.vibrance !== 0) {
    const VibranceFilter = (fabric.Image.filters as any).Vibrance;
    nextFilters.push(new VibranceFilter({ vibrance: settings.vibrance / 100 }));
  }
  if (settings.temperature !== 0) {
    nextFilters.push(new fabric.Image.filters.BlendColor({
      color: settings.temperature > 0 ? "#ff8a3d" : "#4f8cff",
      mode: "tint",
      alpha: Math.abs(settings.temperature) / 400,
    }));
  }
  if (settings.whites !== 0) nextFilters.push(new fabric.Image.filters.Brightness({ brightness: settings.whites / 250 }));
  if (settings.blacks !== 0) nextFilters.push(new fabric.Image.filters.Contrast({ contrast: settings.blacks / 250 }));

  image.filters = nextFilters;
  applyFiltersWithoutTextureClipping(image);
  image.set({
    stroke: settings.borderWidth > 0 ? settings.borderColor : undefined,
    strokeWidth: settings.borderWidth,
    strokeUniform: true,
    globalCompositeOperation: settings.blendMode,
    shadow: settings.shadowBlur > 0
      ? new fabric.Shadow({
          color: shadowColorWithOpacity(settings.shadowColor, settings.shadowOpacity),
          blur: settings.shadowBlur,
          offsetX: settings.shadowOffsetX,
          offsetY: settings.shadowOffsetY,
          nonScaling: true,
        } as any)
      : undefined,
    dirty: true,
  } as any);
  applyImageClipPath(image);
};

export const resetImageEffects = (image: EditableFabricImage) => {
  Object.assign(image, {
    imagePreset: "none",
    imageBlur: 0,
    imageBrightness: 0,
    imageTemperature: 0,
    imageContrast: 0,
    imageSaturation: 0,
    imageVibrance: 0,
    imageWhites: 0,
    imageBlacks: 0,
    imageBorderColor: "#000000",
    imageBorderWidth: 0,
    imageCornerRadius: 0,
    imageCornerMode: "px",
    imageSoftEdges: 0,
    imageShadowColor: "#000000",
    imageShadowBlur: 0,
    imageShadowOpacity: 0.35,
    imageShadowOffsetX: 0,
    imageShadowOffsetY: 8,
    imageBlendMode: "source-over",
    imageMaskShape: "none",
  });
  applyImageEffects(image);
};
