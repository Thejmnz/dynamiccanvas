import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDuplicateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await fetch(`/api/user-templates/${id}/duplicate`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to duplicate project");
      return result.data;
    },
    onSuccess: () => {
      toast.success("Template duplicated");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast.error("Failed to duplicate project");
    }
  });

  return mutation;
};
