import { AlertTriangle, Loader, Upload, Image as ImageIcon, Trash2 } from "lucide-react";
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

interface UploadsSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const UploadsSidebar = ({ editor, activeTool, onChangeActiveTool }: UploadsSidebarProps) => {
  const { t } = useLanguage();
  const { data: userImages, isLoading, isError, refetch } = useGetImages();
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
      const fileName = `uploads/${timestamp}-${file.name.replace(/\s+/g, '-')}`;

      const { error } = await supabase.storage
        .from('media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      editor?.addImage(publicUrl);
      queryClient.invalidateQueries({ queryKey: ["images"] });
      toast.success(t("image_uploaded"));
    } catch (error) {
      console.error(error);
      toast.error(t("image_upload_failed"));
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleAddImage = (imageUrl: string) => {
    editor?.addImage(imageUrl);
  };

  const handleDelete = async (imageId: string, imagePath: string) => {
    setDeletingId(imageId);

    try {
      // Delete from storage
      const pathParts = imagePath.split('/storage/v1/object/public/media/');
      const storagePath = pathParts[1] || imagePath;

      if (storagePath) {
        await supabase.storage
          .from('media')
          .remove([storagePath]);
      }

      // Invalidate cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["images"] });
      toast.success(t("image_deleted") || "Imagen eliminada");
    } catch (error) {
      console.error(error);
      toast.error(t("image_delete_failed") || "Error al eliminar la imagen");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside
      className={cn(
        "absolute left-0 top-0 bg-white border-r z-[40] w-[360px] h-full flex flex-col shadow-lg",
        activeTool === "uploads" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title={t("sidebar_uploads_title") || "Mis Subidas"}
        description={t("sidebar_uploads_desc") || "Sube y gestiona tus propias imágenes"}
      />

      {/* Upload button */}
      <div className="px-3 pt-3 pb-2 border-b">
        <label className={cn(
          "w-full flex items-center justify-center p-3 border-2 border-dashed border-purple-300 rounded-md cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition bg-purple-50/50 text-purple-600 text-sm font-medium",
          isUploading && "opacity-50 pointer-events-none"
        )}>
          {isUploading ? (
            <Loader className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Upload className="mr-2 h-5 w-5" />
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

      <ScrollArea className="flex-1">
        <div className="p-3">
          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader className="size-8 text-purple-500 animate-spin" />
              <p className="text-sm text-gray-500">
                {t("loading_uploads") || "Cargando imágenes..."}
              </p>
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <AlertTriangle className="size-8 text-red-400" />
              <p className="text-sm text-gray-500">
                {t("uploads_error") || "Error al cargar las imágenes"}
              </p>
              <button
                onClick={() => refetch()}
                className="text-xs text-purple-500 hover:text-purple-600"
              >
                {t("try_again") || "Intentar de nuevo"}
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && (!userImages || userImages.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <ImageIcon className="size-12 text-gray-300" />
              <p className="text-sm text-gray-500 text-center">
                {t("no_uploads_yet") || "Aún no has subido imágenes"}
              </p>
              <p className="text-xs text-gray-400 text-center">
                {t("upload_first_hint") || "Haz clic en el botón de arriba para subir tu primera imagen"}
              </p>
            </div>
          )}

          {/* Images grid */}
          {!isLoading && !isError && userImages && userImages.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">
                  {userImages.length} {t("images_count") || "imágenes"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {userImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative group"
                  >
                    <button
                      onClick={() => handleAddImage(image.urls.regular)}
                      className="w-full aspect-square bg-muted rounded-md overflow-hidden border hover:border-purple-400 transition"
                    >
                      <img
                        src={image.urls.small}
                        alt={image.alt_description || "Image"}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(image.id, image.urls.regular)}
                      disabled={deletingId === image.id}
                      className={cn(
                        "absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition",
                        "hover:bg-red-600 disabled:opacity-50"
                      )}
                      title={t("delete_image") || "Eliminar imagen"}
                    >
                      {deletingId === image.id ? (
                        <Loader className="size-3 animate-spin" />
                      ) : (
                        <Trash2 className="size-3" />
                      )}
                    </button>
                    {/* Image name */}
                    <div className="mt-1 text-[10px] text-gray-500 truncate px-1">
                      {image.name}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
