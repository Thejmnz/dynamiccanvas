import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useDuplicateTemplate = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/templates/${id}/duplicate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate template");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return mutation;
};
