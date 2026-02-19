import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AuthProvider } from "@/lib/contexts/AuthContext";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";
import { SubscriptionAlert } from "@/features/subscriptions/components/subscription-alert";

import { Modals } from "@/components/modals";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Dynamic Canvas - Crea Diseños a Escala con una Simple API",
  description: "Automatiza tu flujo de trabajo creativo. Integra herramientas de diseño directamente en tu stack tecnológico y genera visuales dinámicos en segundos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
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
            </Providers>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
