"use client";

import { Loader2, Upload } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ActiveTool, Editor, fonts } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

interface FontSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

interface UploadedFont {
  displayName: string;
  publicUrl: string;
}

const FONT_EXTENSIONS = [".ttf", ".otf", ".woff", ".woff2"];

const loadFontFace = async (fontName: string, fontUrl: string) => {
  const isLoaded = Array.from(document.fonts).some((face) => face.family === fontName);
  if (isLoaded) return;

  const fontFace = new FontFace(fontName, `url("${fontUrl}")`);
  await fontFace.load();
  document.fonts.add(fontFace);
};

export const FontSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FontSidebarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [customFonts, setCustomFonts] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const selectedFont = editor?.getActiveFontFamily();

  useEffect(() => {
    let mounted = true;

    const discoverFonts = async () => {
      const discovered: string[] = [];

      try {
        const localResponse = await fetch("/api/fonts");
        if (localResponse.ok) {
          const localFiles = await localResponse.json();
          if (Array.isArray(localFiles)) {
            await Promise.all(localFiles.map(async (file: string) => {
              const fontName = file.replace(/\.[^/.]+$/, "");
              try {
                await loadFontFace(fontName, `/fonts/${file}`);
                discovered.push(fontName);
              } catch {}
            }));
          }
        }
      } catch {}

      try {
        const uploadedResponse = await fetch(`/api/uploaded-fonts?_t=${Date.now()}`);
        if (uploadedResponse.ok) {
          const uploaded = await uploadedResponse.json() as UploadedFont[];
          if (Array.isArray(uploaded)) {
            await Promise.all(uploaded.map(async (font) => {
              try {
                await loadFontFace(font.displayName, `${font.publicUrl}?_t=${Date.now()}`);
                discovered.push(font.displayName);
              } catch {}
            }));
          }
        }
      } catch {}

      if (mounted) {
        setCustomFonts(Array.from(new Set(discovered.filter((font) => !fonts.includes(font)))));
      }
    };

    void discoverFonts();
    return () => { mounted = false; };
  }, []);

  const allFonts = useMemo(
    () => Array.from(new Set([...fonts, ...customFonts])),
    [customFonts],
  );

  const uploadFont = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!FONT_EXTENSIONS.includes(extension)) {
      toast.error("Sube una fuente .ttf, .otf, .woff o .woff2");
      event.target.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const storagePath = `fonts/${Date.now()}-${safeFileName}`;
      const { error } = await supabase.storage.from("media").upload(storagePath, file, {
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) throw error;

      const { data } = supabase.storage.from("media").getPublicUrl(storagePath);
      const fontName = file.name.replace(/\.[^/.]+$/, "");
      await loadFontFace(fontName, data.publicUrl);

      setCustomFonts((current) => Array.from(new Set([...current, fontName])));
      editor?.changeFontFamily(fontName);
      editor?.canvas.requestRenderAll();
      toast.success(`Fuente “${fontName}” subida`);
    } catch (error) {
      console.error("Failed to upload font:", error);
      toast.error("No se pudo subir la fuente");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <aside
      className={cn(
        "relative z-[40] flex h-full w-[320px] flex-col border-r bg-white",
        activeTool === "font" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader title="Fuentes" description="Cambia o sube una fuente" />
      <ScrollArea>
        <div className="space-y-3 p-4">
          <input
            ref={inputRef}
            id="font-upload"
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            className="hidden"
            onChange={uploadFont}
          />
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-16 w-full gap-2 border-dashed"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {isUploading ? "Subiendo fuente..." : "Subir fuente personalizada"}
          </Button>

          <div className="space-y-1 border-t pt-3">
            {allFonts.map((font) => (
              <Button
                key={font}
                variant="secondary"
                size="lg"
                className={cn(
                  "h-14 w-full justify-start px-4 text-left text-base",
                  selectedFont === font && "border-2 border-blue-500 bg-blue-50",
                )}
                style={{ fontFamily: font }}
                onClick={() => editor?.changeFontFamily(font)}
              >
                {font}
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={() => onChangeActiveTool("select")} />
    </aside>
  );
};
