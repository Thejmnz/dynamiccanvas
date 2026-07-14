export type ApiProperty = {
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string;
  description: { es: string; en: string };
};

export const requestProperties: ApiProperty[] = [
  { name: "templateId", type: "string (UUID)", required: true, description: { es: "ID de una plantilla perteneciente al usuario autenticado.", en: "ID of a template owned by the authenticated user." } },
  { name: "layers", type: "object", defaultValue: "{}", description: { es: "Objeto indexado por ID de capa. Cada valor contiene los cambios de esa capa.", en: "Object keyed by layer ID. Each value contains that layer's overrides." } },
  { name: "format", type: '"jpeg" | "jpg" | "png" | "webp"', defaultValue: '"jpeg"', description: { es: "Formato del archivo generado. jpg es alias de jpeg.", en: "Generated file format. jpg is an alias of jpeg." } },
  { name: "scale", type: "number", defaultValue: "2", description: { es: "Multiplicador de resolución entre 1 y 3, limitado además a ~4096 px en el lado mayor.", en: "Resolution multiplier from 1 to 3, also capped near 4096 px on the longest side." } },
  { name: "pixelRatio", type: "number", defaultValue: "2", description: { es: "Alias de scale. scale tiene prioridad si se envían ambos.", en: "Alias for scale. scale takes precedence when both are provided." } },
  { name: "transparent", type: "boolean", defaultValue: "false", description: { es: "Omite el fondo en PNG o WebP. JPEG siempre conserva un fondo.", en: "Omits the background for PNG or WebP. JPEG always keeps a background." } },
];

export const commonLayerProperties: ApiProperty[] = [
  { name: "x", type: "number", description: { es: "Coordenada horizontal desde la esquina superior izquierda del lienzo.", en: "Horizontal coordinate from the canvas top-left corner." } },
  { name: "y", type: "number", description: { es: "Coordenada vertical desde la esquina superior izquierda del lienzo.", en: "Vertical coordinate from the canvas top-left corner." } },
  { name: "width", type: "number ≥ 1", description: { es: "Ancho lógico de la caja antes de aplicar scaleX.", en: "Logical box width before scaleX is applied." } },
  { name: "height", type: "number ≥ 1", description: { es: "Alto lógico de la caja antes de aplicar scaleY. En texto actúa como alto mínimo.", en: "Logical box height before scaleY. For text it acts as a minimum height." } },
  { name: "rotation", type: "number", defaultValue: "0", description: { es: "Rotación en grados. angle se acepta como alias.", en: "Rotation in degrees. angle is accepted as an alias." } },
  { name: "scaleX", type: "number", defaultValue: "1", description: { es: "Escala horizontal del objeto.", en: "Object horizontal scale." } },
  { name: "scaleY", type: "number", defaultValue: "1", description: { es: "Escala vertical del objeto.", en: "Object vertical scale." } },
  { name: "opacity", type: "number 0–1", defaultValue: "1", description: { es: "Opacidad total del objeto.", en: "Overall object opacity." } },
  { name: "zIndex", type: "integer", description: { es: "Orden de apilamiento; valores mayores se dibujan encima.", en: "Stacking order; larger values render on top." } },
  { name: "visible", type: "boolean", defaultValue: "true", description: { es: "Con false la capa no se incluye en el render.", en: "When false, the layer is omitted from the render." } },
  { name: "fill / color", type: "CSS color", description: { es: "Color de relleno. color es el alias recomendado para texto.", en: "Fill color. color is the recommended alias for text." } },
  { name: "stroke", type: "CSS color", description: { es: "Color del contorno.", en: "Outline color." } },
  { name: "strokeWidth", type: "number ≥ 0", defaultValue: "0", description: { es: "Grosor del contorno en píxeles lógicos.", en: "Outline width in logical pixels." } },
  { name: "shadowColor", type: "CSS color", description: { es: "Color de sombra para texto y formas.", en: "Shadow color for text and shapes." } },
  { name: "shadowBlur", type: "number ≥ 0", defaultValue: "0", description: { es: "Desenfoque de la sombra.", en: "Shadow blur radius." } },
  { name: "shadowOpacity", type: "number 0–1", defaultValue: "1", description: { es: "Opacidad de la sombra.", en: "Shadow opacity." } },
  { name: "shadowOffsetX", type: "number", defaultValue: "0", description: { es: "Desplazamiento horizontal de la sombra.", en: "Horizontal shadow offset." } },
  { name: "shadowOffsetY", type: "number", defaultValue: "0", description: { es: "Desplazamiento vertical de la sombra.", en: "Vertical shadow offset." } },
];

export const textLayerProperties: ApiProperty[] = [
  { name: "text", type: "string", description: { es: "Contenido que reemplaza el texto de la capa.", en: "Content that replaces the layer text." } },
  { name: "fontFamily", type: "string", description: { es: "Nombre exacto de una fuente disponible o subida en la cuenta.", en: "Exact name of an available font or one uploaded to the account." } },
  { name: "fontSize", type: "number > 0", description: { es: "Tamaño tipográfico en píxeles lógicos.", en: "Font size in logical pixels." } },
  { name: "fontWeight", type: "string | number", description: { es: "Peso como normal, bold o un valor numérico. 600 o más se renderiza en negrita.", en: "Weight such as normal, bold, or a numeric value. 600+ renders bold." } },
  { name: "fontStyle", type: '"normal" | "italic"', defaultValue: '"normal"', description: { es: "Estilo de la fuente.", en: "Font style." } },
  { name: "lineHeight", type: "number 0.1–20", description: { es: "Multiplicador del interlineado; por ejemplo 1.4.", en: "Line-height multiplier; for example 1.4." } },
  { name: "letterSpacing", type: "number", description: { es: "Espaciado directo entre caracteres en píxeles.", en: "Direct spacing between characters in pixels." } },
  { name: "charSpacing", type: "number", description: { es: "Espaciado compatible con Fabric en milésimas del tamaño de fuente.", en: "Fabric-compatible spacing in thousandths of the font size." } },
  { name: "textAlign", type: '"left" | "center" | "right" | "justify"', description: { es: "Alineación horizontal dentro del textbox.", en: "Horizontal alignment inside the textbox." } },
  { name: "verticalAlign", type: '"top" | "middle" | "bottom"', description: { es: "Alineación vertical del texto dentro de la caja. textVerticalAlign es un alias.", en: "Vertical text alignment inside the box. textVerticalAlign is an alias." } },
  { name: "textDecoration", type: '"" | "underline" | "line-through"', description: { es: "Decoración del texto.", en: "Text decoration." } },
  { name: "wrap", type: '"word" | "char" | "none"', defaultValue: '"word"', description: { es: "Método de salto de línea cuando el contenido alcanza width.", en: "Wrapping mode when content reaches width." } },
  { name: "ellipsis", type: "boolean", defaultValue: "false", description: { es: "Muestra puntos suspensivos cuando el contenido está limitado.", en: "Shows an ellipsis when constrained content overflows." } },
];

export const imageLayerProperties: ApiProperty[] = [
  { name: "image_url", type: "HTTPS URL", description: { es: "Nueva imagen para la capa. También se aceptan src, url e image.", en: "Replacement image for the layer. src, url, and image are also accepted." } },
  { name: "imageFit", type: '"cover" | "contain" | "fill"', defaultValue: '"cover"', description: { es: "Cómo encaja una imagen reemplazada dentro de width × height.", en: "How a replacement image fits within width × height." } },
  { name: "flipX", type: "boolean", defaultValue: "false", description: { es: "Voltea la imagen horizontalmente.", en: "Flips the image horizontally." } },
  { name: "flipY", type: "boolean", defaultValue: "false", description: { es: "Voltea la imagen verticalmente.", en: "Flips the image vertically." } },
  { name: "imageMaskShape", type: '"none" | "circle" | "star" | "triangle" | "diamond" | "pentagon" | "hexagon" | "octagon" | "quarter-circle" | "rounded-rectangle"', defaultValue: '"none"', description: { es: "Máscara geométrica aplicada a la imagen.", en: "Geometric mask applied to the image." } },
  { name: "imageCornerMode", type: '"px" | "%"', defaultValue: '"px"', description: { es: "Unidad usada por imageCornerRadius.", en: "Unit used by imageCornerRadius." } },
  { name: "imageCornerRadius", type: "number ≥ 0", defaultValue: "0", description: { es: "Redondeo de esquinas en píxeles o porcentaje.", en: "Corner rounding in pixels or percent." } },
  { name: "imageBorderColor", type: "CSS color", defaultValue: '"#000000"', description: { es: "Color uniforme del borde de imagen.", en: "Uniform image border color." } },
  { name: "imageBorderWidth", type: "number ≥ 0", defaultValue: "0", description: { es: "Grosor uniforme del borde.", en: "Uniform border width." } },
  { name: "imageShadowColor", type: "CSS color", defaultValue: '"#000000"', description: { es: "Color de la sombra de imagen.", en: "Image shadow color." } },
  { name: "imageShadowBlur", type: "number ≥ 0", defaultValue: "0", description: { es: "Desenfoque de la sombra de imagen.", en: "Image shadow blur." } },
  { name: "imageShadowOpacity", type: "number 0–1", defaultValue: "0.35", description: { es: "Opacidad de la sombra de imagen.", en: "Image shadow opacity." } },
  { name: "imageShadowOffsetX", type: "number", defaultValue: "0", description: { es: "Desplazamiento horizontal de la sombra.", en: "Horizontal image shadow offset." } },
  { name: "imageShadowOffsetY", type: "number", defaultValue: "0", description: { es: "Desplazamiento vertical de la sombra.", en: "Vertical image shadow offset." } },
  { name: "imagePreset", type: '"none" | "grayscale" | "sepia" | "cold" | "natural" | "warm"', defaultValue: '"none"', description: { es: "Preset de color aplicado antes de los ajustes manuales.", en: "Color preset applied before manual adjustments." } },
  { name: "imageBlur", type: "number", defaultValue: "0", description: { es: "Cantidad de desenfoque.", en: "Blur amount." } },
  { name: "imageBrightness", type: "number", defaultValue: "0", description: { es: "Ajuste de brillo; se recomienda -100 a 100.", en: "Brightness adjustment; -100 to 100 is recommended." } },
  { name: "imageTemperature", type: "number", defaultValue: "0", description: { es: "Temperatura de color; negativo enfría y positivo calienta.", en: "Color temperature; negative cools and positive warms." } },
  { name: "imageContrast", type: "number", defaultValue: "0", description: { es: "Ajuste de contraste.", en: "Contrast adjustment." } },
  { name: "imageSaturation", type: "number", defaultValue: "0", description: { es: "Ajuste de saturación.", en: "Saturation adjustment." } },
  { name: "imageVibrance", type: "number", defaultValue: "0", description: { es: "Ajuste suave de intensidad de color.", en: "Gentle color intensity adjustment." } },
  { name: "imageWhites", type: "number", defaultValue: "0", description: { es: "Ajuste de luces, combinado con brillo.", en: "Highlight adjustment, combined with brightness." } },
  { name: "imageBlacks", type: "number", defaultValue: "0", description: { es: "Ajuste de negros, combinado con contraste.", en: "Black-point adjustment, combined with contrast." } },
  { name: "imageBlendMode", type: '"source-over" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "color-dodge" | "color-burn"', defaultValue: '"source-over"', description: { es: "Modo de fusión con las capas inferiores.", en: "Blend mode with layers underneath." } },
];

export const shapeLayerProperties: ApiProperty[] = [
  { name: "fill / color", type: "CSS color", description: { es: "Color interior de la forma.", en: "Shape fill color." } },
  { name: "stroke", type: "CSS color", description: { es: "Color del contorno.", en: "Shape outline color." } },
  { name: "strokeWidth", type: "number ≥ 0", defaultValue: "0", description: { es: "Grosor del contorno.", en: "Shape outline width." } },
  { name: "cornerRadius", type: "number ≥ 0", defaultValue: "0", description: { es: "Radio de esquina para rectángulos. rx es un alias.", en: "Corner radius for rectangles. rx is an alias." } },
];

