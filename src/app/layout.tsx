import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";

import { AuthProvider } from "@/lib/contexts/AuthContext";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";
import { SubscriptionAlert } from "@/features/subscriptions/components/subscription-alert";

import { Modals } from "@/components/modals";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { CookieConsent } from "@/components/cookie-consent";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Dynamic Canvas - Crea Diseños a Escala con una Simple API",
  description: "Automatiza tu flujo de trabajo creativo. Integra herramientas de diseño directamente en tu stack tecnológico y genera visuales dinámicos en segundos.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
  openGraph: {
    title: "Dynamic Canvas",
    description: "Genera visuales dinámicos en segundos con una simple API.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} ${inter.variable}`}>
        <AuthProvider>
          <LanguageProvider>
            <Providers>
              <Toaster />
              <Modals />
              {/* <SubscriptionAlert /> */}
              {children}
              <CookieConsent />
            </Providers>
          </LanguageProvider>
        </AuthProvider>
        <Script id="crisp-chat" strategy="afterInteractive">
          {`window.$crisp=window.$crisp||[];window.CRISP_WEBSITE_ID="${process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID || "12862c83-106c-4ab0-bb6a-304caecb459d"}";(function(){var d=document;var s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=true;d.head.appendChild(s);})();`}
        </Script>
      </body>
    </html>
  );
}
