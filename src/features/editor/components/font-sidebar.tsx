import { useState, useEffect } from "react";
import {
  ActiveTool,
  Editor,
  fonts,
} from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface FontSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const FontSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FontSidebarProps) => {
  const value = editor?.getActiveFontFamily();
  const [customFonts, setCustomFonts] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadLocalFonts = async () => {
      try {
        const response = await fetch("/api/fonts");
        if (!response.ok) return;

        const fontFiles = await response.json();

        if (Array.isArray(fontFiles)) {
          const loadedFonts: string[] = [];

          for (const file of fontFiles) {
            const fontName = file.replace(/\.[^/.]+$/, "");
            const fontUrl = `/fonts/${file}`;

            // Check if font is already loaded/available to avoid errors
            const isLoaded = Array.from(document.fonts).some(f => f.family === fontName);
            if (!isLoaded) {
              try {
                const fontFace = new FontFace(fontName, `url('${fontUrl}')`);
                await fontFace.load();
                document.fonts.add(fontFace);
                loadedFonts.push(fontName);
              } catch (e) {
                // Silent fail - font not available
              }
            } else {
              // If already in document.fonts, we still might want it in our list if it's not in 'fonts' constant
              loadedFonts.push(fontName);
            }
          }

          setCustomFonts((prev) => {
            // Avoid duplicates with existing custom fonts or default fonts
            // Note: 'fonts' array from types is static.
            const newFonts = loadedFonts.filter(f => !prev.includes(f) && !fonts.includes(f));
            return [...prev, ...newFonts];
          });
        }
      } catch (error) {
        // Silent fail - local fonts not available
      }
    };

    const loadUploadedFonts = async () => {
      try {
        // Add cache-busting parameter
        const response = await fetch(`/api/uploaded-fonts?_t=${Date.now()}`);
        if (!response.ok) return;

        const uploadedFonts = await response.json();

        if (Array.isArray(uploadedFonts)) {
          const loadedFonts: string[] = [];

          for (const font of uploadedFonts) {
            const fontName = font.displayName;

            // Check if font is already loaded/available to avoid errors
            const isLoaded = Array.from(document.fonts).some(f => f.family === fontName);
            if (!isLoaded) {
              try {
                // Add cache-busting to font URL
                const fontUrlWithCache = `${font.publicUrl}?_t=${Date.now()}`;
                const fontFace = new FontFace(fontName, `url('${fontUrlWithCache}')`);
                await fontFace.load();
                document.fonts.add(fontFace);
                loadedFonts.push(fontName);
              } catch (e) {
                // Silent fail - uploaded font not available
              }
            } else {
              loadedFonts.push(fontName);
            }
          }

          setCustomFonts((prev) => {
            // Avoid duplicates with existing custom fonts or default fonts
            const newFonts = loadedFonts.filter(f => !prev.includes(f) && !fonts.includes(f));
            return [...prev, ...newFonts];
          });
        }
      } catch (error) {
        // Silent fail - uploaded fonts not available
      }
    };

    loadLocalFonts();
    loadUploadedFonts();
  }, []);

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['.ttf', '.otf', '.woff', '.woff2'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(fileExt)) {
      toast.error("Please upload a valid font file (.ttf, .otf, .woff, .woff2)");
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('media')
        .upload(`fonts/${fileName}`, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(`fonts/${fileName}`);

      // Get font name without extension
      const fontName = file.name.replace(/\.[^/.]+$/, "");

      // Dynamically load the font
      const fontFace = new FontFace(fontName, `url(${publicUrl})`);
      await fontFace.load();
      document.fonts.add(fontFace);

      // Add to custom fonts list
      setCustomFonts(prev => [...prev, fontName]);

      toast.success("Font uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload font");
    } finally {
      setIsUploading(false);
    }
  };

  const allFonts = [...fonts, ...customFonts];

  return (
    <aside
      className={cn(
        "absolute left-0 top-0 bg-white border-r z-[40] w-[360px] h-full flex flex-col shadow-lg",
        activeTool === "font" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Font"
        description="Change the text font"
      />
      <ScrollArea>
        <div className="p-4 space-y-2">
          {/* Upload Custom Font Button */}
          <label htmlFor="font-upload">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-16 justify-center gap-2 border-dashed"
              disabled={isUploading}
              asChild
            >
              <div>
                <Upload className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload Custom Font"}
              </div>
            </Button>
          </label>
          <input
            id="font-upload"
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            className="hidden"
            onChange={handleFontUpload}
          />

          {/* Font List */}
          <div className="space-y-1 border-t pt-2">
            {allFonts.map((font) => (
              <Button
                key={font}
                variant="secondary"
                size="lg"
                className={cn(
                  "w-full h-16 justify-start text-left",
                  value === font && "border-2 border-blue-500",
                )}
                style={{
                  fontFamily: font,
                  fontSize: "16px",
                  padding: "8px 16px"
                }}
                onClick={() => editor?.changeFontFamily(font)}
              >
                {font}
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
