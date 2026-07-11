export type ShapeCategory =
  | "basic"
  | "stars"
  | "arrows"
  | "symbols"
  | "frames"
  | "nature";

export type ShapeKind =
  | "circle"
  | "ellipse"
  | "square"
  | "rounded-square"
  | "triangle"
  | "triangle-down"
  | "diamond"
  | "pentagon"
  | "hexagon"
  | "octagon"
  | "trapezoid"
  | "parallelogram"
  | "star-4"
  | "star-5"
  | "star-6"
  | "star-8"
  | "burst"
  | "heart"
  | "plus"
  | "cross"
  | "check"
  | "moon"
  | "arrow-right"
  | "arrow-left"
  | "arrow-up"
  | "arrow-down"
  | "double-arrow"
  | "chevron"
  | "speech-bubble"
  | "cloud"
  | "lightning"
  | "map-pin"
  | "bookmark"
  | "shield"
  | "home"
  | "crown"
  | "semicircle"
  | "quarter-circle"
  | "capsule"
  | "teardrop"
  | "cylinder"
  | "cube"
  | "sparkle"
  | "sun"
  | "flower"
  | "clover"
  | "arrow-north-east"
  | "bent-arrow"
  | "u-turn"
  | "circular-arrow"
  | "rounded-speech"
  | "thought-bubble"
  | "tag"
  | "flag"
  | "ribbon"
  | "medal"
  | "lock"
  | "key"
  | "ring"
  | "square-frame"
  | "rounded-frame"
  | "hex-frame"
  | "leaf"
  | "tree"
  | "mountain"
  | "flame"
  | "butterfly"
  | "paw"
  | "wave"
  | "snowflake";

export interface ShapeDefinition {
  kind: ShapeKind;
  category: ShapeCategory;
  label: { en: string; es: string };
  path: string;
}

export const SHAPE_CATEGORIES: Array<{
  id: ShapeCategory;
  label: { en: string; es: string };
}> = [
  { id: "basic", label: { en: "Basic shapes", es: "Formas básicas" } },
  { id: "stars", label: { en: "Stars and badges", es: "Estrellas y símbolos" } },
  { id: "arrows", label: { en: "Arrows", es: "Flechas" } },
  { id: "symbols", label: { en: "Callouts and icons", es: "Globos e iconos" } },
  { id: "frames", label: { en: "Frames", es: "Marcos" } },
  { id: "nature", label: { en: "Nature", es: "Naturaleza" } },
];

// Every path uses the same 100 × 100 coordinate system. The same data powers
// both the sidebar preview and the editable Fabric object on the canvas.
export const SHAPE_LIBRARY: ShapeDefinition[] = [
  { kind: "circle", category: "basic", label: { en: "Circle", es: "Círculo" }, path: "M50 2 A48 48 0 1 1 49.99 2 Z" },
  { kind: "ellipse", category: "basic", label: { en: "Ellipse", es: "Elipse" }, path: "M50 18 A48 32 0 1 1 49.99 18 Z" },
  { kind: "square", category: "basic", label: { en: "Square", es: "Cuadrado" }, path: "M4 4 H96 V96 H4 Z" },
  { kind: "rounded-square", category: "basic", label: { en: "Rounded", es: "Redondeado" }, path: "M22 4 H78 Q96 4 96 22 V78 Q96 96 78 96 H22 Q4 96 4 78 V22 Q4 4 22 4 Z" },
  { kind: "triangle", category: "basic", label: { en: "Triangle", es: "Triángulo" }, path: "M50 3 L98 96 H2 Z" },
  { kind: "triangle-down", category: "basic", label: { en: "Down triangle", es: "Triángulo abajo" }, path: "M2 4 H98 L50 97 Z" },
  { kind: "diamond", category: "basic", label: { en: "Diamond", es: "Rombo" }, path: "M50 2 L98 50 L50 98 L2 50 Z" },
  { kind: "pentagon", category: "basic", label: { en: "Pentagon", es: "Pentágono" }, path: "M50 2 L98 37 L80 96 H20 L2 37 Z" },
  { kind: "hexagon", category: "basic", label: { en: "Hexagon", es: "Hexágono" }, path: "M26 3 H74 L98 50 L74 97 H26 L2 50 Z" },
  { kind: "octagon", category: "basic", label: { en: "Octagon", es: "Octágono" }, path: "M30 3 H70 L97 30 V70 L70 97 H30 L3 70 V30 Z" },
  { kind: "trapezoid", category: "basic", label: { en: "Trapezoid", es: "Trapecio" }, path: "M22 12 H78 L98 88 H2 Z" },
  { kind: "parallelogram", category: "basic", label: { en: "Parallelogram", es: "Paralelogramo" }, path: "M24 8 H98 L76 92 H2 Z" },
  { kind: "semicircle", category: "basic", label: { en: "Semicircle", es: "Semicírculo" }, path: "M2 92 A48 48 0 0 1 98 92 Z" },
  { kind: "quarter-circle", category: "basic", label: { en: "Quarter circle", es: "Cuarto de círculo" }, path: "M3 3 H97 A94 94 0 0 1 3 97 Z" },
  { kind: "capsule", category: "basic", label: { en: "Capsule", es: "Cápsula" }, path: "M25 18 H75 A32 32 0 0 1 75 82 H25 A32 32 0 0 1 25 18 Z" },
  { kind: "teardrop", category: "basic", label: { en: "Teardrop", es: "Gota" }, path: "M50 2 C50 2 91 48 91 70 C91 91 73 99 50 99 C27 99 9 91 9 70 C9 48 50 2 50 2 Z" },
  { kind: "cylinder", category: "basic", label: { en: "Cylinder", es: "Cilindro" }, path: "M8 18 C8 7 92 7 92 18 V82 C92 93 8 93 8 82 Z M8 18 C8 29 92 29 92 18 C92 7 8 7 8 18 Z" },
  { kind: "cube", category: "basic", label: { en: "Cube", es: "Cubo" }, path: "M50 2 L94 25 V75 L50 98 L6 75 V25 Z M50 2 V50 L94 25 M50 50 L6 25 M50 50 V98" },

  { kind: "star-4", category: "stars", label: { en: "4-point star", es: "Estrella de 4" }, path: "M50 2 L61 39 L98 50 L61 61 L50 98 L39 61 L2 50 L39 39 Z" },
  { kind: "star-5", category: "stars", label: { en: "5-point star", es: "Estrella de 5" }, path: "M50 2 L61 36 L97 36 L68 57 L79 93 L50 72 L21 93 L32 57 L3 36 L39 36 Z" },
  { kind: "star-6", category: "stars", label: { en: "6-point star", es: "Estrella de 6" }, path: "M50 2 L63 28 L92 25 L76 50 L92 75 L63 72 L50 98 L37 72 L8 75 L24 50 L8 25 L37 28 Z" },
  { kind: "star-8", category: "stars", label: { en: "8-point star", es: "Estrella de 8" }, path: "M50 2 L59 31 L79 9 L69 38 L98 28 L72 50 L98 72 L69 62 L79 91 L59 69 L50 98 L41 69 L21 91 L31 62 L2 72 L28 50 L2 28 L31 38 L21 9 L41 31 Z" },
  { kind: "burst", category: "stars", label: { en: "Sale burst", es: "Sello oferta" }, path: "M50 2 L60 15 L75 8 L78 24 L95 24 L88 40 L100 50 L88 60 L95 76 L78 76 L75 92 L60 85 L50 98 L40 85 L25 92 L22 76 L5 76 L12 60 L0 50 L12 40 L5 24 L22 24 L25 8 L40 15 Z" },
  { kind: "heart", category: "stars", label: { en: "Heart", es: "Corazón" }, path: "M50 92 C38 80 8 60 8 34 C8 13 34 5 50 25 C66 5 92 13 92 34 C92 60 62 80 50 92 Z" },
  { kind: "plus", category: "stars", label: { en: "Plus", es: "Más" }, path: "M36 4 H64 V36 H96 V64 H64 V96 H36 V64 H4 V36 H36 Z" },
  { kind: "cross", category: "stars", label: { en: "Cross", es: "Equis" }, path: "M20 3 L50 33 L80 3 L97 20 L67 50 L97 80 L80 97 L50 67 L20 97 L3 80 L33 50 L3 20 Z" },
  { kind: "check", category: "stars", label: { en: "Check", es: "Correcto" }, path: "M4 52 L19 37 L40 58 L81 10 L97 25 L41 91 Z" },
  { kind: "moon", category: "stars", label: { en: "Moon", es: "Luna" }, path: "M79 83 C39 104 4 75 12 36 C18 9 48 -4 72 10 C45 13 31 39 41 61 C48 78 64 85 79 83 Z" },
  { kind: "sparkle", category: "stars", label: { en: "Sparkle", es: "Destello" }, path: "M50 1 C55 29 61 40 99 50 C61 60 55 71 50 99 C45 71 39 60 1 50 C39 40 45 29 50 1 Z" },
  { kind: "sun", category: "stars", label: { en: "Sun", es: "Sol" }, path: "M50 1 L58 18 L72 6 L75 25 L94 19 L82 36 L99 43 L80 50 L99 57 L82 64 L94 81 L75 75 L72 94 L58 82 L50 99 L42 82 L28 94 L25 75 L6 81 L18 64 L1 57 L20 50 L1 43 L18 36 L6 19 L25 25 L28 6 L42 18 Z" },
  { kind: "flower", category: "stars", label: { en: "Flower", es: "Flor" }, path: "M50 35 C36 4 12 9 24 38 C-5 27 -7 56 24 59 C3 82 28 98 44 70 C51 101 79 92 65 64 C96 76 106 48 73 43 C98 21 74 4 56 32 Z" },
  { kind: "clover", category: "stars", label: { en: "Clover", es: "Trébol" }, path: "M50 45 C42 10 4 11 10 39 C13 52 26 56 38 53 C12 63 20 97 45 88 C52 85 55 77 55 68 C56 78 60 91 73 91 C98 91 100 58 73 52 C90 56 101 42 93 27 C82 7 56 18 50 45 Z" },

  { kind: "arrow-right", category: "arrows", label: { en: "Right arrow", es: "Flecha derecha" }, path: "M4 35 H58 V12 L98 50 L58 88 V65 H4 Z" },
  { kind: "arrow-left", category: "arrows", label: { en: "Left arrow", es: "Flecha izquierda" }, path: "M96 35 H42 V12 L2 50 L42 88 V65 H96 Z" },
  { kind: "arrow-up", category: "arrows", label: { en: "Up arrow", es: "Flecha arriba" }, path: "M35 96 V42 H12 L50 2 L88 42 H65 V96 Z" },
  { kind: "arrow-down", category: "arrows", label: { en: "Down arrow", es: "Flecha abajo" }, path: "M35 4 V58 H12 L50 98 L88 58 H65 V4 Z" },
  { kind: "double-arrow", category: "arrows", label: { en: "Double arrow", es: "Flecha doble" }, path: "M2 50 L26 20 V36 H74 V20 L98 50 L74 80 V64 H26 V80 Z" },
  { kind: "chevron", category: "arrows", label: { en: "Chevron", es: "Chevron" }, path: "M18 4 L68 4 L96 50 L68 96 L18 96 L47 50 Z" },
  { kind: "arrow-north-east", category: "arrows", label: { en: "Diagonal arrow", es: "Flecha diagonal" }, path: "M10 72 L56 26 H35 V4 H96 V65 H74 V43 L28 90 Z" },
  { kind: "bent-arrow", category: "arrows", label: { en: "Bent arrow", es: "Flecha doblada" }, path: "M7 91 V54 C7 30 22 17 45 17 H60 V3 L97 31 L60 59 V44 H45 C37 44 34 48 34 56 V91 Z" },
  { kind: "u-turn", category: "arrows", label: { en: "U-turn", es: "Retorno" }, path: "M17 96 V46 C17 19 34 5 57 5 C80 5 94 20 94 42 V55 H99 L80 79 L61 55 H67 V43 C67 34 63 29 56 29 C48 29 44 35 44 46 V96 Z" },
  { kind: "circular-arrow", category: "arrows", label: { en: "Circular arrow", es: "Flecha circular" }, path: "M83 17 V3 L99 25 L83 47 V34 C69 18 42 17 26 34 C9 52 17 82 40 91 C60 99 82 89 91 69 L70 60 C65 71 53 76 43 72 C32 68 28 55 35 45 C45 31 65 31 76 43 L76 17 Z" },

  { kind: "speech-bubble", category: "symbols", label: { en: "Speech bubble", es: "Globo de diálogo" }, path: "M13 8 H87 Q98 8 98 19 V67 Q98 78 87 78 H43 L20 98 L24 78 H13 Q2 78 2 67 V19 Q2 8 13 8 Z" },
  { kind: "cloud", category: "symbols", label: { en: "Cloud", es: "Nube" }, path: "M24 82 C8 82 2 70 7 57 C10 48 18 44 27 45 C29 25 47 15 63 23 C72 27 78 35 79 44 C92 44 99 53 98 64 C97 75 89 82 77 82 Z" },
  { kind: "lightning", category: "symbols", label: { en: "Lightning", es: "Rayo" }, path: "M57 2 L16 58 H43 L35 98 L84 39 H57 Z" },
  { kind: "map-pin", category: "symbols", label: { en: "Map pin", es: "Ubicación" }, path: "M50 2 C25 2 10 20 10 42 C10 66 34 88 50 99 C66 88 90 66 90 42 C90 20 75 2 50 2 Z M50 25 C60 25 67 32 67 42 C67 52 60 59 50 59 C40 59 33 52 33 42 C33 32 40 25 50 25 Z" },
  { kind: "bookmark", category: "symbols", label: { en: "Bookmark", es: "Marcador" }, path: "M19 3 H81 V98 L50 76 L19 98 Z" },
  { kind: "shield", category: "symbols", label: { en: "Shield", es: "Escudo" }, path: "M50 2 C65 13 78 16 94 17 V48 C94 72 76 90 50 99 C24 90 6 72 6 48 V17 C22 16 35 13 50 2 Z" },
  { kind: "home", category: "symbols", label: { en: "Home", es: "Casa" }, path: "M2 48 L50 5 L98 48 L87 60 L81 55 V96 H60 V68 H40 V96 H19 V55 L13 60 Z" },
  { kind: "crown", category: "symbols", label: { en: "Crown", es: "Corona" }, path: "M5 25 L30 47 L50 10 L70 47 L95 25 L84 82 H16 Z M16 88 H84 V98 H16 Z" },
  { kind: "rounded-speech", category: "symbols", label: { en: "Round callout", es: "Globo redondo" }, path: "M50 5 C77 5 97 21 97 43 C97 65 77 81 50 81 C44 81 37 80 32 78 L12 96 L17 71 C8 64 3 54 3 43 C3 21 23 5 50 5 Z" },
  { kind: "thought-bubble", category: "symbols", label: { en: "Thought bubble", es: "Globo de pensamiento" }, path: "M51 4 C75 4 95 18 95 37 C95 56 75 70 51 70 C27 70 7 56 7 37 C7 18 27 4 51 4 Z M29 75 A9 9 0 1 1 28.99 75 Z M13 91 A6 6 0 1 1 12.99 91 Z" },
  { kind: "tag", category: "symbols", label: { en: "Tag", es: "Etiqueta" }, path: "M4 15 V55 L45 96 L96 45 L56 4 H15 Q4 4 4 15 Z M27 18 A9 9 0 1 1 26.99 18 Z" },
  { kind: "flag", category: "symbols", label: { en: "Flag", es: "Bandera" }, path: "M12 3 H23 V10 H91 L76 34 L91 58 H23 V98 H12 Z" },
  { kind: "ribbon", category: "symbols", label: { en: "Ribbon", es: "Cinta" }, path: "M3 20 H23 V12 H77 V20 H97 L85 50 L97 80 H68 V88 H32 V80 H3 L15 50 Z M23 20 V69 H77 V20 Z" },
  { kind: "medal", category: "symbols", label: { en: "Medal", es: "Medalla" }, path: "M21 2 H45 L55 34 L65 2 H89 L69 42 C83 50 89 63 85 78 C80 97 57 104 41 95 C24 86 21 64 32 50 C36 45 40 42 45 40 Z M55 50 A22 22 0 1 1 54.99 50 Z" },
  { kind: "lock", category: "symbols", label: { en: "Lock", es: "Candado" }, path: "M22 43 V31 C22 -7 78 -7 78 31 V43 H91 V98 H9 V43 Z M37 43 H63 V31 C63 13 37 13 37 31 Z" },
  { kind: "key", category: "symbols", label: { en: "Key", es: "Llave" }, path: "M6 38 C6 17 23 3 43 7 C58 10 67 23 66 38 H98 V56 H88 V68 H74 V80 H59 L49 60 C30 68 6 57 6 38 Z M27 28 A11 11 0 1 1 26.99 28 Z" },

  { kind: "ring", category: "frames", label: { en: "Ring", es: "Aro" }, path: "M50 2 A48 48 0 1 1 49.99 2 Z M50 23 A27 27 0 1 0 50.01 23 Z" },
  { kind: "square-frame", category: "frames", label: { en: "Square frame", es: "Marco cuadrado" }, path: "M3 3 H97 V97 H3 Z M20 20 V80 H80 V20 Z" },
  { kind: "rounded-frame", category: "frames", label: { en: "Rounded frame", es: "Marco redondeado" }, path: "M21 3 H79 Q97 3 97 21 V79 Q97 97 79 97 H21 Q3 97 3 79 V21 Q3 3 21 3 Z M25 20 Q20 20 20 25 V75 Q20 80 25 80 H75 Q80 80 80 75 V25 Q80 20 75 20 Z" },
  { kind: "hex-frame", category: "frames", label: { en: "Hexagon frame", es: "Marco hexagonal" }, path: "M26 2 H74 L99 50 L74 98 H26 L1 50 Z M33 20 L17 50 L33 80 H67 L83 50 L67 20 Z" },

  { kind: "leaf", category: "nature", label: { en: "Leaf", es: "Hoja" }, path: "M6 94 C4 45 31 7 95 4 C93 63 62 94 6 94 Z M13 84 C34 61 54 42 84 18 C56 36 34 53 13 84 Z" },
  { kind: "tree", category: "nature", label: { en: "Tree", es: "Árbol" }, path: "M42 98 V73 H18 L31 55 H20 L38 32 H29 L50 3 L71 32 H62 L80 55 H69 L82 73 H58 V98 Z" },
  { kind: "mountain", category: "nature", label: { en: "Mountains", es: "Montañas" }, path: "M2 94 L35 30 L50 54 L66 7 L98 94 Z M35 30 L27 46 L35 43 L42 48 Z M66 7 L55 37 L66 31 L76 40 Z" },
  { kind: "flame", category: "nature", label: { en: "Flame", es: "Llama" }, path: "M54 2 C61 25 91 34 88 64 C86 86 70 98 50 98 C27 98 10 82 12 60 C14 42 27 34 31 18 C39 27 43 35 41 48 C53 38 58 23 54 2 Z M51 55 C62 67 63 79 51 88 C38 82 37 69 51 55 Z" },
  { kind: "butterfly", category: "nature", label: { en: "Butterfly", es: "Mariposa" }, path: "M47 45 C31 2 1 4 7 37 C9 51 22 56 40 54 C19 60 8 77 19 91 C30 103 44 82 49 61 C54 82 68 103 79 91 C90 77 79 60 58 54 C76 56 89 51 91 37 C97 4 67 2 52 45 Z" },
  { kind: "paw", category: "nature", label: { en: "Paw", es: "Huella" }, path: "M50 44 C69 44 84 61 84 78 C84 94 69 99 50 91 C31 99 16 94 16 78 C16 61 31 44 50 44 Z M18 16 C29 16 34 29 27 39 C20 49 6 43 6 30 C6 22 11 16 18 16 Z M42 4 C53 4 57 19 50 29 C43 39 30 31 31 18 C31 10 36 4 42 4 Z M63 5 C74 5 78 20 71 30 C64 40 51 32 52 19 C52 11 57 5 63 5 Z M84 18 C95 18 99 31 92 41 C85 51 71 45 72 32 C72 24 77 18 84 18 Z" },
  { kind: "wave", category: "nature", label: { en: "Wave", es: "Ola" }, path: "M2 63 C18 25 36 25 52 54 C66 79 80 73 98 39 V72 C80 99 61 101 44 75 C30 54 18 61 2 91 Z" },
  { kind: "snowflake", category: "nature", label: { en: "Snowflake", es: "Copo de nieve" }, path: "M44 2 H56 V24 L69 11 L77 19 L62 34 L79 44 H98 V56 H79 L62 66 L77 81 L69 89 L56 76 V98 H44 V76 L31 89 L23 81 L38 66 L21 56 H2 V44 H21 L38 34 L23 19 L31 11 L44 24 Z" },
];

export const getShapeDefinition = (kind: ShapeKind) =>
  SHAPE_LIBRARY.find((shape) => shape.kind === kind);
