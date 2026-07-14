"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Code2,
  Copy,
  ExternalLink,
  FileImage,
  Gauge,
  ImageIcon,
  KeyRound,
  Layers3,
  Menu,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { BrandLogo } from "@/components/brand-mark";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import {
  commonLayerProperties,
  imageLayerProperties,
  requestProperties,
  shapeLayerProperties,
  textLayerProperties,
  type ApiProperty,
} from "@/app/docs/api-reference-data";

const docsCopy = {
  es: {
    back: "Volver al inicio",
    dashboard: "Dashboard",
    badge: "DOCUMENTACIÓN API",
    title: "Construye imágenes dinámicas sin construir un motor de render.",
    subtitle: "Diseña plantillas visualmente, modifica sus capas con JSON y recibe una imagen HD lista para usar.",
    start: "Inicio rápido",
    playground: "Abrir Playground",
    live: "API activa",
    version: "Endpoint actual",
    nav: "En esta página",
    overview: "Introducción",
    quick: "Inicio rápido",
    auth: "Autenticación",
    endpoint: "Renderizar imagen",
    layers: "Capas e IDs",
    common: "Propiedades comunes",
    textReference: "Referencia de texto",
    imageReference: "Referencia de imagen",
    shapeReference: "Referencia de formas",
    output: "Calidad y respuesta",
    errors: "Errores",
    integrations: "Integraciones",
    limits: "Límites",
    overviewTitle: "Una API, dos equipos, un solo flujo",
    overviewText: "El equipo creativo controla la composición en el editor. Desarrollo solo envía los datos que cambian. Dynamic Canvas carga la plantilla, actualiza las capas y produce el render final.",
    creative: "Diseño controla",
    creativeText: "Composición, fuentes, tamaños, formas, imágenes y nombres de capa.",
    dev: "Desarrollo controla",
    devText: "Contenido, imágenes dinámicas, escala de salida y momento del render.",
    service: "Dynamic Canvas resuelve",
    serviceText: "Fuentes, layout, procesamiento, exportación HD y URL pública.",
    quickTitle: "Tu primer render en menos de cinco minutos",
    quickText: "Necesitas una plantilla guardada, su ID y una API Key creada desde el dashboard.",
    step1: "Crea y guarda una plantilla",
    step1Text: "Usa el editor, nombra claramente las capas dinámicas y pulsa Guardar.",
    step2: "Copia las credenciales",
    step2Text: "Obtén el ID desde Archivo → ID de plantilla y tu clave desde API Key.",
    step3: "Envía la petición",
    step3Text: "Usa el endpoint de tu instalación. El ejemplo usa una ruta relativa para el mismo dominio.",
    authTitle: "Autenticación Bearer",
    authText: "Todas las peticiones de render requieren una API Key válida en el encabezado Authorization.",
    securityTitle: "Mantén la clave en el servidor",
    securityText: "Nunca publiques la API Key en JavaScript del navegador, repositorios o aplicaciones móviles. Envíala desde tu backend o plataforma de automatización.",
    endpointTitle: "POST /api/render",
    endpointText: "Genera una imagen JPEG, PNG o WebP desde una plantilla existente. La salida usa escala 2× por defecto, limitada de forma segura para no superar aproximadamente 4096 px en el lado mayor.",
    field: "Campo",
    type: "Tipo",
    required: "Requerido",
    description: "Descripción",
    yes: "Sí",
    no: "No",
    templateDesc: "UUID de la plantilla guardada.",
    layersDesc: "Objeto cuyas claves son IDs o nombres de capa.",
    scaleDesc: "Multiplicador de resolución entre 1 y 3. Predeterminado: 2.",
    layersTitle: "Actualiza capas por ID",
    layersText: "El nombre visible en el panel Capas se serializa como identificador. Usa ese valor como clave dentro de layers.",
    textLayer: "Capa de texto",
    textLayerText: "Permite cambiar contenido, caja, tipografía, alineación, interlineado, espaciado, contorno, sombra y posición.",
    imageLayer: "Capa de imagen",
    imageLayerText: "Acepta image_url, src, url o image. Por seguridad, la URL debe usar HTTPS y no puede apuntar a redes privadas.",
    noteTitle: "Los IDs importan",
    noteText: "Si una clave no coincide con una capa, el render continúa pero esa actualización se ignora. Revisa los nombres en Playground antes de integrar.",
    outputTitle: "Render HD por defecto",
    outputText: "El endpoint produce JPEG por defecto y también admite PNG y WebP. pixelRatio indica la escala aplicada y width/height corresponden a los píxeles finales.",
    response: "Respuesta 200",
    errorsTitle: "Respuestas de error",
    errorsText: "Los errores devuelven JSON con una propiedad error legible. Registra el status HTTP y el mensaje para diagnosticar integraciones.",
    integrationsTitle: "Conecta cualquier flujo HTTP",
    integrationsText: "No necesitas un SDK. Usa fetch, cURL, Python, n8n, Make, Zapier o cualquier herramienta capaz de enviar JSON.",
    limitsTitle: "Límites por plan",
    limitsText: "Cada render consume un crédito. Cuando el saldo llega a cero, debes esperar la renovación mensual o cambiar de plan.",
    plan: "Plan",
    requests: "Plantillas",
    renders: "Créditos de render",
    free: "Gratis",
    pro: "Creator",
    enterprise: "Agency",
    unlimited: "Business",
    nextTitle: "¿Listo para probar tu plantilla?",
    nextText: "El Playground usa la misma API y te permite revisar IDs, payload y resultado antes de escribir código.",
    copied: "Copiado",
    copy: "Copiar",
  },
  en: {
    back: "Back to home",
    dashboard: "Dashboard",
    badge: "API DOCUMENTATION",
    title: "Build dynamic images without building a rendering engine.",
    subtitle: "Design templates visually, modify their layers with JSON and receive an HD image ready to use.",
    start: "Quick start",
    playground: "Open Playground",
    live: "API active",
    version: "Current endpoint",
    nav: "On this page",
    overview: "Introduction",
    quick: "Quick start",
    auth: "Authentication",
    endpoint: "Render image",
    layers: "Layers and IDs",
    common: "Common properties",
    textReference: "Text reference",
    imageReference: "Image reference",
    shapeReference: "Shape reference",
    output: "Quality and response",
    errors: "Errors",
    integrations: "Integrations",
    limits: "Limits",
    overviewTitle: "One API, two teams, one workflow",
    overviewText: "The creative team controls composition in the editor. Development only sends the data that changes. Dynamic Canvas loads the template, updates its layers and produces the final render.",
    creative: "Design controls",
    creativeText: "Composition, fonts, sizes, shapes, images and layer names.",
    dev: "Development controls",
    devText: "Content, dynamic images, output scale and render timing.",
    service: "Dynamic Canvas handles",
    serviceText: "Fonts, layout, processing, HD export and the public URL.",
    quickTitle: "Your first render in under five minutes",
    quickText: "You need a saved template, its ID and an API Key created from the dashboard.",
    step1: "Create and save a template",
    step1Text: "Use the editor, clearly name dynamic layers and click Save.",
    step2: "Copy your credentials",
    step2Text: "Get the ID from File → Template ID and your key from API Key.",
    step3: "Send the request",
    step3Text: "Use your installation endpoint. The example uses a relative route on the same domain.",
    authTitle: "Bearer authentication",
    authText: "Every render request requires a valid API Key in the Authorization header.",
    securityTitle: "Keep the key server-side",
    securityText: "Never publish the API Key in browser JavaScript, repositories or mobile apps. Send it from your backend or automation platform.",
    endpointTitle: "POST /api/render",
    endpointText: "Generates a JPEG, PNG, or WebP image from an existing template. Output defaults to 2× scale, safely capped so the longest side remains around 4096 px.",
    field: "Field",
    type: "Type",
    required: "Required",
    description: "Description",
    yes: "Yes",
    no: "No",
    templateDesc: "UUID of the saved template.",
    layersDesc: "Object whose keys are layer IDs or names.",
    scaleDesc: "Resolution multiplier from 1 to 3. Default: 2.",
    layersTitle: "Update layers by ID",
    layersText: "The visible name in the Layers panel is serialized as the identifier. Use that value as a key inside layers.",
    textLayer: "Text layer",
    textLayerText: "Supports content, box dimensions, typography, alignment, spacing, outline, shadow, and position.",
    imageLayer: "Image layer",
    imageLayerText: "Accepts image_url, src, url or image. For security, the URL must use HTTPS and cannot target private networks.",
    noteTitle: "IDs matter",
    noteText: "If a key does not match a layer, rendering continues but that update is ignored. Check names in Playground before integrating.",
    outputTitle: "HD rendering by default",
    outputText: "The endpoint produces JPEG by default and also supports PNG and WebP. pixelRatio reports the applied scale and width/height are the final pixel dimensions.",
    response: "200 response",
    errorsTitle: "Error responses",
    errorsText: "Errors return JSON with a readable error property. Log the HTTP status and message to diagnose integrations.",
    integrationsTitle: "Connect any HTTP workflow",
    integrationsText: "No SDK is required. Use fetch, cURL, Python, n8n, Make, Zapier or any tool capable of sending JSON.",
    limitsTitle: "Limits by plan",
    limitsText: "Each render consumes one credit. When the balance reaches zero, you must wait for the monthly renewal or change plans.",
    plan: "Plan",
    requests: "Templates",
    renders: "Render credits",
    free: "Free",
    pro: "Creator",
    enterprise: "Agency",
    unlimited: "Business",
    nextTitle: "Ready to test your template?",
    nextText: "Playground uses the same API and lets you inspect IDs, payload and output before writing code.",
    copied: "Copied",
    copy: "Copy",
  },
};

const navItems = [
  ["overview", "overview"],
  ["quick-start", "quick"],
  ["authentication", "auth"],
  ["render", "endpoint"],
  ["layers", "layers"],
  ["common-properties", "common"],
  ["text-properties", "textReference"],
  ["image-properties", "imageReference"],
  ["shape-properties", "shapeReference"],
  ["output", "output"],
  ["errors", "errors"],
  ["integrations", "integrations"],
  ["limits", "limits"],
] as const;

const curlCode = `curl -X POST "https://your-domain.com/api/render" \\
  -H "Authorization: Bearer $DYNAMIC_CANVAS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "templateId": "YOUR_TEMPLATE_UUID",
    "layers": {
      "headline": {
        "text": "Summer sale",
        "color": "#5b35d5",
        "fontSize": 72,
        "lineHeight": 1.1,
        "textAlign": "center",
        "width": 820,
        "height": 220
      },
      "product_image": {
        "image_url": "https://example.com/product.png",
        "imageFit": "cover",
        "imageCornerRadius": 32
      }
    },
    "format": "png",
    "scale": 2
  }'`;

const jsCode = `const response = await fetch("/api/render", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.DYNAMIC_CANVAS_API_KEY}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    templateId: "YOUR_TEMPLATE_UUID",
    layers: {
      headline: { text: "Summer sale", color: "#5b35d5" },
      product_image: { image_url: "https://example.com/product.png", imageFit: "cover" }
    },
    format: "png",
    scale: 2
  })
});

const render = await response.json();`;

const responseCode = `{
  "status": "success",
  "imageUrl": "https://.../renders/template-1720000000000.png",
  "width": 2160,
  "height": 2700,
  "pixelRatio": 2,
  "totalTimeMs": 1840,
  "creditsRemaining": 999
}`;

function CodeBlock({ code, label }: { code: string; label: string }) {
  const { language } = useLanguage();
  const c = docsCopy[language];
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#101426] bg-[#101426] shadow-[6px_6px_0_#d9ccff]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#ff6b57]" /><span className="size-2.5 rounded-full bg-[#ffd166]" /><span className="size-2.5 rounded-full bg-[#c9ff5a]" /><span className="ml-2 font-mono text-[10px] font-bold text-white/40">{label}</span></div>
        <button onClick={copyCode} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold text-white/50 transition hover:bg-white/10 hover:text-white">{copied ? <Check className="size-3" /> : <Copy className="size-3" />}{copied ? c.copied : c.copy}</button>
      </div>
      <pre className="overflow-x-auto p-5 text-[12px] leading-6 text-white/75"><code>{code}</code></pre>
    </div>
  );
}

function PropertyTable({ properties }: { properties: ApiProperty[] }) {
  const { language } = useLanguage();

  return (
    <div className="mt-7 overflow-x-auto rounded-[22px] border-2 border-[#101426] bg-white">
      <table className="w-full min-w-[760px] table-fixed">
        <thead className="bg-[#101426] text-left text-[10px] font-black uppercase tracking-wider text-white">
          <tr>
            <th className="w-[22%] px-4 py-3">{language === "es" ? "Propiedad" : "Property"}</th>
            <th className="w-[20%] px-4 py-3">{language === "es" ? "Tipo" : "Type"}</th>
            <th className="w-[15%] px-4 py-3">{language === "es" ? "Predeterminado" : "Default"}</th>
            <th className="px-4 py-3">{language === "es" ? "Descripción" : "Description"}</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property.name} className="border-t border-[#101426]/10 align-top">
              <td className="px-4 py-4"><code className="break-words font-bold text-[#5b35d5]">{property.name}</code>{property.required && <span className="ml-2 rounded bg-[#ffb7aa] px-1.5 py-0.5 text-[9px] font-black uppercase">{language === "es" ? "Requerido" : "Required"}</span>}</td>
              <td className="break-words px-4 py-4 font-mono text-xs text-[#101426]/65">{property.type}</td>
              <td className="px-4 py-4 font-mono text-xs text-[#101426]/50">{property.defaultValue || "—"}</td>
              <td className="px-4 py-4 text-sm leading-relaxed text-[#101426]/60">{property.description[language]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DocsPage() {
  const { language } = useLanguage();
  const c = docsCopy[language];
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActive(visible.target.id);
    }, { rootMargin: "-18% 0px -68% 0px", threshold: [0, 0.25, 0.75] });
    navItems.forEach(([id]) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setSidebarOpen(false);
  };

  return (
    <div className="docs-modern min-h-screen bg-[#fafafe] text-[#101426] selection:bg-[#d9ccff]">
      <header className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-[#101426]/10 bg-white/90 shadow-[0_8px_30px_rgba(16,20,38,.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button aria-label="Menu" onClick={() => setSidebarOpen(!sidebarOpen)} className="flex size-10 items-center justify-center rounded-xl border border-[#101426]/15 bg-white lg:hidden">{sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
            <Link href="/" aria-label="Dynamic Canvas"><BrandLogo className="h-9" /></Link>
            <span className="hidden h-7 border-l border-[#101426]/15 sm:block" /><span className="hidden text-xs font-black uppercase tracking-[0.15em] text-[#5b35d5] sm:block">Docs</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4"><Link href="/" className="hidden text-sm font-bold text-[#101426]/55 hover:text-[#5b35d5] sm:block">{c.back}</Link><Link href="/dashboard" className="rounded-full bg-[#101426] px-4 py-2 text-sm font-bold text-white hover:bg-[#5b35d5]">{c.dashboard}</Link><LanguageSwitcher /></div>
        </div>
      </header>

      {sidebarOpen && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-[#101426]/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed bottom-0 left-0 top-[72px] z-40 w-[292px] overflow-y-auto border-r border-[#101426]/10 bg-white p-5 text-[#101426] shadow-[12px_0_40px_rgba(16,20,38,.035)] transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-5 rounded-2xl border border-[#5b35d5]/12 bg-[#f4f1ff] p-4"><div className="flex items-center gap-2 text-xs font-extrabold text-[#5b35d5]"><span className="size-2 animate-pulse rounded-full bg-emerald-500" />{c.live}</div><div className="mt-2 font-mono text-[11px] text-[#101426]/45">POST /api/render</div></div>
        <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#101426]/35">{c.nav}</p>
        <nav className="space-y-1">{navItems.map(([id, key], index) => <button key={id} onClick={() => goTo(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${active === id ? "bg-[#eeeaff] font-bold text-[#5b35d5]" : "text-[#101426]/55 hover:bg-[#f6f5fb] hover:text-[#101426]"}`}><span className="font-mono text-[10px] opacity-50">{String(index + 1).padStart(2, "0")}</span>{c[key]}</button>)}</nav>
        <div className="mt-7 border-t border-[#101426]/10 pt-5"><Link href="/playground" className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#5b35d5] to-[#6f4bea] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_28px_rgba(91,53,213,.18)] hover:brightness-105">{c.playground}<ExternalLink className="size-4" /></Link></div>
      </aside>

      <main className="pt-[72px] lg:pl-[292px]">
        <section className="docs-hero-background border-b border-[#101426]/8 px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-5xl"><div className="inline-flex items-center gap-2 rounded-full border border-[#5b35d5]/20 bg-white px-3 py-1.5 text-[10px] font-black tracking-[0.16em] text-[#5b35d5]"><BookOpen className="size-3.5" />{c.badge}</div><h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.055em] sm:text-6xl lg:text-7xl">{c.title}</h1><p className="mt-7 max-w-2xl text-lg font-medium leading-relaxed text-[#101426]/60">{c.subtitle}</p><div className="mt-8 flex flex-wrap gap-3"><button onClick={() => goTo("quick-start")} className="flex items-center gap-2 rounded-full bg-[#5b35d5] px-6 py-3 font-bold text-white hover:bg-[#101426]">{c.start}<ArrowRight className="size-4" /></button><Link href="/playground" className="flex items-center gap-2 rounded-full border-2 border-[#101426] bg-white px-6 py-3 font-bold hover:border-[#5b35d5] hover:bg-[#eeeaff] hover:text-[#5b35d5]"><Terminal className="size-4" />{c.playground}</Link></div><div className="mt-9 flex flex-wrap gap-3 text-xs font-bold text-[#101426]/50"><span className="rounded-full bg-[#c9ff5a] px-3 py-1.5 text-[#101426]">{c.version}: /api/render</span><span className="rounded-full border border-[#101426]/15 bg-white px-3 py-1.5">Bearer Auth</span><span className="rounded-full border border-[#101426]/15 bg-white px-3 py-1.5">JPEG · PNG · WebP · 1×–3×</span></div></div>
        </section>

        <div className="mx-auto max-w-5xl space-y-24 px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <section id="overview" className="scroll-mt-28"><SectionHeading number="01" title={c.overviewTitle} text={c.overviewText} /><div className="mt-9 grid gap-4 md:grid-cols-3">{[[PaletteIcon, c.creative, c.creativeText, "bg-[#e9e5ff]"], [Code2, c.dev, c.devText, "bg-[#c9ff5a]"], [Server, c.service, c.serviceText, "bg-[#ffb7aa]"]].map(([Icon, title, text, bg]) => { const CardIcon = Icon as typeof Code2; return <article key={String(title)} className={`rounded-[22px] border-2 border-[#101426] p-5 ${String(bg)}`}><CardIcon className="size-8" /><h3 className="mt-8 text-lg font-black">{String(title)}</h3><p className="mt-2 text-sm leading-relaxed text-[#101426]/60">{String(text)}</p></article>; })}</div></section>

          <section id="quick-start" className="scroll-mt-28"><SectionHeading number="02" title={c.quickTitle} text={c.quickText} /><div className="mt-9 space-y-4">{[[Rocket, c.step1, c.step1Text], [KeyRound, c.step2, c.step2Text], [Zap, c.step3, c.step3Text]].map(([Icon, title, text], index) => { const StepIcon = Icon as typeof Rocket; return <div key={String(title)} className="grid gap-4 rounded-[22px] border-2 border-[#101426] bg-white p-5 sm:grid-cols-[56px_1fr]"><div className="flex size-12 items-center justify-center rounded-xl bg-[#e9e5ff]"><StepIcon className="size-6 text-[#5b35d5]" /></div><div><div className="text-[10px] font-black text-[#5b35d5]">STEP 0{index + 1}</div><h3 className="mt-1 text-lg font-black">{String(title)}</h3><p className="mt-1 text-sm leading-relaxed text-[#101426]/55">{String(text)}</p></div></div>; })}</div><div className="mt-7"><CodeBlock code={curlCode} label="curl" /></div></section>

          <section id="authentication" className="scroll-mt-28"><SectionHeading number="03" title={c.authTitle} text={c.authText} /><div className="mt-8 grid gap-5 lg:grid-cols-[1fr_.9fr]"><CodeBlock code={`Authorization: Bearer YOUR_API_KEY\nContent-Type: application/json`} label="headers" /><div className="rounded-[22px] border-2 border-[#101426] bg-[#ffd166] p-5"><ShieldCheck className="size-8" /><h3 className="mt-5 font-black">{c.securityTitle}</h3><p className="mt-2 text-sm leading-relaxed text-[#101426]/65">{c.securityText}</p></div></div></section>

          <section id="render" className="scroll-mt-28"><SectionHeading number="04" title={c.endpointTitle} text={c.endpointText} /><PropertyTable properties={requestProperties} /><div className="mt-7"><CodeBlock code={jsCode} label="JavaScript · server-side" /></div></section>

          <section id="layers" className="scroll-mt-28"><SectionHeading number="05" title={c.layersTitle} text={c.layersText} /><div className="mt-8 grid gap-5 md:grid-cols-2"><div className="rounded-[22px] border-2 border-[#101426] bg-[#e9e5ff] p-6"><Layers3 className="size-8 text-[#5b35d5]" /><h3 className="mt-6 text-xl font-black">{c.textLayer}</h3><p className="mt-2 text-sm text-[#101426]/60">{c.textLayerText}</p><code className="mt-5 block rounded-xl bg-white p-3 text-xs">{`layers["layer-id"] = { text: "..." }`}</code></div><div className="rounded-[22px] border-2 border-[#101426] bg-[#c9ff5a] p-6"><ImageIcon className="size-8" /><h3 className="mt-6 text-xl font-black">{c.imageLayer}</h3><p className="mt-2 text-sm text-[#101426]/60">{c.imageLayerText}</p><code className="mt-5 block rounded-xl bg-white p-3 text-xs">{`layers["layer-id"] = { image_url: "https://..." }`}</code></div></div><div className="mt-5 flex gap-3 rounded-2xl border-2 border-[#101426] bg-[#ffb7aa] p-5"><AlertTriangle className="mt-0.5 size-5 shrink-0" /><div><h3 className="font-black">{c.noteTitle}</h3><p className="mt-1 text-sm text-[#101426]/65">{c.noteText}</p></div></div></section>

          <section id="common-properties" className="scroll-mt-28"><SectionHeading number="06" title={c.common} text={language === "es" ? "Estas propiedades se pueden enviar en capas de texto, imagen y formas. Las coordenadas y medidas usan los píxeles lógicos de la plantilla, antes de scale." : "These properties can be sent for text, image, and shape layers. Coordinates and dimensions use template logical pixels before scale."} /><PropertyTable properties={commonLayerProperties} /></section>

          <section id="text-properties" className="scroll-mt-28"><SectionHeading number="07" title={c.textReference} text={language === "es" ? "Controla el contenido y la caja de texto por separado. width determina el wrapping; height es el alto mínimo y verticalAlign posiciona el texto dentro de esa caja." : "Control text content and its box separately. width determines wrapping; height is the minimum height and verticalAlign positions text inside that box."} /><PropertyTable properties={textLayerProperties} /><div className="mt-7"><CodeBlock label="text layer" code={`"headline": {\n  "text": "New collection",\n  "x": 120,\n  "y": 160,\n  "width": 840,\n  "height": 240,\n  "fontFamily": "Playfair Display",\n  "fontSize": 76,\n  "fontWeight": 700,\n  "lineHeight": 1.15,\n  "letterSpacing": 1,\n  "textAlign": "center",\n  "verticalAlign": "middle",\n  "color": "#ffffff"\n}`} /></div></section>

          <section id="image-properties" className="scroll-mt-28"><SectionHeading number="08" title={c.imageReference} text={language === "es" ? "Reemplaza imágenes sin deformarlas y controla ajuste, máscaras, bordes, sombras, color y modo de fusión desde la misma llamada." : "Replace images without distortion and control fit, masks, borders, shadows, color, and blend mode in the same request."} /><PropertyTable properties={imageLayerProperties} /><div className="mt-7"><CodeBlock label="image layer" code={`"hero_image": {\n  "image_url": "https://example.com/photo.jpg",\n  "x": 80,\n  "y": 80,\n  "width": 920,\n  "height": 920,\n  "imageFit": "cover",\n  "imageMaskShape": "rounded-rectangle",\n  "imageCornerRadius": 48,\n  "imageBorderColor": "#ffffff",\n  "imageBorderWidth": 8,\n  "imageShadowBlur": 24,\n  "imageShadowOpacity": 0.3,\n  "imagePreset": "warm",\n  "imageSaturation": 12\n}`} /></div></section>

          <section id="shape-properties" className="scroll-mt-28"><SectionHeading number="09" title={c.shapeReference} text={language === "es" ? "Las formas admitidas por el render son rectángulo, círculo, triángulo y diamante. También reciben todas las propiedades comunes." : "Rendered shape types are rectangle, circle, triangle, and diamond. They also accept every common property."} /><PropertyTable properties={shapeLayerProperties} /></section>

          <section id="output" className="scroll-mt-28"><SectionHeading number="10" title={c.outputTitle} text={c.outputText} /><div className="mt-8 grid gap-5 lg:grid-cols-[.65fr_1.35fr]"><div className="rounded-[22px] border-2 border-[#101426] bg-[#5b35d5] p-6 text-white"><Gauge className="size-9 text-[#c9ff5a]" /><div className="mt-8 text-5xl font-black">2×</div><p className="mt-2 text-sm text-white/60">Default pixel ratio</p><div className="mt-6 border-t border-white/15 pt-4 text-xs text-white/50">JPEG · PNG · WebP · safe cap ≈ 4096 px</div></div><CodeBlock code={responseCode} label={c.response} /></div></section>

          <section id="errors" className="scroll-mt-28"><SectionHeading number="11" title={c.errorsTitle} text={c.errorsText} /><div className="mt-8 overflow-hidden rounded-[22px] border-2 border-[#101426] bg-white">{[["400", "Invalid JSON · Missing templateId · Invalid layers or format"], ["401", "Missing/Invalid Authorization header · Invalid API key"], ["402", "Credits exhausted"], ["403", "User account not found"], ["404", "Template not found or not owned by this account"], ["500", "Internal render error · reserved credit is refunded"]].map(([status, message]) => <div key={status} className="flex items-center gap-4 border-b border-[#101426]/10 px-5 py-4 last:border-0"><span className={`rounded-lg px-2.5 py-1 font-mono text-xs font-black ${status === "500" ? "bg-[#ffb7aa]" : status === "401" || status === "402" ? "bg-[#ffd166]" : "bg-[#e9e5ff]"}`}>{status}</span><code className="text-sm text-[#101426]/65">{message}</code></div>)}</div></section>

          <section id="integrations" className="scroll-mt-28"><SectionHeading number="12" title={c.integrationsTitle} text={c.integrationsText} /><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{["fetch", "cURL", "Python", "n8n", "Make", "Zapier"].map((name, index) => <div key={name} className={`flex h-24 items-center justify-center rounded-2xl border-2 border-[#101426] text-sm font-black ${index % 3 === 0 ? "bg-[#c9ff5a]" : index % 3 === 1 ? "bg-[#e9e5ff]" : "bg-white"}`}>{name}</div>)}</div></section>

          <section id="limits" className="scroll-mt-28"><SectionHeading number="13" title={c.limitsTitle} text={c.limitsText} /><div className="mt-8 overflow-x-auto rounded-[22px] border-2 border-[#101426] bg-white"><table className="w-full min-w-[560px]"><thead className="bg-[#101426] text-white"><tr><th className="px-5 py-4 text-left text-xs font-black uppercase">{c.plan}</th><th className="px-5 py-4 text-left text-xs font-black uppercase">{c.requests}</th><th className="px-5 py-4 text-left text-xs font-black uppercase">{c.renders}</th></tr></thead><tbody>{[[c.free, "3", language === "es" ? "50 créditos de bienvenida" : "50 welcome credits"], [c.pro, "15", language === "es" ? "1.000 créditos / mes" : "1,000 credits / month"], [c.enterprise, "100", language === "es" ? "5.000 créditos / mes" : "5,000 credits / month"], [c.unlimited, language === "es" ? "Ilimitadas" : "Unlimited", language === "es" ? "25.000 créditos / mes" : "25,000 credits / month"]].map((row, index) => <tr key={row[0]} className={index === 2 ? "bg-[#c9ff5a]" : "border-t border-[#101426]/10"}><td className="px-5 py-4 font-black">{row[0]}</td><td className="px-5 py-4">{row[1]}</td><td className="px-5 py-4">{row[2]}</td></tr>)}</tbody></table></div></section>

          <section className="rounded-[30px] border-2 border-[#101426] bg-[#c9ff5a] p-7 shadow-[8px_8px_0_#101426] sm:p-10"><Sparkles className="size-9 text-[#5b35d5]" /><h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">{c.nextTitle}</h2><p className="mt-3 max-w-2xl text-[#101426]/60">{c.nextText}</p><Link href="/playground" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#5b35d5] px-6 py-3 font-bold text-white hover:bg-[#101426]">{c.playground}<ArrowRight className="size-4" /></Link></section>
        </div>
      </main>
    </div>
  );
}

const PaletteIcon = Sparkles;

function SectionHeading({ number, title, text }: { number: string; title: string; text: string }) {
  return <div><div className="flex items-center gap-3"><span className="rounded-full bg-[#5b35d5] px-3 py-1 font-mono text-[10px] font-black text-white">{number}</span><span className="h-px flex-1 bg-[#101426]/10" /></div><h2 className="mt-5 text-3xl font-black tracking-[-0.035em] sm:text-5xl">{title}</h2><p className="mt-4 max-w-3xl text-base leading-relaxed text-[#101426]/60 sm:text-lg">{text}</p></div>;
}
