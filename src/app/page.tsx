"use client";

import { useEffect, useRef, useState } from "react";
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
  FileImage,
  Gauge,
  Infinity as InfinityIcon,
  Palette,
  Play,
  Rocket,
  ShieldCheck,
  Terminal,
  Users,
  Timer,
  Server,
  Lock,
  Upload,
  WandSparkles,
  Zap,
} from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { BrandLogo, BrandMark } from "@/components/brand-mark";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const copy = {
  es: {
    navProduct: "Producto",
    navHow: "Cómo funciona",
    navTemplates: "Plantillas",
    navPlans: "Precios",
    navDocs: "Documentación",
    login: "Ingresar",
    start: "Crear gratis",
    heroA: "Automatiza tus",
    heroB: [
      "posts de Instagram.",
      "anuncios de Facebook.",
      "miniaturas de YouTube.",
      "banners de productos.",
      "anuncios inmobiliarios.",
      "campañas de ofertas.",
      "certificados.",
      "menús de restaurantes.",
      "gráficas para eventos.",
      "creatividades publicitarias.",
    ],
    heroText:
      "Diseña la plantilla visualmente. Después envía textos, fotos, precios o colores desde tu app o automatización y recibe un render HD listo para publicar.",
    heroPrimary: "Crear plantilla gratis",
    heroSecondary: "Probar la API",
    heroJsonTitle: "Datos JSON",
    heroJsonText: "Envía tus datos",
    heroRenderTitle: "Imagen generada",
    heroRenderText: "Recibe tu diseño",
    heroPoints: [
      "Genera banners, posts y creatividades automáticamente",
      "Cambia textos, imágenes, precios y colores con JSON",
      "Conecta n8n, Make, Zapier o tu propio backend",
    ],
    noCard: "Sin tarjeta de crédito",
    freeRenders: "50 créditos de bienvenida",
    hdExport: "Exportación HD",
    live: "Render completado",
    renderTime: "respuesta lista",
    trusted: "Conecta Dynamic Canvas con las herramientas que ya usas",
    integrationsTitleA: "Integra con",
    integrationsTitleB: "No-code",
    integrationsText: "Automatiza la generación de imágenes desde n8n, Make, Zapier o cualquier plataforma que pueda llamar una API.",
    noCodeLabel: "Plataformas No-code",
    metricTemplates: "Plantillas dinámicas",
    metricApi: "API lista para producción",
    metricFormats: "PNG · JPG · WebP",
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
    bentoKicker: "Diseña una vez. Automatiza después.",
    bentoTitle: "Todo el flujo para convertir datos en imágenes.",
    editorTitle: "Editor para construir plantillas",
    editorText: "Define visualmente la composición, capas dinámicas, fuentes, imágenes, QR, códigos de barra y formas que la API reutilizará.",
    apiCardTitle: "API simple, resultado HD",
    apiCardText: "Un endpoint claro para modificar plantillas y renderizar imágenes de alta resolución.",
    playgroundTitle: "Prueba antes de integrar",
    playgroundText: "Selecciona una plantilla, cambia el JSON y valida la respuesta desde el Playground.",
    automationTitle: "Conecta tu flujo",
    automationText: "Úsalo con n8n, Make, Zapier o cualquier backend mediante HTTP.",
    formatsTitle: "Listo para publicar",
    formatsText: "Genera JPEG, PNG o WebP en alta resolución para redes, anuncios, e-commerce y documentos.",
    scaleKicker: "Equipos y escala",
    scaleTitle: "Listo para equipos que crecen rápido",
    scaleText: "De startups a empresas, nuestra infraestructura está diseñada para soportar tu crecimiento con velocidad y confiabilidad.",
    scaleTeamTitle: "Trabajo en equipo",
    scaleTeamText: "Invita a tu equipo, comparte plantillas y colaboren en tiempo real. Gestiona permisos y mantén a todos alineados.",
    scaleSpeedTitle: "Renders en segundos",
    scaleSpeedText: "Renderizado ultrarrápido con infraestructura optimizada. Genera miles de imágenes sin esfuerzo.",
    scaleInfraTitle: "Infraestructura empresarial",
    scaleInfraText: "Servidores con auto-escalado, 99.9% de uptime y distribución global. Diseñado para millones de renders.",
    scaleSecureTitle: "Seguro y confiable",
    scaleSecureText: "Autenticación API segura, conexiones cifradas y infraestructura en la nube confiable. Tus assets siempre protegidos.",
    scaleStat1: "~3s",
    scaleStat1Label: "Tiempo promedio de render",
    scaleStat2: "99.9%",
    scaleStat2Label: "Uptime garantizado",
    scaleStat3: "50K+",
    scaleStat3Label: "Imágenes generadas",
    scaleStat4: "24/7",
    scaleStat4Label: "Soporte dedicado",
    galleryKicker: "Un template. Cientos de variaciones.",
    galleryTitle: "Tu marca consistente, incluso cuando todo cambia.",
    galleryText:
      "Actualiza títulos, ofertas, imágenes y colores sin reconstruir el diseño. Cada render conserva la composición aprobada.",
    swapLabel: "Datos dinámicos",
    flowKicker: "De plantilla a producción",
    flowTitle: "¿Cómo funciona?",
    stepLabel: "Paso",
    step1: "Diseña tu plantilla",
    step1Text: "Empieza desde cero, elige un diseño de la galería o construye tu composición con nuestro editor visual. Define cuáles textos e imágenes serán dinámicos.",
    step2: "Conecta la API o No-code",
    step2Text: "Usa el endpoint de render o conecta tu plantilla con n8n, Make, Zapier y cualquier herramienta que pueda enviar una petición HTTP.",
    step3: "Automatiza y escala",
    step3Text: "Genera cientos o miles de piezas personalizadas para campañas, redes sociales, e-commerce y flujos internos sin rediseñar.",
    howPreviewAlt: "Ejemplos de plantillas generadas con Dynamic Canvas",
    apiShowcaseKicker: "API de generación de imágenes",
    apiShowcaseTitle: "Convierte datos en imágenes listas para publicar.",
    apiShowcaseText: "Envía una petición con tu plantilla y los valores que cambian. Dynamic Canvas devuelve una imagen HD manteniendo intacto el diseño aprobado.",
    apiShowcaseFeatures: [
      ["Un POST y listo", "Envía templateId, formato y capas dinámicas en un JSON claro."],
      ["Controla cada capa", "Actualiza textos, imágenes, colores, precios y otros valores."],
      ["Solo formatos de imagen", "Genera JPG, PNG o WebP en alta resolución."],
      ["Conecta cualquier flujo", "Úsalo desde JavaScript, Python, n8n, Make, Zapier o tu backend."],
    ],
    apiShowcaseButton: "Ver documentación de la API",
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
    plansTitle: "El precio anual de otras plataformas, sin obligarte a pagar un año.",
    free: "Creator",
    pro: "Agency",
    scale: "Business",
    monthly: "/ mes",
    current: "Automatiza tu creación de imágenes",
    popular: "Más elegido",
    custom: "Potencia tu producción de imágenes",
    freeItems: [
      "1.000 renders de imágenes por mes",
      "JPG, PNG o WebP · Exporta en múltiples formatos",
      "Hasta 15 plantillas · Diseños reutilizables",
      "2 miembros de equipo · Colabora",
      "Carpetas y etiquetas · Organiza tus plantillas",
      "Fuentes personalizadas + Google Fonts",
      "Acceso API · Genera desde tus apps",
      "Soporte por email y chat",
    ],
    proItems: [
      "5.000 renders de imágenes por mes",
      "5× más renders para alto volumen",
      "Todo lo de Creator incluido",
      "Hasta 100 plantillas · Escala tu biblioteca",
      "5 miembros de equipo · Amplía la colaboración",
      "Carpetas · Organiza plantillas por cliente o campaña",
      "Límites API más altos · Procesamiento más rápido",
      "Editor embebido · Integra el editor en tu app",
      "Soporte prioritario por email y chat · Respuestas más rápidas",
    ],
    scaleItems: [
      "25.000 renders de imágenes por mes",
      "Alta capacidad para cargas empresariales",
      "Todo lo de Agency incluido",
      "Plantillas ilimitadas · Construye sin límites",
      "20 miembros de equipo · Colaboración empresarial",
      "Carpetas · Organiza plantillas por cliente o campaña",
      "API avanzada · Límites superiores",
      "Funciones e integraciones personalizadas",
      "Soporte dedicado por email y chat · Línea directa con el equipo",
    ],
    planAction: "Empezar prueba gratis",
    contactAction: "Hablar con nosotros",
    billingMonthly: "Mensual",
    billingYearly: "Anual",
    annualDiscount: "Ahorra 20%",
    billedYearly: "cobrado anualmente",
    ctaTitle: "Deja de diseñar la misma pieza una y otra vez.",
    ctaText: "Crea tu primera plantilla dinámica y empieza con 50 créditos de bienvenida gratis.",
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
    navPlans: "Pricing",
    navDocs: "Documentation",
    login: "Log in",
    start: "Start free",
    heroA: "Automate your",
    heroB: [
      "Instagram posts.",
      "Facebook ads.",
      "YouTube thumbnails.",
      "product banners.",
      "real estate listings.",
      "sales campaigns.",
      "certificates.",
      "restaurant menus.",
      "event graphics.",
      "ad creatives.",
    ],
    heroText: "Design the template visually. Then send text, photos, prices, or colors from your app or automation and receive an HD render ready to publish.",
    heroPrimary: "Create a free template",
    heroSecondary: "Test the API",
    heroJsonTitle: "JSON data",
    heroJsonText: "Send your data",
    heroRenderTitle: "Rendered image",
    heroRenderText: "Get your design",
    heroPoints: [
      "Generate banners, posts, and campaign assets automatically",
      "Change text, images, prices, and colors with JSON",
      "Connect n8n, Make, Zapier, or your own backend",
    ],
    noCard: "No credit card",
    freeRenders: "50 free welcome credits",
    hdExport: "HD export",
    live: "Render completed",
    renderTime: "response ready",
    trusted: "Connect Dynamic Canvas to the tools you already use",
    integrationsTitleA: "Integrate with",
    integrationsTitleB: "No-code",
    integrationsText: "Automate image generation from n8n, Make, Zapier, or any platform that can call an API.",
    noCodeLabel: "No-code platforms",
    metricTemplates: "Dynamic templates",
    metricApi: "Production-ready API",
    metricFormats: "PNG · JPG · WebP",
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
    bentoKicker: "Design once. Automate afterward.",
    bentoTitle: "The complete workflow for turning data into images.",
    editorTitle: "An editor for building templates",
    editorText: "Visually define the composition, dynamic layers, fonts, images, QR codes, barcodes, and shapes the API will reuse.",
    apiCardTitle: "Simple API, HD output",
    apiCardText: "One clear endpoint to modify templates and render high-resolution images.",
    playgroundTitle: "Test before integrating",
    playgroundText: "Select a template, change the JSON and validate the response in the Playground.",
    automationTitle: "Connect your workflow",
    automationText: "Use it with n8n, Make, Zapier or any backend over HTTP.",
    formatsTitle: "Ready to publish",
    formatsText: "Generate high-resolution JPEG, PNG, or WebP for social, ads, e-commerce, and documents.",
    scaleKicker: "Teams & Scale",
    scaleTitle: "Built for teams that move fast",
    scaleText: "From startups to enterprises, our infrastructure handles your growth with speed and reliability.",
    scaleTeamTitle: "Team Collaboration",
    scaleTeamText: "Invite team members, share templates, and collaborate in real-time. Manage permissions and keep everyone aligned.",
    scaleSpeedTitle: "Renders in seconds",
    scaleSpeedText: "Lightning-fast rendering powered by optimized infrastructure. Generate thousands of assets effortlessly.",
    scaleInfraTitle: "Enterprise Infrastructure",
    scaleInfraText: "Auto-scaling servers, 99.9% uptime SLA, and global distribution. Built to handle millions of renders.",
    scaleSecureTitle: "Secure & Reliable",
    scaleSecureText: "Secure API authentication, encrypted connections, and reliable cloud infrastructure. Your assets are always protected.",
    scaleStat1: "~3s",
    scaleStat1Label: "Average render time",
    scaleStat2: "99.9%",
    scaleStat2Label: "Uptime SLA",
    scaleStat3: "50K+",
    scaleStat3Label: "Assets generated",
    scaleStat4: "24/7",
    scaleStat4Label: "Dedicated support",
    galleryKicker: "One template. Hundreds of variations.",
    galleryTitle: "Your brand stays consistent, even when everything changes.",
    galleryText: "Update headlines, offers, images and colors without rebuilding the design. Every render keeps the approved composition.",
    swapLabel: "Dynamic data",
    flowKicker: "From template to production",
    flowTitle: "How does it work?",
    stepLabel: "Step",
    step1: "Design your template",
    step1Text: "Start from scratch, choose a gallery design, or build your composition with our visual editor. Define which text and images will be dynamic.",
    step2: "Connect the API or No-code",
    step2Text: "Use the render endpoint or connect your template to n8n, Make, Zapier, and any tool that can send an HTTP request.",
    step3: "Automate and scale",
    step3Text: "Generate hundreds or thousands of personalized assets for campaigns, social media, e-commerce, and internal workflows without redesigning.",
    howPreviewAlt: "Examples of templates generated with Dynamic Canvas",
    apiShowcaseKicker: "Image generation API",
    apiShowcaseTitle: "Turn data into publish-ready images.",
    apiShowcaseText: "Send a request with your template and the values that change. Dynamic Canvas returns an HD image while preserving the approved design.",
    apiShowcaseFeatures: [
      ["One POST is enough", "Send a templateId, format, and dynamic layers in a clear JSON payload."],
      ["Control every layer", "Update text, images, colors, prices, and other values."],
      ["Image formats only", "Generate high-resolution JPG, PNG, or WebP files."],
      ["Connect any workflow", "Use it from JavaScript, Python, n8n, Make, Zapier, or your backend."],
    ],
    apiShowcaseButton: "View API documentation",
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
    plansTitle: "Get annual pricing elsewhere without committing to a full year.",
    free: "Creator",
    pro: "Agency",
    scale: "Business",
    monthly: "/ month",
    current: "Automate your image creation",
    popular: "Popular",
    custom: "Power your image production",
    freeItems: [
      "1,000 image renders per month",
      "JPG, PNG or WebP · Export in multiple formats",
      "Up to 15 Templates · Reusable designs",
      "2 Team Members · Collaborate with your team",
      "Folders & Tags · Keep templates organized",
      "Custom Fonts + Google Fonts",
      "API Access · Generate from your apps",
      "Email + Chat Support",
    ],
    proItems: [
      "5,000 image renders per month",
      "5x more renders for high-volume creation",
      "All Creator Plan Benefits",
      "Up to 100 Templates · Scale your library",
      "5 Team Members · Expand collaboration",
      "Folders · Organize templates by client or campaign",
      "Higher API Limits · Faster processing",
      "Embedded Editor · Add editor to your app",
      "Priority Email + Chat Support · Faster response times",
    ],
    scaleItems: [
      "25,000 image renders per month",
      "High-capacity for enterprise workloads",
      "All Agency Plan Benefits",
      "Unlimited Templates · Build without limits",
      "20 Team Members · Enterprise collaboration",
      "Folders · Organize templates by client or campaign",
      "Advanced API Access · Higher limits",
      "Custom Features & Integrations",
      "Dedicated Email + Chat Support · Direct line to our team",
    ],
    planAction: "Start free trial",
    contactAction: "Talk to us",
    billingMonthly: "Monthly",
    billingYearly: "Annual",
    annualDiscount: "Save 20%",
    billedYearly: "billed annually",
    ctaTitle: "Stop designing the same asset again and again.",
    ctaText: "Create your first dynamic template and start with 50 free welcome credits.",
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

const noCodeIntegrations = [
  { name: "n8n", src: "/integrations/n8n.webp", width: 280, height: 78 },
  { name: "Make", src: "/integrations/make.webp", width: 280, height: 58 },
  { name: "Zapier", src: "/integrations/zapier.webp", width: 280, height: 76 },
  { name: "Bubble", src: "/integrations/bubble.webp", width: 280, height: 63 },
  { name: "Airtable", src: "/integrations/airtable.webp", width: 280, height: 62 },
] as const;

const heroRenderDemos = {
  es: [
    {
      templateId: "b70551d1-90aa-4bb2-b137-75a94726ec88",
      background: "#111820",
      accent: "#ff6a35",
      ink: "#f7f3ed",
      variations: [
        { brand: "MIDNIGHT AUTO", headline: "OFERTA DE FIN DE SEMANA", subheadline: "30% DE DESCUENTO", cta: "VER OFERTA", image: "/sunset-supercar-optimized.jpg", imageName: "sunset-supercar.jpg" },
        { brand: "MIDNIGHT AUTO", headline: "ESTRENA TU PRÓXIMO AUTO", subheadline: "BONO DE $2.000", cta: "VER MODELOS", image: "/sunset-supercar-optimized.jpg", imageName: "sunset-supercar.jpg" },
        { brand: "MIDNIGHT AUTO", headline: "ÚLTIMAS UNIDADES", subheadline: "ENTREGA INMEDIATA", cta: "COTIZAR AHORA", image: "/sunset-supercar-optimized.jpg", imageName: "sunset-supercar.jpg" },
      ],
    },
    {
      templateId: "e87a9044-7ebf-42b3-9537-16e2b080a8ad",
      background: "#081d24",
      accent: "#ffad3d",
      ink: "#f2f7f4",
      variations: [
        { brand: "NOMAD ESCAPES", headline: "BALI TE ESPERA", subheadline: "25% MENOS ESTE MES", cta: "RESERVAR AHORA", image: "/bali-travel-optimized.webp", imageName: "bali-travel.jpg" },
        { brand: "NOMAD ESCAPES", headline: "ESCAPA A LA COSTA", subheadline: "VUELOS DESDE $299", cta: "EXPLORAR VIAJE", image: "/bali-travel-optimized.webp", imageName: "bali-travel.jpg" },
        { brand: "NOMAD ESCAPES", headline: "TU PRÓXIMA AVENTURA", subheadline: "7 NOCHES · TODO INCLUIDO", cta: "VER DESTINOS", image: "/bali-travel-optimized.webp", imageName: "bali-travel.jpg" },
      ],
    },
    {
      templateId: "54d6eab2-3806-439e-b747-a45985b18acd",
      background: "#23121d",
      accent: "#ff6b7d",
      ink: "#fff3ef",
      variations: [
        { brand: "PACE STUDIO", headline: "CORRE A TU RITMO", subheadline: "NUEVA COLECCIÓN", cta: "COMPRAR AHORA", image: "/pink-running-shoe-optimized.webp", imageName: "pink-running-shoe.webp" },
        { brand: "PACE STUDIO", headline: "LIGERA TODO EL DÍA", subheadline: "ENVÍO GRATIS HOY", cta: "VER MODELO", image: "/pink-running-shoe-optimized.webp", imageName: "pink-running-shoe.webp" },
        { brand: "PACE STUDIO", headline: "COLOR QUE SE MUEVE", subheadline: "EDICIÓN LIMITADA", cta: "DESCUBRIR", image: "/pink-running-shoe-optimized.webp", imageName: "pink-running-shoe.webp" },
      ],
    },
  ],
  en: [
    {
      templateId: "b70551d1-90aa-4bb2-b137-75a94726ec88",
      background: "#111820",
      accent: "#ff6a35",
      ink: "#f7f3ed",
      variations: [
        { brand: "MIDNIGHT AUTO", headline: "WEEKEND SALE", subheadline: "30% OFF TODAY", cta: "VIEW OFFER", image: "/sunset-supercar-optimized.jpg", imageName: "sunset-supercar.jpg" },
        { brand: "MIDNIGHT AUTO", headline: "DRIVE SOMETHING NEW", subheadline: "$2,000 BONUS", cta: "VIEW MODELS", image: "/sunset-supercar-optimized.jpg", imageName: "sunset-supercar.jpg" },
        { brand: "MIDNIGHT AUTO", headline: "LAST UNITS AVAILABLE", subheadline: "READY FOR DELIVERY", cta: "GET A QUOTE", image: "/sunset-supercar-optimized.jpg", imageName: "sunset-supercar.jpg" },
      ],
    },
    {
      templateId: "e87a9044-7ebf-42b3-9537-16e2b080a8ad",
      background: "#081d24",
      accent: "#ffad3d",
      ink: "#f2f7f4",
      variations: [
        { brand: "NOMAD ESCAPES", headline: "BALI IS CALLING", subheadline: "25% OFF THIS MONTH", cta: "BOOK NOW", image: "/bali-travel-optimized.webp", imageName: "bali-travel.jpg" },
        { brand: "NOMAD ESCAPES", headline: "ESCAPE TO THE COAST", subheadline: "FLIGHTS FROM $299", cta: "EXPLORE TRIP", image: "/bali-travel-optimized.webp", imageName: "bali-travel.jpg" },
        { brand: "NOMAD ESCAPES", headline: "YOUR NEXT ADVENTURE", subheadline: "7 NIGHTS · ALL INCLUDED", cta: "VIEW DESTINATIONS", image: "/bali-travel-optimized.webp", imageName: "bali-travel.jpg" },
      ],
    },
    {
      templateId: "54d6eab2-3806-439e-b747-a45985b18acd",
      background: "#23121d",
      accent: "#ff6b7d",
      ink: "#fff3ef",
      variations: [
        { brand: "PACE STUDIO", headline: "RUN AT YOUR PACE", subheadline: "NEW COLLECTION", cta: "SHOP NOW", image: "/pink-running-shoe-optimized.webp", imageName: "pink-running-shoe.webp" },
        { brand: "PACE STUDIO", headline: "LIGHT ALL DAY", subheadline: "FREE SHIPPING TODAY", cta: "VIEW MODEL", image: "/pink-running-shoe-optimized.webp", imageName: "pink-running-shoe.webp" },
        { brand: "PACE STUDIO", headline: "COLOR IN MOTION", subheadline: "LIMITED EDITION", cta: "DISCOVER", image: "/pink-running-shoe-optimized.webp", imageName: "pink-running-shoe.webp" },
      ],
    },
  ],
} as const;

const campaignVariationsByLang = {
  es: [
    { eyebrow: "NUEVA TEMPORADA", title: "Formas suaves. Actitud fuerte.", offer: "30% OFF", code: "SS26—01", background: "linear-gradient(145deg,#f6a98f 0%,#f5d7bc 55%,#fff3df 100%)", ink: "#20130f", accent: "#ff633f", rotate: "-rotate-2" },
    { eyebrow: "EDICIÓN NOCTURNA", title: "Hecho para la noche.", offer: "NUEVO", code: "SS26—02", background: "linear-gradient(145deg,#17162b 0%,#44377b 58%,#a68cff 100%)", ink: "#ffffff", accent: "#c9ff5a", rotate: "rotate-1" },
    { eyebrow: "NOTAS DE ESTUDIO", title: "Objetos con intención.", offer: "LIMITADO", code: "SS26—03", background: "linear-gradient(145deg,#d7e9df 0%,#eef4e8 54%,#fbf1d5 100%)", ink: "#17372e", accent: "#196b53", rotate: "-rotate-1" },
    { eyebrow: "VERANO 26", title: "El color lo cambia todo.", offer: "COMPRAR", code: "SS26—04", background: "linear-gradient(145deg,#ffd94d 0%,#ff9f5a 48%,#f95b76 100%)", ink: "#2b1730", accent: "#6c43e0", rotate: "rotate-2" },
  ],
  en: [
    { eyebrow: "NEW SEASON", title: "Soft forms. Bold mood.", offer: "30% OFF", code: "SS26—01", background: "linear-gradient(145deg,#f6a98f 0%,#f5d7bc 55%,#fff3df 100%)", ink: "#20130f", accent: "#ff633f", rotate: "-rotate-2" },
    { eyebrow: "NIGHT EDIT", title: "Made for after dark.", offer: "NEW DROP", code: "SS26—02", background: "linear-gradient(145deg,#17162b 0%,#44377b 58%,#a68cff 100%)", ink: "#ffffff", accent: "#c9ff5a", rotate: "rotate-1" },
    { eyebrow: "STUDIO NOTES", title: "Objects with intention.", offer: "LIMITED", code: "SS26—03", background: "linear-gradient(145deg,#d7e9df 0%,#eef4e8 54%,#fbf1d5 100%)", ink: "#17372e", accent: "#196b53", rotate: "-rotate-1" },
    { eyebrow: "SUMMER 26", title: "Color changes everything.", offer: "SHOP NOW", code: "SS26—04", background: "linear-gradient(145deg,#ffd94d 0%,#ff9f5a 48%,#f95b76 100%)", ink: "#2b1730", accent: "#6c43e0", rotate: "rotate-2" },
  ],
} as const;

export default function HomePage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const c = copy[language];
  const [yearlyBilling, setYearlyBilling] = useState(false);
  const [heroWordIndex, setHeroWordIndex] = useState(0);
  const [heroDemoIndex, setHeroDemoIndex] = useState(0);
  const [heroVariationIndex, setHeroVariationIndex] = useState(0);
  const [typedHeroData, setTypedHeroData] = useState({ brand: "", headline: "", subheadline: "", cta: "", imageName: "" });
  const typedHeroDataRef = useRef(typedHeroData);

  useEffect(() => {
    setHeroWordIndex(0);
    const rotation = window.setInterval(() => {
      setHeroWordIndex((current) => (current + 1) % c.heroB.length);
    }, 2600);

    return () => window.clearInterval(rotation);
  }, [c.heroB]);

  useEffect(() => {
    setHeroDemoIndex(0);
    setHeroVariationIndex(0);
  }, [language]);

  const heroDemo = heroRenderDemos[language][heroDemoIndex];
  const heroVariation = heroDemo.variations[heroVariationIndex];

  useEffect(() => {
    const variationRotation = window.setTimeout(() => {
      if (heroVariationIndex < heroDemo.variations.length - 1) {
        setHeroVariationIndex((current) => current + 1);
        return;
      }

      setHeroDemoIndex((current) => (current + 1) % heroRenderDemos[language].length);
      setHeroVariationIndex(0);
    }, 3100);

    return () => window.clearTimeout(variationRotation);
  }, [heroDemo.variations.length, heroDemoIndex, heroVariationIndex, language]);

  useEffect(() => {
    const fields = ["brand", "headline", "subheadline", "cta", "imageName"] as const;
    const totalCharacters = fields.reduce((total, field) => total + heroVariation[field].length, 0);
    const previous = typedHeroDataRef.current;
    let progress = 0;

    const typing = window.setInterval(() => {
      progress = Math.min(progress + 2, totalCharacters);
      let remaining = progress;
      const next = { brand: "", headline: "", subheadline: "", cta: "", imageName: "" };

      fields.forEach((field) => {
        const visibleCharacters = Math.max(0, Math.min(heroVariation[field].length, remaining));
        next[field] = visibleCharacters === 0
          ? previous[field]
          : visibleCharacters >= heroVariation[field].length
            ? heroVariation[field]
            : heroVariation[field].slice(0, visibleCharacters) + previous[field].slice(visibleCharacters);
        remaining -= heroVariation[field].length;
      });

      setTypedHeroData(next);
      if (progress >= totalCharacters) {
        typedHeroDataRef.current = next;
        window.clearInterval(typing);
      }
    }, 22);

    return () => window.clearInterval(typing);
  }, [heroDemoIndex, heroVariation, heroVariationIndex, language]);

  const primaryHref = user ? "/dashboard" : "/sign-up";

  return (
    <main className="landing-modern min-h-screen overflow-x-clip bg-[#fafafe] text-[#101426] selection:bg-[#d9ccff] selection:text-[#101426]">
      <nav className="sticky top-0 z-50 border-b border-[#101426]/10 bg-white/90 shadow-[0_8px_30px_rgba(16,20,38,.035)] backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" aria-label="Dynamic Canvas" className="flex items-center">
            <BrandLogo className="h-11" />
          </Link>
          <div className="hidden items-center gap-7 lg:flex">
            <a href="#product" className="rounded-xl px-3 py-2 text-sm font-semibold text-[#596174] transition hover:bg-[#f6f5fb] hover:text-[#101426]">{c.navProduct}</a>
            <a href="#how" className="rounded-xl px-3 py-2 text-sm font-semibold text-[#596174] transition hover:bg-[#f6f5fb] hover:text-[#101426]">{c.navHow}</a>
            <a href="#templates" className="rounded-xl px-3 py-2 text-sm font-semibold text-[#596174] transition hover:bg-[#f6f5fb] hover:text-[#101426]">{c.navTemplates}</a>
            <a href="#pricing" className="rounded-xl px-3 py-2 text-sm font-semibold text-[#596174] transition hover:bg-[#f6f5fb] hover:text-[#101426]">{c.navPlans}</a>
            <Link href="/docs" className="rounded-xl px-3 py-2 text-sm font-semibold text-[#596174] transition hover:bg-[#f6f5fb] hover:text-[#101426]">{c.navDocs}</Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            {user ? (
              <Link href="/dashboard" className="rounded-xl bg-[#5b35d5] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#4f2bc5]">Dashboard</Link>
            ) : (
              <>
                <Link href="/sign-in" className="hidden rounded-xl px-3 py-2 text-sm font-bold text-[#596174] hover:bg-[#f6f5fb] hover:text-[#101426] sm:block">{c.login}</Link>
                <Link href="/sign-up" className="rounded-xl bg-[#5b35d5] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#4f2bc5] sm:px-5">{c.start}</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <header className="landing-dark-hero relative overflow-hidden border-b-2 border-[#101426] bg-[#101426] text-white lg:h-[calc(100svh-72px)] lg:min-h-[650px]">
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(to_bottom,black,transparent_95%)]" />
        <div className="pointer-events-none absolute -left-32 top-12 size-[420px] rounded-full bg-[#5b35d5]/25 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 size-[420px] rounded-full bg-[#c9ff5a]/10 blur-[130px]" />

        <div className="relative mx-auto grid h-full max-w-[1440px] items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:px-12 lg:py-8">
          <div className="relative z-10">
            <h1 className="max-w-3xl text-[clamp(3rem,5vw,5.45rem)] font-black leading-[0.89] tracking-[-0.07em]">
              <span className="block">{c.heroA}</span>
              <span className="mt-1 block min-h-[1.78em] overflow-hidden text-[#c9ff5a]">
                <span key={`${language}-${heroWordIndex}`} className="hero-rotating-word block">
                  {c.heroB[heroWordIndex]}
                </span>
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-white/62 sm:text-lg">{c.heroText}</p>

            <div className="mt-5 space-y-2">
              {c.heroPoints.map((item) => <div key={item} className="flex items-start gap-2.5 text-[13px] font-semibold text-white/78 sm:text-sm"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#c9ff5a] text-[#101426]"><Check className="size-3.5 stroke-[3]" /></span>{item}</div>)}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href={primaryHref} className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#2161ed] px-6 text-sm font-extrabold text-white shadow-[0_16px_50px_rgba(33,97,237,.28)] transition hover:-translate-y-0.5 hover:bg-[#3774f2]">
                {c.heroPrimary}<ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </Link>
              <Link href="/playground" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white px-6 text-sm font-extrabold text-[#101426] shadow-sm transition hover:bg-[#eeeaff] hover:text-[#5b35d5]">
                <Terminal className="size-4" />{c.heroSecondary}
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-semibold text-white/42 sm:text-xs">
              {[c.noCard, c.freeRenders, c.hdExport].map((item) => <span key={item} className="flex items-center gap-1.5"><Check className="size-3.5 text-[#c9ff5a]" />{item}</span>)}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[650px]">
            <div className="mb-3 grid grid-cols-2 gap-4 px-2">
              <div className="flex items-start gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#c9ff5a] text-sm font-black text-[#101426]">1</span><div><div className="text-xs font-black uppercase tracking-wider text-white">{c.heroJsonTitle}</div><div className="mt-0.5 text-[10px] text-white/40">{c.heroJsonText}</div></div></div>
              <div className="flex items-start gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#5b35d5] text-sm font-black text-white">2</span><div><div className="text-xs font-black uppercase tracking-wider text-white">{c.heroRenderTitle}</div><div className="mt-0.5 text-[10px] text-white/40">{c.heroRenderText}</div></div></div>
            </div>

            <div key={`${language}-${heroDemoIndex}`} className="hero-demo-enter relative grid gap-4 sm:grid-cols-2">
              <div className="flex h-[550px] w-full max-w-[305px] min-w-0 justify-self-center flex-col overflow-hidden rounded-[24px] border border-white/12 bg-[#171925] shadow-[0_24px_60px_rgba(0,0,0,.32)]">
                <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
                  <div className="flex items-center gap-2 text-[11px] font-black text-white/65"><span className="flex size-7 items-center justify-center rounded-md bg-[#c9ff5a]/12 text-[#c9ff5a]"><Braces className="size-4" /></span>request.json</div>
                  <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 font-mono text-[9px] text-white/35"><span className="size-1.5 animate-pulse rounded-full bg-[#c9ff5a]" />LIVE DATA</span>
                </div>
                <pre className="flex-1 overflow-hidden p-4 font-mono text-[9px] leading-[1.55] text-white/65"><code>{`{\n`}  <span className="text-[#ffb77e]">&quot;templateId&quot;</span>: {`\n`}    <span className="text-[#73a0ff]">&quot;{heroDemo.templateId}&quot;</span>,{`\n`}  <span className="text-[#ffb77e]">&quot;format&quot;</span>: <span className="text-[#73a0ff]">&quot;jpg&quot;</span>,{`\n`}  <span className="text-[#ffb77e]">&quot;layers&quot;</span>: {`{\n`}    <span className="text-[#ffb77e]">&quot;brand&quot;</span>: {`{\n`}      <span className="text-[#ffb77e]">&quot;text&quot;</span>: <span className="text-[#c9ff5a]">&quot;{typedHeroData.brand}&quot;</span>{`\n`}    {`},\n`}    <span className="text-[#ffb77e]">&quot;headline&quot;</span>: {`{\n`}      <span className="text-[#ffb77e]">&quot;text&quot;</span>: <span className="text-[#c9ff5a]">&quot;{typedHeroData.headline}&quot;</span>{`\n`}    {`},\n`}    <span className="text-[#ffb77e]">&quot;subtitle&quot;</span>: {`{\n`}      <span className="text-[#ffb77e]">&quot;text&quot;</span>: <span className="text-[#c9ff5a]">&quot;{typedHeroData.subheadline}&quot;</span>{`\n`}    {`},\n`}    <span className="text-[#ffb77e]">&quot;cta&quot;</span>: {`{\n`}      <span className="text-[#ffb77e]">&quot;text&quot;</span>: <span className="text-[#c9ff5a]">&quot;{typedHeroData.cta}&quot;</span>{`\n`}    {`},\n`}    <span className="text-[#ffb77e]">&quot;cover&quot;</span>: {`{\n`}      <span className="text-[#ffb77e]">&quot;image_url&quot;</span>: {`\n`}        <span className="text-[#73a0ff]">&quot;.../{typedHeroData.imageName}&quot;</span>{`\n`}    {`}\n`}  {`}\n`}{`}`}<span className="hero-json-cursor" /></code></pre>
                <div className="flex h-11 shrink-0 items-center justify-between border-t border-white/10 px-4"><span className="flex items-center gap-1.5 font-mono text-[9px] text-white/35"><Upload className="size-3.5" />POST /api/render</span><span className="rounded-md bg-[#c9ff5a]/15 px-2.5 py-1 font-mono text-[9px] font-black text-[#c9ff5a]">200 OK</span></div>
              </div>

              <div className="relative h-[550px] w-full max-w-[305px] justify-self-center overflow-hidden rounded-[24px] border-2 border-white/15 p-2.5 shadow-[0_24px_60px_rgba(0,0,0,.32)]" style={{ backgroundColor: heroDemo.background }}>
                <div className="relative h-full overflow-hidden rounded-[16px]" style={{ backgroundColor: heroDemo.background, color: heroDemo.ink }}>
                  <div className="absolute inset-x-3 top-2 z-30 flex gap-1">
                    {heroDemo.variations.map((variation, index) => <span key={variation.headline} className="h-[2px] flex-1 overflow-hidden rounded-full bg-black/15"><span key={`${heroDemoIndex}-${heroVariationIndex}-${index}`} className={`block h-full origin-left rounded-full bg-white ${index < heroVariationIndex ? "w-full" : index === heroVariationIndex ? "hero-story-progress" : "w-0"}`} /></span>)}
                  </div>
                  <div className="absolute inset-x-0 top-3 z-20 flex h-14 items-center justify-between px-4"><span className="text-[8px] font-black tracking-[0.16em]">{typedHeroData.brand || "\u00A0"}</span><span className="rounded-full px-2.5 py-1 text-[7px] font-black text-white" style={{ backgroundColor: heroDemo.accent }}>LIVE</span></div>
                  <div className="absolute inset-x-3.5 top-16 h-[49%] overflow-hidden rounded-[14px] border border-black/10 bg-white/40">
                    <Image src={heroVariation.image} alt={heroVariation.imageName} fill priority className="hero-story-image object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                  </div>
                  <div className="absolute inset-x-5 bottom-5 z-20">
                    <div className="min-h-[16px] text-[10px] font-black uppercase tracking-[0.11em]" style={{ color: heroDemo.accent }}>{typedHeroData.subheadline}</div>
                    <div className="mt-1.5 min-h-[66px] text-[28px] font-black leading-[0.88] tracking-[-0.06em]">{typedHeroData.headline}</div>
                    <div className="mt-3.5 inline-flex min-h-[30px] rounded-full px-4 py-2.5 text-[8px] font-black text-white shadow-md" style={{ backgroundColor: heroDemo.accent }}>{typedHeroData.cta || "\u00A0"}</div>
                  </div>
                </div>
              </div>

              <div className="absolute left-1/2 top-1/2 z-30 hidden size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#101426] bg-[#c9ff5a] text-[#101426] shadow-[3px_3px_0_#101426] sm:flex"><ArrowRight className="size-4 stroke-[3]" /></div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2">
              {heroRenderDemos[language].map((demo, index) => <button key={demo.templateId} type="button" aria-label={`Demo ${index + 1}`} onClick={() => { setHeroDemoIndex(index); setHeroVariationIndex(0); }} className={`h-1.5 rounded-full transition-all ${index === heroDemoIndex ? "w-8 bg-[#c9ff5a]" : "w-3 bg-white/20 hover:bg-white/40"}`} />)}
            </div>
          </div>
        </div>
      </header>

      <section id="integrations" className="border-b border-[#101426]/10 bg-[#f7f8fb] py-24 lg:py-32">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#5b35d5]">{c.trusted}</p>
            <h2 className="mt-5 text-4xl font-black leading-[0.95] tracking-[-0.055em] sm:text-6xl">
              {c.integrationsTitleA} <em className="font-serif font-semibold text-[#5b35d5]">{c.integrationsTitleB}</em>
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-[#101426]/60">{c.integrationsText}</p>
          </div>

          <div className="mt-16">
            <div className="mb-7 flex items-center justify-center gap-2 text-sm font-black text-[#101426]/45"><span className="size-2 rounded-full bg-[#2161ed]" />{c.noCodeLabel}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
              {noCodeIntegrations.map((tool) => (
                <div key={tool.name} className="flex h-20 items-center justify-center px-3 transition duration-300 hover:-translate-y-1">
                  <Image src={tool.src} alt={`${tool.name} logo`} width={tool.width} height={tool.height} className="h-auto max-h-12 w-full max-w-[190px] object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="border-b border-[#101426]/10 bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <h2 className="text-5xl font-black leading-none tracking-[-0.055em] sm:text-7xl">{c.flowTitle}</h2>
          </div>

          <div className="mt-14 grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div className="relative space-y-4 pl-1">
              <div className="absolute bottom-8 left-[27px] top-8 w-px bg-[#ddd8f7]" />
              {[
                [Palette, c.step1, c.step1Text],
                [Braces, c.step2, c.step2Text],
                [Rocket, c.step3, c.step3Text],
              ].map(([Icon, title, text], index) => {
                const StepIcon = Icon as typeof Palette;
                return (
                  <article key={String(title)} className="relative grid grid-cols-[56px_1fr] gap-5 rounded-[22px] border border-[#101426]/8 bg-white p-5 shadow-[0_12px_32px_rgba(16,20,38,.045)]">
                    <div className="relative z-10 flex size-14 items-center justify-center rounded-full border border-[#5b35d5]/15 bg-[#eeeaff] text-[#5b35d5]"><StepIcon className="size-6" /></div>
                    <div className="pt-1">
                      <p className="text-lg font-black uppercase leading-none tracking-[0.12em] text-[#5b35d5] sm:text-xl">{c.stepLabel} {index + 1}</p>
                      <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] sm:text-3xl">{String(title)}</h3>
                      <p className="mt-3 max-w-xl leading-relaxed text-[#101426]/60">{String(text)}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="relative min-h-[500px] overflow-hidden rounded-[32px] bg-[#f1f0e9] sm:min-h-[590px]">
              <div className="absolute -left-16 -top-16 size-64 rounded-full bg-[#d9ccff] blur-3xl" />
              <div className="absolute -bottom-20 -right-16 size-72 rounded-full bg-[#c9ff5a]/70 blur-3xl" />
              <div className="absolute left-[7%] top-[9%] z-10 w-[43%] -rotate-6 overflow-hidden rounded-[18px] border-2 border-[#101426] bg-white p-2 shadow-[10px_12px_0_rgba(16,20,38,.12)]">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[11px]"><Image src={`/variaciones/${language === "es" ? "spanish" : "English"}/1.png`} alt={c.howPreviewAlt} fill className="object-cover" /></div>
              </div>
              <div className="absolute right-[6%] top-[14%] z-20 w-[45%] rotate-6 overflow-hidden rounded-[18px] border-2 border-[#101426] bg-white p-2 shadow-[10px_12px_0_rgba(16,20,38,.12)]">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[11px]"><Image src={`/variaciones/${language === "es" ? "spanish" : "English"}/2.png`} alt="" fill className="object-cover" /></div>
              </div>
              <div className="absolute bottom-[5%] left-[29%] z-30 w-[43%] -rotate-1 overflow-hidden rounded-[18px] border-2 border-[#101426] bg-white p-2 shadow-[10px_12px_0_rgba(16,20,38,.12)]">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[11px]"><Image src={`/variaciones/${language === "es" ? "spanish" : "English"}/3.png`} alt="" fill className="object-cover" /></div>
              </div>
              <div className="absolute bottom-5 right-5 z-40 rounded-full border-2 border-[#101426] bg-[#101426] px-4 py-2 font-mono text-[10px] font-black text-[#c9ff5a] shadow-lg">API → RENDER</div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b-2 border-[#101426] bg-[#101426] py-24 text-white lg:py-32">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(to_bottom,black,transparent_95%)]" />
        <div className="pointer-events-none absolute -left-28 bottom-0 size-96 rounded-full bg-[#5b35d5]/25 blur-[120px]" />
        <div className="pointer-events-none absolute -right-20 top-0 size-96 rounded-full bg-[#c9ff5a]/10 blur-[120px]" />

        <div className="relative mx-auto grid max-w-[1240px] items-center gap-16 px-5 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-20 lg:px-12">
          <div>
            <h2 className="max-w-2xl text-4xl font-black leading-[0.94] tracking-[-0.055em] sm:text-6xl">{c.apiShowcaseTitle}</h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/62">{c.apiShowcaseText}</p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {c.apiShowcaseFeatures.map(([title, text]) => (
                <article key={title} className="flex gap-4">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-[#c9ff5a]/30 bg-[#c9ff5a]/10 text-[#c9ff5a]"><ArrowRight className="size-4 stroke-[3]" /></span>
                  <div><h3 className="text-lg font-black">{title}</h3><p className="mt-1 max-w-lg text-sm leading-relaxed text-white/48">{text}</p></div>
                </article>
              ))}
            </div>

            <Link href="/docs" className="mt-10 inline-flex h-13 items-center gap-2 rounded-xl bg-[#c9ff5a] px-6 py-3.5 font-black text-[#101426] shadow-[0_16px_45px_rgba(201,255,90,.16)] transition hover:-translate-y-1 hover:bg-white">
              {c.apiShowcaseButton}<ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -rotate-2 rounded-[32px] border border-[#5b35d5]/45 bg-[#5b35d5]/10" />
            <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[#171925] shadow-[0_35px_100px_rgba(0,0,0,.38)]">
              <div className="flex h-14 items-center justify-between border-b border-white/10 px-5">
                <div className="flex gap-2"><span className="size-3 rounded-full bg-[#ff6b7d]" /><span className="size-3 rounded-full bg-[#ffad3d]" /><span className="size-3 rounded-full bg-[#c9ff5a]" /></div>
                <span className="font-mono text-[11px] font-bold text-white/35">render-image.js</span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[10px] leading-[1.75] text-white/64 sm:p-7 sm:text-[12px]"><code><span className="text-[#d9ccff]">const</span>{` response = await fetch("/api/render", {\n`}  <span className="text-[#ffb77e]">method</span>: <span className="text-[#c9ff5a]">"POST"</span>,{`\n`}  <span className="text-[#ffb77e]">headers</span>: {`{\n`}    <span className="text-[#73a0ff]">"Authorization"</span>: <span className="text-[#c9ff5a]">`Bearer ${'{'}API_KEY{'}'}`</span>,{`\n`}    <span className="text-[#73a0ff]">"Content-Type"</span>: <span className="text-[#c9ff5a]">"application/json"</span>{`\n`}  {`},\n`}  <span className="text-[#ffb77e]">body</span>: JSON.stringify({`{\n`}    <span className="text-[#73a0ff]">templateId</span>: <span className="text-[#c9ff5a]">"YOUR_TEMPLATE_ID"</span>,{`\n`}    <span className="text-[#73a0ff]">format</span>: <span className="text-[#c9ff5a]">"png"</span>,{`\n`}    <span className="text-[#73a0ff]">layers</span>: {`{\n`}      <span className="text-[#73a0ff]">headline</span>: {`{\n`}        <span className="text-[#73a0ff]">text</span>: <span className="text-[#c9ff5a]">"Summer sale"</span>{`\n`}      {`},\n`}      <span className="text-[#73a0ff]">product</span>: {`{\n`}        <span className="text-[#73a0ff]">image_url</span>: <span className="text-[#c9ff5a]">"https://.../shoe.jpg"</span>{`\n`}      {`}\n`}    {`}\n`}  {`}\n`}  {`)\n`}{`});`}</code></pre>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/10 px-5 py-4 sm:px-7">
                <span className="flex items-center gap-2 font-mono text-[10px] text-white/35"><Upload className="size-3.5" />POST /api/render</span>
                <div className="flex items-center gap-2"><span className="rounded-full bg-[#5b35d5]/25 px-3 py-1.5 font-mono text-[9px] font-black text-[#d9ccff]">2160 × 2700</span><span className="rounded-full bg-[#c9ff5a]/12 px-3 py-1.5 font-mono text-[9px] font-black text-[#c9ff5a]">200 OK</span></div>
              </div>
            </div>
            <div className="absolute -bottom-5 -right-3 rounded-full border-2 border-[#101426] bg-[#ff6b7d] px-4 py-2 text-xs font-black text-white shadow-[4px_4px_0_#c9ff5a]">JPG · PNG · WEBP</div>
          </div>
        </div>
      </section>

      <section id="product" className="relative overflow-hidden border-y border-[#101426]/8 bg-[#f7f8fc] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="pointer-events-none absolute -left-40 top-20 size-[420px] rounded-full bg-[#dfe8ff]/70 blur-[110px]" />
        <div className="pointer-events-none absolute -right-44 bottom-0 size-[440px] rounded-full bg-[#e6dcff]/55 blur-[120px]" />
        <div className="relative mx-auto max-w-[1320px]">
          <div className="mb-14 max-w-3xl">
            <h2 className="text-4xl font-black leading-none tracking-[-0.05em] sm:text-6xl">{c.bentoTitle}</h2>
          </div>

          <div className="grid auto-rows-[minmax(220px,auto)] gap-5 md:grid-cols-2 lg:grid-cols-3">
            <article className="relative overflow-hidden rounded-[28px] border border-[#dfe2ec] bg-white p-7 shadow-[0_16px_48px_rgba(43,37,72,.07)] lg:col-span-3 sm:p-8">
              <div className="relative z-10 flex max-w-2xl items-start gap-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#e9e5ff] text-[#5b35d5]"><Palette className="size-6" /></span>
                <div><h3 className="text-2xl font-black tracking-[-0.03em] sm:text-3xl">{c.editorTitle}</h3><p className="mt-3 max-w-xl leading-relaxed text-[#596174]">{c.editorText}</p></div>
              </div>
              <div className="relative z-10 mt-8 overflow-hidden rounded-[20px] border border-[#dfe2ec] bg-[#f4f5fa] shadow-[0_18px_45px_rgba(29,27,48,.12)]">
                <Image
                  src={language === "es" ? "/landing/editor-workspace-es.webp" : "/landing/editor-workspace-en.webp"}
                  alt={c.editorTitle}
                  width={1800}
                  height={922}
                  sizes="(min-width: 1024px) 760px, 92vw"
                  className="block h-auto w-full"
                />
              </div>
            </article>

            <article className="rounded-[28px] border border-[#dfe2ec] bg-white p-7 shadow-[0_16px_48px_rgba(43,37,72,.07)]">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#e5f8f1] text-[#14795d]"><Blocks className="size-6" /></span>
              <h3 className="mt-7 text-2xl font-black tracking-[-0.03em]">{c.automationTitle}</h3><p className="mt-3 text-sm leading-relaxed text-[#596174]">{c.automationText}</p><div className="mt-6 flex flex-wrap gap-2">{["n8n", "Make", "Zapier"].map(x => <span key={x} className="rounded-full border border-[#cfe8df] bg-[#f2fbf7] px-3 py-1.5 text-[10px] font-black text-[#14795d]">{x}</span>)}</div>
            </article>

            <article className="relative overflow-hidden rounded-[28px] border border-[#dfe2ec] bg-white p-7 shadow-[0_16px_48px_rgba(43,37,72,.07)] lg:col-span-2 sm:p-8">
              <div className="pointer-events-none absolute -bottom-20 -left-12 size-56 rounded-full bg-[#fff0e8] blur-3xl" />
              <div className="relative grid gap-8 sm:grid-cols-[minmax(0,1fr)_minmax(300px,.9fr)] sm:items-center">
                <div className="flex items-start gap-5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff0e8] text-[#d85a26]"><FileImage className="size-6" /></span>
                  <div>
                    <h3 className="text-2xl font-black tracking-[-0.03em]">{c.formatsTitle}</h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-[#596174]">{c.formatsText}</p>
                    <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#596174]">
                      <span className="rounded-full border border-[#e4e7ef] bg-[#f8f9fc] px-3 py-1.5">2× HD</span>
                      <span className="rounded-full border border-[#e4e7ef] bg-[#f8f9fc] px-3 py-1.5">RGB</span>
                      <span className="rounded-full border border-[#e4e7ef] bg-[#f8f9fc] px-3 py-1.5">API</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] bg-[#111629] p-3.5 shadow-[0_16px_35px_rgba(17,22,41,.18)]">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/45">{language === "es" ? "Formatos de salida" : "Output formats"}</span>
                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#c9ff5a]"><span className="size-1.5 rounded-full bg-[#c9ff5a] shadow-[0_0_10px_#c9ff5a]" />{language === "es" ? "Listo" : "Ready"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["JPEG", "PNG", "WebP"].map((format, index) => (
                      <div key={format} className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-3 text-center">
                        <FileImage className={`mx-auto size-5 ${index === 0 ? "text-[#ff9a70]" : index === 1 ? "text-[#a995ff]" : "text-[#73a0ff]"}`} />
                        <div className="mt-2 text-[11px] font-black text-white">{format}</div>
                        <div className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-white/30">HD</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2.5 flex items-center justify-between rounded-xl bg-black/15 px-3 py-2 font-mono text-[9px] text-white/35"><span>2160 × 2700</span><span className="font-black text-[#c9ff5a]">200 OK</span></div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-[#101426]/8 bg-[#f7f8fc] py-24 text-[#101426] lg:py-32">
        <div className="pointer-events-none absolute -left-40 top-24 size-[420px] rounded-full bg-[#dfe8ff]/70 blur-[110px]" />
        <div className="pointer-events-none absolute -right-44 bottom-0 size-[440px] rounded-full bg-[#e6dcff]/55 blur-[120px]" />
        <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="mb-14 grid items-end gap-7 lg:grid-cols-[1fr_.72fr]">
            <div className="max-w-3xl">
              <h2 className="text-4xl font-black leading-[0.98] tracking-[-0.05em] sm:text-6xl">{c.scaleTitle}</h2>
            </div>
            <p className="max-w-xl text-base leading-relaxed text-[#596174] lg:justify-self-end lg:text-lg">{c.scaleText}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {[
              { Icon: Users, title: c.scaleTeamTitle, text: c.scaleTeamText, icon: "bg-[#e9e5ff] text-[#5b35d5]" },
              { Icon: Zap, title: c.scaleSpeedTitle, text: c.scaleSpeedText, icon: "bg-[#e7f0ff] text-[#2161ed]" },
              { Icon: Server, title: c.scaleInfraTitle, text: c.scaleInfraText, icon: "bg-[#e5f8f1] text-[#14795d]" },
              { Icon: Lock, title: c.scaleSecureTitle, text: c.scaleSecureText, icon: "bg-[#fff0e8] text-[#d85a26]" },
            ].map(({ Icon, title, text, icon }) => (
              <article key={title} className="group relative overflow-hidden rounded-[26px] border border-[#dfe2ec] bg-white p-7 shadow-[0_16px_48px_rgba(43,37,72,.07)] transition duration-300 hover:-translate-y-1 hover:border-[#cfc8ed] hover:shadow-[0_22px_60px_rgba(43,37,72,.11)] sm:p-8">
                <div className="flex items-start gap-5">
                  <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${icon}`}><Icon className="size-6" /></span>
                  <div>
                    <h3 className="text-xl font-black tracking-[-0.025em] sm:text-2xl">{title}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-[#596174] sm:text-[15px]">{text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-[26px] border border-white/10 bg-[#111629] p-1.5 shadow-[0_22px_60px_rgba(17,22,41,.18)] lg:grid-cols-4">
            {[
              [c.scaleStat1, c.scaleStat1Label],
              [c.scaleStat2, c.scaleStat2Label],
              [c.scaleStat3, c.scaleStat3Label],
              [c.scaleStat4, c.scaleStat4Label],
            ].map(([value, label], index) => (
              <div key={String(label)} className={`rounded-[20px] p-6 text-center sm:p-8 ${index === 0 ? "bg-white/[.06]" : ""}`}>
                <div className={`text-4xl font-black tracking-[-0.045em] ${index % 2 === 0 ? "text-[#c9ff5a]" : "text-[#a995ff]"}`}>{value}</div>
                <div className="mt-2 text-xs font-bold text-white/45">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#101426]/10 bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12"><div className="mb-14 max-w-3xl"><h2 className="text-4xl font-black leading-none tracking-[-0.045em] sm:text-6xl">{c.useTitle}</h2></div><div className="grid gap-px overflow-hidden rounded-[28px] border border-[#101426]/10 bg-[#101426]/10 shadow-[0_22px_70px_rgba(16,20,38,.06)] md:grid-cols-2 lg:grid-cols-3">{c.uses.map(([title, text], index) => <article key={title} className="group bg-white p-7 transition hover:bg-[#f2efff]"><div className="flex items-start justify-between"><span className="text-xs font-black text-[#5b35d5]">0{index + 1}</span><ArrowRight className="size-5 -rotate-45 transition group-hover:rotate-0" /></div><h3 className="mt-10 text-2xl font-black">{title}</h3><p className="mt-3 text-sm leading-relaxed text-[#101426]/60">{text}</p></article>)}</div></div>
      </section>

      <section id="pricing" className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="text-center"><h2 className="mx-auto max-w-4xl text-4xl font-black leading-none tracking-[-0.045em] sm:text-6xl">{c.plansTitle}</h2></div>
        <div className="mx-auto mt-9 flex w-fit items-center rounded-full border-2 border-[#101426] bg-white p-1 shadow-[4px_4px_0_#101426]">
          <button onClick={() => setYearlyBilling(false)} className={`rounded-full px-5 py-2 text-sm font-black transition ${!yearlyBilling ? "bg-[#101426] text-white" : "text-[#101426]/55"}`}>{c.billingMonthly}</button>
          <button onClick={() => setYearlyBilling(true)} className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black transition ${yearlyBilling ? "bg-[#5b35d5] text-white" : "text-[#101426]/55"}`}>{c.billingYearly}<span className={`rounded-full px-2 py-0.5 text-[9px] ${yearlyBilling ? "bg-[#c9ff5a] text-[#101426]" : "bg-[#e9e5ff] text-[#5b35d5]"}`}>{c.annualDiscount}</span></button>
        </div>
        <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
          {[
            ["creator", c.free, c.current, 29, 23, 276, c.freeItems, false],
            ["agency", c.pro, c.popular, 79, 63, 756, c.proItems, true],
            ["business", c.scale, c.custom, 179, 143, 1716, c.scaleItems, false],
          ].map(([slug, name, badge, monthlyPrice, annualMonthlyPrice, annualTotal, items, featured]) => <article key={String(slug)} className={`relative flex flex-col rounded-[28px] border-2 border-[#101426] p-7 ${featured ? "bg-[#101426] text-white shadow-[10px_10px_0_#c9ff5a]" : "bg-white"}`}><span className={`w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${featured ? "bg-[#c9ff5a] text-[#101426]" : "bg-[#e9e5ff] text-[#5b35d5]"}`}>{String(badge)}</span><h3 className="mt-7 text-3xl font-black">{String(name)}</h3><p className={`mt-2 text-sm font-medium ${featured ? "text-white/55" : "text-[#101426]/55"}`}>{String(badge) === c.current ? (language === "es" ? "Automatiza tu creación de imágenes" : "Automate your image creation") : String(badge) === c.popular ? (language === "es" ? "Escala tus automatizaciones de imágenes" : "Scale your image automations") : (language === "es" ? "Potencia tu producción de imágenes" : "Power your image production")}</p><div className="mt-5 flex items-end gap-2"><span className="pb-2 text-xl font-black">$</span><strong className="text-5xl font-black tracking-tight">{yearlyBilling ? String(annualMonthlyPrice) : String(monthlyPrice)}</strong><span className={`pb-1 text-xs ${featured ? "text-white/45" : "text-[#101426]/45"}`}>{c.monthly}</span></div>{yearlyBilling && <p className={`mt-2 text-xs font-semibold ${featured ? "text-white/45" : "text-[#101426]/45"}`}>USD {Number(annualTotal).toLocaleString(language === "es" ? "es-CO" : "en-US")} · {c.billedYearly}</p>}<div className={`my-7 border-t ${featured ? "border-white/15" : "border-[#101426]/10"}`} /><ul className="flex-1 space-y-3">{(items as string[]).map(item => <li key={item} className="flex gap-2 text-[13px] font-semibold leading-snug"><BadgeCheck className={`size-5 shrink-0 ${featured ? "text-[#c9ff5a]" : "text-[#5b35d5]"}`} />{item}</li>)}</ul><Link href={`${user ? "/dashboard" : "/sign-up"}?plan=${String(slug)}&billing=${yearlyBilling ? "yearly" : "monthly"}`} className={`mt-8 flex h-12 items-center justify-center rounded-full font-black transition ${featured ? "bg-[#c9ff5a] text-[#101426] hover:bg-white" : "bg-[#101426] text-white hover:bg-[#5b35d5]"}`}>{c.planAction}</Link></article>)}
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32"><div className="relative mx-auto max-w-[1344px] overflow-hidden rounded-[36px] border border-[#5b35d5]/10 bg-gradient-to-br from-[#eeeaff] via-white to-[#f7f8ff] px-6 py-16 text-center shadow-[0_30px_90px_rgba(91,53,213,.12)] sm:px-12 lg:py-24"><div className="absolute -left-12 -top-12 size-40 rounded-full bg-[#5b35d5]/10 blur-sm" /><h2 className="relative mx-auto max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-7xl">{c.ctaTitle}</h2><p className="relative mx-auto mt-6 max-w-2xl text-lg font-semibold text-[#101426]/60 text-balance">{c.ctaText}</p><Link href={primaryHref} className="relative mt-9 inline-flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-[#5b35d5] to-[#6f4bea] px-7 font-black text-white shadow-[0_14px_35px_rgba(91,53,213,.24)] transition hover:-translate-y-1 hover:brightness-105">{c.ctaButton}<ArrowRight className="size-4" /></Link><p className="relative mt-4 text-sm font-bold text-[#101426]/45">{c.noCard}</p></div></section>

      <footer className="bg-[#101426] text-white"><div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12"><div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-2 lg:grid-cols-5"><div className="lg:col-span-2"><BrandMark className="size-12 text-base" /><p className="mt-5 max-w-sm text-sm leading-relaxed text-white/45">{c.footerText}</p></div><div><h3 className="text-xs font-black uppercase tracking-wider text-[#c9ff5a]">{c.product}</h3><div className="mt-5 space-y-3 text-sm text-white/55"><a className="block hover:text-white" href="#product">{c.navProduct}</a><a className="block hover:text-white" href="#templates">{c.navTemplates}</a><a className="block hover:text-white" href="#pricing">{c.navPlans}</a></div></div><div><h3 className="text-xs font-black uppercase tracking-wider text-[#c9ff5a]">{c.resources}</h3><div className="mt-5 space-y-3 text-sm text-white/55"><Link className="block hover:text-white" href="/docs">{c.navDocs}</Link><Link className="block hover:text-white" href="/playground">Playground</Link><Link className="block hover:text-white" href="/dashboard">Dashboard</Link></div></div><div><h3 className="text-xs font-black uppercase tracking-wider text-[#c9ff5a]">{c.legal}</h3><div className="mt-5 space-y-3 text-sm text-white/55"><Link className="block hover:text-white" href="/privacy">{c.privacy}</Link><Link className="block hover:text-white" href="/terms">{c.terms}</Link><Link className="block hover:text-white" href="/security">{c.security}</Link></div></div></div><div className="flex flex-col gap-4 pt-8 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Dynamic Canvas. {c.rights}</p><div className="flex items-center gap-2"><ShieldCheck className="size-4" /> Secure API infrastructure</div></div></div></footer>
    </main>
  );
}
