import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const mutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await fetch(`/api/user-templates/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete project");
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
