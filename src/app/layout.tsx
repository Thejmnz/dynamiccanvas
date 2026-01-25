import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AuthProvider } from "@/lib/contexts/AuthContext";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";
import { SubscriptionAlert } from "@/features/subscriptions/components/subscription-alert";

import { Modals } from "@/components/modals";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dynamic Canvas",
  description: "Build Something Great!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
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
