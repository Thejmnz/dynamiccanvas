import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

// Función auxiliar para generar y subir thumbnail a Supabase Storage
async function generateAndUploadThumbnail(
  projectId: string,
  thumbnailDataUrl: string
): Promise<string | null> {
  try {
    console.log("📤 Uploading thumbnail for project:", projectId);
    console.log("  - Data URL length:", thumbnailDataUrl?.length || 0);

    // Convertir data URL a blob
    const response = await fetch(thumbnailDataUrl);
    const blob = await response.blob();
    console.log("  - Blob size:", blob.size, "bytes");

    // Nombre de archivo fijo basado en el ID del proyecto (sin timestamp)
    // Así se reemplaza el thumbnail anterior en lugar de crear uno nuevo
    const filename = `thumbnails/${projectId}/thumbnail.jpg`;

    // Subir a Supabase Storage (bucket 'media') con upsert para reemplazar
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        upsert: true,
        cacheControl: 'no-cache', // Evitar caché para que se vea la actualización
      });

    if (uploadError) {
      console.error("❌ Error uploading thumbnail:", uploadError);
      return null;
    }

    console.log("✅ Thumbnail uploaded:", uploadData);

    // Obtener URL pública con timestamp para evitar caché del navegador
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filename);

    // Agregar timestamp a la URL para evitar caché del navegador
    const finalUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    console.log("  - Final URL:", finalUrl);
    return finalUrl;
  } catch (e) {
    console.error("❌ Error generating thumbnail:", e);
    return null;
  }
}

export const useUpdateProject = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: {
      json?: string;
      height?: number;
      width?: number;
      thumbnailDataUrl?: string; // Thumbnail en formato data URL
      name?: string;
    }) => {
      console.log("🔄 Saving project:", id);

      // Generar y subir thumbnail si se proporciona
      let thumbnailUrl = undefined;
      if (values.thumbnailDataUrl) {
        thumbnailUrl = await generateAndUploadThumbnail(id, values.thumbnailDataUrl);
        console.log("  - Thumbnail URL:", thumbnailUrl);
      }

      // Build update object with only provided fields
      const updateData: any = {
        updatedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      if (values.json !== undefined) {
        console.log("  - JSON length:", values.json.length);
        updateData.json = values.json;
      }
      if (values.height !== undefined) {
        console.log("  - Height:", values.height);
        updateData.height = values.height;
      }
      if (values.width !== undefined) {
        console.log("  - Width:", values.width);
        updateData.width = values.width;
      }
      if (thumbnailUrl !== undefined) {
        updateData.thumbnailUrl = thumbnailUrl;
      }
      if (values.name !== undefined) {
        console.log("  - Name:", values.name);
        updateData.name = values.name;
      }

      const { data, error } = await supabase
        .from('dynamic_canvas_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("❌ Update error:", error);
        throw new Error(error.message || "Failed to update project");
      }

      console.log("✅ Save success:", data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", { id }] });
      toast.success("Project saved");
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("Failed to save project");
    }
  });

  return mutation;
};
