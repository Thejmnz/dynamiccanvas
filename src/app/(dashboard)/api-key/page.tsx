"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, KeyRound, RefreshCw, Loader2, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const generateExampleApiKey = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `key-${Math.random().toString(36).substring(2, 10)}`;

export default function ApiKeyPage() {
  const { t, language } = useLanguage();
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          setIsLoading(false);
          return;
        }
        const userId = userData.user.id;

        // Ensure user exists in our custom user table
        const { data: existingUser, error: userCheckError } = await supabase
          .from('user')
          .select('id')
          .eq('id', userId)
          .single();

        if (!existingUser && userCheckError?.code === 'PGRST116') {
          const { error: createUserError } = await supabase
            .from('user')
            .insert({
              id: userId,
              email: userData.user.email || '',
              name: userData.user.user_metadata?.name || userData.user.email?.split('@')[0] || 'User',
              emailVerified: new Date().toISOString()
            });

          if (createUserError) {
            console.error("Error creating user:", createUserError);
          }
        }

        const { data: apiKeyData, error: apiKeyError } = await supabase
          .from('user_api_keys')
          .select('api_key')
          .eq('user_id', userId)
          .single();

        if (apiKeyError && apiKeyError.code !== 'PGRST116') {
          console.error("Error fetching API Key:", apiKeyError);
          toast.error(language === "es" ? "No se pudo cargar la API Key" : "Could not load API Key");
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
            const { error: updateError } = await supabase
              .from('user_api_keys')
              .update({ api_key: newKey, updatedAt: now })
              .eq('user_id', userId);

            if (updateError) {
              console.error("Error updating API Key:", updateError);
              toast.error(language === "es" ? "Error al guardar la API Key" : "Failed to save API Key");
            }
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
  }, [language]);

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
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast.error(language === "es" ? "No autenticado" : "Not authenticated");
        return;
      }
      const userId = userData.user.id;
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

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="mb-9 rounded-[28px] border-2 border-[#101426] bg-[#c9ff5a] p-7 shadow-[7px_7px_0_#101426]">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#5b35d5]">DEVELOPER ACCESS</p>
        <h1 className="mb-2 flex items-center gap-3 text-4xl font-black tracking-[-0.04em]">
          <KeyRound className="h-10 w-10 text-[#5b35d5]" />
          {language === "es" ? "API Key" : "API Key"}
        </h1>
        <p className="text-lg text-muted-foreground">
          {language === "es"
            ? "Tu clave de API secreta para autenticar solicitudes."
            : "Your secret API key for authenticating requests."}
        </p>
      </div>

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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
