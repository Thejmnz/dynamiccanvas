"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Code2,
  CreditCard,
  FolderKanban,
  Headphones,
  KeyRound,
  LayoutTemplate,
  Sparkles,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

import { BrandMark } from "@/components/brand-mark";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { supabase } from "@/lib/supabaseClient";

type DashboardOnboardingProps = {
  enabled: boolean;
  userId: string;
  userName?: string | null;
  userCreatedAt?: string | null;
  onboardingCompleted?: boolean;
};

type Step = {
  target?: string;
  icon: typeof Sparkles;
  title: string;
  description: string;
  accent: string;
};

type TargetRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
};

const ONBOARDING_VERSION = "v1";
const ONBOARDING_RELEASE_AT = Date.parse("2026-07-13T00:00:00-05:00");
const CARD_WIDTH = 390;
const VIEWPORT_MARGIN = 18;
const TARGET_GAP = 18;

const clamp = (value: number, min: number, max: number) => (
  Math.min(Math.max(value, min), Math.max(min, max))
);

export const DashboardOnboarding = ({
  enabled,
  userId,
  userName,
  userCreatedAt,
  onboardingCompleted,
}: DashboardOnboardingProps) => {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const forceOnboarding = searchParams.get("onboarding") === "1";
  const storageKey = `dynamic-canvas:onboarding:${ONBOARDING_VERSION}:${userId}`;
  const firstName = userName?.trim().split(/\s+/)[0] || (language === "es" ? "creador" : "creator");

  const steps = useMemo<Step[]>(() => language === "es" ? [
    {
      icon: Sparkles,
      title: `¡Bienvenido, ${firstName}!`,
      description: "Te mostraremos lo esencial para crear plantillas y automatizar tus primeros renders. Solo tomará un minuto.",
      accent: "#c9ff5a",
    },
    {
      target: "create-template",
      icon: LayoutTemplate,
      title: "Crea tu primera plantilla",
      description: "Empieza con un tamaño predeterminado o define dimensiones personalizadas. Después podrás diseñarla en el editor visual.",
      accent: "#c9ff5a",
    },
    {
      target: "templates",
      icon: FolderKanban,
      title: "Tus plantillas viven aquí",
      description: "Busca, duplica, organiza y abre tus diseños. Cada plantilla puede convertirse en cientos de imágenes dinámicas.",
      accent: "#ff8a65",
    },
    {
      target: "api-key",
      icon: KeyRound,
      title: "Conecta tu automatización",
      description: "Tu API key autentica las solicitudes desde n8n, Make, Zapier o cualquier aplicación propia. Trátala como una contraseña.",
      accent: "#8da2ff",
    },
    {
      target: "playground",
      icon: Code2,
      title: "Prueba antes de integrar",
      description: "En Playground eliges una plantilla, cambias sus capas y generas un render real mientras ves el código listo para copiar.",
      accent: "#d9ccff",
    },
    {
      target: "credits",
      icon: CreditCard,
      title: "Cada render usa un crédito",
      description: "Aquí puedes consultar tu plan, créditos disponibles y límites. Tu cuenta gratuita comienza con 50 créditos.",
      accent: "#ffd166",
    },
    {
      target: "support",
      icon: Headphones,
      title: "Estamos para ayudarte",
      description: "Si algo no funciona o necesitas orientación, abre el chat de soporte desde este acceso. ¡Ya estás listo para comenzar!",
      accent: "#c9ff5a",
    },
  ] : [
    {
      icon: Sparkles,
      title: `Welcome, ${firstName}!`,
      description: "We will show you the essentials to create templates and automate your first renders. It only takes a minute.",
      accent: "#c9ff5a",
    },
    {
      target: "create-template",
      icon: LayoutTemplate,
      title: "Create your first template",
      description: "Start with a preset size or define custom dimensions. Then build your design in the visual editor.",
      accent: "#c9ff5a",
    },
    {
      target: "templates",
      icon: FolderKanban,
      title: "Your templates live here",
      description: "Search, duplicate, organize and open your designs. Each template can become hundreds of dynamic images.",
      accent: "#ff8a65",
    },
    {
      target: "api-key",
      icon: KeyRound,
      title: "Connect your automation",
      description: "Your API key authenticates requests from n8n, Make, Zapier or your own application. Treat it like a password.",
      accent: "#8da2ff",
    },
    {
      target: "playground",
      icon: Code2,
      title: "Test before integrating",
      description: "In Playground you can select a template, change its layers and generate a real render while viewing copy-ready code.",
      accent: "#d9ccff",
    },
    {
      target: "credits",
      icon: CreditCard,
      title: "Each render uses one credit",
      description: "Check your plan, available credits and limits here. Your free account starts with 50 credits.",
      accent: "#ffd166",
    },
    {
      target: "support",
      icon: Headphones,
      title: "We are here to help",
      description: "If something is not working or you need guidance, open support chat here. You are ready to get started!",
      accent: "#c9ff5a",
    },
  ], [firstName, language]);

  const step = steps[stepIndex];
  const StepIcon = step.icon;

  useEffect(() => {
    if (!enabled || !userId) {
      setOpen(false);
      return;
    }

    const alreadyCompleted = window.localStorage.getItem(storageKey) === "completed";
    const createdAt = userCreatedAt ? Date.parse(userCreatedAt) : Number.NaN;
    const isNewAccount = onboardingCompleted === false || (
      Number.isFinite(createdAt) && createdAt >= ONBOARDING_RELEASE_AT
    );

    if (!forceOnboarding && (alreadyCompleted || onboardingCompleted === true || !isNewAccount)) {
      return;
    }

    const timer = window.setTimeout(() => {
      setStepIndex(0);
      setOpen(true);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [enabled, forceOnboarding, onboardingCompleted, storageKey, userCreatedAt, userId]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !step.target) {
      setTargetRect(null);
      return;
    }

    const updateTarget = () => {
      const element = document.querySelector<HTMLElement>(`[data-onboarding="${step.target}"]`);
      if (!element) {
        setTargetRect(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      setTargetRect({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
      });
    };

    const frame = window.requestAnimationFrame(updateTarget);
    window.addEventListener("resize", updateTarget);
    window.addEventListener("scroll", updateTarget, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("scroll", updateTarget, true);
    };
  }, [open, step.target]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finishOnboarding();
      if (event.key === "ArrowRight" && stepIndex < steps.length - 1) setStepIndex((current) => current + 1);
      if (event.key === "ArrowLeft" && stepIndex > 0) setStepIndex((current) => current - 1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const finishOnboarding = () => {
    window.localStorage.setItem(storageKey, "completed");
    setOpen(false);

    if (onboardingCompleted !== true) {
      void supabase.auth.updateUser({ data: { onboarding_completed: true } }).catch(() => {
        // Local persistence is enough when the auth session belongs to NextAuth.
      });
    }
  };

  const cardPosition = useMemo(() => {
    if (!targetRect || typeof window === "undefined") {
      return {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      } as const;
    }

    const cardHeight = 340;
    if (targetRect.right + TARGET_GAP + CARD_WIDTH <= window.innerWidth - VIEWPORT_MARGIN) {
      return {
        left: targetRect.right + TARGET_GAP,
        top: clamp(targetRect.top + targetRect.height / 2 - cardHeight / 2, VIEWPORT_MARGIN, window.innerHeight - cardHeight - VIEWPORT_MARGIN),
      };
    }

    if (targetRect.left - TARGET_GAP - CARD_WIDTH >= VIEWPORT_MARGIN) {
      return {
        left: targetRect.left - TARGET_GAP - CARD_WIDTH,
        top: clamp(targetRect.top + targetRect.height / 2 - cardHeight / 2, VIEWPORT_MARGIN, window.innerHeight - cardHeight - VIEWPORT_MARGIN),
      };
    }

    if (targetRect.bottom + TARGET_GAP + cardHeight <= window.innerHeight - VIEWPORT_MARGIN) {
      return {
        left: clamp(targetRect.left + targetRect.width / 2 - CARD_WIDTH / 2, VIEWPORT_MARGIN, window.innerWidth - CARD_WIDTH - VIEWPORT_MARGIN),
        top: targetRect.bottom + TARGET_GAP,
      };
    }

    return {
      left: clamp(targetRect.left + targetRect.width / 2 - CARD_WIDTH / 2, VIEWPORT_MARGIN, window.innerWidth - CARD_WIDTH - VIEWPORT_MARGIN),
      top: Math.max(VIEWPORT_MARGIN, targetRect.top - TARGET_GAP - cardHeight),
    };
  }, [targetRect]);

  if (!open) return null;

  const isLastStep = stepIndex === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[200]" aria-live="polite">
      <div
        className={`absolute inset-0 ${targetRect ? "bg-transparent" : "bg-[#101426]/75 backdrop-blur-[2px]"}`}
        onClick={(event) => event.stopPropagation()}
      />

      {targetRect && (
        <div
          className="pointer-events-none fixed rounded-2xl border-[3px] border-[#c9ff5a] shadow-[0_0_0_9999px_rgba(16,20,38,0.76),0_0_0_7px_rgba(201,255,90,0.18)] transition-all duration-300"
          style={{
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      <section
        role="dialog"
        aria-modal="true"
        aria-label={language === "es" ? "Recorrido de bienvenida" : "Welcome tour"}
        className="fixed w-[calc(100vw-32px)] max-w-[390px] overflow-hidden rounded-[28px] border-2 border-[#101426] bg-white shadow-[10px_10px_0_rgba(16,20,38,.32)] transition-all duration-300"
        style={cardPosition}
      >
        <div className="relative overflow-hidden border-b-2 border-[#101426]/10 px-6 pb-5 pt-6" style={{ backgroundColor: `${step.accent}35` }}>
          <div className="absolute -right-10 -top-12 size-32 rounded-full border-2 border-[#101426]/10 bg-white/35" />
          <button
            type="button"
            onClick={finishOnboarding}
            aria-label={language === "es" ? "Omitir recorrido" : "Skip tour"}
            className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full border border-[#101426]/15 bg-white/70 text-[#101426]/50 transition hover:bg-white hover:text-[#101426]"
          >
            <X className="size-4" />
          </button>

          <div className="relative flex items-center gap-4 pr-10">
            {stepIndex === 0 ? (
              <BrandMark className="size-14 shrink-0 text-lg shadow-[4px_4px_0_#101426]" />
            ) : (
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#101426] bg-white shadow-[4px_4px_0_#101426]">
                <StepIcon className="size-6 text-[#5b35d5]" />
              </div>
            )}
            <div>
              <p className="mb-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#101426]/45">
                {language === "es" ? `Paso ${stepIndex + 1} de ${steps.length}` : `Step ${stepIndex + 1} of ${steps.length}`}
              </p>
              <h2 className="text-2xl font-black leading-tight tracking-[-0.035em] text-[#101426]">
                {step.title}
              </h2>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">
          <p className="min-h-[66px] text-sm leading-6 text-[#101426]/65">
            {step.description}
          </p>

          <div className="mt-5 flex items-center gap-1.5" aria-hidden="true">
            {steps.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all ${index === stepIndex ? "w-8 bg-[#5b35d5]" : index < stepIndex ? "w-3 bg-[#c9ff5a]" : "w-3 bg-[#101426]/10"}`}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            {stepIndex === 0 ? (
              <button
                type="button"
                onClick={finishOnboarding}
                className="px-1 text-sm font-bold text-[#101426]/40 transition hover:text-[#101426]"
              >
                {language === "es" ? "Omitir" : "Skip"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStepIndex((current) => current - 1)}
                className="flex h-11 items-center gap-2 rounded-full border-2 border-[#101426]/15 px-4 text-sm font-black text-[#101426] transition hover:border-[#101426]"
              >
                <ArrowLeft className="size-4" />
                {language === "es" ? "Atrás" : "Back"}
              </button>
            )}

            <button
              type="button"
              autoFocus
              onClick={() => {
                if (isLastStep) finishOnboarding();
                else setStepIndex((current) => current + 1);
              }}
              className="flex h-11 items-center gap-2 rounded-full border-2 border-[#101426] bg-[#c9ff5a] px-5 text-sm font-black text-[#101426] shadow-[3px_3px_0_#101426] transition hover:-translate-y-0.5 hover:bg-white"
            >
              {isLastStep ? (
                <>
                  {language === "es" ? "¡Entendido!" : "Got it!"}
                  <Check className="size-4" />
                </>
              ) : (
                <>
                  {stepIndex === 0
                    ? (language === "es" ? "Empezar" : "Start")
                    : (language === "es" ? "Siguiente" : "Next")}
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
