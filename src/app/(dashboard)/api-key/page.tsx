"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, RefreshCw, Loader2, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { BrandLoading } from "@/components/brand-loading";
import { useAuth } from "@/lib/contexts/AuthContext";

const generateExampleApiKey = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `key-${Math.random().toString(36).substring(2, 10)}`;

export default function ApiKeyPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        if (!user) {
          setIsLoading(false);
          return;
        }
        const userId = user.id;

        const { data: apiKeyData, error: apiKeyError } = await supabase
          .from('user_api_keys')
          .select('api_key')
          .eq('user_id', userId)
          .maybeSingle();

        if (apiKeyError) {
          console.error("Error fetching API Key:", apiKeyError);
          toast.error(language === "es" ? "No se pudo cargar la API Key" : "Could not load API Key");
          return;
        }

        if (apiKeyData?.api_key) {
          setApiKey(apiKeyData.api_key);
        } else {
          const newKey = generateExampleApiKey();
          setApiKey(newKey);
          const now = new Date().toISOString();

          const { error: insertError } = await supabase
            .from('user_api_keys')
            .upsert(
              { user_id: userId, api_key: newKey, createdAt: now, updatedAt: now },
              { onConflict: 'user_id' }
            );

          if (insertError) {
            console.error("Error saving API Key:", insertError);
            toast.error(language === "es" ? "Error al guardar la API Key" : "Failed to save API Key");
          }
        }
      } catch (error) {
        console.error('Error loading API key:', error);
        toast.error(language === "es" ? "Error al cargar" : "Error loading");
      } finally {
        setIsLoading(false);
      }
    };

    loadApiKey();
  }, [user?.id]);

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
      if (!user) {
        toast.error(language === "es" ? "No autenticado" : "Not authenticated");
        return;
      }
      const userId = user.id;
      const newKey = generateExampleApiKey();
      const now = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('user_api_keys')
        .update({ api_key: newKey, updatedAt: now })
        .eq('user_id', userId);

      if (updateError) {
        console.error("Error regenerating API Key:", updateError);
        toast.error(language === "es" ? "Error al regenerar" : "Failed to regenerate");
      } else {
        setApiKey(newKey);
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
    <div className="container mx-auto max-w-3xl py-8">
      <Card className="rounded-[24px] border-2 border-[#101426] bg-white shadow-[7px_7px_0_#d9ccff]">
        <CardHeader>
          <CardTitle>{language === "es" ? "Tu API Key" : "Your API Key"}</CardTitle>
          <CardDescription>
            {language === "es"
              ? "Usa esta clave para autenticar tus solicitudes a la API."
              : "Use this key to authenticate your API requests."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
                  className="flex-1 h-12 rounded-full border-2 border-[#101426] bg-[#c9ff5a] text-[#101426] font-black shadow-[5px_5px_0_#101426] transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#101426] hover:bg-[#c9ff5a] hover:text-[#101426]"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {language === "es" ? "Copiar API Key" : "Copy API Key"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={regenerateApiKey}
                  disabled={isRegenerating}
                  className="flex-1 h-12 rounded-full border-2 border-[#101426] bg-white text-[#101426] font-black shadow-[5px_5px_0_#101426] transition hover:-translate-y-0.5 hover:bg-[#c9ff5a] hover:shadow-[3px_3px_0_#101426] hover:text-[#101426] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[5px_5px_0_#101426]"
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
