"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

import { useAuth } from "@/lib/contexts/AuthContext";

const INTERNAL_ROUTES = [
  "/dashboard",
  "/editor",
  "/playground",
  "/renders",
  "/admin",
  "/api-key",
  "/api-integration",
];

const isInternalRoute = (pathname: string) =>
  INTERNAL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

export const SupportChat = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: session } = useSession();
  const isInternal = isInternalRoute(pathname);

  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    session?.user?.name ||
    user?.email ||
    session?.user?.email;
  const email = user?.email || session?.user?.email;

  useEffect(() => {
    window.$crisp = window.$crisp || [];

    if (!isInternal) {
      window.$crisp.push(["do", "chat:hide"]);
      return;
    }

    window.$crisp.push(["do", "chat:show"]);

    if (name) {
      window.$crisp.push(["set", "user:nickname", [name]]);
    }

    if (email) {
      window.$crisp.push(["set", "user:email", [email]]);
    }

    return () => {
      window.$crisp?.push(["do", "chat:hide"]);
    };
  }, [email, isInternal, name]);

  if (!isInternal) return null;

  return (
    <Script id="crisp-chat" strategy="afterInteractive">
      {`window.$crisp=window.$crisp||[];window.CRISP_WEBSITE_ID="${process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID || "12862c83-106c-4ab0-bb6a-304caecb459d"}";(function(){if(document.querySelector('script[data-dynamic-canvas-crisp]'))return;var s=document.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=true;s.dataset.dynamicCanvasCrisp="true";document.head.appendChild(s);})();`}
    </Script>
  );
};
