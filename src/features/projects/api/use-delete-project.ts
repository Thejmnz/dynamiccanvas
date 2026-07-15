import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const mutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('dynamic_canvas_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Delete project error:", error);
        throw new Error("Failed to delete project");
      }

      return { id };
    },
    onSuccess: ({ id }) => {
      toast.success(t("project_deleted"));
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", { id }] });
    },
    onError: () => {
      toast.error(t("failed_to_delete_project"));
    }
  });

  return mutation;
};
