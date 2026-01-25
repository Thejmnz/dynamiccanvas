import Link from "next/link";
import { AlertTriangle, Loader, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { useGetImages } from "@/features/images/api/use-get-images";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabaseClient";

interface ImageSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const ImageSidebar = ({ editor, activeTool, onChangeActiveTool }: ImageSidebarProps) => {
  const { t } = useLanguage();
  const { data, isLoading, isError } = useGetImages();
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const timestamp = Date.now();
      // Upload to 'uploads' folder
      const fileName = `uploads/${timestamp}-${file.name.replace(/\s+/g, '-')}`;

      const { error } = await supabase.storage
        .from('media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      // Add to editor
      editor?.addImage(publicUrl);

      // Refresh list
      queryClient.invalidateQueries({ queryKey: ["images"] });

      toast.success(t("image_uploaded"));
    } catch (error) {
      console.error(error);
      toast.error(t("image_upload_failed"));
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "images" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader title={t("sidebar_images_title")} description={t("sidebar_images_desc")} />
      <div className="p-4 border-b">
        <label className={cn(
          "w-full flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition bg-gray-50 text-gray-600 text-sm font-medium",
          isUploading && "opacity-50 pointer-events-none"
        )}>
          {isUploading ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {isUploading ? t("uploading") : t("upload_image")}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      </div>
      {isLoading && (
        <div className="flex items-center justify-center flex-1">
          <Loader className="size-4 text-muted-foreground animate-spin" />
        </div>
      )}
      {isError && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-muted-foreground text-xs">{t("image_fetch_failed")}</p>
        </div>
      )}
      <ScrollArea>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {data &&
              data.map((image) => {
                return (
                  <button
                    onClick={() => editor?.addImage(image.urls.regular)}
                    key={image.id}
                    className="relative w-full h-[100px] group hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border"
                  >
                    <img
                      src={image.urls.small}
                      alt={image.alt_description || "Image"}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                    <div className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-white p-1 bg-black/50 text-left">
                      {image.name}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
