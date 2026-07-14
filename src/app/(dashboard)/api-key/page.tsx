"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, RefreshCw, Loader2, Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { BrandLoading } from "@/components/brand-loading";
import { useUserRole } from "@/hooks/use-user-role";
import { apiKeyQueryKey, fetchOrCreateApiKey } from "@/features/dashboard/api/dashboard-prefetch";

const generateApiKey = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `key-${Math.random().toString(36).substring(2, 10)}`;

export default function ApiKeyPage() {
  const { language } = useLanguage();
  const { userId = "" } = useUserRole();
  const queryClient = useQueryClient();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const { data: apiKey = "", isPending: isLoading } = useQuery({
    queryKey: apiKeyQueryKey(userId),
    queryFn: () => fetchOrCreateApiKey(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const copyApiKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey).then(() => {
      toast.success(language === "es" ? "API Key copiada!" : "API Key copied!");
    }).catch(() => {
      toast.error(language === "es" ? "Error al copiar" : "Copy failed");
    });
  };

  const regenerateApiKey = async () => {
    setIsRegenerating(true);
    try {
      if (!userId) {
        toast.error(language === "es" ? "No autenticado" : "Not authenticated");
        return;
      }
      const newKey = generateApiKey();
      const now = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('user_api_keys')
        .update({ api_key: newKey, updatedAt: now })
        .eq('user_id', userId);

      if (updateError) {
        console.error("Error regenerating API Key:", updateError);
        toast.error(language === "es" ? "Error al regenerar" : "Failed to regenerate");
      } else {
        queryClient.setQueryData(apiKeyQueryKey(userId), newKey);
        toast.success(language === "es" ? "API Key regenerada!" : "API Key regenerated!");
      }
    } catch (error) {
      console.error('Error regenerating API key:', error);
      toast.error(language === "es" ? "Error" : "Error");
    } finally {
      setIsRegenerating(false);
    }
  };

  const maskedKey = apiKey
    ? `${apiKey.substring(0, 8)}${'•'.repeat(24)}${apiKey.substring(apiKey.length - 4)}`
    : '';

  if (isLoading) {
    return <BrandLoading label="" className="min-h-[70vh] border-0 bg-transparent" />;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card className="rounded-[24px] border border-[#101426]/10 bg-white shadow-[0_22px_60px_rgba(16,20,38,.08)]">
        <CardHeader className="docs-hero-background rounded-t-[24px] border-b border-[#101426]/10 p-7">
          <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-[#eeeaff] text-[#5b35d5]">
            <KeyRound className="size-5" />
          </div>
          <CardTitle className="text-3xl font-black tracking-[-0.035em] text-[#101426]">{language === "es" ? "Tu API Key" : "Your API Key"}</CardTitle>
          <CardDescription className="text-sm leading-relaxed text-[#596174]">
            {language === "es"
              ? "Usa esta clave para autenticar tus solicitudes a la API."
              : "Use this key to authenticate your API requests."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-7">
          <>
              {/* API Key Display */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === "es" ? "Clave secreta" : "Secret Key"}
                </label>
                <div className="relative">
                  <Input
                    value={showKey ? apiKey : maskedKey}
                    readOnly
                    className="font-mono text-sm pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  {language === "es"
                    ? "⚠️ Mantén tu API Key segura. No la compartas ni la expongas en código del lado del cliente."
                    : "⚠️ Keep your API Key secure. Do not share it or expose it in client-side code."}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="ghost"
                  onClick={copyApiKey}
                  className="h-12 flex-1 rounded-xl border-0 bg-gradient-to-r from-[#5b35d5] to-[#6f4bea] font-bold text-white shadow-[0_12px_28px_rgba(91,53,213,.22)] transition hover:-translate-y-0.5 hover:brightness-105"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {language === "es" ? "Copiar API Key" : "Copy API Key"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={regenerateApiKey}
                  disabled={isRegenerating}
                  className="h-12 flex-1 rounded-xl border border-[#101426]/12 bg-white font-bold text-[#101426] shadow-sm transition hover:-translate-y-0.5 hover:border-[#5b35d5]/30 hover:bg-[#f5f2ff] disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isRegenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {language === "es" ? "Regenerar Key" : "Regenerate Key"}
                </Button>
              </div>

              {/* Info */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  {language === "es"
                    ? "💡 La API Key se usa en el header de autorización:"
                    : "💡 The API Key is used in the authorization header:"}
                </p>
                <code className="block bg-slate-100 p-2 rounded text-xs">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
          </>
        </CardContent>
      </Card>
    </div>
  );
}
