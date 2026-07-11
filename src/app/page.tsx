"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  Bot,
  Braces,
  Check,
  ChevronRight,
  CirclePlay,
  Code2,
  FileImage,
  Gauge,
  ImageIcon,
  Infinity as InfinityIcon,
  Layers3,
  MousePointer2,
  Palette,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
  WandSparkles,
  Zap,
} from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { BrandMark } from "@/components/brand-mark";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const copy = {
  es: {
    navProduct: "Producto",
    navHow: "Cómo funciona",
    navTemplates: "Plantillas",
    navPlans: "Planes",
    navDocs: "Documentación",
    login: "Ingresar",
    start: "Crear gratis",
    eyebrow: "Editor visual + API de imágenes",
    heroA: "Diseña una vez.",
    heroB: "Genera sin límites.",
    heroText:
      "Crea plantillas profesionales en un editor visual y conviértelas en miles de imágenes personalizadas con una sola llamada a la API.",
    heroPrimary: "Empieza a diseñar",
    heroSecondary: "Ver Playground",
    noCard: "Sin tarjeta de crédito",
    freeRenders: "100 renders gratis al mes",
    hdExport: "Exportación HD",
    live: "Render completado",
    renderTime: "respuesta lista",
    trusted: "Construido para equipos que producen contenido a escala",
    metricTemplates: "Plantillas dinámicas",
    metricApi: "API lista para producción",
    metricFormats: "PNG · JPG · SVG",
    metricRenders: "renders generados",
    problemKicker: "Un sistema, no otra tarea manual",
    problemTitle: "Del diseño a la automatización sin perder calidad.",
    problemText:
      "Marketing necesita velocidad. Diseño necesita control. Desarrollo necesita una API confiable. Dynamic Canvas les da a todos el mismo flujo.",
    designTitle: "Diseña visualmente",
    designText: "Editor Fabric preciso con capas, guías, tipografías, formas y exportación en alta resolución.",
    dynamicTitle: "Convierte en plantilla",
    dynamicText: "Nombra los elementos que cambiarán: textos, imágenes, colores, precios o cualquier dato.",
    apiTitle: "Genera por API",
    apiText: "Envía datos desde tu app, CRM o automatización y recibe la imagen final en segundos.",
    bentoKicker: "Todo lo indispensable",
    bentoTitle: "Una plataforma creativa que también habla código.",
    editorTitle: "Editor visual de verdad",
    editorText: "Capas, snapping magnético, controles contextuales, fuentes, Pixabay, QR, códigos de barra y más de 70 formas.",
    apiCardTitle: "API simple, resultado HD",
    apiCardText: "Un endpoint claro para modificar plantillas y renderizar imágenes de alta resolución.",
    playgroundTitle: "Prueba antes de integrar",
    playgroundText: "Selecciona una plantilla, cambia el JSON y valida la respuesta desde el Playground.",
    automationTitle: "Conecta tu flujo",
    automationText: "Úsalo con n8n, Make, Zapier o cualquier backend mediante HTTP.",
    formatsTitle: "Listo para publicar",
    formatsText: "Exporta PNG, JPG o SVG para redes, anuncios, e-commerce y documentos.",
    galleryKicker: "Un template. Cientos de variaciones.",
    galleryTitle: "Tu marca consistente, incluso cuando todo cambia.",
    galleryText:
      "Actualiza títulos, ofertas, imágenes y colores sin reconstruir el diseño. Cada render conserva la composición aprobada.",
    swapLabel: "Datos dinámicos",
    flowKicker: "Tan simple como 1, 2, 3",
    flowTitle: "Publica tu primer flujo en minutos.",
    step1: "Crea la plantilla",
    step1Text: "Diseña desde cero o usa una base y define sus capas editables.",
    step2: "Envía tus datos",
    step2Text: "Haz una petición con el ID de plantilla y los valores a reemplazar.",
    step3: "Recibe la imagen",
    step3Text: "Obtén un render listo para publicar, guardar o enviar automáticamente.",
    useKicker: "Hecho para volumen",
    useTitle: "Una herramienta, muchos motores de crecimiento.",
    uses: [
      ["E-commerce", "Ofertas, fichas de producto y campañas personalizadas."],
      ["Social media", "Publicaciones consistentes para múltiples cuentas y formatos."],
      ["Inmobiliarias", "Piezas automáticas para cada propiedad y asesor."],
      ["Restaurantes", "Menús, promociones y precios que cambian sin rediseñar."],
      ["SaaS", "Reportes, certificados e imágenes generadas dentro de tu producto."],
      ["Agencias", "Más entregables por cliente sin multiplicar el trabajo manual."],
    ],
    devKicker: "Amigable para desarrollo",
    devTitle: "De JSON a imagen. Sin pelear con un canvas en el servidor.",
    devText:
      "Tu equipo creativo controla la plantilla. Tu aplicación solo envía los datos. Nosotros resolvemos el render.",
    viewDocs: "Explorar documentación",
    plansKicker: "Crece a tu ritmo",
    plansTitle: "Empieza gratis. Escala cuando el volumen lo pida.",
    free: "Gratis",
    pro: "Pro",
    scale: "Enterprise",
    monthly: "renders / mes",
    current: "Para empezar",
    popular: "Más elegido",
    custom: "Volumen personalizado",
    freeItems: ["100 renders al mes", "10 solicitudes por minuto", "Editor y Playground", "Exportación HD"],
    proItems: ["5.000 renders al mes", "60 solicitudes por minuto", "Automatizaciones", "Soporte prioritario"],
    scaleItems: ["Renders ilimitados", "500 solicitudes por minuto", "Límites y soporte a medida", "Uso para equipos"],
    planAction: "Comenzar ahora",
    contactAction: "Hablar con nosotros",
    ctaTitle: "Deja de diseñar la misma pieza una y otra vez.",
    ctaText: "Crea tu primera plantilla dinámica y genera 100 imágenes gratis este mes.",
    ctaButton: "Crear mi cuenta gratis",
    footerText: "Infraestructura creativa para equipos que necesitan diseñar, automatizar y crecer.",
    product: "Producto",
    resources: "Recursos",
    legal: "Legal",
    privacy: "Privacidad",
    terms: "Términos",
    security: "Seguridad",
    rights: "Todos los derechos reservados.",
  },
  en: {
    navProduct: "Product",
    navHow: "How it works",
    navTemplates: "Templates",
    navPlans: "Plans",
    navDocs: "Documentation",
    login: "Log in",
    start: "Start free",
    eyebrow: "Visual editor + image API",
    heroA: "Design once.",
    heroB: "Generate without limits.",
    heroText: "Build professional templates visually and turn them into thousands of personalized images with a single API call.",
    heroPrimary: "Start designing",
    heroSecondary: "View Playground",
    noCard: "No credit card",
    freeRenders: "100 free renders per month",
    hdExport: "HD export",
    live: "Render completed",
    renderTime: "response ready",
    trusted: "Built for teams producing content at scale",
    metricTemplates: "Dynamic templates",
    metricApi: "Production-ready API",
    metricFormats: "PNG · JPG · SVG",
    metricRenders: "renders generated",
    problemKicker: "A system, not another manual task",
    problemTitle: "From design to automation without losing quality.",
    problemText: "Marketing needs speed. Design needs control. Development needs a reliable API. Dynamic Canvas gives everyone the same workflow.",
    designTitle: "Design visually",
    designText: "Precise Fabric editor with layers, guides, fonts, shapes and high-resolution export.",
    dynamicTitle: "Turn it into a template",
    dynamicText: "Name the elements that change: text, images, colors, prices or any other data.",
    apiTitle: "Generate via API",
    apiText: "Send data from your app, CRM or automation and receive the final image in seconds.",
    bentoKicker: "Everything you need",
    bentoTitle: "A creative platform that also speaks code.",
    editorTitle: "A real visual editor",
    editorText: "Layers, magnetic snapping, contextual controls, fonts, Pixabay, QR, barcodes and 70+ shapes.",
    apiCardTitle: "Simple API, HD output",
    apiCardText: "One clear endpoint to modify templates and render high-resolution images.",
    playgroundTitle: "Test before integrating",
    playgroundText: "Select a template, change the JSON and validate the response in the Playground.",
    automationTitle: "Connect your workflow",
    automationText: "Use it with n8n, Make, Zapier or any backend over HTTP.",
    formatsTitle: "Ready to publish",
    formatsText: "Export PNG, JPG or SVG for social, ads, e-commerce and documents.",
    galleryKicker: "One template. Hundreds of variations.",
    galleryTitle: "Your brand stays consistent, even when everything changes.",
    galleryText: "Update headlines, offers, images and colors without rebuilding the design. Every render keeps the approved composition.",
    swapLabel: "Dynamic data",
    flowKicker: "As simple as 1, 2, 3",
    flowTitle: "Ship your first workflow in minutes.",
    step1: "Create the template",
    step1Text: "Design from scratch or use a base and define its editable layers.",
    step2: "Send your data",
    step2Text: "Request the template ID with the values you want to replace.",
    step3: "Receive the image",
    step3Text: "Get a render ready to publish, store or send automatically.",
    useKicker: "Built for volume",
    useTitle: "One tool, many growth engines.",
    uses: [
      ["E-commerce", "Offers, product cards and personalized campaigns."],
      ["Social media", "Consistent posts for multiple accounts and formats."],
      ["Real estate", "Automatic assets for every property and agent."],
      ["Restaurants", "Menus, promotions and prices that change without redesigning."],
      ["SaaS", "Reports, certificates and images generated inside your product."],
      ["Agencies", "More deliverables per client without multiplying manual work."],
    ],
    devKicker: "Developer friendly",
    devTitle: "From JSON to image. No server-side canvas wrestling.",
    devText: "Your creative team owns the template. Your application only sends data. We handle the render.",
    viewDocs: "Explore documentation",
    plansKicker: "Grow at your pace",
    plansTitle: "Start free. Scale when volume demands it.",
    free: "Free",
    pro: "Pro",
    scale: "Enterprise",
    monthly: "renders / month",
    current: "For starters",
    popular: "Most popular",
    custom: "Custom volume",
    freeItems: ["100 renders per month", "10 requests per minute", "Editor and Playground", "HD export"],
    proItems: ["5,000 renders per month", "60 requests per minute", "Automations", "Priority support"],
    scaleItems: ["Unlimited renders", "500 requests per minute", "Custom limits and support", "Team usage"],
    planAction: "Get started",
    contactAction: "Talk to us",
    ctaTitle: "Stop designing the same asset again and again.",
    ctaText: "Create your first dynamic template and generate 100 images free this month.",
    ctaButton: "Create my free account",
    footerText: "Creative infrastructure for teams that need to design, automate and grow.",
    product: "Product",
    resources: "Resources",
    legal: "Legal",
    privacy: "Privacy",
    terms: "Terms",
    security: "Security",
    rights: "All rights reserved.",
  },
};

const templates = [
  { src: "/flash_sale.png", label: "Flash sale", color: "bg-[#ff6b57]", rotate: "-rotate-3" },
  { src: "/travel.png", label: "Travel", color: "bg-[#c9ff5a]", rotate: "rotate-2" },
  { src: "/car_sale.png", label: "Car sale", color: "bg-[#6c43e0]", rotate: "-rotate-1" },
  { src: "/coming_soon.png", label: "Coming soon", color: "bg-[#ffd166]", rotate: "rotate-3" },
];

const integrationNames = ["n8n", "Make", "Zapier", "Node.js", "Python", "cURL"];

export default function HomePage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const c = copy[language];

  const primaryHref = user ? "/dashboard" : "/sign-up";

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f6f5ef] text-[#101426] selection:bg-[#c9ff5a] selection:text-[#101426]">
      <nav className="sticky top-0 z-50 border-b border-[#101426]/10 bg-[#f6f5ef]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" aria-label="Dynamic Canvas" className="flex items-center">
            <BrandMark className="size-11 text-base" />
          </Link>
          <div className="hidden items-center gap-7 lg:flex">
            <a href="#product" className="text-sm font-semibold text-[#101426]/65 transition hover:text-[#5b35d5]">{c.navProduct}</a>
            <a href="#how" className="text-sm font-semibold text-[#101426]/65 transition hover:text-[#5b35d5]">{c.navHow}</a>
            <a href="#templates" className="text-sm font-semibold text-[#101426]/65 transition hover:text-[#5b35d5]">{c.navTemplates}</a>
            <a href="#pricing" className="text-sm font-semibold text-[#101426]/65 transition hover:text-[#5b35d5]">{c.navPlans}</a>
            <Link href="/docs" className="text-sm font-semibold text-[#101426]/65 transition hover:text-[#5b35d5]">{c.navDocs}</Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            {user ? (
              <Link href="/dashboard" className="rounded-full bg-[#101426] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#5b35d5]">Dashboard</Link>
            ) : (
              <>
                <Link href="/sign-in" className="hidden px-3 py-2 text-sm font-bold sm:block">{c.login}</Link>
                <Link href="/sign-up" className="rounded-full bg-[#101426] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#5b35d5] sm:px-5">{c.start}</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <header className="relative border-b border-[#101426]/10">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(#5b35d5_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 px-5 py-14 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-12 lg:py-16 xl:py-20">
          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#5b35d5]/20 bg-white/70 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#5b35d5] shadow-sm">
              <Sparkles className="size-3.5" /> {c.eyebrow}
            </div>
            <h1 className="max-w-3xl text-[clamp(3.4rem,5.8vw,6.5rem)] font-black leading-[0.88] tracking-[-0.07em]">
              {c.heroA}<br />
              <span className="relative inline-block text-[#5b35d5]">
                {c.heroB}
                <svg viewBox="0 0 560 20" className="absolute -bottom-4 left-1 h-5 w-[96%] text-[#ff6b57]" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M3 13 C130 3 390 3 557 11" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-10 max-w-xl text-lg font-medium leading-relaxed text-[#101426]/65 sm:text-xl">{c.heroText}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={primaryHref} className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#5b35d5] px-7 font-extrabold text-white shadow-[0_12px_40px_rgba(91,53,213,.28)] transition hover:-translate-y-0.5 hover:bg-[#4824c4]">
                {c.heroPrimary}<ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </Link>
              <Link href="/playground" className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[#101426]/15 bg-white/70 px-7 font-extrabold transition hover:border-[#101426]/35 hover:bg-white">
                <CirclePlay className="size-4" />{c.heroSecondary}
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#101426]/55">
              {[c.noCard, c.freeRenders, c.hdExport].map((item) => <span key={item} className="flex items-center gap-1.5"><Check className="size-3.5 text-[#5b35d5]" />{item}</span>)}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[720px] lg:mx-0">
            <div className="absolute -left-4 -top-8 z-20 hidden -rotate-6 rounded-2xl border-2 border-[#101426] bg-[#c9ff5a] px-5 py-3 text-sm font-black shadow-[5px_5px_0_#101426] sm:block">API + EDITOR = ⚡</div>
            <div className="absolute -bottom-8 -right-3 z-20 rounded-2xl border-2 border-[#101426] bg-white p-3 shadow-[5px_5px_0_#101426] sm:right-5">
              <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check className="size-5" /></span><div><div className="text-xs font-black">{c.live}</div><div className="text-[11px] text-[#101426]/50">200 OK · {c.renderTime}</div></div></div>
            </div>
            <div className="overflow-hidden rounded-[28px] border-2 border-[#101426] bg-white shadow-[14px_16px_0_#101426]">
              <div className="flex h-12 items-center justify-between border-b-2 border-[#101426] bg-[#f1f0e9] px-4">
                <div className="flex gap-1.5"><span className="size-3 rounded-full bg-[#ff6b57]" /><span className="size-3 rounded-full bg-[#ffd166]" /><span className="size-3 rounded-full bg-[#7ddb70]" /></div>
                <div className="rounded-md border border-[#101426]/15 bg-white px-12 py-1 text-[10px] font-bold text-[#101426]/45">campaign-template.dc</div>
                <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#5b35d5]" /><span className="size-2 rounded-full bg-[#101426]/15" /></div>
              </div>
              <div className="grid min-h-[475px] grid-cols-[64px_1fr] sm:grid-cols-[82px_1fr_180px]">
                <div className="border-r-2 border-[#101426] bg-[#f7f6f1] p-2.5">
                  {[MousePointer2, ImageIcon, Layers3, Palette, WandSparkles].map((Icon, index) => <div key={index} className={`mb-2 flex aspect-square items-center justify-center rounded-xl ${index === 1 ? "bg-[#5b35d5] text-white" : "text-[#101426]/45"}`}><Icon className="size-5" /></div>)}
                </div>
                <div className="relative flex items-center justify-center overflow-hidden bg-[#ebeae4] p-5 [background-image:radial-gradient(#a7a59b_1px,transparent_1px)] [background-size:18px_18px]">
                  <div className="relative aspect-[4/5] w-[72%] max-w-[300px] overflow-hidden bg-[#ff6b57] shadow-xl">
                    <Image src="/flash_sale.png" alt="Dynamic template preview" fill className="object-cover" />
                    <div className="absolute left-[12%] top-[18%] h-[16%] w-[76%] border-2 border-[#62a5ff]"><span className="absolute -left-1 -top-1 size-2 rounded-full bg-white ring-1 ring-[#62a5ff]" /><span className="absolute -right-1 -top-1 size-2 rounded-full bg-white ring-1 ring-[#62a5ff]" /><span className="absolute -bottom-1 -left-1 size-2 rounded-full bg-white ring-1 ring-[#62a5ff]" /><span className="absolute -bottom-1 -right-1 size-2 rounded-full bg-white ring-1 ring-[#62a5ff]" /></div>
                  </div>
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[#101426]/10 bg-white px-4 py-2 text-[10px] font-bold shadow-lg"><span>−</span><span className="text-[#5b35d5]">68%</span><span>+</span></div>
                </div>
                <div className="hidden border-l-2 border-[#101426] bg-white p-3 sm:block">
                  <div className="mb-3 text-[10px] font-black uppercase tracking-wider text-[#101426]/40">Layers</div>
                  {["FLASH SALE", "discount", "product.jpg", "background"].map((layer, index) => <div key={layer} className={`mb-2 flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[10px] font-bold ${index === 0 ? "border-[#5b35d5] bg-[#5b35d5]/5" : "border-[#101426]/10"}`}><span className="size-2 rounded-sm bg-[#101426]/20" />{layer}</div>)}
                  <div className="mt-6 rounded-xl bg-[#101426] p-3 font-mono text-[9px] leading-relaxed text-white"><span className="text-[#c9ff5a]">POST</span> /api/render<br /><span className="text-[#ad94ff]">templateId</span>: <span className="text-[#ffd166]">"flash-sale"</span><br /><span className="text-[#ad94ff]">title</span>: <span className="text-[#ffd166]">"40% OFF"</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="border-b border-[#101426]/10 bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
          <p className="mb-6 text-center text-xs font-black uppercase tracking-[0.18em] text-[#101426]/40">{c.trusted}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-lg font-black text-[#101426]/45 sm:gap-x-16">
            {integrationNames.map((name) => <span key={name} className="transition hover:text-[#5b35d5]">{name}</span>)}
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#5b35d5]">{c.problemKicker}</p>
            <h2 className="mt-5 text-4xl font-black leading-[0.98] tracking-[-0.045em] sm:text-6xl">{c.problemTitle}</h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#101426]/60">{c.problemText}</p>
          </div>
          <div className="space-y-4">
            {[
              ["01", MousePointer2, c.designTitle, c.designText, "bg-[#d9ccff]"],
              ["02", Layers3, c.dynamicTitle, c.dynamicText, "bg-[#c9ff5a]"],
              ["03", Terminal, c.apiTitle, c.apiText, "bg-[#ffb7aa]"],
            ].map(([num, Icon, title, text, bg]) => { const CardIcon = Icon as typeof MousePointer2; return <div key={String(num)} className={`group grid gap-5 rounded-[28px] border-2 border-[#101426] p-6 transition hover:-translate-y-1 hover:shadow-[8px_8px_0_#101426] sm:grid-cols-[70px_1fr] sm:p-8 ${String(bg)}`}><div className="flex size-16 items-center justify-center rounded-2xl border-2 border-[#101426] bg-white"><CardIcon className="size-7" /></div><div><div className="mb-2 text-xs font-black text-[#101426]/45">STEP {String(num)}</div><h3 className="text-2xl font-black">{String(title)}</h3><p className="mt-2 max-w-xl leading-relaxed text-[#101426]/65">{String(text)}</p></div></div>; })}
          </div>
        </div>
      </section>

      <section id="product" className="bg-[#e9e5ff] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-14 max-w-3xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#5b35d5]">{c.bentoKicker}</p><h2 className="mt-5 text-4xl font-black leading-none tracking-[-0.045em] sm:text-6xl">{c.bentoTitle}</h2></div>
          <div className="grid auto-rows-[minmax(220px,auto)] gap-4 md:grid-cols-2 lg:grid-cols-3">
            <article className="relative overflow-hidden rounded-[28px] border-2 border-[#101426] bg-white p-7 lg:col-span-2 lg:row-span-2">
              <div className="relative z-10 max-w-md"><span className="mb-5 flex size-12 items-center justify-center rounded-xl bg-[#5b35d5] text-white"><Palette /></span><h3 className="text-3xl font-black">{c.editorTitle}</h3><p className="mt-3 leading-relaxed text-[#101426]/60">{c.editorText}</p></div>
              <div className="mt-9 grid grid-cols-4 gap-2 rounded-2xl border-2 border-[#101426] bg-[#f4f3ee] p-3 sm:grid-cols-7">{[Layers3, MousePointer2, ImageIcon, Palette, Sparkles, WandSparkles, FileImage].map((Icon, index) => <span key={index} className={`flex aspect-square items-center justify-center rounded-xl border border-[#101426]/10 ${index === 4 ? "bg-[#c9ff5a]" : "bg-white"}`}><Icon className="size-5" /></span>)}</div>
              <div className="absolute -bottom-12 -right-12 size-48 rounded-full bg-[#c9ff5a] opacity-70 blur-3xl" />
            </article>
            <article className="rounded-[28px] border-2 border-[#101426] bg-[#101426] p-7 text-white"><Code2 className="size-10 text-[#c9ff5a]" /><h3 className="mt-8 text-2xl font-black">{c.apiCardTitle}</h3><p className="mt-3 text-sm leading-relaxed text-white/60">{c.apiCardText}</p><div className="mt-6 rounded-xl bg-white/5 p-3 font-mono text-[10px] text-[#ad94ff]">POST <span className="text-white">/api/render</span> <span className="text-[#c9ff5a]">→ 200</span></div></article>
            <article className="rounded-[28px] border-2 border-[#101426] bg-[#ffd166] p-7"><CirclePlay className="size-10" /><h3 className="mt-8 text-2xl font-black">{c.playgroundTitle}</h3><p className="mt-3 text-sm leading-relaxed text-[#101426]/65">{c.playgroundText}</p><Link href="/playground" className="mt-6 inline-flex items-center gap-1 text-sm font-black underline decoration-2 underline-offset-4">Playground <ChevronRight className="size-4" /></Link></article>
            <article className="rounded-[28px] border-2 border-[#101426] bg-[#ffb7aa] p-7"><Blocks className="size-10" /><h3 className="mt-8 text-2xl font-black">{c.automationTitle}</h3><p className="mt-3 text-sm leading-relaxed text-[#101426]/65">{c.automationText}</p><div className="mt-6 flex gap-2">{["n8n", "Make", "Zapier"].map(x => <span key={x} className="rounded-full border border-[#101426]/20 bg-white/50 px-2.5 py-1 text-[10px] font-black">{x}</span>)}</div></article>
            <article className="rounded-[28px] border-2 border-[#101426] bg-white p-7 lg:col-span-2"><FileImage className="size-10 text-[#5b35d5]" /><div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h3 className="text-2xl font-black">{c.formatsTitle}</h3><p className="mt-3 max-w-md text-sm leading-relaxed text-[#101426]/60">{c.formatsText}</p></div><div className="flex gap-2">{["PNG", "JPG", "SVG"].map(x => <span key={x} className="rounded-xl border-2 border-[#101426] bg-[#f6f5ef] px-4 py-3 text-xs font-black">{x}</span>)}</div></div></article>
          </div>
        </div>
      </section>

      <section id="templates" className="border-y border-[#101426]/10 bg-[#101426] py-24 text-white lg:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="grid items-end gap-8 lg:grid-cols-2"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#c9ff5a]">{c.galleryKicker}</p><h2 className="mt-5 text-4xl font-black leading-none tracking-[-0.045em] sm:text-6xl">{c.galleryTitle}</h2></div><p className="max-w-xl text-lg leading-relaxed text-white/55 lg:justify-self-end">{c.galleryText}</p></div>
          <div className="mt-16 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {templates.map((template, index) => <div key={template.src} className={`group relative ${template.rotate} transition duration-300 hover:z-10 hover:rotate-0 hover:-translate-y-3`}><div className={`absolute -inset-2 rounded-[24px] ${template.color}`} /><div className="relative aspect-[4/5] overflow-hidden rounded-[18px] border-2 border-white/80 bg-white shadow-2xl"><Image src={template.src} alt={template.label} fill className="object-cover transition duration-500 group-hover:scale-105" /></div><span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-[10px] font-black text-[#101426]">{c.swapLabel} #{index + 1}</span></div>)}
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="text-center"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#5b35d5]">{c.flowKicker}</p><h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-none tracking-[-0.045em] sm:text-6xl">{c.flowTitle}</h2></div>
        <div className="relative mt-16 grid gap-5 lg:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-12 hidden border-t-2 border-dashed border-[#5b35d5]/30 lg:block" />
          {[[Palette, c.step1, c.step1Text], [Braces, c.step2, c.step2Text], [Rocket, c.step3, c.step3Text]].map(([Icon, title, text], index) => { const StepIcon = Icon as typeof Palette; return <div key={String(title)} className="relative rounded-[28px] border-2 border-[#101426] bg-white p-7 text-center shadow-[7px_7px_0_#d9ccff]"><span className="absolute -top-3 left-5 rounded-full bg-[#101426] px-3 py-1 text-[10px] font-black text-white">0{index + 1}</span><span className="mx-auto flex size-20 items-center justify-center rounded-full border-2 border-[#101426] bg-[#c9ff5a]"><StepIcon className="size-8" /></span><h3 className="mt-6 text-2xl font-black">{String(title)}</h3><p className="mt-3 leading-relaxed text-[#101426]/60">{String(text)}</p></div>; })}
        </div>
      </section>

      <section className="border-y border-[#101426]/10 bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12"><div className="mb-14 max-w-3xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#5b35d5]">{c.useKicker}</p><h2 className="mt-5 text-4xl font-black leading-none tracking-[-0.045em] sm:text-6xl">{c.useTitle}</h2></div><div className="grid gap-px overflow-hidden rounded-[28px] border-2 border-[#101426] bg-[#101426] md:grid-cols-2 lg:grid-cols-3">{c.uses.map(([title, text], index) => <article key={title} className="group bg-white p-7 transition hover:bg-[#c9ff5a]"><div className="flex items-start justify-between"><span className="text-xs font-black text-[#5b35d5]">0{index + 1}</span><ArrowRight className="size-5 -rotate-45 transition group-hover:rotate-0" /></div><h3 className="mt-10 text-2xl font-black">{title}</h3><p className="mt-3 text-sm leading-relaxed text-[#101426]/60">{text}</p></article>)}</div></div>
      </section>

      <section className="bg-[#5b35d5] py-24 text-white lg:py-32">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-12">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#c9ff5a]">{c.devKicker}</p><h2 className="mt-5 text-4xl font-black leading-none tracking-[-0.045em] sm:text-6xl">{c.devTitle}</h2><p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65">{c.devText}</p><Link href="/docs" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-black text-[#5b35d5] transition hover:bg-[#c9ff5a]">{c.viewDocs}<ArrowRight className="size-4" /></Link></div>
          <div className="overflow-hidden rounded-[24px] border-2 border-[#101426] bg-[#101426] shadow-[12px_12px_0_#c9ff5a]"><div className="flex items-center justify-between border-b border-white/10 px-5 py-3"><div className="flex gap-1.5"><span className="size-3 rounded-full bg-[#ff6b57]" /><span className="size-3 rounded-full bg-[#ffd166]" /><span className="size-3 rounded-full bg-[#7ddb70]" /></div><span className="font-mono text-[10px] text-white/35">render.js</span></div><pre className="overflow-x-auto p-6 text-[12px] leading-7 text-white/80 sm:p-8 sm:text-sm"><code><span className="text-[#ad94ff]">const</span> response = <span className="text-[#ad94ff]">await</span> fetch(<span className="text-[#c9ff5a]">&quot;/api/render&quot;</span>, {`\n`}  method: <span className="text-[#c9ff5a]">&quot;POST&quot;</span>,{`\n`}  headers: {`{`} <span className="text-[#ffb7aa]">&quot;x-api-key&quot;</span>: API_KEY {`}`},{`\n`}  body: JSON.stringify({`{`}{`\n`}    templateId: <span className="text-[#c9ff5a]">&quot;flash-sale&quot;</span>,{`\n`}    modifications: {`{`}{`\n`}      title: <span className="text-[#c9ff5a]">&quot;40% OFF&quot;</span>,{`\n`}      price: <span className="text-[#c9ff5a]">&quot;$29&quot;</span>{`\n`}    {`}`}{`\n`}  {`}`}){`\n`}{`}`});{`\n`}{`\n`}<span className="text-white/35">// → 3240 × 4050 PNG</span></code></pre></div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="text-center"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#5b35d5]">{c.plansKicker}</p><h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-none tracking-[-0.045em] sm:text-6xl">{c.plansTitle}</h2></div>
        <div className="mt-16 grid items-stretch gap-5 lg:grid-cols-3">
          {[
            [c.free, c.current, "100", c.freeItems, false],
            [c.pro, c.popular, "5.000", c.proItems, true],
            [c.scale, c.custom, "∞", c.scaleItems, false],
          ].map(([name, badge, amount, items, featured]) => <article key={String(name)} className={`relative flex flex-col rounded-[28px] border-2 border-[#101426] p-7 ${featured ? "bg-[#101426] text-white shadow-[10px_10px_0_#c9ff5a]" : "bg-white"}`}><span className={`w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${featured ? "bg-[#c9ff5a] text-[#101426]" : "bg-[#e9e5ff] text-[#5b35d5]"}`}>{badge}</span><h3 className="mt-7 text-3xl font-black">{name}</h3><div className="mt-5 flex items-end gap-2"><strong className="text-5xl font-black tracking-tight">{amount}</strong><span className={`pb-1 text-xs ${featured ? "text-white/45" : "text-[#101426]/45"}`}>{c.monthly}</span></div><div className={`my-7 border-t ${featured ? "border-white/15" : "border-[#101426]/10"}`} /><ul className="flex-1 space-y-4">{(items as string[]).map(item => <li key={item} className="flex gap-2 text-sm font-semibold"><BadgeCheck className={`size-5 shrink-0 ${featured ? "text-[#c9ff5a]" : "text-[#5b35d5]"}`} />{item}</li>)}</ul><Link href={primaryHref} className={`mt-8 flex h-12 items-center justify-center rounded-full font-black transition ${featured ? "bg-[#c9ff5a] text-[#101426] hover:bg-white" : "bg-[#101426] text-white hover:bg-[#5b35d5]"}`}>{name === c.scale ? c.contactAction : c.planAction}</Link></article>)}
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32"><div className="relative mx-auto max-w-[1344px] overflow-hidden rounded-[36px] border-2 border-[#101426] bg-[#c9ff5a] px-6 py-16 text-center shadow-[12px_12px_0_#101426] sm:px-12 lg:py-24"><div className="absolute -left-12 -top-12 size-40 rounded-full border-[28px] border-[#5b35d5]" /><Sparkles className="absolute right-10 top-10 size-10 text-[#5b35d5]" /><h2 className="relative mx-auto max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-7xl">{c.ctaTitle}</h2><p className="relative mx-auto mt-6 max-w-2xl text-lg font-semibold text-[#101426]/60">{c.ctaText}</p><Link href={primaryHref} className="relative mt-9 inline-flex h-14 items-center gap-2 rounded-full bg-[#5b35d5] px-7 font-black text-white transition hover:-translate-y-1 hover:bg-[#101426]">{c.ctaButton}<ArrowRight className="size-4" /></Link></div></section>

      <footer className="bg-[#101426] text-white"><div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12"><div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-2 lg:grid-cols-5"><div className="lg:col-span-2"><BrandMark className="size-12 text-base" /><p className="mt-5 max-w-sm text-sm leading-relaxed text-white/45">{c.footerText}</p></div><div><h3 className="text-xs font-black uppercase tracking-wider text-[#c9ff5a]">{c.product}</h3><div className="mt-5 space-y-3 text-sm text-white/55"><a className="block hover:text-white" href="#product">{c.navProduct}</a><a className="block hover:text-white" href="#templates">{c.navTemplates}</a><a className="block hover:text-white" href="#pricing">{c.navPlans}</a></div></div><div><h3 className="text-xs font-black uppercase tracking-wider text-[#c9ff5a]">{c.resources}</h3><div className="mt-5 space-y-3 text-sm text-white/55"><Link className="block hover:text-white" href="/docs">{c.navDocs}</Link><Link className="block hover:text-white" href="/playground">Playground</Link><Link className="block hover:text-white" href="/dashboard">Dashboard</Link></div></div><div><h3 className="text-xs font-black uppercase tracking-wider text-[#c9ff5a]">{c.legal}</h3><div className="mt-5 space-y-3 text-sm text-white/55"><Link className="block hover:text-white" href="/privacy">{c.privacy}</Link><Link className="block hover:text-white" href="/terms">{c.terms}</Link><Link className="block hover:text-white" href="/security">{c.security}</Link></div></div></div><div className="flex flex-col gap-4 pt-8 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Dynamic Canvas. {c.rights}</p><div className="flex items-center gap-2"><ShieldCheck className="size-4" /> Secure API infrastructure</div></div></div></footer>
    </main>
  );
}
