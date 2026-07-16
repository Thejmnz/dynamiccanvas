import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/lib/contexts/LanguageContext";

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

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("thumbnail", blob, "thumbnail.jpg");
    const uploadResponse = await fetch("/api/template-thumbnail", {
      method: "POST",
      body: formData,
    });
    const uploadData = await uploadResponse.json() as { url?: string; error?: string };
    if (!uploadResponse.ok || !uploadData.url) {
      console.error("❌ Error uploading thumbnail:", uploadData.error);
      return null;
    }

    const finalUrl = uploadData.url;
    console.log("✅ Thumbnail uploaded:", finalUrl);
    return finalUrl;
  } catch (e) {
    console.error("❌ Error generating thumbnail:", e);
    return null;
  }
}

export const useUpdateProject = (id: string) => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const mutation = useMutation({
    mutationFn: async (values: {
      json?: string;
      height?: number;
      width?: number;
      thumbnailDataUrl?: string;
      name?: string;
      description?: string;
      tags?: string[];
      silent?: boolean;
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
      if (values.description !== undefined) {
        updateData.description = values.description;
      }
      if (values.tags !== undefined) {
        updateData.tags = values.tags;
      }

      const response = await fetch(`/api/user-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to update project");
      const data = result.data;

      console.log("✅ Save success:", data);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", { id }] });
      if (!variables.silent) {
        toast.success(t("project_saved"));
      }
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error(t("failed_to_save_project"));
    }
  });

  return mutation;
};
