"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Code2,
  Coins,
  FileImage,
  Layers3,
  LifeBuoy,
  MessageCircle,
  Search,
  Settings2,
  Sparkles,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

import { BrandLogo } from "@/components/brand-mark";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/lib/contexts/LanguageContext";

type LocaleText = { es: string; en: string };
type HelpArticle = {
  id: string;
  category: string;
  title: LocaleText;
  summary: LocaleText;
  steps: { title: LocaleText; body: LocaleText }[];
  note?: LocaleText;
};

const categories = [
  { id: "getting-started", icon: Sparkles, title: { es: "Primeros pasos", en: "Getting started" }, description: { es: "De tu cuenta al primer diseño exportado.", en: "From your account to your first exported design." } },
  { id: "editor", icon: Settings2, title: { es: "Uso del editor", en: "Using the editor" }, description: { es: "Lienzo, herramientas, guías y guardado.", en: "Canvas, tools, guides, and saving." } },
  { id: "content", icon: Layers3, title: { es: "Texto, imágenes, capas y exportación", en: "Text, images, layers, and export" }, description: { es: "Controla cada elemento de tu plantilla.", en: "Control every element in your template." } },
  { id: "plans", icon: Coins, title: { es: "Planes, créditos y equipos", en: "Plans, credits, and teams" }, description: { es: "Límites, consumo y colaboración.", en: "Limits, usage, and collaboration." } },
  { id: "integrations", icon: Zap, title: { es: "Integraciones", en: "Integrations" }, description: { es: "Playground, API y herramientas no-code.", en: "Playground, API, and no-code tools." } },
  { id: "troubleshooting", icon: Wrench, title: { es: "Solución de problemas", en: "Troubleshooting" }, description: { es: "Resuelve los errores más frecuentes.", en: "Solve the most common issues." } },
  { id: "faq", icon: CircleHelp, title: { es: "Preguntas frecuentes", en: "Frequently asked questions" }, description: { es: "Respuestas rápidas sobre el producto.", en: "Quick answers about the product." } },
] as const;

const articles: HelpArticle[] = [
  {
    id: "create-account",
    category: "getting-started",
    title: { es: "Crear y confirmar tu cuenta", en: "Create and confirm your account" },
    summary: { es: "Regístrate con correo o Google y activa tu espacio de trabajo.", en: "Sign up with email or Google and activate your workspace." },
    steps: [
      { title: { es: "Regístrate", en: "Sign up" }, body: { es: "Abre Crear cuenta, escribe tu nombre, correo y contraseña, o continúa con Google.", en: "Open Sign up, enter your name, email, and password, or continue with Google." } },
      { title: { es: "Confirma el correo", en: "Confirm your email" }, body: { es: "Si usaste correo y contraseña, abre el mensaje de Dynamic Canvas y pulsa Confirmar correo. Revisa Spam si no aparece.", en: "If you used email and password, open the Dynamic Canvas message and click Confirm email. Check Spam if it is missing." } },
      { title: { es: "Entra al dashboard", en: "Open the dashboard" }, body: { es: "Una cuenta nueva recibe 50 créditos de bienvenida y puede crear hasta 3 plantillas en el plan Gratis.", en: "A new account receives 50 welcome credits and can create up to 3 templates on the Free plan." } },
    ],
  },
  {
    id: "first-template",
    category: "getting-started",
    title: { es: "Crear tu primera plantilla", en: "Create your first template" },
    summary: { es: "Elige un tamaño, diseña y guarda una plantilla reutilizable.", en: "Choose a size, design, and save a reusable template." },
    steps: [
      { title: { es: "Pulsa Crear plantilla", en: "Click Create template" }, body: { es: "Selecciona una categoría y un formato predefinido, o indica un ancho y alto personalizados.", en: "Choose a category and preset format, or enter a custom width and height." } },
      { title: { es: "Construye el diseño", en: "Build the design" }, body: { es: "Agrega texto, imágenes, formas, iconos, QR o códigos de barras desde la barra lateral del editor.", en: "Add text, images, shapes, icons, QR codes, or barcodes from the editor sidebar." } },
      { title: { es: "Nombra y guarda", en: "Name and save" }, body: { es: "Cambia el nombre en la barra superior y pulsa Guardar. El guardado manual actualiza también la miniatura del dashboard.", en: "Change the name in the top bar and click Save. Manual saving also updates the dashboard thumbnail." } },
    ],
  },
  {
    id: "editor-basics",
    category: "editor",
    title: { es: "Recorrido por el editor", en: "Editor overview" },
    summary: { es: "Identifica la barra lateral, el lienzo, las propiedades y el panel Capas.", en: "Learn the sidebar, canvas, properties, and Layers panel." },
    steps: [
      { title: { es: "Barra lateral", en: "Sidebar" }, body: { es: "Design abre la galería; Image busca en Pixabay; Uploads contiene únicamente tus archivos; Text, Shapes y las demás herramientas crean elementos.", en: "Design opens the gallery; Image searches Pixabay; Uploads contains only your files; Text, Shapes, and the other tools create elements." } },
      { title: { es: "Barra de propiedades", en: "Properties bar" }, body: { es: "Aparece al seleccionar un objeto y cambia según sea texto, imagen o forma. Al deseleccionar, se oculta.", en: "It appears when an object is selected and changes for text, images, or shapes. It hides when you deselect." } },
      { title: { es: "Panel Capas", en: "Layers panel" }, body: { es: "La ventana flotante muestra el orden de los objetos, su nombre, visibilidad y bloqueo.", en: "The floating window shows object order, name, visibility, and lock state." } },
    ],
  },
  {
    id: "move-align-zoom",
    category: "editor",
    title: { es: "Mover, alinear y hacer zoom", en: "Move, align, and zoom" },
    summary: { es: "Usa guías magnéticas y controles de zoom sin alterar el diseño exportado.", en: "Use magnetic guides and zoom controls without changing the exported design." },
    steps: [
      { title: { es: "Mover y ajustar", en: "Move and snap" }, body: { es: "Arrastra un objeto. Las guías aparecen cuando sus bordes o su centro coinciden con el lienzo u otros elementos y crean un ajuste magnético suave.", en: "Drag an object. Guides appear when its edges or center align with the canvas or other elements and provide gentle snapping." } },
      { title: { es: "Alineación precisa", en: "Precise alignment" }, body: { es: "Usa las acciones de posición de la barra superior para centrar el objeto completo horizontal o verticalmente.", en: "Use the position actions in the top bar to center the entire object horizontally or vertically." } },
      { title: { es: "Zoom", en: "Zoom" }, body: { es: "El control inferior cambia únicamente la vista del editor. No modifica el tamaño ni la calidad del archivo exportado.", en: "The bottom control changes only the editor view. It does not change exported size or quality." } },
    ],
  },
  {
    id: "save-history-shortcuts",
    category: "editor",
    title: { es: "Guardar, deshacer y atajos", en: "Save, undo, and shortcuts" },
    summary: { es: "Trabaja con guardado manual e historial local del editor.", en: "Work with manual saving and the editor's local history." },
    steps: [
      { title: { es: "Guardar", en: "Save" }, body: { es: "Pulsa Guardar o Ctrl/Cmd + S. Cambiar el bloqueo u orden de una capa no debería guardar automáticamente el proyecto.", en: "Click Save or Ctrl/Cmd + S. Changing layer lock or order should not automatically save the project." } },
      { title: { es: "Historial", en: "History" }, body: { es: "Usa Ctrl/Cmd + Z para deshacer y Ctrl/Cmd + Shift + Z o Ctrl/Cmd + Y para rehacer.", en: "Use Ctrl/Cmd + Z to undo and Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y to redo." } },
      { title: { es: "Portapapeles", en: "Clipboard" }, body: { es: "Ctrl/Cmd + C copia la selección, Ctrl/Cmd + V la pega y Delete/Backspace elimina objetos desbloqueados.", en: "Ctrl/Cmd + C copies the selection, Ctrl/Cmd + V pastes it, and Delete/Backspace removes unlocked objects." } },
    ],
  },
  {
    id: "text-boxes",
    category: "content",
    title: { es: "Trabajar con cajas de texto", en: "Work with text boxes" },
    summary: { es: "Redimensiona la caja sin estirar las letras y controla el flujo del texto.", en: "Resize the box without stretching letters and control text flow." },
    steps: [
      { title: { es: "Editar", en: "Edit" }, body: { es: "Haz doble clic para entrar al modo de edición. El tamaño tipográfico permanece independiente del ancho y alto de la caja.", en: "Double-click to enter editing mode. Font size remains independent from the box width and height." } },
      { title: { es: "Wrapping", en: "Wrapping" }, body: { es: "El ancho del textbox es el límite: el texto salta por palabra a una línea nueva. Una cadena sin espacios puede cortarse por caracteres para no ensanchar la caja.", en: "Textbox width is the limit: text wraps by word. A string without spaces may break by character so the box does not expand." } },
      { title: { es: "Alineación interna", en: "Internal alignment" }, body: { es: "Alinea el texto a izquierda, centro o derecha y usa la alineación vertical para colocarlo arriba, en medio o abajo dentro de su propia caja.", en: "Align text left, center, or right and use vertical alignment to place it at the top, middle, or bottom inside its own box." } },
      { title: { es: "Espaciado", en: "Spacing" }, body: { es: "El menú de espaciado controla letter spacing y line height. Mantén el menú abierto mientras arrastras los sliders.", en: "The spacing menu controls letter spacing and line height. It stays open while you drag the sliders." } },
    ],
  },
  {
    id: "images",
    category: "content",
    title: { es: "Imágenes, recorte y efectos", en: "Images, cropping, and effects" },
    summary: { es: "Agrega, reemplaza, recorta y estiliza imágenes sin deformarlas.", en: "Add, replace, crop, and style images without distortion." },
    steps: [
      { title: { es: "Agregar", en: "Add" }, body: { es: "Busca imágenes en Image o sube archivos en Uploads. Al hacer clic, la imagen se añade con un tamaño visible y conserva su versión HD.", en: "Search images under Image or upload files under Uploads. Clicking adds the image at a visible size while preserving its HD version." } },
      { title: { es: "Recortar", en: "Crop" }, body: { es: "Pulsa Crop, mueve y escala la imagen dentro del marco, luego confirma con Listo. Cancelar conserva el recorte anterior.", en: "Click Crop, move and scale the image inside the frame, then confirm with Done. Cancel keeps the previous crop." } },
      { title: { es: "Máscaras y bordes", en: "Masks and borders" }, body: { es: "Aplica círculos, estrellas, polígonos o rectángulos redondeados. El borde se distribuye uniformemente y el redondeo admite píxeles o porcentaje.", en: "Apply circles, stars, polygons, or rounded rectangles. Borders are uniform and rounding supports pixels or percent." } },
      { title: { es: "Efectos", en: "Effects" }, body: { es: "Usa presets o ajusta blur, brillo, temperatura, contraste, saturación, vibrance, blancos, negros, sombra y blend mode.", en: "Use presets or adjust blur, brightness, temperature, contrast, saturation, vibrance, whites, blacks, shadow, and blend mode." } },
    ],
  },
  {
    id: "layers",
    category: "content",
    title: { es: "Ordenar, bloquear y nombrar capas", en: "Order, lock, and name layers" },
    summary: { es: "Organiza el diseño y prepara IDs claros para la API.", en: "Organize the design and prepare clear IDs for the API." },
    steps: [
      { title: { es: "Reordenar", en: "Reorder" }, body: { es: "Arrastra capas en la ventana flotante o usa traer al frente/enviar atrás. El cambio se refleja en vivo en el lienzo.", en: "Drag layers in the floating panel or use bring forward/send backward. The canvas updates live." } },
      { title: { es: "Bloquear", en: "Lock" }, body: { es: "Una capa bloqueada puede seleccionarse para mostrar la acción Desbloquear, pero no puede moverse, transformarse, duplicarse ni eliminarse.", en: "A locked layer can be selected to show Unlock, but it cannot be moved, transformed, duplicated, or deleted." } },
      { title: { es: "Renombrar", en: "Rename" }, body: { es: "Haz doble clic en el nombre de la capa. Usa nombres estables como headline o product_image: esos identificadores se usan en Playground y /api/render.", en: "Double-click the layer name. Use stable names such as headline or product_image: those identifiers are used in Playground and /api/render." } },
    ],
  },
  {
    id: "export",
    category: "content",
    title: { es: "Exportar en alta calidad", en: "Export in high quality" },
    summary: { es: "Elige formato y calidad sin depender del zoom del editor.", en: "Choose format and quality independently of editor zoom." },
    steps: [
      { title: { es: "Abre Exportar", en: "Open Export" }, body: { es: "Selecciona JPEG para fotografías compactas, PNG para transparencia o máxima fidelidad, y WebP para compresión moderna.", en: "Choose JPEG for compact photos, PNG for transparency or maximum fidelity, and WebP for modern compression." } },
      { title: { es: "Resolución", en: "Resolution" }, body: { es: "La salida se calcula desde las dimensiones reales de la plantilla. El zoom de 10%–300% solo cambia la vista del lienzo.", en: "Output is calculated from the template's actual dimensions. The 10%–300% zoom only changes the canvas view." } },
      { title: { es: "Selecciones", en: "Selections" }, body: { es: "Controles, guías, cajas de selección y menús flotantes nunca forman parte de la exportación ni de la miniatura guardada.", en: "Controls, guides, selection boxes, and floating menus are never included in exports or saved thumbnails." } },
    ],
  },
  {
    id: "credits-plans",
    category: "plans",
    title: { es: "Créditos y límites de cada plan", en: "Credits and plan limits" },
    summary: { es: "Entiende qué consume créditos y cuántas plantillas puedes crear.", en: "Understand what consumes credits and how many templates you can create." },
    steps: [
      { title: { es: "Plan Gratis", en: "Free plan" }, body: { es: "Incluye 50 créditos de bienvenida y hasta 3 plantillas. Cuando los créditos llegan a cero, debes contratar un plan para seguir renderizando.", en: "Includes 50 welcome credits and up to 3 templates. When credits reach zero, you must subscribe to continue rendering." } },
      { title: { es: "Planes pagos", en: "Paid plans" }, body: { es: "Creator incluye 1.000 créditos y 15 plantillas; Agency 5.000 y 100; Business 25.000 y plantillas ilimitadas, por mes.", en: "Creator includes 1,000 credits and 15 templates; Agency 5,000 and 100; Business 25,000 and unlimited templates, per month." } },
      { title: { es: "Consumo", en: "Usage" }, body: { es: "Cada render exitoso de la API o Playground consume 1 crédito. Un render que falla en el servidor devuelve automáticamente el crédito reservado.", en: "Each successful API or Playground render consumes 1 credit. A server-side failure automatically refunds the reserved credit." } },
    ],
  },
  {
    id: "teams-folders-fonts",
    category: "plans",
    title: { es: "Equipos, carpetas y fuentes personalizadas", en: "Teams, folders, and custom fonts" },
    summary: { es: "Funciones de organización y marca disponibles en planes pagos.", en: "Organization and branding features available on paid plans." },
    steps: [
      { title: { es: "Carpetas", en: "Folders" }, body: { es: "Creator, Agency y Business pueden crear carpetas, mover varias plantillas y agregar etiquetas.", en: "Creator, Agency, and Business can create folders, move multiple templates, and add tags." } },
      { title: { es: "Fuentes", en: "Fonts" }, body: { es: "Las fuentes incluidas están disponibles para todos. Subir archivos propios de fuente requiere un plan pago.", en: "Included fonts are available to everyone. Uploading your own font files requires a paid plan." } },
      { title: { es: "Equipo", en: "Team" }, body: { es: "Agency admite hasta 5 miembros y Business hasta 20. Desde Equipo puedes cambiar el nombre del espacio e invitar por correo.", en: "Agency supports up to 5 members and Business up to 20. From Team you can rename the workspace and invite by email." } },
    ],
  },
  {
    id: "playground",
    category: "integrations",
    title: { es: "Probar una plantilla en Playground", en: "Test a template in Playground" },
    summary: { es: "Valida capas y datos antes de conectar una automatización.", en: "Validate layers and data before connecting an automation." },
    steps: [
      { title: { es: "Selecciona", en: "Select" }, body: { es: "Abre Playground, elige una tarjeta de plantilla y revisa sus capas dinámicas.", en: "Open Playground, choose a template card, and review its dynamic layers." } },
      { title: { es: "Completa valores", en: "Fill values" }, body: { es: "Escribe textos y URLs de imagen. El código inferior se actualiza para reflejar exactamente esos datos.", en: "Enter text and image URLs. The code below updates to reflect those values exactly." } },
      { title: { es: "Genera", en: "Generate" }, body: { es: "Pulsa Generar render y revisa Preview y Response. La respuesta es la misma estructura que recibe n8n, Make o tu backend.", en: "Click Generate render and inspect Preview and Response. The response has the same structure received by n8n, Make, or your backend." } },
    ],
  },
  {
    id: "api-key-integration",
    category: "integrations",
    title: { es: "Conectar n8n, Make, Zapier o tu backend", en: "Connect n8n, Make, Zapier, or your backend" },
    summary: { es: "Envía una petición POST autenticada con un body JSON.", en: "Send an authenticated POST request with a JSON body." },
    steps: [
      { title: { es: "Crea la API Key", en: "Create the API Key" }, body: { es: "Copia tu clave desde API Key. Trátala como un secreto y no la incluyas en código público del navegador.", en: "Copy your key from API Key. Treat it as a secret and never include it in public browser code." } },
      { title: { es: "Configura HTTP POST", en: "Configure HTTP POST" }, body: { es: "Usa /api/render, Authorization: Bearer TU_API_KEY y Content-Type: application/json.", en: "Use /api/render, Authorization: Bearer YOUR_API_KEY, and Content-Type: application/json." } },
      { title: { es: "Envía los datos", en: "Send the data" }, body: { es: "El body contiene templateId, layers y opcionalmente format, scale y transparent. Consulta /docs para cada propiedad.", en: "The body contains templateId, layers, and optionally format, scale, and transparent. See /docs for every property." } },
    ],
    note: { es: "Usa Playground para copiar un ejemplo válido de tu plantilla antes de construir el flujo final.", en: "Use Playground to copy a valid example for your template before building the final workflow." },
  },
  {
    id: "images-not-loading",
    category: "troubleshooting",
    title: { es: "Una imagen no carga o no aparece en el render", en: "An image does not load or appear in the render" },
    summary: { es: "Comprueba acceso público, HTTPS, formato y permisos.", en: "Check public access, HTTPS, format, and permissions." },
    steps: [
      { title: { es: "Prueba la URL", en: "Test the URL" }, body: { es: "Ábrela en una ventana privada. Debe mostrar directamente el archivo sin iniciar sesión, cookies ni una página HTML intermedia.", en: "Open it in a private window. It must show the file directly without login, cookies, or an intermediate HTML page." } },
      { title: { es: "Usa HTTPS público", en: "Use public HTTPS" }, body: { es: "La API bloquea localhost, IPs privadas y URLs no seguras para evitar acceso a redes internas.", en: "The API blocks localhost, private IPs, and insecure URLs to prevent internal network access." } },
      { title: { es: "Vuelve a subir", en: "Upload again" }, body: { es: "Si falla un upload, verifica la sesión, el tipo de archivo y la conexión. Los archivos nuevos se guardan dentro de la carpeta privada del usuario.", en: "If an upload fails, verify the session, file type, and connection. New files are stored inside the user's private folder." } },
    ],
  },
  {
    id: "render-errors",
    category: "troubleshooting",
    title: { es: "Errores comunes de la API", en: "Common API errors" },
    summary: { es: "Interpreta 400, 401, 402, 403, 404 y 500.", en: "Understand 400, 401, 402, 403, 404, and 500." },
    steps: [
      { title: { es: "400 o 401", en: "400 or 401" }, body: { es: "400 indica JSON o campos inválidos. 401 indica que falta Bearer, la API Key no existe o fue revocada.", en: "400 means invalid JSON or fields. 401 means Bearer is missing, or the API Key is invalid or revoked." } },
      { title: { es: "402, 403 o 404", en: "402, 403, or 404" }, body: { es: "402 significa créditos agotados; 403, cuenta no disponible; 404, plantilla inexistente o perteneciente a otro usuario.", en: "402 means no credits; 403 means the account is unavailable; 404 means the template does not exist or belongs to another user." } },
      { title: { es: "500", en: "500" }, body: { es: "Es un fallo interno de render. El crédito reservado se devuelve. Reintenta una vez y, si persiste, comparte templateId y hora con soporte, nunca tu API Key.", en: "This is an internal rendering failure. The reserved credit is refunded. Retry once and, if it persists, share templateId and time with support, never your API Key." } },
    ],
  },
  {
    id: "fonts-layout",
    category: "troubleshooting",
    title: { es: "La fuente o posición cambia al renderizar", en: "Font or position changes when rendering" },
    summary: { es: "Evita diferencias entre editor, plantilla guardada y API.", en: "Avoid differences between the editor, saved template, and API." },
    steps: [
      { title: { es: "Guarda antes de probar", en: "Save before testing" }, body: { es: "Playground y la API leen la última versión guardada, no cambios que aún estén abiertos solo en el navegador.", en: "Playground and the API read the last saved version, not edits that are still only open in the browser." } },
      { title: { es: "Verifica la fuente", en: "Verify the font" }, body: { es: "Usa el nombre exacto mostrado en el editor. Si es una fuente personalizada, confirma que terminó de subirse.", en: "Use the exact name shown in the editor. For a custom font, confirm its upload completed." } },
      { title: { es: "Mantén la caja estable", en: "Keep the box stable" }, body: { es: "Define width, height, lineHeight y verticalAlign. Cuando el texto cambia, el motor conserva el centro visual si no envías una coordenada y explícita.", en: "Define width, height, lineHeight, and verticalAlign. When text changes, the renderer preserves its visual center unless you send an explicit y coordinate." } },
    ],
  },
  {
    id: "faq-credits",
    category: "faq",
    title: { es: "¿Qué acción consume un crédito?", en: "What action consumes one credit?" },
    summary: { es: "Un render final exitoso consume un crédito.", en: "One successful final render consumes one credit." },
    steps: [
      { title: { es: "Sí consume", en: "Consumes" }, body: { es: "Generar desde Playground o llamar correctamente a /api/render.", en: "Generating from Playground or successfully calling /api/render." } },
      { title: { es: "No consume", en: "Does not consume" }, body: { es: "Editar, guardar, abrir una plantilla, buscar imágenes, organizar capas o exportar manualmente desde el editor.", en: "Editing, saving, opening a template, searching images, organizing layers, or manually exporting from the editor." } },
    ],
  },
  {
    id: "faq-dynamic-layers",
    category: "faq",
    title: { es: "¿Qué es una capa dinámica?", en: "What is a dynamic layer?" },
    summary: { es: "Es un objeto cuyo contenido puede cambiarse con JSON.", en: "It is an object whose content can be changed with JSON." },
    steps: [
      { title: { es: "Identificador", en: "Identifier" }, body: { es: "El nombre visible de la capa se convierte en la clave usada dentro de layers.", en: "The visible layer name becomes the key used inside layers." } },
      { title: { es: "Propiedades", en: "Properties" }, body: { es: "Puedes cambiar texto, URL de imagen, color, tamaño, posición, opacidad, tipografía y muchas propiedades más sin editar la plantilla base.", en: "You can change text, image URL, color, size, position, opacity, typography, and many more properties without editing the base template." } },
    ],
  },
  {
    id: "faq-api-playground",
    category: "faq",
    title: { es: "¿Playground y API producen lo mismo?", en: "Do Playground and the API produce the same output?" },
    summary: { es: "Sí. Playground es una interfaz visual para la misma ruta de render.", en: "Yes. Playground is a visual interface for the same render route." },
    steps: [
      { title: { es: "Mismo contrato", en: "Same contract" }, body: { es: "Ambos usan templateId, layers, formato y escala, y devuelven imageUrl, dimensiones, tiempo y créditos restantes.", en: "Both use templateId, layers, format, and scale, and return imageUrl, dimensions, time, and remaining credits." } },
      { title: { es: "Uso recomendado", en: "Recommended use" }, body: { es: "Valida el resultado en Playground y luego copia el ejemplo hacia tu backend o herramienta no-code.", en: "Validate the result in Playground, then copy the example to your backend or no-code tool." } },
    ],
  },
  {
    id: "faq-privacy",
    category: "faq",
    title: { es: "¿Otros usuarios pueden ver mis uploads o plantillas?", en: "Can other users see my uploads or templates?" },
    summary: { es: "No. El contenido del editor se consulta por usuario autenticado.", en: "No. Editor content is queried by authenticated user." },
    steps: [
      { title: { es: "Contenido privado", en: "Private content" }, body: { es: "Uploads, plantillas, carpetas y renders del dashboard se filtran por la cuenta o equipo que los creó.", en: "Uploads, templates, folders, and dashboard renders are filtered by the account or team that created them." } },
      { title: { es: "URLs compartidas", en: "Shared URLs" }, body: { es: "Una URL pública de un render puede verla cualquier persona que la reciba. No compartas enlaces que contengan información sensible.", en: "Anyone who receives a public render URL can view it. Do not share links containing sensitive information." } },
    ],
  },
];

function ArticleVisual({ article, language }: { article: HelpArticle; language: "es" | "en" }) {
  if (article.category === "integrations") {
    const integrations = ["n8n", "make", "zapier", "bubble", "airtable"];
    return (
      <div className="grid min-h-[260px] grid-cols-2 place-items-center gap-4 rounded-[28px] border border-[#101426]/8 bg-[#fafafe] p-6 sm:grid-cols-5">
        {integrations.map((name) => (
          <div key={name} className="flex h-24 w-full items-center justify-center rounded-2xl border border-[#101426]/8 bg-white p-4 shadow-sm">
            <Image src={`/integrations/${name}.webp`} alt={name} width={145} height={56} className="max-h-12 w-auto object-contain" />
          </div>
        ))}
      </div>
    );
  }

  const src = article.id === "images" || article.id === "images-not-loading"
    ? "/pink-running-shoe-optimized.webp"
    : article.id === "export"
      ? `/variaciones/${language === "es" ? "spanish" : "English"}/1.png`
      : language === "es"
        ? "/landing/editor-workspace-es.webp"
        : "/landing/editor-workspace-en.webp";

  return (
    <div className="relative min-h-[280px] overflow-hidden rounded-[28px] border border-[#101426]/8 bg-[#f1effa] shadow-[0_24px_70px_rgba(16,20,38,.08)] sm:min-h-[420px]">
      <Image src={src} alt={article.title[language]} fill sizes="(max-width: 1024px) 100vw, 900px" className={article.id === "images" || article.id === "images-not-loading" ? "object-contain p-8" : "object-contain"} priority />
    </div>
  );
}

export default function HelpPage() {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [openArticle, setOpenArticle] = useState<string | null>(null);

  const copy = language === "es" ? {
    label: "CENTRO DE AYUDA",
    title: "¿Cómo podemos ayudarte?",
    subtitle: "Encuentra respuestas claras para configurar tu cuenta, diseñar plantillas y automatizar imágenes.",
    placeholder: "Buscar: exportar, créditos, capas, n8n...",
    all: "Todos los temas",
    results: "artículos encontrados",
    noResults: "No encontramos una respuesta con esos términos.",
    noResultsText: "Prueba con una palabra más general o habla con soporte.",
    docs: "Documentación API",
    dashboard: "Volver al dashboard",
    support: "Abrir chat de soporte",
    related: "¿Necesitas la referencia técnica?",
    relatedText: "Consulta parámetros, propiedades de capa, respuestas, errores y ejemplos completos de /api/render.",
    close: "Cerrar artículo",
    read: "Leer guía",
    step: "Paso",
  } : {
    label: "HELP CENTER",
    title: "How can we help?",
    subtitle: "Find clear answers for setting up your account, designing templates, and automating images.",
    placeholder: "Search: export, credits, layers, n8n...",
    all: "All topics",
    results: "articles found",
    noResults: "We could not find an answer with those terms.",
    noResultsText: "Try a broader word or contact support.",
    docs: "API Documentation",
    dashboard: "Back to dashboard",
    support: "Open support chat",
    related: "Need the technical reference?",
    relatedText: "See parameters, layer properties, responses, errors, and complete /api/render examples.",
    close: "Close article",
    read: "Read guide",
    step: "Step",
  };

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(language);
    return articles.filter((article) => {
      if (category !== "all" && article.category !== category) return false;
      if (!normalized) return true;
      const haystack = [article.title[language], article.summary[language], ...article.steps.flatMap((step) => [step.title[language], step.body[language]])].join(" ").toLocaleLowerCase(language);
      return haystack.includes(normalized);
    });
  }, [category, language, query]);

  const selectedArticle = articles.find((article) => article.id === openArticle) || null;
  const selectedCategory = selectedArticle ? categories.find((item) => item.id === selectedArticle.category) : null;

  const openSupport = () => {
    window.$crisp = window.$crisp || [];
    window.$crisp.push(["do", "chat:open"]);
  };

  const showArticle = (id: string | null) => {
    setOpenArticle(id);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  return (
    <div className="min-h-screen bg-[#f8f8fc] text-[#101426] selection:bg-[#d9ccff]">
      <header className="sticky top-0 z-40 border-b border-[#101426]/8 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3"><Link href="/" aria-label="Dynamic Canvas"><BrandLogo className="h-9" /></Link><span className="hidden h-7 border-l border-[#101426]/10 sm:block" /><span className="hidden text-xs font-black uppercase tracking-[.15em] text-[#5b35d5] sm:block">Help</span></div>
          <div className="flex items-center gap-2"><Link href="/docs" className="hidden rounded-xl px-3 py-2 text-sm font-bold text-[#101426]/55 transition hover:bg-[#eeeaff] hover:text-[#5b35d5] sm:block">{copy.docs}</Link><Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-[#101426] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#5b35d5]"><ArrowLeft className="size-4" /><span className="hidden sm:inline">{copy.dashboard}</span></Link><LanguageSwitcher /></div>
        </div>
      </header>

      <main>
        {selectedArticle ? (
          <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[280px_1fr]">
            <aside className="border-r border-[#101426]/8 bg-[#f4f4f8] px-5 py-8 lg:min-h-[calc(100vh-72px)] lg:px-7 lg:py-12">
              <button onClick={() => showArticle(null)} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-[#5b35d5] shadow-sm transition hover:bg-[#eeeaff]"><ArrowLeft className="size-4" />{selectedCategory?.title[language]}</button>
              <p className="mt-8 text-[10px] font-black uppercase tracking-[.17em] text-[#101426]/35">{language === "es" ? "Artículos relacionados" : "Related articles"}</p>
              <nav className="mt-3 space-y-1">{articles.filter((article) => article.category === selectedArticle.category).map((article) => <button key={article.id} onClick={() => showArticle(article.id)} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold leading-snug transition ${article.id === selectedArticle.id ? "bg-[#5b35d5] text-white" : "text-[#101426]/55 hover:bg-white hover:text-[#101426]"}`}>{article.title[language]}</button>)}</nav>
            </aside>
            <article className="min-w-0 bg-white px-5 py-10 sm:px-10 lg:px-14 lg:py-14">
              <div className="mx-auto max-w-4xl">
                <div className="text-xs font-bold text-[#5b35d5]">{language === "es" ? "Artículos sobre" : "Articles on"}: {selectedCategory?.title[language]}</div>
                <h1 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-5xl">{selectedArticle.title[language]}</h1>
                <p className="mt-5 text-lg font-medium leading-relaxed text-[#101426]/55">{selectedArticle.summary[language]}</p>
                <div className="mt-10"><ArticleVisual article={selectedArticle} language={language} /></div>
                <div className="mt-12 space-y-10">{selectedArticle.steps.map((step, index) => <section key={`${selectedArticle.id}-${index}`} className="scroll-mt-28"><div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-full bg-[#5b35d5] text-xs font-black text-white">{index + 1}</span><span className="h-px flex-1 bg-[#101426]/10" /></div><h2 className="mt-5 text-2xl font-black tracking-[-.025em] sm:text-3xl">{step.title[language]}</h2><p className="mt-3 text-base leading-8 text-[#101426]/65">{step.body[language]}</p></section>)}</div>
                {selectedArticle.note && <div className="mt-10 flex gap-3 rounded-2xl border border-[#8ac63f]/20 bg-[#efffcf] p-5"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#3b6517]" /><p className="text-sm font-semibold leading-relaxed text-[#29440f]">{selectedArticle.note[language]}</p></div>}
                <div className="mt-14 flex flex-col gap-5 border-y border-[#101426]/8 py-8 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-black">{language === "es" ? "¿Te sirvió este artículo?" : "Was this article helpful?"}</h2><p className="mt-1 text-sm text-[#101426]/45">{language === "es" ? "Si aún tienes dudas, nuestro equipo puede ayudarte." : "If you still have questions, our team can help."}</p></div><button onClick={openSupport} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#101426] px-5 py-3 text-sm font-black text-white transition hover:bg-[#5b35d5]">{copy.support}<MessageCircle className="size-4" /></button></div>
              </div>
            </article>
          </div>
        ) : (<>
        <section className="relative overflow-hidden border-b border-[#101426]/8 bg-white px-5 py-16 sm:px-8 lg:py-24">
          <div className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-[#d9ccff]/55 blur-3xl" /><div className="pointer-events-none absolute -bottom-36 right-0 size-96 rounded-full bg-[#c9ff5a]/30 blur-3xl" />
          <div className="relative mx-auto max-w-4xl text-center"><div className="inline-flex items-center gap-2 rounded-full border border-[#5b35d5]/15 bg-[#f4f1ff] px-3 py-1.5 text-[10px] font-black tracking-[.17em] text-[#5b35d5]"><LifeBuoy className="size-3.5" />{copy.label}</div><h1 className="mt-6 text-5xl font-black tracking-[-.055em] sm:text-6xl lg:text-7xl">{copy.title}</h1><p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-relaxed text-[#101426]/55 sm:text-lg">{copy.subtitle}</p><div className="mx-auto mt-9 flex max-w-2xl items-center gap-3 rounded-2xl border border-[#101426]/10 bg-white p-2 shadow-[0_18px_60px_rgba(40,32,95,.12)]"><Search className="ml-3 size-5 shrink-0 text-[#5b35d5]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.placeholder} className="h-12 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[#101426]/30" />{query && <button onClick={() => setQuery("")} className="mr-2 flex size-9 items-center justify-center rounded-xl text-[#101426]/35 hover:bg-[#f4f1ff] hover:text-[#5b35d5]" aria-label="Clear search"><X className="size-4" /></button>}</div></div>
        </section>

        <div className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8 lg:py-16">
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button onClick={() => setCategory("all")} className={`rounded-2xl border p-5 text-left transition ${category === "all" ? "border-[#5b35d5] bg-[#eeeaff] shadow-[0_12px_35px_rgba(91,53,213,.1)]" : "border-[#101426]/8 bg-white hover:-translate-y-0.5 hover:border-[#5b35d5]/30"}`}><BookOpen className="size-6 text-[#5b35d5]" /><h2 className="mt-5 font-black">{copy.all}</h2><p className="mt-1 text-xs text-[#101426]/45">{articles.length} {copy.results}</p></button>
            {categories.map((item) => { const Icon = item.icon; const total = articles.filter((article) => article.category === item.id).length; return <button key={item.id} onClick={() => setCategory(item.id)} className={`rounded-2xl border p-5 text-left transition ${category === item.id ? "border-[#5b35d5] bg-[#eeeaff] shadow-[0_12px_35px_rgba(91,53,213,.1)]" : "border-[#101426]/8 bg-white hover:-translate-y-0.5 hover:border-[#5b35d5]/30"}`}><Icon className="size-6 text-[#5b35d5]" /><h2 className="mt-5 font-black">{item.title[language]}</h2><p className="mt-1 text-xs leading-relaxed text-[#101426]/45">{item.description[language]}</p><p className="mt-3 text-[10px] font-black uppercase tracking-wider text-[#5b35d5]">{total} {copy.results}</p></button>; })}
          </section>

          <section className="mt-14 grid gap-10 lg:grid-cols-[1fr_310px]">
            <div><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.17em] text-[#5b35d5]">{category === "all" ? copy.all : categories.find((item) => item.id === category)?.title[language]}</p><h2 className="mt-2 text-3xl font-black tracking-[-.035em]">{filtered.length} {copy.results}</h2></div></div>
              {filtered.length > 0 ? <div className="overflow-hidden rounded-3xl border border-[#101426]/8 bg-white shadow-[0_18px_50px_rgba(16,20,38,.045)]">{filtered.map((article) => { const itemCategory = categories.find((item) => item.id === article.category); const Icon = itemCategory?.icon || CircleHelp; return <button key={article.id} onClick={() => showArticle(article.id)} className="group flex w-full items-start gap-4 border-b border-[#101426]/8 p-5 text-left transition last:border-0 hover:bg-[#faf9ff] sm:p-6"><span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#eeeaff] text-[#5b35d5] transition group-hover:bg-[#5b35d5] group-hover:text-white"><Icon className="size-5" /></span><span className="min-w-0 flex-1"><span className="block text-base font-black sm:text-lg">{article.title[language]}</span><span className="mt-1 block text-sm leading-relaxed text-[#101426]/50">{article.summary[language]}</span></span><span className="mt-2 flex size-9 shrink-0 items-center justify-center rounded-full border border-[#101426]/10 text-[#101426]/35 transition group-hover:border-[#5b35d5] group-hover:text-[#5b35d5]"><ArrowRight className="size-4" /></span></button>; })}</div> : <div className="rounded-3xl border border-dashed border-[#5b35d5]/25 bg-white px-6 py-20 text-center"><CircleHelp className="mx-auto size-10 text-[#5b35d5]/30" /><h3 className="mt-5 text-xl font-black">{copy.noResults}</h3><p className="mt-2 text-sm text-[#101426]/45">{copy.noResultsText}</p><button onClick={() => { setQuery(""); setCategory("all"); }} className="mt-6 rounded-full bg-[#101426] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#5b35d5]">{copy.all}</button></div>}
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start"><div className="rounded-3xl bg-[#101426] p-6 text-white shadow-[0_20px_55px_rgba(16,20,38,.15)]"><Code2 className="size-8 text-[#c9ff5a]" /><h2 className="mt-7 text-xl font-black">{copy.related}</h2><p className="mt-2 text-sm leading-relaxed text-white/55">{copy.relatedText}</p><Link href="/docs" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c9ff5a] px-5 py-2.5 text-sm font-black text-[#101426] transition hover:bg-white">{copy.docs}<ArrowRight className="size-4" /></Link></div><div className="rounded-3xl border border-[#5b35d5]/12 bg-[#f0ecff] p-6"><MessageCircle className="size-8 text-[#5b35d5]" /><h2 className="mt-7 text-xl font-black">{language === "es" ? "¿Aún necesitas ayuda?" : "Still need help?"}</h2><p className="mt-2 text-sm leading-relaxed text-[#101426]/50">{language === "es" ? "Habla con nuestro equipo desde cualquier página interna de Dynamic Canvas." : "Talk to our team from any internal Dynamic Canvas page."}</p><button onClick={openSupport} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#5b35d5] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#101426]">{copy.support}<MessageCircle className="size-4" /></button></div></aside>
          </section>
        </div>
        </>)}
      </main>
    </div>
  );
}
